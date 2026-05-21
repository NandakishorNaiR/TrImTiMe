import React from 'react';

export default function Input({
  className = '',
  error,
  label,
  required,
  helperText,
  disabled,
  ...props
}) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        disabled={disabled}
        className={`w-full px-3 py-2 border rounded-md bg-white/90 placeholder-gray-400 text-primary focus:outline-none focus:ring-2 transition ${
          error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-accent'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
        {...props}
      />
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      {helperText && !error && <p className="text-gray-500 text-sm mt-1">{helperText}</p>}
    </div>
  );
}
