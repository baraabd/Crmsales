/**
 * Design Tokens - Shadows & Effects
 * Glassmorphism and glow effects
 */

export const shadows = {
  // Standard shadows
  sm: '0px 2px 8px rgba(0, 0, 0, 0.4)',
  md: '0px 4px 16px rgba(0, 0, 0, 0.5)',
  lg: '0px 8px 24px rgba(0, 0, 0, 0.6)',
  xl: '0px 16px 48px rgba(0, 0, 0, 0.7)',

  // Glow effects for neon elements
  glow: {
    green: '0px 0px 20px rgba(0, 255, 136, 0.4), 0px 0px 40px rgba(0, 255, 136, 0.2)',
    blue: '0px 0px 20px rgba(0, 153, 255, 0.4), 0px 0px 40px rgba(0, 153, 255, 0.2)',
    orange: '0px 0px 20px rgba(255, 149, 0, 0.4), 0px 0px 40px rgba(255, 149, 0, 0.2)',
  },

  // Inner shadows for depth
  inner: 'inset 0px 2px 4px rgba(0, 0, 0, 0.3)',
} as const;

export const effects = {
  // Glassmorphism backdrop blur
  blur: {
    light: 'blur(8px)',
    medium: 'blur(16px)',
    heavy: 'blur(24px)',
  },

  // Transitions
  transition: {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
  },
} as const;

export type Shadows = typeof shadows;
export type Effects = typeof effects;
