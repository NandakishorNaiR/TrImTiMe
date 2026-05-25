/**
 * BUTTON COMPONENT - Multiple Variants
 * Sizes: sm, md, lg
 * Variants: primary, secondary, tertiary, danger, ghost
 * States: default, hover, active, disabled, loading
 */

import React from 'react';

export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  disabled = false,
  loading = false,
  fullWidth = false,
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-primary-600 to-primary-700 text-white hover:from-primary-700 hover:to-primary-800 focus:ring-primary-400 shadow-md hover:shadow-lg',
    secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 focus:ring-secondary-400 border border-secondary-300',
    tertiary: 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200 focus:ring-neutral-400',
    danger: 'bg-danger-600 text-white hover:bg-danger-700 focus:ring-danger-400 shadow-md hover:shadow-lg',
    ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-400',
  };

  const widthClass = fullWidth ? 'w-full' : '';

  return (
    <button
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${widthClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <>
          <span className="inline-block w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
