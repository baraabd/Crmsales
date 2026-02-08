/**
 * Typography Scale - FieldCRM Design System
 * IBM Plex Sans Arabic - Professional Arabic font
 * Scale based on Material Design 3 & iOS Human Interface Guidelines
 */

export const typography = {
  // Font Family
  fontFamily: {
    primary: "'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    mono: "'IBM Plex Mono', 'Courier New', monospace",
  },

  // Font Weights
  fontWeight: {
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },

  // Font Sizes (Mobile-first, fluid scale)
  fontSize: {
    xs: '11px',    // Micro text, timestamps
    sm: '13px',    // Captions, helper text
    base: '15px',  // Body text, inputs
    md: '16px',    // Comfortable body
    lg: '18px',    // Emphasized text
    xl: '20px',    // Small headings
    '2xl': '24px', // Section headings
    '3xl': '28px', // Screen titles
    '4xl': '32px', // Display text
    '5xl': '40px', // Hero text
  },

  // Line Heights (optimized for Arabic)
  lineHeight: {
    tight: '1.2',    // Headings
    snug: '1.35',    // Emphasized text
    normal: '1.5',   // Body text
    relaxed: '1.65', // Long form content
  },

  // Letter Spacing (subtle for Arabic)
  letterSpacing: {
    tighter: '-0.02em',
    tight: '-0.01em',
    normal: '0',
    wide: '0.01em',
  },

  // Text Styles (Predefined combinations)
  styles: {
    // Display Styles
    displayLarge: {
      fontSize: '40px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.02em',
    },
    displayMedium: {
      fontSize: '32px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },
    displaySmall: {
      fontSize: '28px',
      fontWeight: '700',
      lineHeight: '1.2',
      letterSpacing: '-0.01em',
    },

    // Heading Styles
    headingLarge: {
      fontSize: '24px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '-0.01em',
    },
    headingMedium: {
      fontSize: '20px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '0',
    },
    headingSmall: {
      fontSize: '18px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '0',
    },

    // Title Styles (for cards, sections)
    titleLarge: {
      fontSize: '16px',
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    titleMedium: {
      fontSize: '15px',
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    titleSmall: {
      fontSize: '13px',
      fontWeight: '600',
      lineHeight: '1.5',
      letterSpacing: '0',
    },

    // Body Styles
    bodyLarge: {
      fontSize: '16px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    bodyMedium: {
      fontSize: '15px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },
    bodySmall: {
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '1.5',
      letterSpacing: '0',
    },

    // Label Styles (for buttons, inputs)
    labelLarge: {
      fontSize: '15px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '0',
    },
    labelMedium: {
      fontSize: '13px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '0',
    },
    labelSmall: {
      fontSize: '11px',
      fontWeight: '600',
      lineHeight: '1.35',
      letterSpacing: '0',
    },

    // Caption & Helper Text
    caption: {
      fontSize: '13px',
      fontWeight: '400',
      lineHeight: '1.35',
      letterSpacing: '0',
    },
    captionSmall: {
      fontSize: '11px',
      fontWeight: '400',
      lineHeight: '1.35',
      letterSpacing: '0',
    },
  },
} as const;

export type Typography = typeof typography;
export type TypographyStyle = keyof typeof typography.styles;
