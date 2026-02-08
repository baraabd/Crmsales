/**
 * EmptyState Component - FieldCRM Design System
 * Display when no content is available
 */

import React from 'react';
import { cn } from '../../../utils';
import { Text, Button } from '../../../primitives';
import { BaseComponentProps } from '../../../types';

export interface EmptyStateProps extends BaseComponentProps {
  /** Icon or illustration */
  icon?: React.ReactNode;
  
  /** Title */
  title: string;
  
  /** Description */
  description?: string;
  
  /** Action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Size */
  size?: 'sm' | 'md' | 'lg';
}

const sizeConfig = {
  sm: {
    container: 'py-8 px-4',
    icon: 'text-4xl',
    gap: 'gap-2',
  },
  md: {
    container: 'py-12 px-6',
    icon: 'text-5xl',
    gap: 'gap-3',
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'text-6xl',
    gap: 'gap-4',
  },
};

const defaultIcon = (
  <svg
    width="64"
    height="64"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    className="text-[var(--text-tertiary)]"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);

export function EmptyState({
  icon,
  title,
  description,
  action,
  size = 'md',
  className,
  style,
  testId,
}: EmptyStateProps) {
  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        config.container,
        config.gap,
        className
      )}
      style={style}
      data-testid={testId}
    >
      {/* Icon */}
      <div className={cn('flex items-center justify-center', config.icon)}>
        {icon || defaultIcon}
      </div>

      {/* Title */}
      <Text
        variant={size === 'lg' ? 'headingMedium' : 'headingSmall'}
        className="text-[var(--text-primary)]"
      >
        {title}
      </Text>

      {/* Description */}
      {description && (
        <Text
          variant="bodyMedium"
          className="text-[var(--text-secondary)] max-w-sm"
        >
          {description}
        </Text>
      )}

      {/* Action Button */}
      {action && (
        <div className="mt-2">
          <Button
            variant="primary"
            size={size === 'sm' ? 'md' : 'lg'}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}
