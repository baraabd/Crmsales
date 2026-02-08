/**
 * TextField Component - FieldCRM Design System
 * Professional text input with validation & RTL support
 */

import React, { useState, forwardRef } from 'react';
import { cn } from '../../../utils';
import { Text } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface TextFieldProps extends Omit<BaseComponentProps, 'children'> {
  /** Field label */
  label?: string;
  
  /** Input value */
  value: string;
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** Blur handler */
  onBlur?: () => void;
  
  /** Focus handler */
  onFocus?: () => void;
  
  /** Placeholder text */
  placeholder?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Error message */
  error?: string;
  
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url' | 'search';
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Required field */
  required?: boolean;
  
  /** Read-only */
  readOnly?: boolean;
  
  /** Input size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Max length */
  maxLength?: number;
  
  /** Autocomplete */
  autoComplete?: string;
  
  /** Start adornment (icon/text) */
  startAdornment?: React.ReactNode;
  
  /** End adornment (icon/text) */
  endAdornment?: React.ReactNode;
  
  /** Full width */
  fullWidth?: boolean;
  
  /** Auto focus */
  autoFocus?: boolean;
  
  /** Input name */
  name?: string;
  
  /** Input ID */
  id?: string;
}

const sizeClasses = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-10 px-4 text-[15px]',
  lg: 'h-12 px-4 text-[15px]',
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  (
    {
      label,
      value,
      onChange,
      onBlur,
      onFocus,
      placeholder,
      helperText,
      error,
      type = 'text',
      disabled = false,
      required = false,
      readOnly = false,
      size = 'lg',
      maxLength,
      autoComplete,
      startAdornment,
      endAdornment,
      fullWidth = true,
      autoFocus = false,
      name,
      id,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const hasError = Boolean(error);
    const inputId = id || `textfield-${name}`;

    const handleFocus = () => {
      setIsFocused(true);
      onFocus?.();
    };

    const handleBlur = () => {
      setIsFocused(false);
      onBlur?.();
    };

    return (
      <div
        className={cn(
          'flex flex-col gap-2',
          fullWidth && 'w-full',
          className
        )}
        style={style}
        data-testid={testId}
      >
        {/* Label */}
        {label && (
          <label htmlFor={inputId}>
            <Text variant="labelMedium" className="text-[var(--text-secondary)]">
              {label}
              {required && (
                <span className="text-[var(--status-error)] mr-1">*</span>
              )}
            </Text>
          </label>
        )}

        {/* Input Container */}
        <div className="relative">
          {/* Start Adornment */}
          {startAdornment && (
            <div className="absolute right-0 top-0 h-full flex items-center pr-3 pointer-events-none text-[var(--text-tertiary)]">
              {startAdornment}
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            id={inputId}
            name={name}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={maxLength}
            autoComplete={autoComplete}
            autoFocus={autoFocus}
            className={cn(
              // Base styles
              'w-full',
              'rounded-[var(--input-radius)]',
              'border',
              'font-[var(--font-family-primary)]',
              'transition-all duration-200',
              
              // Size
              sizeClasses[size],
              
              // States
              hasError
                ? 'border-[var(--status-error)] focus:border-[var(--status-error)] focus:ring-2 focus:ring-[var(--status-error)]/20'
                : cn(
                    'border-[var(--border-main)]',
                    'focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/20'
                  ),
              
              // Colors
              'bg-white text-[var(--text-primary)]',
              'placeholder:text-[var(--text-tertiary)]',
              
              // Disabled
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--neutral-slate-50)]',
              
              // ReadOnly
              readOnly && 'bg-[var(--neutral-slate-50)] cursor-default',
              
              // Focus
              'focus:outline-none',
              
              // Adornments padding
              startAdornment && 'pr-10',
              endAdornment && 'pl-10'
            )}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />

          {/* End Adornment */}
          {endAdornment && (
            <div className="absolute left-0 top-0 h-full flex items-center pl-3 pointer-events-none text-[var(--text-tertiary)]">
              {endAdornment}
            </div>
          )}
        </div>

        {/* Helper Text / Error */}
        {(helperText || error) && (
          <div
            id={error ? `${inputId}-error` : `${inputId}-helper`}
            className="flex items-start gap-1.5"
          >
            {error && (
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="flex-shrink-0 text-[var(--status-error)] mt-0.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            )}
            <Text
              variant="captionSmall"
              className={cn(
                error ? 'text-[var(--status-error)]' : 'text-[var(--text-tertiary)]'
              )}
            >
              {error || helperText}
            </Text>
          </div>
        )}

        {/* Character Count */}
        {maxLength && !error && (
          <div className="flex justify-end">
            <Text
              variant="captionSmall"
              className={cn(
                'text-[var(--text-tertiary)]',
                value.length > maxLength * 0.9 && 'text-[var(--status-warning)]',
                value.length >= maxLength && 'text-[var(--status-error)]'
              )}
            >
              {value.length} / {maxLength}
            </Text>
          </div>
        )}
      </div>
    );
  }
);

TextField.displayName = 'TextField';
