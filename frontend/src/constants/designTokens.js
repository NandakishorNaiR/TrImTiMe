/**
 * DESIGN SYSTEM - TrimTime Barber Booking (Pro Edition)
 * Modern, professional design tokens
 * Last Updated: May 26, 2026
 */

export const DESIGN_TOKENS = {
    // ============================================
    // COLORS - Modern Professional Palette
    // ============================================
    colors: {
        // Primary - Sophisticated Slate/Indigo (Modern brand)
        primary: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b', // Primary - Slate
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
        },

        // Secondary - Deep Indigo (Accent)
        secondary: {
            50: '#eef2ff',
            100: '#e0e7ff',
            200: '#c7d2fe',
            300: '#a5b4fc',
            400: '#818cf8',
            500: '#6366f1', // Indigo
            600: '#4f46e5',
            700: '#4338ca',
            800: '#3730a3',
            900: '#312e81',
        },

        // Accent - Modern Teal (Highlights)
        accent: {
            50: '#f0fdfa',
            100: '#ccfbf1',
            200: '#99f6e4',
            300: '#5eead4',
            400: '#2dd4bf',
            500: '#14b8a6', // Teal
            600: '#0d9488',
            700: '#0f766e',
            800: '#134e4a',
            900: '#0f2f2e',
        },

        // Success - Modern Green
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

        // Warning - Amber
        warning: {
            50: '#fffbeb',
            100: '#fef3c7',
            200: '#fde68a',
            300: '#fcd34d',
            400: '#fbbf24',
            500: '#f59e0b', // Amber
            600: '#d97706',
            700: '#b45309',
            800: '#92400e',
            900: '#78350f',
        },

        // Danger - Rose
        danger: {
            50: '#fff5f7',
            100: '#ffe4e6',
            200: '#fecdd3',
            300: '#fda4af',
            400: '#f472b6',
            500: '#e91e63', // Rose
            600: '#d81b60',
            700: '#c2185b',
            800: '#ad1457',
            900: '#880e4f',
        },

        // Neutral - Professional Gray
        neutral: {
            50: '#fafafa',
            100: '#f5f5f5',
            200: '#eeeeee',
            300: '#e0e0e0',
            400: '#bdbdbd',
            500: '#9e9e9e',
            600: '#757575',
            700: '#616161',
            800: '#424242',
            900: '#212121',
        },

        // Backgrounds
        background: {
            light: '#ffffff',
            lighter: '#f8fafc', // Clean slate
            default: '#f5f7fa',
            dark: '#0f172a',
        },

        // Borders & Dividers
        border: '#e2e8f0',
        borderLight: '#f1f5f9',

        // Text
        text: {
            primary: '#1e293b',
            secondary: '#64748b',
            tertiary: '#94a3b8',
            light: '#cbd5e1',
            lighter: '#e2e8f0',
        },
    },

    // ============================================
    // TYPOGRAPHY
    // ============================================
    typography: {
        fontFamily: {
            sans: ['Poppins', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
            serif: ['Georgia', 'serif'],
            mono: ['Menlo', 'Monaco', 'monospace'],
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