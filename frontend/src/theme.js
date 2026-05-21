// Central design tokens for components (keeps JS and Tailwind in sync)
export const colors = {
    primary: '#111827', // gray-900
    secondary: '#4B5563', // gray-600
    accent: '#2563EB', // blue-600
    success: '#10B981', // green-500
    danger: '#EF4444', // red-500
};

export const radii = {
    card: '12px',
};

export const shadows = {
    glass: '0 4px 30px rgba(2,6,23,0.12)',
};

export const typography = {
    heading: '1.25rem', // text-xl / text-2xl
    cardTitle: '1rem',
    body: '0.875rem', // text-sm
    meta: '0.75rem',
};

export default {
    colors,
    radii,
    shadows,
    typography,
};