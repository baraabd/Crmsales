/**
 * Badge Component - Jibble Style
 * Vibrant colors, pill shape, bold
 */

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils';
import { BaseComponentProps } from '../../types';

export interface BadgeProps extends BaseComponentProps {
  variant?: 'brand' | 'neutral' | 'success' | 'info' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  dot?: boolean;
  pulse?: boolean;
  content?: React.ReactNode;
  max?: number;
}

const variantClasses = {
  brand: 'bg-[var(--brand-primary-100)] text-[var(--brand-primary-700)] border-[var(--brand-primary-200)]',
  neutral: 'bg-[var(--neutral-100)] text-[var(--neutral-700)] border-[var(--neutral-200)]',
  success: 'bg-[var(--status-success-light)] text-[var(--status-success)] border-[var(--status-success-light)]',
  info: 'bg-[var(--status-info-light)] text-[var(--status-info)] border-[var(--status-info-light)]',
  warning: 'bg-[var(--status-warning-light)] text-[var(--status-warning)] border-[var(--status-warning-light)]',
  error: 'bg-[var(--status-error-light)] text-[var(--status-error)] border-[var(--status-error-light)]',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs min-h-[20px]',
  md: 'px-3 py-1 text-sm min-h-[24px]',
  lg: 'px-4 py-1.5 text-base min-h-[28px]',
};

const dotSizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
};

export function Badge({
  variant = 'brand',
  size = 'md',
  dot = false,
  pulse = false,
  content,
  max = 99,
  className,
  style,
  testId,
}: BadgeProps) {
  // Format content if it's a number
  const formattedContent =
    typeof content === 'number' && max && content > max
      ? `${max}+`
      : content;

  if (dot) {
    return (
      <span
        className={cn('relative inline-flex', className)}
        style={style}
        data-testid={testId}
      >
        <span
          className={cn(
            'inline-flex rounded-full',
            dotSizeClasses[size],
            variantClasses[variant]
          )}
        />
        {pulse && (
          <motion.span
            animate={{
              scale: [1, 1.5, 1.5, 1],
              opacity: [0.7, 0, 0, 0.7],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
            className={cn(
              'absolute inline-flex rounded-full',
              dotSizeClasses[size],
              variantClasses[variant],
              'opacity-75'
            )}
          />
        )}
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center',
        'rounded-full border-2',
        'font-bold',
        'transition-all duration-200',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      style={style}
      data-testid={testId}
    >
      {formattedContent}
    </span>
  );
}