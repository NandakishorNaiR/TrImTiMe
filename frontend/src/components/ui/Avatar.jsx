/**
 * AVATAR COMPONENT - User Profile Images
 */

import React from 'react';

export const Avatar = ({ 
  src, 
  alt = 'User',
  initials,
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
  };

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        {...props}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} bg-gradient-to-br from-primary-400 to-primary-600 text-white rounded-full flex items-center justify-center font-bold ${className}`}
      {...props}
    >
      {initials}
    </div>
  );
};

export default Avatar;
