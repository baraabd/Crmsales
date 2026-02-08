/**
 * Sync Context - إدارة حالة المزامنة والأوفلاين
 * Hybrid Pipeline Implementation - Offline-First Architecture
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'syncing';
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';

export interface OutboxItem {
  id: string;
  type: 'visit' | 'task' | 'party' | 'quote' | 'media';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'uploading' | 'synced' | 'error' | 'conflict';
  error?: string;
  progress?: number; // للميديا
}

interface SyncContextValue {
  // حالة الاتصال
  connectionStatus: ConnectionStatus;
  isOnline: boolean;
  
  // حالة المزامنة
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  lastSyncError: string | null;
  
  // Outbox Queue
  outboxItems: OutboxItem[];
  outboxCount: number;
  conflictCount: number;
  
  // Actions
  triggerSync: () => Promise<void>;
  addToOutbox: (item: Omit<OutboxItem, 'id' | 'timestamp' | 'attempts' | 'status'>) => void;
  removeFromOutbox: (id: string) => void;
  retryFailedItems: () => Promise<void>;
  resolveConflict: (id: string, resolution: 'local' | 'server') => Promise<void>;
  clearOutbox: () => void;
}

const SyncContext = createContext<SyncContextValue | undefined>(undefined);

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const [outboxItems, setOutboxItems] = useState<OutboxItem[]>([]);

  const isOnline = connectionStatus === 'online' || connectionStatus === 'syncing';
  const outboxCount = outboxItems.filter(item => item.status === 'pending' || item.status === 'uploading').length;
  const conflictCount = outboxItems.filter(item => item.status === 'conflict').length;

  // مراقبة حالة الاتصال
  useEffect(() => {
    const updateOnlineStatus = () => {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    };

    updateOnlineStatus();
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  // تحميل Outbox من LocalStorage عند البداية
  useEffect(() => {
    const loadOutbox = () => {
      try {
        const saved = localStorage.getItem('crm_outbox');
        if (saved) {
          setOutboxItems(JSON.parse(saved));
        }
      } catch (error) {
        console.error('Failed to load outbox:', error);
      }
    };
    loadOutbox();
  }, []);

  // حفظ Outbox في LocalStorage عند التغيير
  useEffect(() => {
    try {
      localStorage.setItem('crm_outbox', JSON.stringify(outboxItems));
    } catch (error) {
      console.error('Failed to save outbox:', error);
    }
  }, [outboxItems]);

  // المزامنة التلقائية عند الاتصال
  useEffect(() => {
    if (isOnline && outboxCount > 0) {
      const timer = setTimeout(() => {
        triggerSync();
      }, 2000); // تأخير 2 ثانية بعد الاتصال
      return () => clearTimeout(timer);
    }
  }, [isOnline, outboxCount]);

  const triggerSync = useCallback(async () => {
    if (!isOnline || syncStatus === 'syncing') return;

    try {
      setConnectionStatus('syncing');
      setSyncStatus('syncing');
      setLastSyncError(null);

      // محاكاة عملية المزامنة
      await new Promise(resolve => setTimeout(resolve, 1500));

      // معالجة عناصر الـ Outbox
      const itemsToSync = outboxItems.filter(item => 
        item.status === 'pending' && item.attempts < item.maxAttempts
      );

      for (const item of itemsToSync) {
        try {
          // محاكاة رفع البيانات
          await new Promise(resolve => setTimeout(resolve, 500));
          
          // نجحت العملية
          setOutboxItems(prev => 
            prev.map(i => i.id === item.id ? { ...i, status: 'synced' as const } : i)
          );
        } catch (error) {
          // فشلت العملية
          setOutboxItems(prev => 
            prev.map(i => i.id === item.id ? { 
              ...i, 
              attempts: i.attempts + 1,
              status: i.attempts + 1 >= i.maxAttempts ? 'error' as const : 'pending' as const,
              error: 'Sync failed'
            } : i)
          );
        }
      }

      setSyncStatus('success');
      setLastSyncTime(new Date());
      
      // حذف العناصر المتزامنة بعد 5 ثوان
      setTimeout(() => {
        setOutboxItems(prev => prev.filter(item => item.status !== 'synced'));
      }, 5000);

    } catch (error) {
      setSyncStatus('error');
      setLastSyncError(error instanceof Error ? error.message : 'خطأ في المزامنة');
    } finally {
      setConnectionStatus(navigator.onLine ? 'online' : 'offline');
    }
  }, [isOnline, syncStatus, outboxItems]);

  const addToOutbox = useCallback((item: Omit<OutboxItem, 'id' | 'timestamp' | 'attempts' | 'status'>) => {
    const newItem: OutboxItem = {
      ...item,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      attempts: 0,
      status: 'pending'
    };
    setOutboxItems(prev => [...prev, newItem]);
  }, []);

  const removeFromOutbox = useCallback((id: string) => {
    setOutboxItems(prev => prev.filter(item => item.id !== id));
  }, []);

  const retryFailedItems = useCallback(async () => {
    setOutboxItems(prev => 
      prev.map(item => 
        item.status === 'error' ? { ...item, status: 'pending' as const, attempts: 0 } : item
      )
    );
    await triggerSync();
  }, [triggerSync]);

  const resolveConflict = useCallback(async (id: string, resolution: 'local' | 'server') => {
    // معالجة التعارض
    setOutboxItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status: 'pending' as const } : item
      )
    );
    await triggerSync();
  }, [triggerSync]);

  const clearOutbox = useCallback(() => {
    setOutboxItems([]);
  }, []);

  const value: SyncContextValue = {
    connectionStatus,
    isOnline,
    syncStatus,
    lastSyncTime,
    lastSyncError,
    outboxItems,
    outboxCount,
    conflictCount,
    triggerSync,
    addToOutbox,
    removeFromOutbox,
    retryFailedItems,
    resolveConflict,
    clearOutbox,
  };

  return (
    <SyncContext.Provider value={value}>
      {children}
    </SyncContext.Provider>
  );
}

export function useSync() {
  const context = useContext(SyncContext);
  if (!context) {
    throw new Error('useSync must be used within SyncProvider');
  }
  return context;
}
