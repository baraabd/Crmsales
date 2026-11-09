import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { apiRequest, ApiError, readStored, SESSION_KEY, userStorageKey } from '../services/api';
import { syncService } from '../services/syncService';

// Types
export interface User {
  id: string;
  name: string;
  employeeId: string;
  email: string;
  company?: string;
}

// Work Status Type
export type WorkStatus = 'offDuty' | 'clockedIn' | 'break';

export interface TimeEntry {
  id: string;
  status: WorkStatus;
  timestamp: string;
  location?: { lat: number; lng: number };
}

export interface DailySummary {
  totalVisits: number;
  totalDeals: number;
  totalAppointments: number;
  totalFollowUps: number;
  totalWorkTime: number;
  date: string;
}

export interface Account {
  id: string;
  name: string;
  contactPerson?: string;
  phone?: string;
  address?: string;
  latitude: number;
  longitude: number;
  lifecycle: 'prospect' | 'cold' | 'warm' | 'customer' | 'lost';
  pinColor: 'green' | 'blue' | 'yellow' | 'gray';
  nextAction?: {
    type: 'appointment' | 'followUp' | 'none';
    datetime?: string;
    notes?: string;
  };
  lastVisit?: string;
  photoUrl?: string;
}

export interface Visit {
  id: string;
  accountId: string;
  startTime: string;
  endTime?: string;
  latitude: number;
  longitude: number;
  duration?: number;
  outcome?: 'deal' | 'appointment' | 'busy' | 'rejected';
  notes?: string;
}

export interface Agreement {
  id: string;
  accountId: string;
  visitId: string;
  agreementNumber: string;
  services: any[];
  subtotal: number;
  discount: number;
  total: number;
  duration: string;
  durationLabel: string;
  implementation: string;
  payment: string;
  paymentDates?: { date: string; amount: number; percentage: number }[];
  customNotes?: string;
  signatureData?: string;
  status: 'active' | 'completed' | 'cancelled';
  createdAt: string;
  startDate: string;
  endDate: string;
}

