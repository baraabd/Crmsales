/**
 * AppInput - Premium Dark Input Component
 */

import { InputHTMLAttributes, ReactNode, forwardRef } from 'react';

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

export const AppInput = forwardRef<HTMLInputElement, AppInputProps>(
  ({ label, error, icon, iconPosition = 'right', fullWidth = false, className = '', ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? 'w-full' : ''}`}>
        {label && (
          <label 
            className="text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        
        <div className="relative">
          {icon && iconPosition === 'right' && (
            <div 
              className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {icon}
            </div>
          )}
          
          <input
            ref={ref}
            className={`
              w-full h-12 px-4 rounded-xl
              text-base font-medium
              border transition-all
              ${icon && iconPosition === 'right' ? 'pl-12' : ''}
              ${icon && iconPosition === 'left' ? 'pr-12' : ''}
              ${error ? 'border-[var(--accent-red)]' : 'border-[var(--ui-border)] focus:border-[var(--brand-primary)]'}
              ${className}
            `}
            style={{
              background: 'var(--ui-input-bg)',
              color: 'var(--text-primary)',
              backdropFilter: 'blur(16px)',
              WebkitBackdropFilter: 'blur(16px)',
            }}
            {...props}
          />
          
          {icon && iconPosition === 'left' && (
            <div 
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center"
              style={{ color: 'var(--text-tertiary)' }}
            >
              {icon}
            </div>
          )}
        </div>
        
        {error && (
          <span 
            className="text-sm"
            style={{ color: 'var(--accent-red)' }}
          >
            {error}
          </span>
        )}
      </div>
    );
  }
);

AppInput.displayName = 'AppInput';
