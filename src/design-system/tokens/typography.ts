/**
 * Design Tokens - Typography
 * IBM Plex Sans Arabic with proper weights
 */

export const typography = {
  fonts: {
    primary: "'IBM Plex Sans Arabic', -apple-system, system-ui, sans-serif",
    mono: "'SF Mono', 'Consolas', monospace",
  },

  fontSizes: {
    xs: '11px',
    sm: '13px',
    base: '15px',
    md: '17px',
    lg: '20px',
    xl: '24px',
    '2xl': '28px',
    '3xl': '34px',
    '4xl': '40px',
  },

  fontWeights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },

  lineHeights: {
    tight: 1.2,
    normal: 1.5,
    relaxed: 1.7,
  },

  letterSpacing: {
    tight: '-0.02em',
    normal: '0em',
    wide: '0.02em',
  },
} as const;

export type Typography = typeof typography;
