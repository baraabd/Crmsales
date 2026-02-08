/**
 * Chip Component - Jibble Style
 * Reusable chip/tag component for selections with theme tokens
 */

import * as React from 'react';
import { cn } from './utils';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
  variant?: 'default' | 'time' | 'date';
  size?: 'sm' | 'md' | 'lg';
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected = false, variant = 'default', size = 'md', children, ...props }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5',
      md: 'px-4 py-2.5',
      lg: 'px-5 py-3',
    };

    const fontSizes = {
      sm: 'var(--font-size-xs)',
      md: 'var(--font-size-sm)',
      lg: 'var(--font-size-base)',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'relative inline-flex items-center justify-center gap-2',
          'rounded-full font-semibold transition-all duration-200',
          'border-2 focus:outline-none',
          'disabled:opacity-50 disabled:cursor-not-allowed',
          sizeClasses[size],
          className
        )}
        style={{
          fontSize: fontSizes[size],
          background: selected
            ? 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))'
            : 'var(--bg-surface)',
          borderColor: selected ? 'var(--brand-primary-500)' : 'var(--border-main)',
          color: selected ? 'var(--text-inverse)' : 'var(--text-primary)',
          boxShadow: selected ? 'var(--shadow-md)' : 'var(--shadow-xs)',
          ...(selected ? {} : {
            ':hover': {
              borderColor: 'var(--brand-primary-300)',
              background: 'var(--brand-soft)',
            }
          }),
        }}
        {...props}
      >
        {selected && variant === 'default' && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
          >
            <Check className="size-4" />
          </motion.span>
        )}
        {children}
      </motion.button>
    );
  }
);

Chip.displayName = 'Chip';

export { Chip };
