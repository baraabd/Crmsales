/**
 * TopBar Component - FieldCRM Design System
 * Application header with title and actions
 */

import React from 'react';
import { cn } from '../../../utils';
import { Text } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface TopBarProps extends BaseComponentProps {
  /** Page title */
  title: string;
  
  /** Left content (back button, logo) */
  leftContent?: React.ReactNode;
  
  /** Right content (actions, avatar) */
  rightContent?: React.ReactNode;
  
  /** Variant */
  variant?: 'default' | 'transparent' | 'elevated';
  
  /** Show border */
  border?: boolean;
}

const variantClasses = {
  default: 'bg-[var(--bg-surface)]',
  transparent: 'bg-transparent',
  elevated: 'bg-[var(--bg-surface)] shadow-[var(--shadow-level-1)]',
};

export function TopBar({
  title,
  leftContent,
  rightContent,
  variant = 'default',
  border = true,
  className,
  style,
  testId,
}: TopBarProps) {
  return (
    <header
      className={cn(
        'flex items-center justify-between',
        'h-14 px-4',
        'sticky top-0 z-[var(--z-sticky)]',
        variantClasses[variant],
        border && 'border-b border-[var(--border-light)]',
        className
      )}
      style={style}
      data-testid={testId}
    >
      {/* Left Content */}
      <div className="flex items-center gap-2 min-w-0">
        {leftContent}
      </div>

      {/* Title */}
      <div className="flex-1 flex items-center justify-center px-4 min-w-0">
        <Text
          variant="titleLarge"
          weight="semibold"
          truncate
          className="text-[var(--text-primary)]"
        >
          {title}
        </Text>
      </div>

      {/* Right Content */}
      <div className="flex items-center gap-2 min-w-0">
        {rightContent}
      </div>
    </header>
  );
}

// Icon Button for TopBar
export interface TopBarIconButtonProps {
  icon: React.ReactNode;
  onClick?: () => void;
  label: string;
  badge?: number;
}

export function TopBarIconButton({
  icon,
  onClick,
  label,
  badge,
}: TopBarIconButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative',
        'flex items-center justify-center',
        'w-10 h-10',
        'rounded-full',
        'transition-colors duration-150',
        'hover:bg-[var(--neutral-slate-100)]',
        'active:bg-[var(--neutral-slate-200)]',
        'text-[var(--text-primary)]'
      )}
      aria-label={label}
    >
      {icon}
      
      {/* Badge */}
      {badge !== undefined && badge > 0 && (
        <span
          className={cn(
            'absolute -top-0.5 -right-0.5',
            'flex items-center justify-center',
            'min-w-[18px] h-[18px] px-1',
            'rounded-full',
            'bg-[var(--status-error)] text-white',
            'text-[10px] font-bold'
          )}
        >
          {badge > 99 ? '99+' : badge}
        </span>
      )}
    </button>
  );
}

// Back Button for TopBar
export interface TopBarBackButtonProps {
  onClick: () => void;
  label?: string;
}

export function TopBarBackButton({
  onClick,
  label = 'رجوع',
}: TopBarBackButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1',
        'px-2 h-10',
        'rounded-lg',
        'transition-colors duration-150',
        'hover:bg-[var(--neutral-slate-100)]',
        'active:bg-[var(--neutral-slate-200)]',
        'text-[var(--text-primary)]'
      )}
      aria-label={label}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>
  );
}
