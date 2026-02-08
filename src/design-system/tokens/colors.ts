/**
 * Design Tokens - Colors
 * Dark theme with neon accents inspired by modern field apps
 */

export const colors = {
  // Brand Colors - Neon Green Primary
  brand: {
    primary: '#00FF88',      // Neon green
    primaryDark: '#00CC6E',
    primaryLight: '#33FFA3',
    secondary: '#0099FF',    // Bright blue
    secondaryDark: '#007ACC',
    secondaryLight: '#33AAFF',
  },

  // Accent Colors
  accent: {
    orange: '#FF9500',
    red: '#FF3B30',
    purple: '#7B61FF',
    cyan: '#00D9FF',
  },

  // Background - Dark theme
  bg: {
    primary: '#0A0E14',      // Very dark blue-black
    secondary: '#141B26',    // Dark surface
    tertiary: '#1C2533',     // Elevated surface
    overlay: 'rgba(10, 14, 20, 0.85)',
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#9BA5B7',
    tertiary: '#6B7685',
    inverse: '#0A0E14',
  },

  // Status
  status: {
    success: '#00FF88',
    warning: '#FF9500',
    error: '#FF3B30',
    info: '#0099FF',
  },

  // UI Elements
  ui: {
    border: 'rgba(255, 255, 255, 0.1)',
    divider: 'rgba(255, 255, 255, 0.08)',
    cardBg: 'rgba(28, 37, 51, 0.6)',        // Glass effect
    cardBgSolid: '#1C2533',
    inputBg: 'rgba(28, 37, 51, 0.8)',
    backdrop: 'rgba(10, 14, 20, 0.75)',
  },

  // Map specific
  map: {
    markerActive: '#00FF88',
    markerInactive: '#6B7685',
    routeLine: '#0099FF',
    locationDot: '#FF3B30',
  },

  // Glassmorphism
  glass: {
    light: 'rgba(255, 255, 255, 0.05)',
    medium: 'rgba(255, 255, 255, 0.08)',
    heavy: 'rgba(255, 255, 255, 0.12)',
  },
} as const;

export type Colors = typeof colors;
