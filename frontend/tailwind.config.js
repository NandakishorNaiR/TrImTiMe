/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,jsx}'
    ],
    theme: {
        extend: {
            // ============================================
            // COLORS - Updated Design System
            // ============================================
            colors: {
                // Primary - Deep Purple
                primary: {
                    50: '#faf5ff',
                    100: '#f3e8ff',
                    200: '#e9d5ff',
                    300: '#d8b4fe',
                    400: '#c084fc',
                    500: '#a855f7',
                    600: '#9333ea',
                    700: '#7e22ce',
                    800: '#6b21a8',
                    900: '#581c87',
                    DEFAULT: '#9333ea',
                },

                // Secondary - Light Purple
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
                    DEFAULT: '#7c3aed',
                },

                // Accent - Teal/Cyan
                accent: {
                    50: '#f0fdfa',
                    100: '#ccfbf1',
                    200: '#99f6e4',
                    300: '#5eead4',
                    400: '#2dd4bf',
                    500: '#14b8a6',
                    600: '#0d9488',
                    700: '#0f766e',
                    800: '#134e4a',
                    900: '#0f2f2e',
                    DEFAULT: '#14b8a6',
                },

                // Success - Green
                success: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#166534',
                    900: '#145231',
                    DEFAULT: '#22c55e',
                },

                // Warning - Orange
                warning: {
                    50: '#fff7ed',
                    100: '#ffedd5',
                    200: '#fed7aa',
                    300: '#fdba74',
                    400: '#fb923c',
                    500: '#f97316',
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                    DEFAULT: '#f97316',
                },

                // Danger - Red
                danger: {
                    50: '#fef2f2',
                    100: '#fee2e2',
                    200: '#fecaca',
                    300: '#fca5a5',
                    400: '#f87171',
                    500: '#ef4444',
                    600: '#dc2626',
                    700: '#b91c1c',
                    800: '#991b1b',
                    900: '#7f1d1d',
                    DEFAULT: '#ef4444',
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

                // Background colors
                background: {
                    light: '#ffffff',
                    lighter: '#f9f7ff',
                    default: '#fafafa',
                    dark: '#0f172a',
                },
            },

            // ============================================
            // TYPOGRAPHY
            // ============================================
            fontFamily: {
                sans: ['Poppins', 'system-ui', 'sans-serif'],
                serif: ['Georgia', 'serif'],
                mono: ['Menlo', 'monospace'],
            },

            fontSize: {
                display: ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }],
                h1: ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }],
                h2: ['2rem', { lineHeight: '1.3', fontWeight: '700' }],
                h3: ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }],
                h4: ['1.25rem', { lineHeight: '1.4', fontWeight: '600' }],
                h5: ['1.125rem', { lineHeight: '1.5', fontWeight: '600' }],
                h6: ['1rem', { lineHeight: '1.5', fontWeight: '600' }],
                body: ['1rem', { lineHeight: '1.6', fontWeight: '400' }],
                'body-large': ['1.125rem', { lineHeight: '1.6', fontWeight: '400' }],
                'body-small': ['0.875rem', { lineHeight: '1.5', fontWeight: '400' }],
                'body-xsmall': ['0.75rem', { lineHeight: '1.4', fontWeight: '400' }],
                label: ['0.875rem', { lineHeight: '1.5', fontWeight: '600' }],
                caption: ['0.75rem', { lineHeight: '1.4', fontWeight: '500' }],
            },

            fontWeight: {
                light: '300',
                normal: '400',
                medium: '500',
                semibold: '600',
                bold: '700',
                extrabold: '800',
            },

            // ============================================
            // SPACING
            // ============================================
            spacing: {
                0: '0',
                1: '0.25rem',
                2: '0.5rem',
                3: '0.75rem',
                4: '1rem',
                6: '1.5rem',
                8: '2rem',
                12: '3rem',
                16: '4rem',
                20: '5rem',
                24: '6rem',
            },

            // ============================================
            // BORDER RADIUS
            // ============================================
            borderRadius: {
                xs: '0.25rem',
                sm: '0.5rem',
                md: '0.75rem',
                lg: '1rem',
                xl: '1.5rem',
                card: '1rem',
                full: '9999px',
            },

            // ============================================
            // SHADOWS - Modern Design
            // ============================================
            boxShadow: {
                xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
                sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
                glass: '0 4px 30px rgba(2,6,23,0.12)',
                card: '0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 2px rgba(0, 0, 0, 0.04)',
            },

            // ============================================
            // GRADIENTS
            // ============================================
            backgroundImage: {
                'gradient-primary': 'linear-gradient(135deg, #7e22ce 0%, #9333ea 100%)',
                'gradient-secondary': 'linear-gradient(135deg, #c084fc 0%, #a855f7 100%)',
                'gradient-accent': 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)',
                'gradient-warm': 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)',
                'gradient-cool': 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
            },

            // ============================================
            // TRANSITIONS
            // ============================================
            transitionDuration: {
                fast: '150ms',
                base: '200ms',
                slow: '300ms',
                slowest: '500ms',
            },

            transitionTimingFunction: {
                smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
            },

            // ============================================
            // Z-INDEX
            // ============================================
            zIndex: {
                hide: '-1',
                auto: 'auto',
                base: '0',
                dropdown: '1000',
                sticky: '1100',
                fixed: '1200',
                'modal-backdrop': '1300',
                modal: '1400',
                popover: '1500',
                tooltip: '1600',
            },

            // ============================================
            // BACKDROP BLUR
            // ============================================
            backdropBlur: {
                sm: '4px',
                md: '12px',
                lg: '20px',
            },
        },
    },
    plugins: [],
};