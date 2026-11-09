import { apiRequest, ApiError, readStored, userStorageKey } from './api';

export interface SyncQueueItem {
  id: string;
  type: string;
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
  status: 'pending' | 'syncing' | 'failed';
  error?: string;
  order?: number;
}

const endpoints: Record<string, string> = {
  account: '/accounts', visit: '/visits', appointment: '/appointments', agreement: '/agreements',
};
const priority: Record<string, number> = { account: 0, visit: 1, appointment: 2, agreement: 2 };
const compareOrder = (a: SyncQueueItem, b: SyncQueueItem) => (a.order ?? Date.parse(a.timestamp)) - (b.order ?? Date.parse(b.timestamp)) || a.id.localeCompare(b.id);

/** Durable user-scoped queue. Every write has its own storage key; tabs cannot replace one another's queue. */
export class SyncService {
  private queue: SyncQueueItem[] = [];
  private userId: string | null = null;
  private token: string | null = null;
  private generation = 0;
  private listeners = new Set<() => void>();
  private running: Promise<void> | null = null;
  private inFlightId: string | null = null;
  private lastSyncAt: string | null = null;
  private lastError: string | null = null;
  private interval: number;
  private onOnline = () => { void this.processSyncQueue().catch(() => {}); };
  private onStorage = (event: StorageEvent) => {
    if (this.userId && event.key?.startsWith(this.itemPrefix()) && !this.running) {
      this.queue = this.loadQueue();
      this.publish();
    }
  };

  constructor() {
    this.interval = window.setInterval(this.onOnline, 30000);
    window.addEventListener('online', this.onOnline);
    window.addEventListener('storage', this.onStorage);
  }

  private itemPrefix() { return userStorageKey(this.userId!, 'queue-item:'); }
  private itemKey(id: string) { return `${this.itemPrefix()}${id}`; }
  private persistItem(item: SyncQueueItem) {
    try { localStorage.setItem(this.itemKey(item.id), JSON.stringify(item)); }
    catch { throw new Error('مساحة التخزين المحلية ممتلئة؛ لم يتم حفظ العملية. حرّر بعض المساحة ثم أعد المحاولة.'); }
  }
  private loadQueue(): SyncQueueItem[] {
    if (!this.userId) return [];
    const items: SyncQueueItem[] = [];
    const prefix = this.itemPrefix();
    for (let index = 0; index < localStorage.length; index++) {
      const key = localStorage.key(index);
      if (!key?.startsWith(prefix)) continue;
      const item = readStored<SyncQueueItem | null>(key, null);
      if (item && typeof item.id === 'string' && item.data) {
        items.push({ ...item, status: item.status === 'syncing' ? 'pending' : item.status });
      }
    }
    return items.sort(compareOrder);
  }

