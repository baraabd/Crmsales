/**
 * Dialog Component - FieldCRM Design System
 * Modal dialog with backdrop and animations
 */

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../utils';
import { Text, Button } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface DialogProps extends BaseComponentProps {
  /** Open state */
  open: boolean;
  
  /** Close handler */
  onClose: () => void;
  
  /** Dialog title */
  title?: string;
  
  /** Dialog description */
  description?: string;
  
  /** Primary action button text */
  primaryText?: string;
  
  /** Primary action handler */
  onPrimary?: () => void;
  
  /** Primary button loading state */
  primaryLoading?: boolean;
  
  /** Primary button variant */
  primaryVariant?: 'primary' | 'danger' | 'success';
  
  /** Secondary action button text */
  secondaryText?: string;
  
  /** Secondary action handler */
  onSecondary?: () => void;
  
  /** Close on backdrop click */
  closeOnBackdrop?: boolean;
  
  /** Close on Escape key */
  closeOnEscape?: boolean;
  
  /** Dialog max width */
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  
  /** Custom actions (replaces default buttons) */
  actions?: React.ReactNode;
  
  /** Icon */
  icon?: React.ReactNode;
  
  /** Icon variant (for default icons) */
  iconVariant?: 'info' | 'success' | 'warning' | 'error';
}

const maxWidthClasses = {
  xs: 'max-w-xs',
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const iconVariantIcons = {
  info: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  ),
  success: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  ),
  warning: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  error: (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="10" />
      <line x1="15" y1="9" x2="9" y2="15" />
      <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
  ),
};

const iconVariantColors = {
  info: 'text-[var(--status-info)]',
  success: 'text-[var(--status-success)]',
  warning: 'text-[var(--status-warning)]',
  error: 'text-[var(--status-error)]',
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  primaryText,
  onPrimary,
  primaryLoading = false,
  primaryVariant = 'primary',
  secondaryText,
  onSecondary,
  closeOnBackdrop = true,
  closeOnEscape = true,
  maxWidth = 'sm',
  actions,
  icon,
  iconVariant,
  children,
  className,
  style,
  testId,
}: DialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && closeOnEscape && open) {
        onClose();
      }
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [open, closeOnEscape, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }
  }, [open]);

  const handleBackdropClick = () => {
    if (closeOnBackdrop) {
      onClose();
    }
  };

  const displayIcon = icon || (iconVariant && iconVariantIcons[iconVariant]);

  return (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center p-4"
          data-testid={testId}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-[var(--overlay-strong)] backdrop-blur-sm"
            onClick={handleBackdropClick}
          />

          {/* Dialog */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
            className={cn(
              'relative z-10 w-full',
              maxWidthClasses[maxWidth],
              'bg-white rounded-[var(--radius-xl)]',
              'shadow-[var(--shadow-level-4)]',
              'overflow-hidden',
              className
            )}
            style={style}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? 'dialog-title' : undefined}
            aria-describedby={description ? 'dialog-description' : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Content */}
            <div className="p-6 space-y-4">
              {/* Icon */}
              {displayIcon && (
                <div className="flex justify-center">
                  <div
                    className={cn(
                      'flex items-center justify-center',
                      iconVariant && iconVariantColors[iconVariant]
                    )}
                  >
                    {displayIcon}
                  </div>
                </div>
              )}

              {/* Title */}
              {title && (
                <Text
                  id="dialog-title"
                  variant="headingMedium"
                  align="center"
                  className="text-[var(--text-primary)]"
                >
                  {title}
                </Text>
              )}

              {/* Description */}
              {description && (
                <Text
                  id="dialog-description"
                  variant="bodyMedium"
                  align="center"
                  className="text-[var(--text-secondary)]"
                >
                  {description}
                </Text>
              )}

              {/* Custom Content */}
              {children}
            </div>

            {/* Actions */}
            {(actions || primaryText || secondaryText) && (
              <div className="px-6 pb-6 space-y-3">
                {actions || (
                  <>
                    {/* Primary Button */}
                    {primaryText && onPrimary && (
                      <Button
                        variant={primaryVariant}
                        size="lg"
                        fullWidth
                        onClick={onPrimary}
                        loading={primaryLoading}
                      >
                        {primaryText}
                      </Button>
                    )}

                    {/* Secondary Button */}
                    {secondaryText && (
                      <Button
                        variant="secondary"
                        size="lg"
                        fullWidth
                        onClick={onSecondary || onClose}
                        disabled={primaryLoading}
                      >
                        {secondaryText}
                      </Button>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
