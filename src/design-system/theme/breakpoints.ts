/**
 * Breakpoints - FieldCRM Design System
 * Mobile-first responsive design
 */

export const breakpoints = {
  // Mobile
  xs: '0px',      // 0px+ - Mobile portrait
  sm: '480px',    // 480px+ - Mobile landscape
  
  // Tablet
  md: '768px',    // 768px+ - Tablet portrait
  lg: '1024px',   // 1024px+ - Tablet landscape
  
  // Desktop
  xl: '1280px',   // 1280px+ - Desktop
  '2xl': '1536px', // 1536px+ - Large desktop
} as const;

// Container max widths (for content constraint)
export const containerMaxWidth = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
} as const;

export type Breakpoint = typeof breakpoints;
export type BreakpointKey = keyof typeof breakpoints;
