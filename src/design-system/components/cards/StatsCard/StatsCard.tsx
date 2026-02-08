/**
 * StatsCard Component - FieldCRM Design System
 * Display statistics with icon and trend
 */

import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../../utils';
import { Text, Card } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface StatsCardProps extends BaseComponentProps {
  /** Stat label */
  label: string;
  
  /** Stat value */
  value: string | number;
  
  /** Icon */
  icon?: React.ReactNode;
  
  /** Trend (positive/negative percentage) */
  trend?: {
    value: number;
    isPositive?: boolean;
  };
  
  /** Color scheme */
  color?: 'brand' | 'success' | 'warning' | 'info' | 'neutral';
  
  /** Click handler */
  onClick?: () => void;
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

const colorSchemes = {
  brand: {
    bg: 'bg-[var(--brand-blue-50)]',
    icon: 'text-[var(--brand-blue-600)]',
    value: 'text-[var(--brand-blue-700)]',
  },
  success: {
    bg: 'bg-[var(--chip-bg-success)]',
    icon: 'text-[var(--status-success)]',
    value: 'text-[var(--status-success)]',
  },
  warning: {
    bg: 'bg-[var(--chip-bg-warn)]',
    icon: 'text-[var(--status-warning)]',
    value: 'text-[var(--status-warning)]',
  },
  info: {
    bg: 'bg-[var(--chip-bg-info)]',
    icon: 'text-[var(--status-info)]',
    value: 'text-[var(--status-info)]',
  },
  neutral: {
    bg: 'bg-[var(--neutral-slate-100)]',
    icon: 'text-[var(--neutral-slate-600)]',
    value: 'text-[var(--neutral-slate-900)]',
  },
};

const sizeConfig = {
  sm: {
    iconSize: 'w-10 h-10',
    valueVariant: 'headingSmall' as const,
    labelVariant: 'bodySmall' as const,
  },
  md: {
    iconSize: 'w-12 h-12',
    valueVariant: 'headingMedium' as const,
    labelVariant: 'bodyMedium' as const,
  },
  lg: {
    iconSize: 'w-14 h-14',
    valueVariant: 'headingLarge' as const,
    labelVariant: 'bodyLarge' as const,
  },
};

export function StatsCard({
  label,
  value,
  icon,
  trend,
  color = 'brand',
  onClick,
  size = 'md',
  className,
  style,
  testId,
}: StatsCardProps) {
  const colors = colorSchemes[color];
  const config = sizeConfig[size];

  return (
    <Card
      variant="outlined"
      padding="md"
      interactive={Boolean(onClick)}
      onClick={onClick}
      className={className}
      style={style}
      testId={testId}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'flex-shrink-0 rounded-xl flex items-center justify-center',
              config.iconSize,
              colors.bg,
              colors.icon
            )}
          >
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Value */}
          <div className="flex items-baseline gap-2">
            <Text
              variant={config.valueVariant}
              weight="bold"
              className={colors.value}
            >
              {value}
            </Text>

            {/* Trend */}
            {trend && (
              <div
                className={cn(
                  'flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs font-semibold',
                  trend.isPositive
                    ? 'bg-[var(--chip-bg-success)] text-[var(--status-success)]'
                    : 'bg-[var(--chip-bg-error)] text-[var(--status-error)]'
                )}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className={cn(
                    'transition-transform',
                    !trend.isPositive && 'rotate-180'
                  )}
                >
                  <polyline points="18 15 12 9 6 15" />
                </svg>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            )}
          </div>

          {/* Label */}
          <Text
            variant={config.labelVariant}
            color="secondary"
            className="mt-0.5"
          >
            {label}
          </Text>
        </div>
      </div>
    </Card>
  );
}
