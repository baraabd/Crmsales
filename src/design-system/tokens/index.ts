/**
 * Design System - Theme
 * Central theme configuration
 */

import { colors } from './colors';
import { typography } from './typography';
import { spacing } from './spacing';
import { radius } from './radius';
import { shadows, effects } from './shadows';

export const theme = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  effects,
} as const;

export type Theme = typeof theme;

// Helper to convert theme to CSS variables
export const themeToCSSVariables = (theme: Theme): Record<string, string> => {
  const cssVars: Record<string, string> = {};

  // Colors
  Object.entries(theme.colors.brand).forEach(([key, value]) => {
    cssVars[`--color-brand-${key}`] = value;
  });
  Object.entries(theme.colors.accent).forEach(([key, value]) => {
    cssVars[`--color-accent-${key}`] = value;
  });
  Object.entries(theme.colors.bg).forEach(([key, value]) => {
    cssVars[`--color-bg-${key}`] = value;
  });
  Object.entries(theme.colors.text).forEach(([key, value]) => {
    cssVars[`--color-text-${key}`] = value;
  });
  Object.entries(theme.colors.status).forEach(([key, value]) => {
    cssVars[`--color-status-${key}`] = value;
  });
  Object.entries(theme.colors.ui).forEach(([key, value]) => {
    cssVars[`--color-ui-${key}`] = value;
  });

  // Spacing
  Object.entries(theme.spacing).forEach(([key, value]) => {
    cssVars[`--spacing-${key}`] = value;
  });

  // Radius
  Object.entries(theme.radius).forEach(([key, value]) => {
    cssVars[`--radius-${key}`] = value;
  });

  // Typography
  cssVars['--font-primary'] = theme.typography.fonts.primary;
  cssVars['--font-mono'] = theme.typography.fonts.mono;

  return cssVars;
};
