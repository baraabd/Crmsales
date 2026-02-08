/**
 * Main Theme Export - FieldCRM Design System
 * Centralized design tokens
 */

import { colors } from './colors';
import { spacing, semanticSpacing } from './spacing';
import { typography } from './typography';
import { radius, semanticRadius } from './radius';
import { shadows, semanticShadows } from './shadows';
import { breakpoints, containerMaxWidth } from './breakpoints';
import { transitions, animations } from './transitions';
import { zIndex } from './zIndex';

export const theme = {
  colors,
  spacing,
  semanticSpacing,
  typography,
  radius,
  semanticRadius,
  shadows,
  semanticShadows,
  breakpoints,
  containerMaxWidth,
  transitions,
  animations,
  zIndex,
} as const;

export type Theme = typeof theme;

// Export individual tokens for convenience
export { colors, spacing, semanticSpacing, typography, radius, semanticRadius, shadows, semanticShadows, breakpoints, containerMaxWidth, transitions, animations, zIndex };

// Common sizes (for components)
export const sizes = {
  // Touch targets (minimum 48px for mobile)
  touchMin: '48px',
  touchComfortable: '56px',
  
  // Icon sizes
  iconXs: '16px',
  iconSm: '20px',
  iconMd: '24px',
  iconLg: '32px',
  iconXl: '40px',
  
  // Avatar sizes
  avatarXs: '24px',
  avatarSm: '32px',
  avatarMd: '40px',
  avatarLg: '48px',
  avatarXl: '64px',
  
  // Button heights
  buttonSm: '32px',
  buttonMd: '40px',
  buttonLg: '48px',
  buttonXl: '56px',
  
  // Input heights
  inputSm: '32px',
  inputMd: '40px',
  inputLg: '48px',
  
  // FAB
  fabSm: '48px',
  fabMd: '56px',
  fabLg: '64px',
  
  // Navigation
  topBarHeight: '56px',
  bottomNavHeight: '64px',
  sidebarWidth: '280px',
  sidebarWidthCollapsed: '72px',
} as const;

export type Sizes = typeof sizes;
