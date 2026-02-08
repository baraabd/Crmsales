/**
 * Shared TypeScript Types - FieldCRM
 * Common types used across the design system
 */

import { CSSProperties, ReactNode } from 'react';

// ==================== Base Component Props ====================

export interface BaseComponentProps {
  className?: string;
  style?: CSSProperties;
  children?: ReactNode;
  testId?: string;
}

// ==================== Common Prop Types ====================

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type Variant = 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'danger';
export type Status = 'success' | 'info' | 'warning' | 'error';
export type ColorScheme = 'brand' | 'neutral' | 'success' | 'info' | 'warning' | 'error';

// ==================== Layout Props ====================

export interface SpacingProps {
  m?: string | number;
  mt?: string | number;
  mr?: string | number;
  mb?: string | number;
  ml?: string | number;
  mx?: string | number;
  my?: string | number;
  p?: string | number;
  pt?: string | number;
  pr?: string | number;
  pb?: string | number;
  pl?: string | number;
  px?: string | number;
  py?: string | number;
}

export interface FlexProps {
  direction?: 'row' | 'column';
  align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  wrap?: 'nowrap' | 'wrap' | 'wrap-reverse';
  gap?: string | number;
}

// ==================== Interactive Props ====================

export interface InteractiveProps {
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
}

export interface PressableProps extends InteractiveProps {
  onPress?: () => void;
  onLongPress?: () => void;
  pressEffect?: 'scale' | 'opacity' | 'highlight' | 'none';
}

// ==================== Form Props ====================

export interface FormFieldProps<T = string> {
  value: T;
  onChange: (value: T) => void;
  onBlur?: () => void;
  onFocus?: () => void;
  disabled?: boolean;
  readOnly?: boolean;
  error?: string;
  required?: boolean;
}

export interface InputProps extends FormFieldProps {
  label?: string;
  placeholder?: string;
  helperText?: string;
  startAdornment?: ReactNode;
  endAdornment?: ReactNode;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  autoComplete?: string;
  maxLength?: number;
}

// ==================== Navigation Props ====================

export interface NavigationItem {
  key: string;
  label: string;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
  onClick?: () => void;
}

// ==================== Feedback Props ====================

export interface SnackbarProps {
  message: string;
  variant?: Status | 'default';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: ReactNode;
  actions?: ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg';
  closeOnBackdrop?: boolean;
  closeOnEscape?: boolean;
}

export interface BannerProps {
  variant: Status | 'info' | 'offline';
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible?: boolean;
  onDismiss?: () => void;
}

// ==================== Card Props ====================

export interface CardProps extends BaseComponentProps {
  variant?: 'elevated' | 'outlined' | 'filled';
  interactive?: boolean;
  onClick?: () => void;
  padding?: Size | 'none';
}

// ==================== List Props ====================

export interface ListItemProps extends BaseComponentProps {
  interactive?: boolean;
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  startContent?: ReactNode;
  endContent?: ReactNode;
  divider?: boolean;
}

// ==================== Avatar Props ====================

export interface AvatarProps extends BaseComponentProps {
  src?: string;
  alt?: string;
  name?: string;
  size?: Size;
  variant?: 'circular' | 'rounded' | 'square';
  badge?: ReactNode;
  fallback?: ReactNode;
}

// ==================== Badge Props ====================

export interface BadgeProps extends BaseComponentProps {
  content?: string | number;
  variant?: Status | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  max?: number;
  dot?: boolean;
  invisible?: boolean;
}

// ==================== Utility Types ====================

export type ResponsiveValue<T> = T | { xs?: T; sm?: T; md?: T; lg?: T; xl?: T };

export type PolymorphicComponentProps<E extends React.ElementType, P = {}> = P & {
  as?: E;
} & Omit<React.ComponentPropsWithoutRef<E>, keyof P | 'as'>;

// ==================== Animation Types ====================

export interface AnimationProps {
  initial?: CSSProperties;
  animate?: CSSProperties;
  exit?: CSSProperties;
  transition?: {
    duration?: number;
    delay?: number;
    easing?: string;
  };
}

// ==================== Accessibility Types ====================

export interface AccessibilityProps {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-hidden'?: boolean;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-selected'?: boolean;
  'aria-disabled'?: boolean;
  role?: string;
  tabIndex?: number;
}

// ==================== Export All ====================

export type ComponentProps = BaseComponentProps & InteractiveProps & AccessibilityProps;
