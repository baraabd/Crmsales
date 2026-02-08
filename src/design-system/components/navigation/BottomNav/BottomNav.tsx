/**
 * BottomNav Component - FieldCRM Design System
 * Mobile bottom navigation bar
 */

import React from 'react';
import { cn } from '../../../utils';
import { Text } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface BottomNavItem {
  /** Unique key */
  key: string;
  
  /** Display label */
  label: string;
  
  /** Icon element */
  icon: React.ReactNode;
  
  /** Badge count */
  badge?: number;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Click handler */
  onClick?: () => void;
}

export interface BottomNavProps extends BaseComponentProps {
  /** Navigation items */
  items: BottomNavItem[];
  
  /** Active item key */
  activeKey: string;
  
  /** Change handler */
  onChange: (key: string) => void;
  
  /** Show labels */
  showLabels?: boolean;
}

export function BottomNav({
  items,
  activeKey,
  onChange,
  showLabels = true,
  className,
  style,
  testId,
}: BottomNavProps) {
  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0',
        'z-[var(--z-fixed)]',
        'bg-white',
        'border-t border-[var(--border-light)]',
        'shadow-[0_-2px_8px_rgba(0,0,0,0.08)]',
        'safe-area-inset-bottom',
        className
      )}
      style={style}
      data-testid={testId}
      role="navigation"
      aria-label="التنقل الرئيسي"
    >
      <div className="flex items-stretch h-16">
        {items.map((item) => {
          const isActive = item.key === activeKey;
          const isDisabled = item.disabled;

          return (
            <button
              key={item.key}
              onClick={() => {
                if (!isDisabled) {
                  item.onClick?.();
                  onChange(item.key);
                }
              }}
              disabled={isDisabled}
              className={cn(
                'flex-1',
                'flex flex-col items-center justify-center gap-1',
                'transition-all duration-200',
                'relative',
                isDisabled && 'opacity-40 cursor-not-allowed'
              )}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active Indicator */}
              {isActive && (
                <div
                  className={cn(
                    'absolute top-0 left-1/2 -translate-x-1/2',
                    'w-12 h-1 rounded-full',
                    'bg-[var(--brand-blue-500)]'
                  )}
                />
              )}

              {/* Icon Container */}
              <div className="relative">
                <div
                  className={cn(
                    'flex items-center justify-center',
                    'w-10 h-10',
                    'rounded-full',
                    'transition-all duration-200',
                    isActive
                      ? 'text-[var(--brand-blue-500)] scale-110'
                      : 'text-[var(--text-tertiary)]'
                  )}
                >
                  {item.icon}
                </div>

                {/* Badge */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={cn(
                      'absolute -top-1 -right-1',
                      'flex items-center justify-center',
                      'min-w-[18px] h-[18px] px-1',
                      'rounded-full',
                      'bg-[var(--status-error)] text-white',
                      'text-[10px] font-bold'
                    )}
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              {showLabels && (
                <Text
                  variant="captionSmall"
                  weight={isActive ? 'semibold' : 'medium'}
                  className={cn(
                    'transition-colors duration-200',
                    isActive
                      ? 'text-[var(--brand-blue-500)]'
                      : 'text-[var(--text-tertiary)]'
                  )}
                >
                  {item.label}
                </Text>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
