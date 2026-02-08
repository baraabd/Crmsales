/**
 * Text Component - FieldCRM Design System
 * Base text primitive with typography variants
 */

import React from 'react';
import { cn } from '../../utils';
import { BaseComponentProps } from '../../types';
import { TypographyStyle } from '../../theme/typography';

export interface TextProps extends BaseComponentProps {
  /** Typography variant */
  variant?: TypographyStyle;
  
  /** Text color */
  color?: 'primary' | 'secondary' | 'tertiary' | 'inverse' | 'brand' | 'success' | 'error' | 'warning' | 'info';
  
  /** Text alignment */
  align?: 'left' | 'center' | 'right';
  
  /** Text transform */
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  
  /** Weight override */
  weight?: 'regular' | 'medium' | 'semibold' | 'bold';
  
  /** Truncate text */
  truncate?: boolean;
  
  /** Line clamp (max lines before truncating) */
  lineClamp?: number;
  
  /** HTML element to render */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'label';
}

const colorClasses = {
  primary: 'text-[var(--text-primary)]',
  secondary: 'text-[var(--text-secondary)]',
  tertiary: 'text-[var(--text-muted)]',
  inverse: 'text-[var(--text-inverse)]',
  brand: 'text-[var(--brand-blue-600)]',
  success: 'text-[var(--status-success)]',
  error: 'text-[var(--status-error)]',
  warning: 'text-[var(--status-warning)]',
  info: 'text-[var(--status-info)]',
};

const variantClasses: Record<TypographyStyle, string> = {
  displayLarge: 'text-[40px] font-bold leading-[1.2] tracking-[-0.02em]',
  displayMedium: 'text-[32px] font-bold leading-[1.2] tracking-[-0.01em]',
  displaySmall: 'text-[28px] font-bold leading-[1.2] tracking-[-0.01em]',
  
  headingLarge: 'text-[24px] font-semibold leading-[1.35] tracking-[-0.01em]',
  headingMedium: 'text-[20px] font-semibold leading-[1.35]',
  headingSmall: 'text-[18px] font-semibold leading-[1.35]',
  
  titleLarge: 'text-[16px] font-semibold leading-[1.5]',
  titleMedium: 'text-[15px] font-semibold leading-[1.5]',
  titleSmall: 'text-[13px] font-semibold leading-[1.5]',
  
  bodyLarge: 'text-[16px] font-normal leading-[1.5]',
  bodyMedium: 'text-[15px] font-normal leading-[1.5]',
  bodySmall: 'text-[13px] font-normal leading-[1.5]',
  
  labelLarge: 'text-[15px] font-semibold leading-[1.35]',
  labelMedium: 'text-[13px] font-semibold leading-[1.35]',
  labelSmall: 'text-[11px] font-semibold leading-[1.35]',
  
  caption: 'text-[13px] font-normal leading-[1.35]',
  captionSmall: 'text-[11px] font-normal leading-[1.35]',
};

const alignClasses = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

const transformClasses = {
  none: '',
  uppercase: 'uppercase',
  lowercase: 'lowercase',
  capitalize: 'capitalize',
};

const weightClasses = {
  regular: 'font-normal',
  medium: 'font-medium',
  semibold: 'font-semibold',
  bold: 'font-bold',
};

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      variant = 'bodyMedium',
      color = 'primary',
      align,
      transform = 'none',
      weight,
      truncate = false,
      lineClamp,
      as: Component = 'p',
      className,
      style,
      children,
      testId,
      ...props
    },
    ref
  ) => {
    const classes = cn(
      // Base styles
      'font-[var(--font-family-primary)]',
      
      // Variant
      variantClasses[variant],
      
      // Color
      colorClasses[color],
      
      // Alignment
      align && alignClasses[align],
      
      // Transform
      transformClasses[transform],
      
      // Weight override
      weight && weightClasses[weight],
      
      // Truncate
      truncate && 'truncate',
      
      // Line clamp
      lineClamp && `line-clamp-${lineClamp}`,
      
      // Custom className
      className
    );

    return (
      <Component
        ref={ref as any}
        className={classes}
        style={style}
        data-testid={testId}
        {...props}
      >
        {children}
      </Component>
    );
  }
);

Text.displayName = 'Text';
