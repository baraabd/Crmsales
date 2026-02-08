import { projectId } from '/utils/supabase/info';

interface SyncQueueItem {
  id: string;
  type: 'account' | 'visit' | 'appointment';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: string;
  retryCount: number;
}

class SyncService {
  private syncQueue: SyncQueueItem[] = [];
  private isSyncing = false;
  private syncInterval: number | null = null;
  private API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d80cbf4a`;

  constructor() {
    this.loadQueue();
    this.setupAutoSync();
    this.setupOnlineListener();
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem('syncQueue');
      if (saved) {
        this.syncQueue = JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading sync queue:', error);
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem('syncQueue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.error('Error saving sync queue:', error);
    }
  }

  private setupAutoSync() {
    // Auto sync every 30 seconds when online
    this.syncInterval = window.setInterval(() => {
      if (navigator.onLine && !this.isSyncing && this.syncQueue.length > 0) {
        this.processSyncQueue();
      }
    }, 30000);
  }

  private setupOnlineListener() {
    window.addEventListener('online', () => {
      console.log('Connection restored, starting sync...');
      this.processSyncQueue();
    });
  }

  addToQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>) {
    const queueItem: SyncQueueItem = {
      ...item,
      id: `sync_${Date.now()}_${Math.random()}`,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    this.syncQueue.push(queueItem);
    this.saveQueue();

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.processSyncQueue();
    }
  }

  async processSyncQueue(accessToken?: string) {
    if (this.isSyncing || this.syncQueue.length === 0) {
      return;
    }

    // Get access token from localStorage if not provided
    const token = accessToken || localStorage.getItem('accessToken');
    if (!token) {
      console.log('No access token, skipping sync');
      return;
    }

    this.isSyncing = true;

    try {
      const itemsToSync = [...this.syncQueue];
      const failedItems: SyncQueueItem[] = [];

      for (const item of itemsToSync) {
        try {
          let endpoint = '';
          
          if (item.type === 'account') {
            endpoint = '/accounts';
          } else if (item.type === 'visit') {
            endpoint = '/visits';
          }

          const response = await fetch(`${this.API_URL}${endpoint}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(item.data),
          });

          if (!response.ok) {
            throw new Error(`Server returned ${response.status}`);
          }

          console.log(`Successfully synced ${item.type} ${item.id}`);
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Retry logic
          if (item.retryCount < 3) {
            failedItems.push({
              ...item,
              retryCount: item.retryCount + 1,
            });
          } else {
            console.error(`Max retries reached for item ${item.id}, removing from queue`);
          }
        }
      }

      // Update queue with only failed items
      this.syncQueue = failedItems;
      this.saveQueue();

    } finally {
      this.isSyncing = false;
    }
  }

  getQueueSize(): number {
    return this.syncQueue.length;
  }

  clearQueue() {
    this.syncQueue = [];
    this.saveQueue();
  }

  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Create singleton instance
export const syncService = new SyncService();
