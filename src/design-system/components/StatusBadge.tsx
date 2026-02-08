/**
 * StatusBadge - Badge component for status indicators
 */

import { ReactNode } from 'react';

interface StatusBadgeProps {
  children: ReactNode;
  variant?: 'success' | 'warning' | 'error' | 'info' | 'default';
  size?: 'sm' | 'md';
  glow?: boolean;
}

export function StatusBadge({ 
  children, 
  variant = 'default', 
  size = 'md',
  glow = false 
}: StatusBadgeProps) {
  const variantStyles = {
    success: {
      bg: 'var(--status-success-bg)',
      text: 'var(--status-success)',
      glow: 'var(--glow-green)',
    },
    warning: {
      bg: 'var(--status-warning-bg)',
      text: 'var(--status-warning)',
      glow: 'var(--glow-orange)',
    },
    error: {
      bg: 'var(--status-error-bg)',
      text: 'var(--status-error)',
      glow: undefined,
    },
    info: {
      bg: 'var(--status-info-bg)',
      text: 'var(--status-info)',
      glow: 'var(--glow-blue)',
    },
    default: {
      bg: 'var(--bg-glass-medium)',
      text: 'var(--text-secondary)',
      glow: undefined,
    },
  };

  const sizeStyles = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const style = variantStyles[variant];

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${sizeStyles[size]}`}
      style={{
        background: style.bg,
        color: style.text,
        boxShadow: glow && style.glow ? style.glow : undefined,
      }}
    >
      {children}
    </span>
  );
}
