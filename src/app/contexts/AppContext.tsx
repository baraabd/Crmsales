import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '/src/utils/supabase';
import { projectId, publicAnonKey } from '/utils/supabase/info';
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

interface AppContextType {
  user: User | null;
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
  login: (employeeId: string, password: string) => Promise<void>;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [visits, setVisits] = useState<Visit[]>([]);
  const [outbox, setOutbox] = useState<OutboxItem[]>([]);
  const [currentVisit, setCurrentVisit] = useState<Visit | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [workStatus, setWorkStatusState] = useState<WorkStatus>('offDuty');
  const [clockInTime, setClockInTime] = useState<string | null>(null);
  const [breakStartTime, setBreakStartTime] = useState<string | null>(null);
  const [totalWorkTime, setTotalWorkTime] = useState<number>(0);
  const [breakTimeRemaining, setBreakTimeRemaining] = useState<number>(0);
  const [dailySummary, setDailySummary] = useState<DailySummary | null>(null);
  const [agreements, setAgreements] = useState<Agreement[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const API_URL = `https://${projectId}.supabase.co/functions/v1/make-server-d80cbf4a`;

  const BREAK_DURATION = 30 * 60; // 30 minutes in seconds
  const BREAK_WARNING_TIME = 5 * 60; // 5 minutes warning

  // Calculate daily summary
  const calculateDailySummary = (): DailySummary => {
    const today = new Date().toDateString();
    const todayVisits = visits.filter(v => v.endTime && new Date(v.endTime).toDateString() === today);
    
    return {
      totalVisits: todayVisits.length,
      totalDeals: todayVisits.filter(v => v.outcome === 'deal').length,
      totalAppointments: todayVisits.filter(v => v.outcome === 'appointment').length,
      totalFollowUps: todayVisits.filter(v => v.outcome === 'busy').length,
      totalWorkTime,
      date: today,
    };
  };

  // Handle work status changes
  const handleSetWorkStatus = (status: WorkStatus) => {
    const now = new Date().toISOString();
    
    if (status === 'clockedIn' && workStatus === 'offDuty') {
      // Clock In
      setClockInTime(now);
      localStorage.setItem('clockInTime', now);
    } else if (status === 'offDuty' && workStatus !== 'offDuty') {
      // Clock Out
      if (clockInTime) {
        const duration = Math.floor((new Date().getTime() - new Date(clockInTime).getTime()) / 1000);
        setTotalWorkTime(duration);
      }
      setClockInTime(null);
      localStorage.removeItem('clockInTime');
    } else if (status === 'break' && workStatus !== 'break') {
      // Start Break
      setBreakStartTime(now);
      localStorage.setItem('breakStartTime', now);
    } else if (status === 'clockedIn' && workStatus === 'break') {
      // End Break
      if (breakStartTime) {
        const breakDuration = Math.floor((new Date().getTime() - new Date(breakStartTime).getTime()) / 1000);
        setBreakTimeRemaining(breakTimeRemaining + breakDuration);
      }
      setBreakStartTime(null);
      localStorage.removeItem('breakStartTime');
    }
    
    setWorkStatusState(status);
    localStorage.setItem('workStatus', status);
  };

  // Calculate canAddData: only allow when clockedIn
  const canAddData = workStatus === 'clockedIn';

  // Load data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    const savedAccounts = localStorage.getItem('accounts');
    const savedVisits = localStorage.getItem('visits');
    const savedOutbox = localStorage.getItem('outbox');
    const savedWorkStatus = localStorage.getItem('workStatus');
    const savedClockInTime = localStorage.getItem('clockInTime');
    const savedBreakStartTime = localStorage.getItem('breakStartTime');
    const savedAgreements = localStorage.getItem('agreements');
    const savedAppointments = localStorage.getItem('appointments');
    const savedCurrentVisit = localStorage.getItem('currentVisit');

    if (savedUser) setUser(JSON.parse(savedUser));
    if (savedToken) setAccessToken(savedToken);
    if (savedAccounts) setAccounts(JSON.parse(savedAccounts));
    if (savedVisits) setVisits(JSON.parse(savedVisits));
    if (savedOutbox) setOutbox(JSON.parse(savedOutbox));
    if (savedWorkStatus) setWorkStatusState(savedWorkStatus as WorkStatus);
    if (savedClockInTime) setClockInTime(savedClockInTime);
    if (savedBreakStartTime) setBreakStartTime(savedBreakStartTime);
    if (savedAgreements) setAgreements(JSON.parse(savedAgreements));
    if (savedAppointments) setAppointments(JSON.parse(savedAppointments));
    if (savedCurrentVisit) setCurrentVisit(JSON.parse(savedCurrentVisit));
  }, []);

  // Save to localStorage when data changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));
  }, [accounts]);

  useEffect(() => {
    localStorage.setItem('visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('outbox', JSON.stringify(outbox));
  }, [outbox]);

  useEffect(() => {
    localStorage.setItem('agreements', JSON.stringify(agreements));
  }, [agreements]);

  useEffect(() => {
    localStorage.setItem('appointments', JSON.stringify(appointments));
  }, [appointments]);

  // Fetch accounts and visits when user logs in
  useEffect(() => {
    if (user && accessToken && isOnline) {
      fetchAccountsFromServer();
      fetchVisitsFromServer();
    }
  }, [user, accessToken, isOnline]);

  const fetchAccountsFromServer = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/accounts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.accounts) {
          setAccounts(data.accounts);
        }
      }
    } catch (error) {
      console.log('Error fetching accounts:', error);
    }
  };

  const fetchVisitsFromServer = async () => {
    if (!accessToken) return;

    try {
      const response = await fetch(`${API_URL}/visits`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.visits) {
          setVisits(data.visits);
        }
      }
    } catch (error) {
      console.log('Error fetching visits:', error);
    }
  };

  const login = async (employeeId: string, password: string) => {
    if (!isOnline) {
      throw new Error('لا يمكن تسجيل الدخول لأول مرة بدون إنترنت.');
    }

    try {
      // Sign in with Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: employeeId, // Using employeeId as email for now
        password,
      });

      if (error) {
        throw new Error('بيانات الدخول غير صحيحة.');
      }

      if (!data.session) {
        throw new Error('فشل تسجيل الدخول.');
      }

      // Get user details from server
      const response = await fetch(`${API_URL}/auth/user`, {
        headers: {
          'Authorization': `Bearer ${data.session.access_token}`,
        },
      });

      if (!response.ok) {
        throw new Error('فشل الحصول على بيانات المستخدم.');
      }

      const userData = await response.json();

      const userObj: User = {
        id: data.user.id,
        name: userData.user.name || data.user.user_metadata.name,
        employeeId: userData.user.employeeId || data.user.user_metadata.employeeId,
        email: data.user.email || '',
        company: userData.user.company,
      };

      setUser(userObj);
      setAccessToken(data.session.access_token);
      localStorage.setItem('accessToken', data.session.access_token);
    } catch (error) {
      console.log('Login error:', error);
      throw error;
    }
  };

  const loginOffline = () => {
    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('accessToken');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setAccessToken(savedToken);
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem('accessToken');
    // Keep other data for offline use
  };

  const addAccount = (accountData: Omit<Account, 'id'>): Account => {
    const newAccount: Account = {
      ...accountData,
      id: Date.now().toString(),
    };
    setAccounts(prev => [...prev, newAccount]);
    
    // Add to sync queue
    syncService.addToQueue({
      type: 'account',
      operation: 'create',
      data: newAccount,
    });
    
    return newAccount;
  };

  const syncAccountToServer = async (account: Account) => {
    // This method is now handled by syncService
    syncService.addToQueue({
      type: 'account',
      operation: 'update',
      data: account,
    });
  };

  const updateAccount = (id: string, updates: Partial<Account>) => {
    setAccounts(prev =>
      prev.map(acc => (acc.id === id ? { ...acc, ...updates } : acc))
    );
    
    const updatedAccount = accounts.find(a => a.id === id);
    if (updatedAccount) {
      const updated = { ...updatedAccount, ...updates };
      
      syncService.addToQueue({
        type: 'account',
        operation: 'update',
        data: updated,
      });
    }
  };

  const startVisit = (accountId: string, lat: number, lng: number): Visit => {
    const newVisit: Visit = {
      id: Date.now().toString(),
      accountId,
      startTime: new Date().toISOString(),
      latitude: lat,
      longitude: lng,
    };
    setCurrentVisit(newVisit);
    localStorage.setItem('currentVisit', JSON.stringify(newVisit));
    return newVisit;
  };

  const endVisit = (visitId: string, outcome: Visit['outcome'], notesOrData?: string | any) => {
    const endTime = new Date().toISOString();
    const visit = currentVisit;
    if (!visit) return;

    // Handle both string notes and object data
    let notes = '';
    let additionalData = {};
    
    if (typeof notesOrData === 'string') {
      notes = notesOrData;
    } else if (typeof notesOrData === 'object' && notesOrData !== null) {
      // Extract notes from object if present
      if ('notes' in notesOrData && typeof notesOrData.notes === 'string') {
        notes = notesOrData.notes;
      }
      // Store the entire object as additional data
      // But DON'T include it in the Visit object to avoid rendering issues
      // Instead, we could stringify it or handle it separately
      additionalData = notesOrData;
    }

    const completedVisit: Visit = {
      ...visit,
      endTime,
      outcome,
      notes, // This is always a string now
      duration: Math.floor(
        (new Date(endTime).getTime() - new Date(visit.startTime).getTime()) / 60000
      ),
      // Store additional data separately if needed for backend sync
      // but not in a way that will be rendered directly
    };

    setVisits(prev => [...prev, completedVisit]);
    setCurrentVisit(null);
    localStorage.removeItem('currentVisit');
    
    // Add to sync queue with additional data
    syncService.addToQueue({
      type: 'visit',
      operation: 'create',
      data: {
        ...completedVisit,
        ...additionalData, // Backend can handle the full data
      },
    });

    // Update account last visit
    updateAccount(visit.accountId, { lastVisit: endTime });
  };

  const syncVisitToServer = async (visit: Visit) => {
    // This method is now handled by syncService
    syncService.addToQueue({
      type: 'visit',
      operation: 'create',
      data: visit,
    });
  };

  const addToOutbox = (item: Omit<OutboxItem, 'id' | 'timestamp'>) => {
    const newItem: OutboxItem = {
      ...item,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };
    setOutbox(prev => [...prev, newItem]);
  };

  const syncNow = async () => {
    if (!isOnline) {
      throw new Error('لا يوجد اتصال بالإنترنت');
    }

    if (!accessToken) {
      throw new Error('يجب تسجيل الدخول أولاً');
    }

    try {
      // Process sync queue
      await syncService.processSyncQueue(accessToken);
      
      // Refresh data from server
      await fetchAccountsFromServer();
      await fetchVisitsFromServer();
      
      // Update outbox to reflect sync queue
      const queueSize = syncService.getQueueSize();
      if (queueSize === 0) {
        setOutbox([]);
      }
    } catch (error) {
      console.log('Sync error:', error);
      throw error;
    }
  };

  // Online/Offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync when coming back online
      if (accessToken) {
        syncService.processSyncQueue(accessToken);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [accessToken]);

  // Timer for work time and break time
  useEffect(() => {
    const interval = setInterval(() => {
      if (workStatus === 'clockedIn' && clockInTime) {
        // Update total work time (excluding breaks)
        const now = new Date().getTime();
        const clockIn = new Date(clockInTime).getTime();
        const duration = Math.floor((now - clockIn) / 1000);
        setTotalWorkTime(duration);
      } else if (workStatus === 'break' && breakStartTime) {
        // Update break timer
        const now = new Date().getTime();
        const breakStart = new Date(breakStartTime).getTime();
        const elapsed = Math.floor((now - breakStart) / 1000);
        const remaining = Math.max(0, BREAK_DURATION - elapsed);
        setBreakTimeRemaining(remaining);

        // Show warning notification
        if (remaining === BREAK_WARNING_TIME) {
          // Trigger notification
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('تنبيه: قرب انتهاء الاستراحة', {
              body: 'ستنتهي فترة الاستراحة خلال 5 دقائق',
              icon: '/icon.png',
            });
          }
        }

        // Auto end break when time is up
        if (remaining === 0 && workStatus === 'break') {
          handleSetWorkStatus('clockedIn');
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('انتهت فترة الاستراحة', {
              body: 'يرجى العودة للعمل',
              icon: '/icon.png',
            });
          }
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [workStatus, clockInTime, breakStartTime]);

  // Request notification permission on mount
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Calculate daily summary when clocking out
  useEffect(() => {
    if (workStatus === 'offDuty' && totalWorkTime > 0) {
      const summary = calculateDailySummary();
      setDailySummary(summary);
    }
  }, [workStatus]);

  const addAgreement = (agreementData: Omit<Agreement, 'id' | 'createdAt'>): Agreement => {
    const newAgreement: Agreement = {
      ...agreementData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAgreements(prev => [...prev, newAgreement]);
    
    // Add to sync queue
    syncService.addToQueue({
      type: 'agreement',
      operation: 'create',
      data: newAgreement,
    });
    
    return newAgreement;
  };

  const getActiveAgreement = (accountId: string): Agreement | null => {
    return agreements.find(a => a.accountId === accountId && a.status === 'active') || null;
  };

  const addAppointment = (appointmentData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newAppointment: Appointment = {
      ...appointmentData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    setAppointments(prev => [...prev, newAppointment]);
    
    // Add to sync queue
    syncService.addToQueue({
      type: 'appointment',
      operation: 'create',
      data: newAppointment,
    });
    
    return newAppointment;
  };

  const updateAppointment = (id: string, updates: Partial<Appointment>) => {
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, ...updates } : app))
    );
    
    const updatedAppointment = appointments.find(a => a.id === id);
    if (updatedAppointment) {
      const updated = { ...updatedAppointment, ...updates };
      
      syncService.addToQueue({
        type: 'appointment',
        operation: 'update',
        data: updated,
      });
    }
  };

  const getUpcomingAppointments = (accountId?: string): Appointment[] => {
    const now = new Date();
    return appointments.filter(app => 
      (!accountId || app.accountId === accountId) &&
      new Date(app.date) >= now &&
      app.status === 'scheduled'
    );
  };

  return (
    <AppContext.Provider
      value={{
        user,
        isOnline,
        isAuthenticated: !!user,
        accounts,
        visits,
        outbox,
        currentVisit,
        workStatus,
        clockInTime,
        breakStartTime,
        totalWorkTime,
        breakTimeRemaining,
        canAddData,
        dailySummary,
        agreements,
        appointments,
        login,
        loginOffline,
        logout,
        setWorkStatus: handleSetWorkStatus,
        addAccount,
        updateAccount,
        startVisit,
        endVisit,
        addToOutbox,
        syncNow,
        addAgreement,
        getActiveAgreement,
        addAppointment,
        updateAppointment,
        getUpcomingAppointments,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}
