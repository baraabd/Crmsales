/**
 * Colors - Real Jibble Style (Orange-based)
 */

export const colors = {
  // Brand Colors (Orange - Jibble Real)
  brand: {
    primary: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316',
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12',
    },
  },

  // Neutral Colors
  neutral: {
    white: '#FFFFFF',
    black: '#111827',
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // Status Colors
  status: {
    success: '#16A34A',
    successLight: '#EAF7EE',
    warning: '#F59E0B',
    warningLight: '#FFF7E6',
    error: '#EF4444',
    errorLight: '#FEECEC',
    info: '#3B82F6',
    infoLight: '#EFF6FF',
  },

  // Work Status Colors (for Clock In/Out/Break)
  workStatus: {
    offDuty: '#6B7280',
    offDutyBg: '#F3F4F6',
    clockedIn: '#F97316',
    clockedInBg: '#FFF2E8',
    break: '#3B82F6',
    breakBg: '#EFF6FF',
  },

  // Soft Backgrounds
  soft: {
    brand: '#FFF2E8',
    success: '#EAF7EE',
    warning: '#FFF7E6',
    danger: '#FEECEC',
  },

  // Functional/Semantic Colors
  functional: {
    background: {
      canvas: '#F7F8FA',
      surface: '#FFFFFF',
      elevated: '#FFFFFF',
      overlay: 'rgba(17, 24, 39, 0.45)',
    },
    text: {
      primary: '#111827',
      secondary: '#6B7280',
      tertiary: '#9CA3AF',
      disabled: '#D1D5DB',
      inverse: '#FFFFFF',
      brand: '#F97316',
      link: '#F97316',
    },
    border: {
      light: '#E5E7EB',
      main: '#D1D5DB',
      strong: '#9CA3AF',
      focus: '#F97316',
      error: '#EF4444',
    },
    interactive: {
      hover: '#F9FAFB',
      pressed: '#F3F4F6',
      disabled: '#E5E7EB',
    },
  },
} as const;

export type ColorPalette = typeof colors;
