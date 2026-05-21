// Form validation utilities
export const validators = {
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email) ? null : 'Invalid email address';
    },

    phone: (phone) => {
        const re = /^[6-9]\d{9}$/;
        return re.test(phone) ? null : 'Phone must be 10 digits starting with 6-9';
    },

    password: (password) => {
        if (password.length < 6) return 'Password must be at least 6 characters';
        if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
        if (!/[0-9]/.test(password)) return 'Password must contain number';
        return null;
    },

    name: (name) => {
        if (!name.trim()) return 'Name is required';
        if (name.trim().length < 2) return 'Name must be at least 2 characters';
        return null;
    },

    serviceName: (name) => {
        if (!name.trim()) return 'Service name is required';
        if (name.trim().length < 2) return 'Service name must be at least 2 characters';
        return null;
    },

    price: (price) => {
        const num = parseFloat(price);
        if (isNaN(num) || num <= 0) return 'Price must be greater than 0';
        return null;
    },

    duration: (duration) => {
        const num = parseInt(duration, 10);
        if (isNaN(num) || num < 15) return 'Duration must be at least 15 minutes';
        return null;
    },

    url: (url) => {
        try {
            new URL(url);
            return null;
        } catch {
            return 'Invalid URL';
        }
    },
};

export const validateForm = (formData, rules) => {
    const errors = {};

    Object.entries(rules).forEach(([field, validator]) => {
        const error = validator(formData[field]);
        if (error) {
            errors[field] = error;
        }
    });

    return errors;
};