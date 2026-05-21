export function formatCurrency(value, locale = 'en-IN', currency = 'INR') {
    const num = Number(value) || 0;
    return new Intl.NumberFormat(locale, { style: 'currency', currency, maximumFractionDigits: 0 }).format(num);
}

export default formatCurrency;