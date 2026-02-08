/**
 * Shadows - Jibble Style (Dramatic & Deep)
 */

export const shadows = {
  // Basic shadows
  xs: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  sm: '0px 2px 8px rgba(0, 0, 0, 0.08)',
  md: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  lg: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  xl: '0px 16px 48px rgba(0, 0, 0, 0.20)',
  '2xl': '0px 24px 64px rgba(0, 0, 0, 0.25)',
  inner: 'inset 0px 2px 4px rgba(0, 0, 0, 0.06)',

  // Colored shadows for vibrant depth (Jibble Style)
  primary: '0px 8px 24px rgba(139, 92, 246, 0.25)',
  secondary: '0px 8px 24px rgba(59, 130, 246, 0.25)',
  success: '0px 8px 24px rgba(16, 185, 129, 0.25)',
  error: '0px 8px 24px rgba(239, 68, 68, 0.25)',
  accent: '0px 8px 24px rgba(217, 70, 239, 0.25)',

  // Component-specific
  card: '0px 4px 16px rgba(0, 0, 0, 0.12)',
  cardHover: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  button: '0px 4px 12px rgba(139, 92, 246, 0.25)',
  input: '0px 1px 2px rgba(0, 0, 0, 0.05)',
  inputFocus: '0 0 0 4px rgba(139, 92, 246, 0.1)',
  dropdown: '0px 8px 24px rgba(0, 0, 0, 0.15)',
  fab: '0px 16px 48px rgba(0, 0, 0, 0.20)',
  bottomSheet: '0px 24px 64px rgba(0, 0, 0, 0.25)',
} as const;

// Semantic shadows for better naming
export const semanticShadows = {
  card: shadows.card,
  cardHover: shadows.cardHover,
  button: shadows.button,
  input: shadows.input,
  inputFocus: shadows.inputFocus,
  dropdown: shadows.dropdown,
  fab: shadows.fab,
  bottomSheet: shadows.bottomSheet,
} as const;

export type ShadowScale = typeof shadows;
export type SemanticShadowScale = typeof semanticShadows;