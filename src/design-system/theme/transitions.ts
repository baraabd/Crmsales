/**
 * Animation & Transitions - FieldCRM Design System
 * Smooth, purposeful motion
 */

export const transitions = {
  // Durations
  duration: {
    instant: '100ms',
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms',
  },

  // Easing functions
  easing: {
    // Standard curves
    standard: 'cubic-bezier(0.4, 0.0, 0.2, 1)',      // Material standard
    decelerate: 'cubic-bezier(0.0, 0.0, 0.2, 1)',    // Entering (ease-out)
    accelerate: 'cubic-bezier(0.4, 0.0, 1, 1)',      // Exiting (ease-in)
    
    // Special curves
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',      // Ease-in-out smooth
  },

  // Common transitions (property + timing)
  common: {
    all: 'all 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    background: 'background-color 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    color: 'color 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    opacity: 'opacity 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    transform: 'transform 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    shadow: 'box-shadow 250ms cubic-bezier(0.4, 0.0, 0.2, 1)',
  },
} as const;

// Animation presets
export const animations = {
  // Fade
  fadeIn: {
    from: { opacity: 0 },
    to: { opacity: 1 },
  },
  fadeOut: {
    from: { opacity: 1 },
    to: { opacity: 0 },
  },

  // Slide
  slideInUp: {
    from: { transform: 'translateY(100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInDown: {
    from: { transform: 'translateY(-100%)', opacity: 0 },
    to: { transform: 'translateY(0)', opacity: 1 },
  },
  slideInRight: {
    from: { transform: 'translateX(100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },
  slideInLeft: {
    from: { transform: 'translateX(-100%)', opacity: 0 },
    to: { transform: 'translateX(0)', opacity: 1 },
  },

  // Scale
  scaleIn: {
    from: { transform: 'scale(0.95)', opacity: 0 },
    to: { transform: 'scale(1)', opacity: 1 },
  },
  scaleOut: {
    from: { transform: 'scale(1)', opacity: 1 },
    to: { transform: 'scale(0.95)', opacity: 0 },
  },

  // Bounce
  bounceIn: {
    '0%': { transform: 'scale(0.95)', opacity: 0 },
    '50%': { transform: 'scale(1.05)' },
    '100%': { transform: 'scale(1)', opacity: 1 },
  },
} as const;

export type Transition = typeof transitions;
export type Animation = typeof animations;
