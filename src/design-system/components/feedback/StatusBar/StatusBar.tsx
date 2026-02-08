/**
 * StatusBar Component - شريط الحالة العلوي الدائم
 * Persistent Status Bar مع مؤشرات الاتصال والمزامنة
 * UX/UI 2026 - Clean, Minimal, Informative
 */

import React from 'react';
import { cn, formatRelativeTime } from '../../../utils';
import { motion, AnimatePresence } from 'motion/react';

export interface StatusBarProps {
  connectionStatus: 'online' | 'offline' | 'syncing';
  lastSyncTime?: Date | null;
  outboxCount?: number;
  conflictCount?: number;
  className?: string;
  onStatusClick?: () => void;
}

export function StatusBar({
  connectionStatus,
  lastSyncTime,
  outboxCount = 0,
  conflictCount = 0,
  className,
  onStatusClick,
}: StatusBarProps) {
  const getStatusConfig = () => {
    switch (connectionStatus) {
      case 'online':
        return {
          color: 'var(--status-success)',
          bgColor: 'var(--status-success-light)',
          icon: '🟢',
          text: 'متصل',
          textColor: 'var(--status-success)',
        };
      case 'offline':
        return {
          color: 'var(--neutral-500)',
          bgColor: 'var(--neutral-100)',
          icon: '🔴',
          text: 'غير متصل',
          textColor: 'var(--status-error)',
        };
      case 'syncing':
        return {
          color: 'var(--brand-primary-500)',
          bgColor: 'var(--brand-soft)',
          icon: '🔄',
          text: 'يتم المزامنة...',
          textColor: 'var(--brand-primary-600)',
        };
    }
  };

  const status = getStatusConfig();
  const hasIssues = outboxCount > 0 || conflictCount > 0;

  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'sticky top-0 z-[var(--z-sticky)]',
        'bg-[var(--bg-surface)] border-b border-[var(--border-light)]',
        'shadow-[var(--shadow-xs)]',
        className
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between px-4 h-12">
        {/* حالة الاتصال */}
        <button
          onClick={onStatusClick}
          className={cn(
            'flex items-center gap-2 px-3 py-1.5 rounded-full',
            'transition-all duration-[var(--transition-fast)]',
            'hover:opacity-80 active:scale-95'
          )}
          style={{ backgroundColor: status.bgColor }}
        >
          <motion.span
            animate={{ rotate: connectionStatus === 'syncing' ? 360 : 0 }}
            transition={{ 
              repeat: connectionStatus === 'syncing' ? Infinity : 0,
              duration: 1,
              ease: 'linear'
            }}
            className="text-sm"
          >
            {status.icon}
          </motion.span>
          <span 
            className="text-xs font-semibold"
            style={{ color: status.textColor }}
          >
            {status.text}
          </span>
        </button>

        {/* آخر مزامنة */}
        <div className="flex items-center gap-3 text-xs">
          {lastSyncTime && (
            <div className="flex items-center gap-1.5 text-[var(--text-secondary)]">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="23 4 23 10 17 10" />
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
              </svg>
              <span>{formatRelativeTime(lastSyncTime)}</span>
            </div>
          )}

          {/* Outbox Counter */}
          <AnimatePresence>
            {hasIssues && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className={cn(
                  'flex items-center gap-1.5 px-2.5 py-1 rounded-full',
                  conflictCount > 0 
                    ? 'bg-[var(--status-warning-light)]' 
                    : 'bg-[var(--brand-soft)]'
                )}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="17 1 21 5 17 9" />
                  <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                  <polyline points="7 23 3 19 7 15" />
                  <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                </svg>
                <span 
                  className="font-semibold"
                  style={{ 
                    color: conflictCount > 0 
                      ? 'var(--status-warning)' 
                      : 'var(--brand-primary-600)' 
                  }}
                >
                  {outboxCount}
                </span>
                {conflictCount > 0 && (
                  <motion.span
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className="w-1.5 h-1.5 rounded-full bg-[var(--status-warning)]"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* شريط التقدم للمزامنة */}
      <AnimatePresence>
        {connectionStatus === 'syncing' && (
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            exit={{ scaleX: 0 }}
            transition={{ duration: 0.8, ease: 'easeInOut' }}
            className="h-0.5 bg-gradient-to-r from-[var(--brand-primary-400)] to-[var(--brand-primary-600)]"
            style={{ transformOrigin: 'right' }}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

StatusBar.displayName = 'StatusBar';
