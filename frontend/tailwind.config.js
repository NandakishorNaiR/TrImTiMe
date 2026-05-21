/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './index.html',
        './src/**/*.{js,jsx}'
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: '#111827', // gray-900
                },
                secondary: {
                    DEFAULT: '#4B5563', // gray-600
                },
                accent: {
                    DEFAULT: '#2563EB', // blue-600
                },
                success: {
                    DEFAULT: '#10B981', // green-500
                },
                danger: {
                    DEFAULT: '#EF4444', // red-500
                },
            },
            boxShadow: {
                glass: '0 4px 30px rgba(2,6,23,0.12)',
            },
            backdropBlur: {
                sm: '4px',
            },
            borderRadius: {
                'card': '12px',
            },
        },
    },
    plugins: [],
};