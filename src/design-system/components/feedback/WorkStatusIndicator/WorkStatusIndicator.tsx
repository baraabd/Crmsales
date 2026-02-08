/**
 * Work Status Indicator - Jibble Style
 * Shows Off Duty / Clocked In / Break status
 */

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../utils';
import { Text } from '../../../primitives';

export type WorkStatus = 'offDuty' | 'clockedIn' | 'break';

export interface WorkStatusIndicatorProps {
  status: WorkStatus;
  onStatusChange?: (status: WorkStatus) => void;
  showButtons?: boolean;
  className?: string;
}

const statusConfig = {
  offDuty: {
    label: 'Off Duty',
    labelAr: 'خارج الدوام',
    color: 'text-[var(--status-off-duty)]',
    bg: 'bg-[var(--status-off-duty-bg)]',
    activeBg: 'bg-[var(--status-off-duty)]',
  },
  clockedIn: {
    label: 'Clocked In',
    labelAr: 'في الدوام',
    color: 'text-[var(--status-clocked-in)]',
    bg: 'bg-[var(--status-clocked-in-bg)]',
    activeBg: 'bg-[var(--status-clocked-in)]',
  },
  break: {
    label: 'Break',
    labelAr: 'استراحة',
    color: 'text-[var(--status-break)]',
    bg: 'bg-[var(--status-break-bg)]',
    activeBg: 'bg-[var(--status-break)]',
  },
};

export function WorkStatusIndicator({
  status,
  onStatusChange,
  showButtons = true,
  className,
}: WorkStatusIndicatorProps) {
  if (!showButtons) {
    const config = statusConfig[status];
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-4 h-9 rounded-full',
          config.bg,
          config.color,
          'font-semibold text-sm',
          className
        )}
      >
        <div className={cn('w-2 h-2 rounded-full', config.activeBg)} />
        <span>{config.labelAr}</span>
      </div>
    );
  }

  return (
    <div className={cn('inline-flex items-center gap-1 p-1 bg-white rounded-full shadow-sm border border-[var(--border-light)]', className)}>
      {(Object.keys(statusConfig) as WorkStatus[]).map((statusKey) => {
        const config = statusConfig[statusKey];
        const isActive = status === statusKey;

        return (
          <motion.button
            key={statusKey}
            whileTap={{ scale: 0.95 }}
            onClick={() => onStatusChange?.(statusKey)}
            className={cn(
              'relative px-3 h-8 rounded-full',
              'text-xs font-semibold',
              'transition-all duration-200',
              isActive
                ? cn(config.activeBg, 'text-white shadow-sm')
                : 'text-[var(--text-secondary)] hover:bg-[var(--interactive-hover)]'
            )}
          >
            {isActive && (
              <motion.div
                layoutId="activeStatus"
                className={cn('absolute inset-0 rounded-full', config.activeBg)}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10">{config.labelAr}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
