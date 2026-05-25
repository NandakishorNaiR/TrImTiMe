/**
 * DESIGN SYSTEM - TrimTime Barber Booking
 * Complete design tokens extracted from UI mockups
 * Last Updated: May 25, 2026
 */

export const DESIGN_TOKENS = {
  // ============================================
  // COLORS - Complete Palette
  // ============================================
  colors: {
    // Primary - Deep Purple (Main brand color)
    primary: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7', // Primary
      600: '#9333ea', // Darker shade
      700: '#7e22ce', // Even darker
      800: '#6b21a8',
      900: '#581c87',
    },

    // Secondary - Light Purple/Lavender
    secondary: {
      50: '#fdf8ff',
      100: '#faf5ff',
      200: '#f3e8ff',
      300: '#ede9fe',
      400: '#ddd6fe',
      500: '#c4b5fd',
      600: '#a78bfa',
      700: '#8b5cf6',
      800: '#7c3aed',
      900: '#6d28d9',
    },

    // Accent - Teal/Cyan (Success states, highlights)
    accent: {
      50: '#f0fdfa',
      100: '#ccfbf1',
      200: '#99f6e4',
      300: '#5eead4',
      400: '#2dd4bf',
      500: '#14b8a6', // Accent
      600: '#0d9488',
      700: '#0f766e',
      800: '#134e4a',
      900: '#0f2f2e',
    },

    // Success - Green
    success: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e', // Success
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#145231',
    },

    // Warning - Orange
    warning: {
      50: '#fff7ed',
      100: '#ffedd5',
      200: '#fed7aa',
      300: '#fdba74',
      400: '#fb923c',
      500: '#f97316', // Warning
      600: '#ea580c',
      700: '#c2410c',
      800: '#9a3412',
      900: '#7c2d12',
    },

    // Danger - Red
    danger: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444', // Danger
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d',
    },

    // Neutral - Gray
    neutral: {
      50: '#fafafa',
      100: '#f5f5f5',
      200: '#e5e5e5',
      300: '#d4d4d4',
      400: '#a3a3a3',
      500: '#737373',
      600: '#525252',
      700: '#404040',
      800: '#262626',
      900: '#171717',
    },

    // Backgrounds
    background: {
      light: '#ffffff',
      lighter: '#f9f7ff', // Very light purple tint
      default: '#fafafa',
      dark: '#0f172a',
    },

    // Borders
    border: '#e5e7eb',
    borderLight: '#f3f4f6',

    // Text
    text: {
      primary: '#1f2937',
      secondary: '#6b7280',
      tertiary: '#9ca3af',
      light: '#d1d5db',
      lighter: '#e5e7eb',
    },
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    fontFamily: {
      sans: ['Poppins', 'system-ui', 'sans-serif'],
      serif: ['Georgia', 'serif'],
      mono: ['Menlo', 'monospace'],
    },

    fontSize: {
      // Display
      display: { size: '3.5rem', lineHeight: '1.1', weight: 700 }, // 56px
      h1: { size: '2.5rem', lineHeight: '1.2', weight: 700 }, // 40px
      h2: { size: '2rem', lineHeight: '1.3', weight: 700 }, // 32px
      h3: { size: '1.5rem', lineHeight: '1.4', weight: 600 }, // 24px
      h4: { size: '1.25rem', lineHeight: '1.4', weight: 600 }, // 20px
      h5: { size: '1.125rem', lineHeight: '1.5', weight: 600 }, // 18px
      h6: { size: '1rem', lineHeight: '1.5', weight: 600 }, // 16px

      // Body
      body: { size: '1rem', lineHeight: '1.6', weight: 400 }, // 16px
      bodyLarge: { size: '1.125rem', lineHeight: '1.6', weight: 400 }, // 18px
      bodySmall: { size: '0.875rem', lineHeight: '1.5', weight: 400 }, // 14px
      bodyXSmall: { size: '0.75rem', lineHeight: '1.4', weight: 400 }, // 12px

      // UI
      label: { size: '0.875rem', lineHeight: '1.5', weight: 600 }, // 14px
      caption: { size: '0.75rem', lineHeight: '1.4', weight: 500 }, // 12px
    },

    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
      extrabold: 800,
    },
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    0: '0',
    1: '0.25rem', // 4px
    2: '0.5rem', // 8px
    3: '0.75rem', // 12px
    4: '1rem', // 16px
    6: '1.5rem', // 24px
    8: '2rem', // 32px
    12: '3rem', // 48px
    16: '4rem', // 64px
    20: '5rem', // 80px
    24: '6rem', // 96px
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    none: '0',
    xs: '0.25rem', // 4px
    sm: '0.5rem', // 8px
    md: '0.75rem', // 12px
    lg: '1rem', // 16px
    xl: '1.5rem', // 24px
    full: '9999px',
  },

  // ============================================
  // SHADOWS
  // ============================================
  shadows: {
    none: 'none',
    xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
  },

  // ============================================
  // TRANSITIONS
  // ============================================
  transitions: {
    fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
    base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
    slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    slowest: '500ms cubic-bezier(0.4, 0, 0.2, 1)',
  },

  // ============================================
  // BREAKPOINTS
  // ============================================
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // ============================================
  // COMPONENT STATES
  // ============================================
  states: {
    hover: {
      opacity: 0.8,
      transform: 'scale(1.02)',
    },
    active: {
      opacity: 0.9,
      transform: 'scale(0.98)',
    },
    disabled: {
      opacity: 0.5,
      cursor: 'not-allowed',
    },
    focus: {
      outline: '2px solid',
      outlineOffset: '2px',
    },
  },

  // ============================================
  // GRADIENTS
  // ============================================
  gradients: {
    primary: 'linear-gradient(135deg, #7e22ce 0%, #9333ea 100%)',
    secondary: 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
    accent: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
    warm: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
    cool: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
  },

  // ============================================
  // Z-INDEX
  // ============================================
  zIndex: {
    hide: -1,
    auto: 'auto',
    base: 0,
    dropdown: 1000,
    sticky: 1100,
    fixed: 1200,
    modalBackdrop: 1300,
    modal: 1400,
    popover: 1500,
    tooltip: 1600,
  },
};

export default DESIGN_TOKENS;
