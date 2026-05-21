import React from 'react';

import Spinner from './ui/Spinner';

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  loading = false,
  icon,
  fullWidth = false,
  ...props
}) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all gap-2 rounded-lg';

  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95 shadow-sm hover:shadow-md disabled:bg-gray-400',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:scale-95 disabled:bg-gray-300',
    outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 disabled:opacity-50',
    ghost: 'text-blue-600 hover:bg-blue-50 disabled:opacity-50',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:scale-95 shadow-sm hover:shadow-md disabled:bg-gray-400',
    success: 'bg-green-600 text-white hover:bg-green-700 active:scale-95 shadow-sm hover:shadow-md disabled:bg-gray-400',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const disabled = props.disabled || loading;
  const classes = `${base} ${sizes[size]} ${variants[variant] ?? variants.primary} ${
    disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
  } ${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <button
      className={classes}
      aria-busy={loading}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="text-lg">{icon}</span>}
      {loading && <Spinner size={16} className="text-current" />}
      <span className={loading ? 'opacity-75' : ''}>{children}</span>
    </button>
  );
}
