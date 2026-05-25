/**
 * RATING COMPONENT - Star Rating Display
 */

import React from 'react';

export const Rating = ({ 
  value = 0, 
  max = 5, 
  size = 'md',
  className = '',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex gap-1 items-center ${className}`} {...props}>
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`${sizeClasses[size]} ${
            i < value ? 'text-warning-400' : 'text-neutral-300'
          }`}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default Rating;
