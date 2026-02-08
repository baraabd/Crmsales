/**
 * Wizard Stepper Component - Jibble Style
 * Advanced stepper for multi-step flows with theme tokens
 */

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from './utils';

export interface WizardStep {
  id: string;
  label: string;
  description?: string;
}

export interface WizardStepperProps {
  steps: WizardStep[];
  currentStepId: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
  allowSkip?: boolean;
}

export function WizardStepper({ 
  steps, 
  currentStepId, 
  onStepClick, 
  className,
  allowSkip = false,
}: WizardStepperProps) {
  const currentIndex = steps.findIndex(s => s.id === currentStepId);

  return (
    <div className={cn('w-full', className)}>
      {/* Mobile: Compact Progress Bar */}
      <div className="block md:hidden">
        <div className="space-y-2">
          {/* Progress Bar */}
          <div 
            className="h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--neutral-200)' }}
          >
            <motion.div
              initial={false}
              animate={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="h-full"
              style={{ 
                background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
              }}
            />
          </div>
          
          {/* Current Step Info */}
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold" style={{ 
                fontSize: 'var(--font-size-sm)',
                color: 'var(--brand-primary-600)',
              }}>
                {steps[currentIndex]?.label}
              </p>
              {steps[currentIndex]?.description && (
                <p style={{ 
                  fontSize: 'var(--font-size-xs)',
                  color: 'var(--text-secondary)',
                }}>
                  {steps[currentIndex]?.description}
                </p>
              )}
            </div>
            <p style={{ 
              fontSize: 'var(--font-size-xs)',
              color: 'var(--text-tertiary)',
              fontWeight: 'var(--font-weight-medium)',
            }}>
              {currentIndex + 1} / {steps.length}
            </p>
          </div>
        </div>
      </div>

      {/* Desktop: Full Stepper */}
      <div className="hidden md:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;
          const isClickable = allowSkip || isCompleted;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Button */}
              <button
                onClick={() => isClickable && onStepClick?.(step.id)}
                disabled={!isClickable}
                className={cn(
                  'flex flex-col items-center transition-opacity',
                  !isClickable && 'cursor-not-allowed',
                  isClickable && 'cursor-pointer hover:opacity-80'
                )}
              >
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  className={cn(
                    'relative rounded-full flex items-center justify-center font-bold transition-all duration-300',
                  )}
                  style={{
                    width: '48px',
                    height: '48px',
                    fontSize: 'var(--font-size-base)',
                    background: isCompleted || isCurrent
                      ? 'linear-gradient(135deg, var(--brand-primary-500), var(--brand-primary-600))'
                      : 'var(--neutral-200)',
                    color: isCompleted || isCurrent ? 'var(--text-inverse)' : 'var(--text-secondary)',
                    boxShadow: isCurrent ? '0 0 0 4px var(--brand-primary-200)' : isCompleted ? 'var(--shadow-md)' : 'none',
                  }}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                    >
                      <Check className="size-6" />
                    </motion.div>
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </motion.div>
                
                {/* Step Label */}
                <div className="mt-3 text-center max-w-[120px]">
                  <p
                    className="font-semibold truncate"
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: isCurrent || isCompleted ? 'var(--brand-primary-600)' : 'var(--text-tertiary)',
                    }}
                  >
                    {step.label}
                  </p>
                  {step.description && (isCurrent || isCompleted) && (
                    <p className="text-xs mt-1 truncate" style={{ color: 'var(--text-secondary)' }}>
                      {step.description}
                    </p>
                  )}
                </div>
              </button>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div 
                  className="flex-1 h-1 mx-3 mb-12 relative overflow-hidden rounded-full"
                  style={{ background: 'var(--neutral-200)' }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-y-0 left-0 rounded-full"
                    style={{ 
                      background: 'linear-gradient(90deg, var(--brand-primary-500), var(--brand-primary-600))',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
