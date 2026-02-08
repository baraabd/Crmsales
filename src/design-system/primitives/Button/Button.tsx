/**
 * Button Component - Real Jibble Style
 * Clean orange, subtle shadows, simple design
 */

import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils';
import { BaseComponentProps } from '../../types';

export interface ButtonProps extends Omit<BaseComponentProps, 'children'> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  children: React.ReactNode;
}

const variantClasses = {
  primary: cn(
    'bg-[var(--button-primary-bg)] text-white',
    'hover:bg-[var(--button-primary-hover)]',
    'shadow-sm hover:shadow-md',
    'active:scale-[0.98]'
  ),
  secondary: cn(
    'bg-white text-[var(--text-primary)] border border-[var(--border-main)]',
    'hover:bg-[var(--interactive-hover)] hover:border-[var(--border-strong)]',
    'shadow-xs hover:shadow-sm',
    'active:scale-[0.98]'
  ),
  ghost: cn(
    'bg-transparent text-[var(--text-brand)]',
    'hover:bg-[var(--brand-soft)]',
    'active:bg-[var(--brand-primary-100)]'
  ),
  danger: cn(
    'bg-[var(--status-error)] text-white',
    'hover:bg-[#DC2626]',
    'shadow-sm hover:shadow-md',
    'active:scale-[0.98]'
  ),
  success: cn(
    'bg-[var(--status-success)] text-white',
    'hover:bg-[#15803D]',
    'shadow-sm hover:shadow-md',
    'active:scale-[0.98]'
  ),
};

const sizeClasses = {
  sm: 'h-9 px-4 text-sm gap-2',
  md: 'h-11 px-5 text-base gap-2',
  lg: 'h-[52px] px-6 text-base gap-3',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'lg',
      fullWidth = false,
      disabled = false,
      loading = false,
      startIcon,
      endIcon,
      onClick,
      type = 'button',
      children,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || loading;

    return (
      <motion.button
        ref={ref}
        type={type}
        disabled={isDisabled}
        onClick={onClick}
        whileTap={!isDisabled ? { scale: 0.98 } : undefined}
        className={cn(
          'inline-flex items-center justify-center',
          'rounded-[var(--button-radius)]',
          'font-semibold',
          'transition-all duration-200',
          'focus:outline-none focus:ring-3 focus:ring-[var(--brand-primary-500)]/20',
          variantClasses[variant],
          sizeClasses[size],
          fullWidth && 'w-full',
          isDisabled && 'opacity-50 cursor-not-allowed pointer-events-none',
          className
        )}
        style={style}
        data-testid={testId}
        {...props}
      >
        {loading && (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-5 h-5 border-2 border-current border-t-transparent rounded-full"
          />
        )}
        
        {!loading && startIcon && (
          <span className="flex-shrink-0">{startIcon}</span>
        )}
        
        <span className={cn('truncate', loading && 'opacity-0')}>
          {children}
        </span>
        
        {!loading && endIcon && (
          <span className="flex-shrink-0">{endIcon}</span>
        )}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';