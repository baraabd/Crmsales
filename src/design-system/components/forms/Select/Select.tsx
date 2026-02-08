/**
 * Select Component - FieldCRM Design System
 * Dropdown select with search and custom rendering
 */

import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { cn } from '../../../utils';
import { Text } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface SelectOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface SelectProps extends Omit<BaseComponentProps, 'children'> {
  /** Field label */
  label?: string;
  
  /** Selected value */
  value: string;
  
  /** Change handler */
  onChange: (value: string) => void;
  
  /** Options */
  options: SelectOption[];
  
  /** Placeholder */
  placeholder?: string;
  
  /** Helper text */
  helperText?: string;
  
  /** Error message */
  error?: string;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Required field */
  required?: boolean;
  
  /** Select size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Enable search */
  searchable?: boolean;
  
  /** Search placeholder */
  searchPlaceholder?: string;
  
  /** Full width */
  fullWidth?: boolean;
  
  /** Name attribute */
  name?: string;
  
  /** ID attribute */
  id?: string;
}

const sizeClasses = {
  sm: 'h-9 px-3 text-[13px]',
  md: 'h-10 px-4 text-[15px]',
  lg: 'h-12 px-4 text-[15px]',
};

export const Select = forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      value,
      onChange,
      options,
      placeholder = 'اختر...',
      helperText,
      error,
      disabled = false,
      required = false,
      size = 'lg',
      searchable = false,
      searchPlaceholder = 'بحث...',
      fullWidth = true,
      name,
      id,
      className,
      style,
      testId,
      ...props
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const containerRef = useRef<HTMLDivElement>(null);
    const selectId = id || `select-${name}`;

    const selectedOption = options.find((opt) => opt.value === value);
    const hasError = Boolean(error);

    // Filter options based on search
    const filteredOptions = searchable
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : options;

    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
          document.removeEventListener('mousedown', handleClickOutside);
      }
    }, [isOpen]);

    // Close on Escape key
    useEffect(() => {
      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape' && isOpen) {
          setIsOpen(false);
          setSearchQuery('');
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen]);

    const handleSelect = (optionValue: string) => {
      onChange(optionValue);
      setIsOpen(false);
      setSearchQuery('');
    };

    return (
      <div
        ref={containerRef}
        className={cn('flex flex-col gap-2', fullWidth && 'w-full', className)}
        style={style}
        data-testid={testId}
      >
        {/* Label */}
        {label && (
          <label htmlFor={selectId}>
            <Text variant="labelMedium" className="text-[var(--text-secondary)]">
              {label}
              {required && (
                <span className="text-[var(--status-error)] mr-1">*</span>
              )}
            </Text>
          </label>
        )}

        {/* Select Button */}
        <div className="relative">
          <button
            type="button"
            id={selectId}
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              'w-full flex items-center justify-between',
              'rounded-[var(--input-radius)]',
              'border',
              'font-[var(--font-family-primary)]',
              'transition-all duration-200',
              'text-right',
              
              // Size
              sizeClasses[size],
              
              // States
              hasError
                ? 'border-[var(--status-error)]'
                : 'border-[var(--border-main)]',
              
              // Focus
              isOpen && !hasError && 'border-[var(--border-focus)] ring-2 ring-[var(--border-focus)]/20',
              
              // Colors
              'bg-white',
              selectedOption
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-tertiary)]',
              
              // Disabled
              disabled && 'opacity-50 cursor-not-allowed bg-[var(--neutral-slate-50)]',
              
              // Focus
              'focus:outline-none',
              !disabled && !hasError && 'focus:border-[var(--border-focus)] focus:ring-2 focus:ring-[var(--border-focus)]/20'
            )}
            aria-haspopup="listbox"
            aria-expanded={isOpen}
            aria-labelledby={label ? selectId : undefined}
          >
            <span className="flex items-center gap-2 truncate">
              {selectedOption?.icon}
              {selectedOption?.label || placeholder}
            </span>

            {/* Chevron Icon */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className={cn(
                'flex-shrink-0 transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown */}
          {isOpen && (
            <div
              className={cn(
                'absolute z-50 w-full mt-2',
                'bg-white rounded-[var(--radius-lg)] border border-[var(--border-main)]',
                'shadow-[var(--shadow-level-3)]',
                'overflow-hidden'
              )}
              role="listbox"
            >
              {/* Search Input */}
              {searchable && (
                <div className="p-2 border-b border-[var(--border-light)]">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={searchPlaceholder}
                    className={cn(
                      'w-full h-9 px-3 text-[13px]',
                      'rounded-lg border border-[var(--border-main)]',
                      'focus:outline-none focus:border-[var(--border-focus)] focus:ring-1 focus:ring-[var(--border-focus)]'
                    )}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}

              {/* Options List */}
              <div className="max-h-60 overflow-y-auto">
                {filteredOptions.length === 0 ? (
                  <div className="p-4 text-center">
                    <Text variant="bodySmall" className="text-[var(--text-tertiary)]">
                      لا توجد نتائج
                    </Text>
                  </div>
                ) : (
                  filteredOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => !option.disabled && handleSelect(option.value)}
                      disabled={option.disabled}
                      className={cn(
                        'w-full px-4 py-2.5 text-right',
                        'flex items-center gap-2',
                        'transition-colors duration-150',
                        
                        // Selected state
                        option.value === value
                          ? 'bg-[var(--brand-blue-50)] text-[var(--brand-blue-700)]'
                          : 'text-[var(--text-primary)]',
                        
                        // Hover state
                        !option.disabled && 'hover:bg-[var(--neutral-slate-50)]',
                        
                        // Disabled state
                        option.disabled && 'opacity-50 cursor-not-allowed'
                      )}
                      role="option"
                      aria-selected={option.value === value}
                    >
                      {option.icon}
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <Text
                          variant="bodyMedium"
                          weight={option.value === value ? 'semibold' : 'regular'}
                          className="truncate w-full"
                        >
                          {option.label}
                        </Text>
                        {option.description && (
                          <Text
                            variant="captionSmall"
                            className="text-[var(--text-tertiary)] truncate w-full"
                          >
                            {option.description}
                          </Text>
                        )}
                      </div>
                      
                      {/* Checkmark for selected */}
                      {option.value === value && (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          className="flex-shrink-0"
                        >
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Helper Text / Error */}
        {(helperText || error) && (
          <div className="flex items-start gap-1.5">
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
                error
                  ? 'text-[var(--status-error)]'
                  : 'text-[var(--text-tertiary)]'
              )}
            >
              {error || helperText}
            </Text>
          </div>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
