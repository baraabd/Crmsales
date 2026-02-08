/**
 * Border Radius - Jibble Style (Large & Rounded)
 */

export const radius = {
  // Basic scale (larger than typical)
  none: '0px',
  xs: '8px',
  sm: '12px',
  md: '16px',
  lg: '20px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',

  // Component-specific
  button: '24px',
  card: '32px',
  input: '20px',
  badge: '9999px',
  fab: '24px',
  bottomSheet: '32px',
  dialog: '32px',
} as const;

// Semantic radius for better naming
export const semanticRadius = {
  button: radius.button,
  card: radius.card,
  input: radius.input,
  badge: radius.badge,
  fab: radius.fab,
  bottomSheet: radius.bottomSheet,
  dialog: radius.dialog,
} as const;

export type RadiusScale = typeof radius;
export type SemanticRadiusScale = typeof semanticRadius;