  configureSession(userId: string | null, token: string | null) {
    this.generation++;
    this.userId = userId;
    this.token = token;
    this.running = null;
    this.inFlightId = null;
    if (userId) {
      // One-time migration from the initial array format, without discarding existing records.
      const oldKey = userStorageKey(userId, 'queue');
      const previous = readStored<SyncQueueItem[]>(oldKey, []);
      if (Array.isArray(previous)) {
        for (const item of previous) if (item?.id && item.data && !localStorage.getItem(this.itemKey(item.id))) this.persistItem(item);
        localStorage.removeItem(oldKey);
      }
    }
    this.queue = this.loadQueue();
    this.lastSyncAt = userId ? readStored<string | null>(userStorageKey(userId, 'lastSyncAt'), null) : null;
    this.lastError = null;
    this.publish();
  }

  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => { this.listeners.delete(listener); };
  }
  private publish() { this.listeners.forEach(listener => listener()); }
  getItems() { return [...this.queue]; }
  getQueueSize() { return this.queue.length; }
  getState() { return { items: this.getItems(), isSyncing: !!this.running, lastSyncAt: this.lastSyncAt, lastError: this.lastError }; }

  addToQueue(item: Pick<SyncQueueItem, 'type' | 'operation' | 'data'>) {
    if (!this.userId || !this.token) throw new Error('يجب تسجيل الدخول أولاً.');
    const stored = this.loadQueue();
    const queueItem: SyncQueueItem = {
      ...item, id: crypto.randomUUID(), timestamp: new Date().toISOString(), retryCount: 0, status: 'pending',
      order: Math.max(Date.now(), ...stored.map(existing => (existing.order ?? Date.parse(existing.timestamp)) + 1)),
    };
    // Persist first: a quota error must not create a visible record with no durable pending write.
    this.persistItem(queueItem);
    // Do not remove another tab's pending writes here: it may already be sending one.
    // Superseded operations are removed only after a newer write is acknowledged by the server.
    this.queue = [...stored, queueItem];
    this.publish();
    queueMicrotask(this.onOnline);
  }

  processSyncQueue(_accessToken?: string): Promise<void> {
    if (this.running) return this.running;
    if (!this.userId || !this.token) return Promise.resolve();
    this.queue = this.loadQueue();
    if (!this.queue.length) return Promise.resolve();
    const generation = this.generation;
    const token = this.token;
    const lockName = userStorageKey(this.userId, 'sync-lock');
    this.lastError = null;
    const run = () => generation === this.generation ? this.run(generation, token) : Promise.resolve();
    // Web Locks serializes the same user's queue across browser tabs where supported.
    const locks = globalThis.navigator?.locks;
    this.running = (locks ? locks.request(lockName, run) : run()).finally(() => {
      if (generation !== this.generation) return;
      this.running = null;
      this.inFlightId = null;
      this.publish();
    });
    this.publish();
    return this.running;
  }

  private async run(generation: number, token: string) {
    const attempted = new Set<string>();
    while (generation === this.generation) {
      this.queue = this.loadQueue();
      const item = this.queue.filter(candidate => !attempted.has(candidate.id))
        .sort((a, b) => (priority[a.type] ?? 9) - (priority[b.type] ?? 9) || compareOrder(a, b))[0];
      if (!item) break;
      attempted.add(item.id);
      this.inFlightId = item.id;
      item.status = 'syncing';
      this.publish();
      try {
        const endpoint = endpoints[item.type];
        if (!endpoint) throw new Error('هذا النوع من البيانات غير مدعوم في المزامنة. لم يتم إرساله أو حذفه.');
        const deleting = item.operation === 'delete';
        if (deleting && !item.data?.id) throw new Error('معرّف السجل مطلوب للحذف.');
        await apiRequest(deleting ? `${endpoint}/${encodeURIComponent(item.data.id)}` : endpoint, {
          method: deleting ? 'DELETE' : 'POST',
          ...(deleting ? {} : { body: JSON.stringify(item.data) }),
        }, token);
        if (generation !== this.generation) return;
        // A completed visit must never be overwritten by retrying an older failed open visit.
        // Remove only acknowledged/superseded items, preserving all subsequently queued writes.
        const current = this.loadQueue();
        for (const candidate of current) {
          if (candidate.id === item.id || (candidate.type === item.type && candidate.data?.id === item.data?.id && compareOrder(candidate, item) < 0)) {
            localStorage.removeItem(this.itemKey(candidate.id));
          }
        }
        this.lastSyncAt = new Date().toISOString();
        try { localStorage.setItem(userStorageKey(this.userId!, 'lastSyncAt'), JSON.stringify(this.lastSyncAt)); } catch { /* The acknowledged data is already safe on the server. */ }
      } catch (error) {
        if (generation !== this.generation) return;
        item.status = 'failed';
        item.retryCount++;
        item.error = error instanceof Error ? error.message : 'تعذر حفظ البيانات على الخادم.';
        this.lastError = item.error;
        try { this.persistItem(item); } catch (storageError) {
          this.lastError = storageError instanceof Error ? storageError.message : item.error;
          // The original durable payload remains; only updated retry metadata failed to save.
        }
        this.publish();
        if (error instanceof ApiError && error.status === 401) throw error;
        if (error instanceof ApiError && error.status === 0) break;
      }
      this.inFlightId = null;
      this.publish();
    }
    if (generation !== this.generation) return;
    this.queue = this.loadQueue();
    this.lastError = this.queue.find(item => item.status === 'failed')?.error || (this.queue.length ? this.lastError : null);
    if (this.lastError) throw new Error(this.lastError);
  }

  removeItem(id: string) {
    if (!this.userId || id === this.inFlightId) return;
    localStorage.removeItem(this.itemKey(id));
    this.queue = this.loadQueue();
    this.publish();
  }
  /** Explicit user action only. Logout deliberately keeps the user's unsent writes. */
  clearQueue() {
    if (!this.userId) return;
    for (const item of this.loadQueue()) if (item.id !== this.inFlightId) localStorage.removeItem(this.itemKey(item.id));
    this.queue = this.loadQueue();
    this.publish();
  }
  destroy() {
    window.clearInterval(this.interval);
    window.removeEventListener('online', this.onOnline);
    window.removeEventListener('storage', this.onStorage);
  }
}
export const syncService = new SyncService();
