/**
 * AppButtonV2 - Fixed Mobile Version
 */

import { ButtonHTMLAttributes, ReactNode } from 'react';
import { motion } from 'motion/react';

interface AppButtonV2Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
}

export function AppButtonV2({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  disabled,
  className = '',
  ...props
}: AppButtonV2Props) {
  const variants = {
    primary: {
      background: 'var(--color-primary)',
      color: '#000000',
      border: 'none',
    },
    secondary: {
      background: 'var(--bg-card)',
      color: 'var(--text-primary)',
      border: '1px solid var(--border-color)',
    },
    outline: {
      background: 'transparent',
      color: 'var(--color-primary)',
      border: '2px solid var(--color-primary)',
    },
    danger: {
      background: 'var(--color-red)',
      color: '#FFFFFF',
      border: 'none',
    },
  };

  const sizes = {
    sm: {
      height: '40px',
      padding: '0 16px',
      fontSize: '13px',
    },
    md: {
      height: '48px',
      padding: '0 20px',
      fontSize: '15px',
    },
    lg: {
      height: '52px',
      padding: '0 24px',
      fontSize: '16px',
    },
  };

  const style = {
    ...variants[variant],
    ...sizes[size],
    width: fullWidth ? '100%' : 'auto',
    borderRadius: '14px',
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled || loading ? 0.5 : 1,
    boxShadow: variant === 'primary' ? 'var(--shadow-button)' : 'none',
    transition: 'all 0.2s ease',
    touchAction: 'manipulation',
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <motion.button
      whileTap={{ scale: disabled || loading ? 1 : 0.97 }}
      style={style}
      disabled={disabled || loading}
      className={className}
      {...props}
    >
      {loading && (
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
        />
      )}
      {!loading && icon && <div className="[&>svg]:w-5 [&>svg]:h-5">{icon}</div>}
      <span className="truncate">{children}</span>
    </motion.button>
  );
}
