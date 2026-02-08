/**
 * Checkbox Component - FieldCRM Design System
 * Accessible checkbox with indeterminate state
 */

import React, { forwardRef, useEffect, useRef } from 'react';
import { cn } from '../../../utils';
import { Text } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface CheckboxProps extends Omit<BaseComponentProps, 'children'> {
  /** Checked state */
  checked: boolean;
  
  /** Change handler */
  onChange: (checked: boolean) => void;
  
  /** Label text */
  label?: string;
  
  /** Description text */
  description?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Indeterminate state */
  indeterminate?: boolean;
  
  /** Error message */
  error?: string;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Name attribute */
  name?: string;
  
  /** ID attribute */
  id?: string;
  
  /** Value attribute */
  value?: string;
}

const sizeClasses = {
  sm: {
    box: 'w-4 h-4',
    text: 'bodySmall' as const,
    gap: 'gap-2',
  },
  md: {
    box: 'w-5 h-5',
    text: 'bodyMedium' as const,
    gap: 'gap-2.5',
  },
  lg: {
    box: 'w-6 h-6',
    text: 'bodyMedium' as const,
    gap: 'gap-3',
  },
};

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      checked,
      onChange,
      label,
      description,
      disabled = false,
      indeterminate = false,
      error,
      size = 'md',
      name,
      id,
      value,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const checkboxId = id || `checkbox-${name}`;

    // Handle indeterminate state
    useEffect(() => {
      const input = inputRef.current || (ref as any)?.current;
      if (input) {
        input.indeterminate = indeterminate;
      }
    }, [indeterminate, ref]);

    const sizeConfig = sizeClasses[size];

    return (
      <div
        className={cn('flex flex-col', className)}
        style={style}
        data-testid={testId}
      >
        <label
          htmlFor={checkboxId}
          className={cn(
            'inline-flex items-start cursor-pointer select-none',
            sizeConfig.gap,
            disabled && 'cursor-not-allowed opacity-50'
          )}
        >
          {/* Checkbox Container */}
          <div className="relative flex-shrink-0 pt-0.5">
            {/* Hidden native checkbox */}
            <input
              ref={ref || inputRef}
              type="checkbox"
              id={checkboxId}
              name={name}
              value={value}
              checked={checked}
              onChange={(e) => onChange(e.target.checked)}
              disabled={disabled}
              className="sr-only peer"
              aria-describedby={error ? `${checkboxId}-error` : undefined}
              {...props}
            />

            {/* Custom checkbox */}
            <div
              className={cn(
                sizeConfig.box,
                'rounded-md border-2 transition-all duration-200',
                'flex items-center justify-center',
                
                // States
                checked || indeterminate
                  ? 'bg-[var(--button-primary-bg)] border-[var(--button-primary-bg)]'
                  : 'bg-white border-[var(--border-main)]',
                
                // Hover & Focus
                !disabled && 'peer-hover:border-[var(--border-focus)]',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--border-focus)] peer-focus-visible:ring-offset-2',
                
                // Error
                error && !checked && 'border-[var(--status-error)]'
              )}
            >
              {/* Check Icon */}
              {checked && !indeterminate && (
                <svg
                  width={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
                  height={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              )}

              {/* Indeterminate Icon */}
              {indeterminate && (
                <svg
                  width={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
                  height={size === 'sm' ? 12 : size === 'md' ? 14 : 16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="3"
                  strokeLinecap="round"
                >
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              )}
            </div>
          </div>

          {/* Label & Description */}
          {(label || description) && (
            <div className="flex flex-col gap-0.5">
              {label && (
                <Text
                  variant={sizeConfig.text}
                  weight="medium"
                  className="text-[var(--text-primary)]"
                >
                  {label}
                </Text>
              )}
              {description && (
                <Text
                  variant="captionSmall"
                  className="text-[var(--text-tertiary)]"
                >
                  {description}
                </Text>
              )}
            </div>
          )}
        </label>

        {/* Error Message */}
        {error && (
          <div
            id={`${checkboxId}-error`}
            className="flex items-start gap-1.5 mt-1.5 mr-8"
          >
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
            <Text variant="captionSmall" className="text-[var(--status-error)]">
              {error}
            </Text>
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
