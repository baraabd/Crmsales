/**
 * AppButton - Premium Dark Design System Button
 * Variants: primary (neon green), secondary (blue), ghost, danger
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'warning';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  glow?: boolean;
}

export function AppButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  loading = false,
  glow = false,
  disabled,
  className = '',
  ...props
}: AppButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all rounded-xl border-none cursor-pointer';
  
  const variantStyles = {
    primary: 'bg-[var(--brand-primary)] text-[var(--text-inverse)] hover:bg-[var(--brand-primary-light)] active:bg-[var(--brand-primary-dark)]',
    secondary: 'bg-[var(--brand-secondary)] text-white hover:bg-[var(--brand-secondary-light)] active:bg-[var(--brand-secondary-dark)]',
    ghost: 'bg-[var(--bg-glass-medium)] text-[var(--text-primary)] hover:bg-[var(--bg-glass-heavy)] border border-[var(--ui-border)]',
    danger: 'bg-[var(--accent-red)] text-white hover:opacity-90 active:opacity-80',
    warning: 'bg-[var(--accent-orange)] text-white hover:opacity-90 active:opacity-80',
  };

  const sizeStyles = {
    sm: 'h-9 px-3 text-sm',
    md: 'h-12 px-5 text-base',
    lg: 'h-14 px-6 text-lg',
  };

  const glowStyle = glow ? {
    boxShadow: variant === 'primary' 
      ? 'var(--glow-green)' 
      : variant === 'secondary' 
      ? 'var(--glow-blue)' 
      : variant === 'warning'
      ? 'var(--glow-orange)'
      : undefined
  } : {};

  const disabledStyles = disabled || loading ? 'opacity-40 cursor-not-allowed' : '';

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      className={`
        ${baseStyles}
        ${variantStyles[variant]}
        ${sizeStyles[size]}
        ${fullWidth ? 'w-full' : ''}
        ${disabledStyles}
        ${className}
      `}
      style={glowStyle}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="size-5 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {!loading && icon && iconPosition === 'left' && icon}
      {children}
      {!loading && icon && iconPosition === 'right' && icon}
    </motion.button>
  );
}
