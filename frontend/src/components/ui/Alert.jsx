/**
 * ALERT COMPONENT - Success, Warning, Error, Info Messages
 */

import React from 'react';

export const Alert = ({ 
  variant = 'info',
  title,
  message,
  onClose,
  className = '',
  ...props 
}) => {
  const variantClasses = {
    success: {
      bg: 'bg-success-50 border border-success-200',
      text: 'text-success-700',
      icon: '✓',
      iconBg: 'bg-success-100',
    },
    warning: {
      bg: 'bg-warning-50 border border-warning-200',
      text: 'text-warning-700',
      icon: '⚠',
      iconBg: 'bg-warning-100',
    },
    error: {
      bg: 'bg-danger-50 border border-danger-200',
      text: 'text-danger-700',
      icon: '✕',
      iconBg: 'bg-danger-100',
    },
    info: {
      bg: 'bg-primary-50 border border-primary-200',
      text: 'text-primary-700',
      icon: 'ℹ',
      iconBg: 'bg-primary-100',
    },
  };

  const style = variantClasses[variant];

  return (
    <div
      className={`${style.bg} rounded-lg p-4 flex gap-4 ${className}`}
      {...props}
    >
      <div className={`${style.iconBg} ${style.text} w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm`}>
        {style.icon}
      </div>
      <div className="flex-1">
        {title && (
          <h4 className={`font-semibold ${style.text}`}>{title}</h4>
        )}
        {message && (
          <p className={`text-sm ${style.text} mt-1`}>{message}</p>
        )}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className={`${style.text} hover:opacity-75 transition-opacity`}
        >
          ✕
        </button>
      )}
    </div>
  );
};

export default Alert;
