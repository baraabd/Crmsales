/**
 * Step Indicator Component - Jibble Style
 * Shows progress through multi-step flows with theme tokens
 */

import { motion } from 'motion/react';
import { Check } from 'lucide-react';
import { cn } from './utils';

export interface Step {
  label: string;
  description?: string;
}

export interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  className?: string;
}

export function StepIndicator({ steps, currentStep, className }: StepIndicatorProps) {
  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isUpcoming = stepNumber > currentStep;

          return (
            <div key={index} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <motion.div
                  initial={false}
                  animate={{
                    scale: isCurrent ? 1.15 : 1,
                  }}
                  className={cn(
                    'relative rounded-full flex items-center justify-center font-bold transition-all duration-300',
                  )}
                  style={{
                    width: '40px',
                    height: '40px',
                    fontSize: 'var(--font-size-sm)',
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
                      <Check className="size-5" />
                    </motion.div>
                  ) : (
                    <span>{stepNumber}</span>
                  )}
                </motion.div>
                
                {/* Step Label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn('text-xs font-semibold whitespace-nowrap')}
                    style={{
                      color: isCurrent || isCompleted ? 'var(--brand-primary-600)' : 'var(--text-tertiary)',
                    }}
                  >
                    {step.label}
                  </p>
                  {step.description && isCurrent && (
                    <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-secondary)' }}>
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Connecting Line */}
              {index < steps.length - 1 && (
                <div 
                  className="flex-1 h-0.5 mx-2 mb-8 relative overflow-hidden"
                  style={{ background: 'var(--neutral-200)' }}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      width: isCompleted ? '100%' : '0%',
                    }}
                    transition={{ duration: 0.5, ease: 'easeInOut' }}
                    className="absolute inset-y-0 left-0"
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
