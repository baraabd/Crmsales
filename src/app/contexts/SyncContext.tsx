import React, { createContext, useContext, useEffect, useState } from 'react';
import { useApp } from './AppContext';
import { syncService } from '../services/syncService';

export type ConnectionStatus = 'online' | 'offline' | 'syncing';
export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error';
export interface OutboxItem {
  id: string;
  type: 'visit' | 'task' | 'party' | 'quote' | 'media' | 'account' | 'appointment' | 'agreement';
  operation: 'create' | 'update' | 'delete';
  data: any;
  timestamp: number;
  attempts: number;
  maxAttempts: number;
  status: 'pending' | 'uploading' | 'synced' | 'error' | 'conflict';
  error?: string;
  progress?: number;
}
interface SyncContextValue {
  connectionStatus: ConnectionStatus;
  isOnline: boolean;
  syncStatus: SyncStatus;
  lastSyncTime: Date | null;
  lastSyncError: string | null;
  outboxItems: OutboxItem[];
  outboxCount: number;
  conflictCount: number;
  triggerSync: () => Promise<void>;
  addToOutbox: (item: Omit<OutboxItem, 'id' | 'timestamp' | 'attempts' | 'status'>) => void;
  removeFromOutbox: (id: string) => void;
  retryFailedItems: () => Promise<void>;
  resolveConflict: (id: string, resolution: 'local' | 'server') => Promise<void>;
  clearOutbox: () => void;
}
const SyncContext = createContext<SyncContextValue | undefined>(undefined);

/** Compatibility view of the same durable HTTP queue used by AppContext. */
export function SyncProvider({ children }: { children: React.ReactNode }) {
  const { isOnline, syncNow } = useApp();
  const [state, setState] = useState(() => syncService.getState());
  useEffect(() => syncService.subscribe(() => setState(syncService.getState())), []);
  const items: OutboxItem[] = state.items.map(item => ({
    ...item, type: item.type as OutboxItem['type'], timestamp: Date.parse(item.timestamp), attempts: item.retryCount,
    maxAttempts: Number.MAX_SAFE_INTEGER, status: item.status === 'syncing' ? 'uploading' : item.status === 'failed' ? 'error' : 'pending',
  }));
  const value: SyncContextValue = {
    connectionStatus: !isOnline ? 'offline' : state.isSyncing ? 'syncing' : 'online',
    isOnline,
    syncStatus: state.isSyncing ? 'syncing' : state.lastError ? 'error' : state.lastSyncAt ? 'success' : 'idle',
    lastSyncTime: state.lastSyncAt ? new Date(state.lastSyncAt) : null,
    lastSyncError: state.lastError,
    outboxItems: items,
    outboxCount: items.length,
    conflictCount: 0,
    triggerSync: syncNow,
    addToOutbox: item => syncService.addToQueue({ type: item.type, operation: item.operation, data: item.data }),
    removeFromOutbox: id => syncService.removeItem(id),
    retryFailedItems: syncNow,
    resolveConflict: async (_id, _resolution) => { throw new Error('لا توجد آلية لحل التعارضات تلقائيًا؛ لم يتم حذف أي بيانات.'); },
    // Successful requests are removed only after the server acknowledges them.
    // "Clear completed" must never erase pending writes.
    clearOutbox: () => {},
  };
  return <SyncContext.Provider value={value}>{children}</SyncContext.Provider>;
}
export function useSync() {
  const context = useContext(SyncContext);
  if (!context) throw new Error('useSync must be used within SyncProvider');
  return context;
}
