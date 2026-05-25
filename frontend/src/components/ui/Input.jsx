/**
 * INPUT COMPONENT - Form Input with Label & Error States
 */

import React from 'react';

export const Input = ({ 
  label,
  type = 'text',
  placeholder,
  error,
  hint,
  disabled = false,
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-4 py-3 text-lg',
  };

  const borderClass = error 
    ? 'border-danger-300 focus:ring-danger-400' 
    : 'border-neutral-300 focus:ring-primary-400';

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-label font-semibold text-neutral-700">
          {label}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full ${sizeClasses[size]} rounded-lg border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all duration-200 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed ${borderClass} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-body-small text-danger-600">{error}</p>
      )}
      {hint && !error && (
        <p className="text-body-small text-neutral-500">{hint}</p>
      )}
    </div>
  );
};

export const Textarea = ({ 
  label,
  placeholder,
  error,
  hint,
  disabled = false,
  rows = 4,
  className = '',
  ...props 
}) => {
  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-label font-semibold text-neutral-700">
          {label}
        </label>
      )}
      <textarea
        placeholder={placeholder}
        disabled={disabled}
        rows={rows}
        className={`w-full px-4 py-2 rounded-lg border border-neutral-200 focus:border-primary-400 focus:ring-2 focus:ring-primary-100 focus:outline-none transition-all duration-200 disabled:bg-neutral-50 disabled:text-neutral-500 disabled:cursor-not-allowed resize-none ${error ? 'border-danger-300' : ''} ${className}`}
        {...props}
      />
      {error && (
        <p className="text-body-small text-danger-600">{error}</p>
      )}
      {hint && !error && (
        <p className="text-body-small text-neutral-500">{hint}</p>
      )}
    </div>
  );
};

export default Input;