export interface Appointment {
  id: string;
  accountId: string;
  visitId?: string;
  date: string;
  time: string;
  reason: string;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface OutboxItem {
  id: string;
  type: 'visit' | 'account' | 'appointment' | 'discount_request' | 'agreement';
  timestamp: string;
  status: 'pending' | 'syncing' | 'failed';
  data: any;
}

export interface Registration {
  email: string;
  password: string;
  name: string;
  employeeId?: string;
  company?: string;
}

interface AppContextType {
  user: User | null;
  authReady: boolean;
  authError: string | null;
  isOnline: boolean;
  isAuthenticated: boolean;
  accounts: Account[];
  visits: Visit[];
  outbox: OutboxItem[];
  currentVisit: Visit | null;
  workStatus: WorkStatus;
  clockInTime: string | null;
  breakStartTime: string | null;
  totalWorkTime: number;
  breakTimeRemaining: number;
  canAddData: boolean;
  dailySummary: DailySummary | null;
  agreements: Agreement[];
  appointments: Appointment[];
  login: (email: string, password: string) => Promise<void>;
  register: (input: Registration) => Promise<void>;
  updateProfile: (updates: Partial<Pick<User, 'name' | 'company' | 'employeeId'>>) => Promise<void>;
  loginOffline: () => void;
  logout: () => void;
  setWorkStatus: (status: WorkStatus) => void;
  addAccount: (account: Omit<Account, 'id'>) => Account;
  updateAccount: (id: string, updates: Partial<Account>) => void;
  startVisit: (accountId: string, lat: number, lng: number) => Visit;
  endVisit: (visitId: string, outcome: Visit['outcome'], notesOrData?: string | any) => void;
  addToOutbox: (item: Omit<OutboxItem, 'id' | 'timestamp'>) => void;
  syncNow: () => Promise<void>;
  addAgreement: (agreement: Omit<Agreement, 'id' | 'createdAt'>) => Agreement;
  getActiveAgreement: (accountId: string) => Agreement | null;
  addAppointment: (appointment: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  getUpcomingAppointments: (accountId?: string) => Appointment[];
}

interface DataState {
  accounts: Account[];
  visits: Visit[];
  agreements: Agreement[];
  appointments: Appointment[];
  currentVisit: Visit | null;
  workStatus: WorkStatus;
  clockInTime: string | null;
  breakStartTime: string | null;
  breakSeconds: number;
  totalWorkTime: number;
  dailySummary: DailySummary | null;
}
interface Session { userId: string; accessToken: string; }
const initialData = (): DataState => ({
  accounts: [], visits: [], agreements: [], appointments: [], currentVisit: null,
  workStatus: 'offDuty', clockInTime: null, breakStartTime: null,
  breakSeconds: 0, totalWorkTime: 0, dailySummary: null,
});
const AppContext = createContext<AppContextType | undefined>(undefined);
const upsert = <T extends { id: string }>(records: T[], record: T): T[] => {
  const found = records.some(item => item.id === record.id);
  return found ? records.map(item => item.id === record.id ? record : item) : [...records, record];
};
function mergePending<T extends { id: string }>(records: T[], type: string): T[] {
  return syncService.getItems().filter(item => item.type === type).reduce((merged, item) =>
    item.operation === 'delete' ? merged.filter(record => record.id !== item.data.id) : upsert(merged, item.data), records);
}
function workSeconds(data: DataState, now: number) {
  if (!data.clockInTime) return data.totalWorkTime;
  const end = data.workStatus === 'break' && data.breakStartTime ? Date.parse(data.breakStartTime) : now;
  return Math.max(0, Math.floor((end - Date.parse(data.clockInTime)) / 1000) - data.breakSeconds);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [data, setData] = useState<DataState>(initialData);
  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  const [now, setNow] = useState(Date.now());
  const dataRef = useRef(data);
  const sessionRef = useRef<Session | null>(null);
  const epochRef = useRef(0);
  const revisionRef = useRef(0);

  function replaceData(next: DataState, persist = true) {
    if (persist && sessionRef.current) {
      try { localStorage.setItem(userStorageKey(sessionRef.current.userId, 'data'), JSON.stringify(next)); }
      catch { setAuthError('تعذر تحديث النسخة المحلية بسبب امتلاء التخزين. عمليات الحفظ المعلقة محفوظة بشكل مستقل.'); }
    }
    dataRef.current = next;
    revisionRef.current++;
    setData(next);
  }
  function updateData(update: (previous: DataState) => DataState) { replaceData(update(dataRef.current)); }
  function requireSession() {
    if (!sessionRef.current) throw new Error('يجب تسجيل الدخول أولاً.');
    return sessionRef.current;
  }
  function clearSession(removeCredential = true) {
    epochRef.current++;
    const previous = sessionRef.current;
    sessionRef.current = null;
    if (removeCredential) localStorage.removeItem(SESSION_KEY);
    if (previous) localStorage.removeItem(userStorageKey(previous.userId, 'data'));
    syncService.configureSession(null, null);
    setUser(null);
    replaceData(initialData(), false);
    setOutbox([]);
    setAuthReady(true);
  }
  async function activateSession(nextUser: User, accessToken: string) {
    // Private routes must wait for the first database read, not only token validation.
    // Otherwise an immediate clock-in can change state and discard the initial GETs.
    setAuthReady(false);
    const session = { userId: nextUser.id, accessToken };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    sessionRef.current = session;
    syncService.configureSession(nextUser.id, accessToken);
    const cached = readStored<Partial<DataState>>(userStorageKey(nextUser.id, 'data'), {});
    const restored = { ...initialData(), ...cached };
    for (const field of ['accounts', 'visits', 'appointments', 'agreements'] as const) {
      if (!Array.isArray(restored[field])) restored[field] = [];
    }
    restored.accounts = mergePending(restored.accounts, 'account');
    restored.visits = mergePending(restored.visits, 'visit');
    restored.appointments = mergePending(restored.appointments, 'appointment');
    restored.agreements = mergePending(restored.agreements, 'agreement');
    replaceData(restored);
    setUser(nextUser);
    setAuthError(null);
    try {
      await syncNow();
    } catch (error) {
      if (sessionRef.current === session) {
        setAuthError(error instanceof Error ? error.message : 'تعذر تحديث البيانات.');
      }
    } finally {
      if (sessionRef.current === session) setAuthReady(true);
    }
  }

  async function refreshServerData() {
    const session = requireSession();
    const revision = revisionRef.current;
    const responses = await Promise.all(['accounts', 'visits', 'appointments', 'agreements'].map(collection =>
      apiRequest<Record<string, any>>(`/${collection}`, {}, session.accessToken)));
    if (sessionRef.current !== session || revisionRef.current !== revision) return;
    const accounts = mergePending<Account>(responses[0].accounts || [], 'account');
    const visits = mergePending<Visit>(responses[1].visits || [], 'visit');
    const appointments = mergePending<Appointment>(responses[2].appointments || [], 'appointment');
    const agreements = mergePending<Agreement>(responses[3].agreements || [], 'agreement');
    const currentVisit = visits.find(visit => visit.id === dataRef.current.currentVisit?.id && !visit.endTime)
      || visits.filter(visit => !visit.endTime).sort((a, b) => b.startTime.localeCompare(a.startTime))[0] || null;
    updateData(previous => ({ ...previous, accounts, visits, appointments, agreements, currentVisit }));
  }
  async function syncNow() {
    requireSession();
    let syncError: unknown;
    try { await syncService.processSyncQueue(); } catch (error) { syncError = error; }
    await refreshServerData();
    if (syncError) throw syncError;
    setAuthError(null);
  }

  useEffect(() => {
    const unsubscribe = syncService.subscribe(() => setOutbox(syncService.getItems() as OutboxItem[]));
    const handleOnline = () => { setIsOnline(true); if (sessionRef.current) void syncNow().catch(() => {}); };
    const handleOffline = () => setIsOnline(false);
    const handleExpired = () => { clearSession(); setAuthError('انتهت الجلسة. يرجى تسجيل الدخول مجددًا؛ العمليات المعلقة محفوظة لحسابك.'); };
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SESSION_KEY && event.newValue !== event.oldValue) {
        clearSession(false);
        setAuthError('تغيّرت الجلسة في نافذة أخرى. أعد تحميل الصفحة أو سجّل الدخول.');
      }
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('crm:session-expired', handleExpired);
    window.addEventListener('storage', handleStorage);
    const epoch = ++epochRef.current;
    const saved = readStored<Session | null>(SESSION_KEY, null);
    if (saved?.accessToken && saved?.userId) {
      apiRequest<{ user: User }>('/auth/user', {}, saved.accessToken).then(result => {
        if (epoch !== epochRef.current) return;
        if (result.user.id !== saved.userId) throw new Error('تعذر التحقق من هوية الجلسة.');
        return activateSession(result.user, saved.accessToken);
      }).catch(error => {
        if (epoch !== epochRef.current) return;
        if (error instanceof ApiError && error.status === 401) localStorage.removeItem(SESSION_KEY);
        setAuthError(error instanceof Error ? error.message : 'تعذر التحقق من الجلسة.');
        setAuthReady(true);
      });
    } else setAuthReady(true);
    return () => {
      epochRef.current++;
      unsubscribe();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('crm:session-expired', handleExpired);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  async function authenticate(path: string, body: unknown) {
    const epoch = ++epochRef.current;
    setAuthError(null);
    const result = await apiRequest<{ user: User; accessToken: string }>(path, { method: 'POST', body: JSON.stringify(body) });
    if (epoch !== epochRef.current) return;
    await activateSession(result.user, result.accessToken);
  }
  const login = (email: string, password: string) => authenticate('/auth/login', { email: email.trim(), password });
  const register = (input: Registration) => authenticate('/auth/signup', { ...input, email: input.email.trim(), name: input.name.trim() });
  async function updateProfile(updates: Partial<Pick<User, 'name' | 'company' | 'employeeId'>>) {
    const session = requireSession();
    const result = await apiRequest<{ user: User }>('/auth/user', { method: 'PATCH', body: JSON.stringify(updates) }, session.accessToken);
    if (sessionRef.current === session) setUser(result.user);
  }
  function logout() {
    const token = sessionRef.current?.accessToken;
    clearSession();
    setAuthError(null);
    if (token) void apiRequest('/auth/logout', { method: 'POST' }, token).catch(() => {});
  }
  function loginOffline() {
    throw new Error('تسجيل الدخول يتطلب التحقق من الخادم. سجّل الدخول عند توفر الاتصال أولاً.');
  }

  function setWorkStatus(status: WorkStatus) {
    requireSession();
    const previous = dataRef.current;
    if (previous.workStatus === status || (status === 'break' && previous.workStatus !== 'clockedIn')) return;
    const timestamp = new Date().toISOString();
    let next = { ...previous, workStatus: status };
    if (status === 'clockedIn' && previous.workStatus === 'offDuty') {
      next = { ...next, clockInTime: timestamp, breakStartTime: null, breakSeconds: 0, totalWorkTime: 0, dailySummary: null };
    } else if (status === 'break') {
      next.breakStartTime = timestamp;
    } else if (status === 'clockedIn' && previous.breakStartTime) {
      next.breakSeconds += Math.max(0, Math.floor((Date.parse(timestamp) - Date.parse(previous.breakStartTime)) / 1000));
      next.breakStartTime = null;
    } else if (status === 'offDuty') {
      next.totalWorkTime = workSeconds(previous, Date.now());
      next.clockInTime = null;
      next.breakStartTime = null;
      const today = new Date().toDateString();
      const completed = next.visits.filter(visit => visit.endTime && new Date(visit.endTime).toDateString() === today);
      next.dailySummary = {
        totalVisits: completed.length, totalDeals: completed.filter(visit => visit.outcome === 'deal').length,
        totalAppointments: completed.filter(visit => visit.outcome === 'appointment').length,
        totalFollowUps: completed.filter(visit => visit.outcome === 'busy').length,
        totalWorkTime: next.totalWorkTime, date: today,
      };
    }
    replaceData(next);
    setNow(Date.now());
  }
  useEffect(() => {
    if (data.workStatus === 'offDuty') return;
    const interval = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(interval);
  }, [data.workStatus]);
  const breakTimeRemaining = data.breakStartTime ? Math.max(0, 1800 - Math.floor((now - Date.parse(data.breakStartTime)) / 1000)) : 0;
  useEffect(() => {
    if (authReady && data.workStatus === 'break' && data.breakStartTime && breakTimeRemaining === 0) setWorkStatus('clockedIn');
  }, [authReady, breakTimeRemaining, data.workStatus, data.breakStartTime]);

  function addAccount(input: Omit<Account, 'id'>) {
    requireSession();
    if (dataRef.current.workStatus !== 'clockedIn') throw new Error('ابدأ يوم العمل قبل إضافة عميل.');
    const account = { ...input, id: crypto.randomUUID() };
    syncService.addToQueue({ type: 'account', operation: 'create', data: account });
    updateData(previous => ({ ...previous, accounts: [...previous.accounts, account] }));
    return account;
  }
  function updateAccount(id: string, updates: Partial<Account>) {
    requireSession();
    const previous = dataRef.current.accounts.find(account => account.id === id);
    if (!previous) throw new Error('لم يتم العثور على العميل.');
    const account = { ...previous, ...updates, id };
    syncService.addToQueue({ type: 'account', operation: 'update', data: account });
    updateData(state => ({ ...state, accounts: upsert(state.accounts, account) }));
  }
  function startVisit(accountId: string, lat: number, lng: number) {
    requireSession();
    if (dataRef.current.workStatus !== 'clockedIn') throw new Error('ابدأ يوم العمل قبل بدء الزيارة.');
    if (!dataRef.current.accounts.some(account => account.id === accountId)) throw new Error('لم يتم العثور على العميل.');
    if (dataRef.current.currentVisit) throw new Error('أنهِ الزيارة الحالية قبل بدء زيارة جديدة.');
    if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) throw new Error('إحداثيات الموقع غير صحيحة.');
    const visit: Visit = { id: crypto.randomUUID(), accountId, startTime: new Date().toISOString(), latitude: lat, longitude: lng };
    syncService.addToQueue({ type: 'visit', operation: 'create', data: visit });
    updateData(previous => ({ ...previous, currentVisit: visit, visits: upsert(previous.visits, visit) }));
    return visit;
  }
  function endVisit(visitId: string, outcome: Visit['outcome'], notesOrData?: string | any) {
    requireSession();
    const visit = dataRef.current.currentVisit;
    if (!visit || visit.id !== visitId) throw new Error('هذه الزيارة غير نشطة.');
    if (!outcome) throw new Error('اختر نتيجة الزيارة.');
    const endTime = new Date().toISOString();
    const notes = typeof notesOrData === 'string' ? notesOrData : typeof notesOrData?.notes === 'string' ? notesOrData.notes : '';
    const completed = { ...visit, endTime, outcome, notes, duration: Math.max(0, Math.floor((Date.parse(endTime) - Date.parse(visit.startTime)) / 60000)) };
    syncService.addToQueue({ type: 'visit', operation: 'update', data: completed });
    updateData(previous => ({ ...previous, visits: upsert(previous.visits, completed), currentVisit: null }));
    updateAccount(visit.accountId, { lastVisit: endTime });
  }
  function addAgreement(input: Omit<Agreement, 'id' | 'createdAt'>) {
    requireSession();
    const agreement = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    syncService.addToQueue({ type: 'agreement', operation: 'create', data: agreement });
    updateData(previous => ({ ...previous, agreements: [...previous.agreements, agreement] }));
    return agreement;
  }
  function addAppointment(input: Omit<Appointment, 'id' | 'createdAt'>) {
    requireSession();
    const appointment = { ...input, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    syncService.addToQueue({ type: 'appointment', operation: 'create', data: appointment });
    updateData(previous => ({ ...previous, appointments: [...previous.appointments, appointment] }));
    return appointment;
  }
  function updateAppointment(id: string, updates: Partial<Appointment>) {
    requireSession();
    const previous = dataRef.current.appointments.find(appointment => appointment.id === id);
    if (!previous) throw new Error('لم يتم العثور على الموعد.');
    const appointment = { ...previous, ...updates, id };
    syncService.addToQueue({ type: 'appointment', operation: 'update', data: appointment });
    updateData(state => ({ ...state, appointments: upsert(state.appointments, appointment) }));
  }
  function getUpcomingAppointments(accountId?: string) {
    return data.appointments.filter(appointment => (!accountId || appointment.accountId === accountId)
      && appointment.status === 'scheduled' && new Date(`${appointment.date}T${appointment.time}`).getTime() >= Date.now())
      .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  }

  return <AppContext.Provider value={{
    ...data, user, authReady, authError, isOnline, isAuthenticated: !!user && !!sessionRef.current, outbox,
    totalWorkTime: workSeconds(data, now), breakTimeRemaining, canAddData: !!user && data.workStatus === 'clockedIn',
    login, register, updateProfile, loginOffline, logout, setWorkStatus, addAccount, updateAccount, startVisit, endVisit,
    addToOutbox: item => syncService.addToQueue({ type: item.type, operation: 'create', data: item.data }),
    syncNow, addAgreement, getActiveAgreement: accountId => data.agreements.find(agreement => agreement.accountId === accountId && agreement.status === 'active') || null,
    addAppointment, updateAppointment, getUpcomingAppointments,
  }}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
}
