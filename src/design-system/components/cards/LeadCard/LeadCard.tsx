/**
 * LeadCard Component - FieldCRM Design System
 * Display lead/customer information
 */

import React from 'react';
import { cn, formatPhoneNumber, formatDistance } from '../../../utils';
import { Text, Card, Badge } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface LeadCardProps extends BaseComponentProps {
  /** Lead/Customer name */
  name: string;
  
  /** Business name */
  businessName?: string;
  
  /** Phone number */
  phone?: string;
  
  /** Status */
  status: 'hot' | 'warm' | 'cold' | 'new';
  
  /** Distance (in meters) */
  distance?: number;
  
  /** Last contact date */
  lastContact?: string;
  
  /** Notes count */
  notesCount?: number;
  
  /** Click handler */
  onClick?: () => void;
  
  /** Show actions */
  showActions?: boolean;
  
  /** Action handlers */
  onCall?: () => void;
  onNavigate?: () => void;
}

const statusConfig = {
  hot: {
    label: 'ساخن',
    variant: 'error' as const,
  },
  warm: {
    label: 'دافئ',
    variant: 'warning' as const,
  },
  cold: {
    label: 'بارد',
    variant: 'info' as const,
  },
  new: {
    label: 'جديد',
    variant: 'success' as const,
  },
};

export function LeadCard({
  name,
  businessName,
  phone,
  status,
  distance,
  lastContact,
  notesCount,
  onClick,
  showActions = false,
  onCall,
  onNavigate,
  className,
  style,
  testId,
}: LeadCardProps) {
  const statusInfo = statusConfig[status];

  return (
    <Card
      variant="outlined"
      padding="none"
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={cn('overflow-hidden', className)}
      style={style}
      testId={testId}
    >
      {/* Main Content */}
      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0 space-y-1">
            {/* Name */}
            <Text variant="titleMedium" weight="semibold" truncate>
              {name}
            </Text>
            
            {/* Business Name */}
            {businessName && (
              <Text variant="bodySmall" color="secondary" truncate>
                {businessName}
              </Text>
            )}
          </div>

          {/* Status Badge */}
          <Badge
            variant={statusInfo.variant}
            content={statusInfo.label}
            size="sm"
          />
        </div>

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {/* Phone */}
          {phone && (
            <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <Text variant="captionSmall" className="font-mono">
                {formatPhoneNumber(phone)}
              </Text>
            </div>
          )}

          {/* Distance */}
          {distance !== undefined && (
            <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <Text variant="captionSmall">
                {formatDistance(distance)}
              </Text>
            </div>
          )}

          {/* Last Contact */}
          {lastContact && (
            <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <Text variant="captionSmall">
                {lastContact}
              </Text>
            </div>
          )}

          {/* Notes Count */}
          {notesCount !== undefined && notesCount > 0 && (
            <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10 9 9 9 8 9" />
              </svg>
              <Text variant="captionSmall">
                {notesCount} {notesCount === 1 ? 'ملاحظة' : 'ملاحظات'}
              </Text>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {showActions && (onCall || onNavigate) && (
        <div className="flex border-t border-[var(--border-light)]">
          {onCall && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCall();
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2',
                'h-12',
                'transition-colors duration-150',
                'hover:bg-[var(--neutral-slate-50)]',
                'active:bg-[var(--neutral-slate-100)]',
                'text-[var(--brand-blue-600)]',
                onNavigate && 'border-l border-[var(--border-light)]'
              )}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <Text variant="labelMedium">اتصال</Text>
            </button>
          )}

          {onNavigate && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onNavigate();
              }}
              className={cn(
                'flex-1 flex items-center justify-center gap-2',
                'h-12',
                'transition-colors duration-150',
                'hover:bg-[var(--neutral-slate-50)]',
                'active:bg-[var(--neutral-slate-100)]',
                'text-[var(--brand-blue-600)]'
              )}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <Text variant="labelMedium">توجيه</Text>
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
