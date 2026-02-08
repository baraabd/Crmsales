/**
 * Design Tokens - Spacing
 * Consistent spacing scale
 */

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '32px',
  8: '40px',
  9: '48px',
  10: '56px',
  11: '64px',
  12: '80px',
} as const;

export type Spacing = typeof spacing;
