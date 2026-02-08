/**
 * BottomSheet - Floating bottom sheet with glassmorphism
 */

import { ReactNode, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  height?: 'auto' | 'half' | 'full';
  showHandle?: boolean;
}

export function BottomSheet({
  isOpen,
  onClose,
  children,
  title,
  height = 'auto',
  showHandle = true,
}: BottomSheetProps) {
  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const heightStyles = {
    auto: 'max-h-[90vh]',
    half: 'h-[50vh]',
    full: 'h-[95vh]',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
            style={{ 
              background: 'var(--ui-backdrop)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className={`
              fixed bottom-0 left-0 right-0 z-50
              rounded-t-3xl overflow-hidden
              ${heightStyles[height]}
            `}
            style={{
              background: 'var(--bg-secondary)',
              boxShadow: 'var(--shadow-xl)',
              paddingBottom: 'var(--safe-area-inset-bottom)',
            }}
            dir="rtl"
          >
            {/* Handle */}
            {showHandle && (
              <div className="flex justify-center pt-3 pb-2">
                <div 
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--ui-border)' }}
                />
              </div>
            )}

            {/* Header */}
            {title && (
              <div 
                className="flex items-center justify-between px-6 py-4"
                style={{ borderBottom: '1px solid var(--ui-divider)' }}
              >
                <h3 
                  className="text-lg font-bold"
                  style={{ color: 'var(--text-primary)' }}
                >
                  {title}
                </h3>
                <button
                  onClick={onClose}
                  className="p-2 rounded-full transition-colors"
                  style={{ 
                    background: 'var(--bg-glass-medium)',
                    color: 'var(--text-secondary)',
                  }}
                >
                  <X className="size-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="overflow-y-auto" style={{ maxHeight: height === 'auto' ? '80vh' : '100%' }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
