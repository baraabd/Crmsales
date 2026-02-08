/**
 * FloatingActionButton (FAB)
 * Circular floating button with glow effect
 */

import { ButtonHTMLAttributes } from 'react';
import { motion } from 'motion/react';

interface FABProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'warning' | 'danger' | 'glass';
  size?: 'md' | 'lg';
  glow?: boolean;
  position?: {
    bottom?: string;
    top?: string;
    left?: string;
    right?: string;
  };
}

export function FloatingActionButton({
  icon,
  variant = 'primary',
  size = 'lg',
  glow = true,
  position,
  className = '',
  ...props
}: FABProps) {
  const variantStyles = {
    primary: 'bg-[var(--brand-primary)] text-[var(--text-inverse)]',
    secondary: 'bg-[var(--brand-secondary)] text-white',
    warning: 'bg-[var(--accent-orange)] text-white',
    danger: 'bg-[var(--accent-red)] text-white',
    glass: 'bg-[var(--bg-card)] text-[var(--text-primary)] border border-[var(--ui-border)]',
  };

  const sizeStyles = {
    md: 'size-12',
    lg: 'size-14',
  };

  const iconSizeStyles = {
    md: '[&>svg]:size-5',
    lg: '[&>svg]:size-6',
  };

  const glowStyles = glow ? {
    boxShadow: variant === 'primary' 
      ? 'var(--glow-green)' 
      : variant === 'secondary' 
      ? 'var(--glow-blue)' 
      : variant === 'warning'
      ? 'var(--glow-orange)'
      : 'var(--shadow-xl)'
  } : {
    boxShadow: 'var(--shadow-xl)'
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      className={`
        rounded-full flex items-center justify-center
        backdrop-blur-[16px]
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${iconSizeStyles[size]}
        ${position ? 'fixed' : ''}
        ${className}
      `}
      style={{
        ...glowStyles,
        ...position,
        WebkitBackdropFilter: 'blur(16px)',
      }}
      {...props}
    >
      {icon}
    </motion.button>
  );
}
