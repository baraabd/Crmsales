/**
 * Card Component - Real Jibble Style
 * Clean white, subtle shadows, simple borders
 */

import React, { forwardRef } from 'react';
import { motion } from 'motion/react';
import { cn } from '../../utils';
import { BaseComponentProps } from '../../types';

export interface CardProps extends BaseComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  padding?: 'none' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  interactive?: boolean;
  onClick?: () => void;
}

const variantClasses = {
  elevated: cn(
    'bg-white',
    'shadow-card',
    'hover:shadow-md',
    'border border-transparent'
  ),
  outlined: cn(
    'bg-white',
    'border border-[var(--border-light)]',
    'hover:border-[var(--border-main)]',
    'shadow-xs'
  ),
  filled: cn(
    'bg-[var(--neutral-50)]',
    'border border-transparent'
  ),
};

const paddingClasses = {
  none: '',
  xs: 'p-2',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-5',
  xl: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      variant = 'elevated',
      padding = 'md',
      interactive = false,
      onClick,
      children,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const Component = interactive ? motion.button : motion.div;

    return (
      <Component
        ref={ref as any}
        onClick={onClick}
        whileHover={interactive ? { y: -2, shadow: 'var(--shadow-md)' } : undefined}
        whileTap={interactive ? { scale: 0.99 } : undefined}
        className={cn(
          'rounded-[var(--card-radius)]',
          'transition-all duration-200',
          variantClasses[variant],
          paddingClasses[padding],
          interactive && 'cursor-pointer hover:shadow-md',
          interactive && 'focus:outline-none focus:ring-3 focus:ring-[var(--brand-primary-500)]/20',
          className
        )}
        style={style}
        data-testid={testId}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Card.displayName = 'Card';