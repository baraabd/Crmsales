/**
 * GlassCard - Glassmorphism Card Component
 * For floating cards with blur effect
 */

import { ReactNode, HTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface GlassCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: ReactNode;
  variant?: 'light' | 'medium' | 'heavy';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  rounded?: 'md' | 'lg' | 'xl' | '2xl';
  shadow?: boolean;
  border?: boolean;
  hover?: boolean;
}

export function GlassCard({
  children,
  variant = 'medium',
  padding = 'md',
  rounded = 'xl',
  shadow = true,
  border = true,
  hover = false,
  className = '',
  style = {},
  ...props
}: GlassCardProps) {
  const variantStyles = {
    light: 'bg-[var(--bg-glass-light)]',
    medium: 'bg-[var(--bg-card)]',
    heavy: 'bg-[var(--bg-card-hover)]',
  };

  const paddingStyles = {
    none: 'p-0',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  };

  const roundedStyles = {
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-[20px]',
    '2xl': 'rounded-3xl',
  };

  const baseStyles = `
    backdrop-blur-[16px]
    ${variantStyles[variant]}
    ${paddingStyles[padding]}
    ${roundedStyles[rounded]}
    ${shadow ? 'shadow-[var(--shadow-lg)]' : ''}
    ${border ? 'border border-[var(--ui-border)]' : ''}
    ${hover ? 'transition-all hover:bg-[var(--bg-card-hover)]' : ''}
  `;

  return (
    <motion.div
      className={`${baseStyles} ${className}`}
      style={{
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        ...style,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
