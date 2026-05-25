/**
 * BADGE COMPONENT - Status Badges, Tags, Labels
 */

import React from 'react';

export const Badge = ({ 
  children, 
  variant = 'default',
  size = 'md',
  className = '',
  ...props 
}) => {
  const baseClasses = 'inline-flex items-center gap-2 rounded-full font-semibold';

  const sizeClasses = {
    sm: 'px-2.5 py-0.5 text-caption',
    md: 'px-3 py-1 text-label',
    lg: 'px-4 py-1.5 text-body-small',
  };

  const variantClasses = {
    default: 'bg-neutral-100 text-neutral-700',
    primary: 'bg-primary-100 text-primary-700',
    secondary: 'bg-secondary-100 text-secondary-700',
    success: 'bg-success-100 text-success-700',
    warning: 'bg-warning-100 text-warning-700',
    danger: 'bg-danger-100 text-danger-700',
    accent: 'bg-accent-100 text-accent-700',
  };

  return (
    <span
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export default Badge;
