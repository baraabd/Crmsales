/**
 * LoadingOverlay Component - FieldCRM Design System
 * Full-screen loading state
 */

import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../../utils';
import { Text } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface LoadingOverlayProps extends BaseComponentProps {
  /** Show/hide loading overlay */
  visible: boolean;
  
  /** Loading message */
  message?: string;
  
  /** Blur backdrop */
  blur?: boolean;
}

export function LoadingOverlay({
  visible,
  message = 'جاري التحميل...',
  blur = true,
  className,
  style,
  testId,
}: LoadingOverlayProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={cn(
            'fixed inset-0 z-[var(--z-modal)]',
            'flex items-center justify-center',
            'bg-[var(--overlay-strong)]',
            blur && 'backdrop-blur-sm',
            className
          )}
          style={style}
          data-testid={testId}
          role="progressbar"
          aria-label={message}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="flex flex-col items-center gap-4 p-8"
          >
            {/* Spinner */}
            <div className="relative w-16 h-16">
              {/* Outer ring */}
              <motion.div
                className="absolute inset-0 border-4 border-white/20 rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
              
              {/* Inner ring */}
              <motion.div
                className="absolute inset-0 border-4 border-transparent border-t-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  ease: 'linear',
                }}
              />
            </div>

            {/* Message */}
            {message && (
              <Text
                variant="bodyMedium"
                weight="medium"
                className="text-white"
              >
                {message}
              </Text>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
