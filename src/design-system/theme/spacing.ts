/**
 * Spacing Scale - FieldCRM Design System
 * Based on 4px grid system (Mobile-optimized)
 */

export const spacing = {
  0: '0px',
  1: '4px',    // 4px - Micro spacing
  2: '8px',    // 8px - Tight spacing
  3: '12px',   // 12px - Compact
  4: '16px',   // 16px - Base unit
  5: '20px',   // 20px - Comfortable
  6: '24px',   // 24px - Standard section spacing
  8: '32px',   // 32px - Large spacing
  10: '40px',  // 40px - Extra large
  12: '48px',  // 48px - Touch target
  16: '64px',  // 64px - Bottom nav height
  20: '80px',  // 80px - Hero spacing
} as const;

// Semantic spacing (use these in components)
export const semanticSpacing = {
  // Component internal spacing
  componentXs: spacing[1],   // 4px - Icon to text
  componentSm: spacing[2],   // 8px - Form label to input
  componentMd: spacing[3],   // 12px - Card internal padding
  componentLg: spacing[4],   // 16px - Standard card padding
  
  // Layout spacing
  screenPadding: spacing[4], // 16px - Screen edges
  sectionGap: spacing[6],    // 24px - Between sections
  cardGap: spacing[3],       // 12px - Between cards
  
  // Touch targets
  touchMin: spacing[12],     // 48px - Minimum touch target
  
  // Navigation
  navHeight: spacing[16],    // 64px - Bottom nav
  topBarHeight: '56px',      // 56px - Top bar
} as const;

export type Spacing = typeof spacing;
export type SpacingKey = keyof typeof spacing;
