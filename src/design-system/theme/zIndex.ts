/**
 * Z-Index Scale - FieldCRM Design System
 * Layering system for proper stacking
 */

export const zIndex = {
  // Base content
  base: 0,
  content: 1,
  
  // Elevated content
  dropdown: 100,
  sticky: 200,
  fixed: 300,
  
  // Overlays
  backdrop: 400,
  drawer: 500,
  modal: 600,
  popover: 700,
  
  // Top layer
  snackbar: 800,
  tooltip: 900,
  notification: 1000,
} as const;

export type ZIndex = typeof zIndex;
export type ZIndexKey = keyof typeof zIndex;
