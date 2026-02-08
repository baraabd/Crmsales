/**
 * Banner Component - FieldCRM Design System
 * Inline messages for important information
 */

import React from 'react';
import { cn } from '../../../utils';
import { Text } from '../../../primitives';
import { BaseComponentProps, Status } from '../../../types';

export interface BannerProps extends BaseComponentProps {
  /** Banner variant */
  variant: Status | 'info' | 'offline';
  
  /** Message text */
  message: string;
  
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Dismissible */
  dismissible?: boolean;
  
  /** Dismiss handler */
  onDismiss?: () => void;
  
  /** Icon */
  icon?: React.ReactNode;
  
  /** Size */
  size?: 'sm' | 'md';
}

const variantStyles = {
  success: {
    bg: 'bg-[var(--chip-bg-success)]',
    border: 'border-[var(--status-success)]/20',
    icon: 'text-[var(--status-success)]',
  },
  info: {
    bg: 'bg-[var(--chip-bg-info)]',
    border: 'border-[var(--status-info)]/20',
    icon: 'text-[var(--status-info)]',
  },
  warning: {
    bg: 'bg-[var(--chip-bg-warn)]',
    border: 'border-[var(--status-warning)]/20',
    icon: 'text-[var(--status-warning)]',
  },
  error: {
    bg: 'bg-[var(--chip-bg-error)]',
    border: 'border-[var(--status-error)]/20',
    icon: 'text-[var(--status-error)]',
  },
  offline: {
    bg: 'bg-[var(--neutral-slate-100)]',
    border: 'border-[var(--neutral-slate-300)]',
    icon: 'text-[var(--neutral-slate-600)]',
  },
};

const defaultIcons = {
  success: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  ),
  info: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  warning: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  offline: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M8.5 16.5a5 5 0 0 1 7 0M2 8.82a15 15 0 0 1 4.17-2.65M10.66 5c4.01-.36 8.14.9 11.34 3.76" />
    </svg>
  ),
};

const sizeClasses = {
  sm: 'p-3 gap-2',
  md: 'p-4 gap-3',
};

export function Banner({
  variant,
  message,
  action,
  dismissible = false,
  onDismiss,
  icon,
  size = 'md',
  className,
  style,
  testId,
}: BannerProps) {
  const styles = variantStyles[variant];
  const displayIcon = icon || defaultIcons[variant];

  return (
    <div
      className={cn(
        'flex items-start rounded-[var(--radius-lg)] border',
        styles.bg,
        styles.border,
        sizeClasses[size],
        className
      )}
      style={style}
      data-testid={testId}
      role="alert"
    >
      {/* Icon */}
      {displayIcon && (
        <div className={cn('flex-shrink-0', styles.icon)}>
          {displayIcon}
        </div>
      )}

      {/* Message */}
      <div className="flex-1 min-w-0">
        <Text
          variant={size === 'sm' ? 'bodySmall' : 'bodyMedium'}
          className="text-[var(--text-primary)]"
        >
          {message}
        </Text>
      </div>

      {/* Action Button */}
      {action && (
        <button
          onClick={action.onClick}
          className={cn(
            'flex-shrink-0 px-3 py-1',
            'rounded-lg',
            'text-[13px] font-semibold',
            'transition-colors duration-150',
            'hover:bg-black/5 active:bg-black/10',
            styles.icon
          )}
        >
          {action.label}
        </button>
      )}

      {/* Dismiss Button */}
      {dismissible && onDismiss && (
        <button
          onClick={onDismiss}
          className={cn(
            'flex-shrink-0 p-1',
            'rounded-lg',
            'transition-colors duration-150',
            'hover:bg-black/5 active:bg-black/10',
            'text-[var(--text-tertiary)]'
          )}
          aria-label="إغلاق"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      )}
    </div>
  );
}
