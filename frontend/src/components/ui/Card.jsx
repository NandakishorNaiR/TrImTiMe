/**
 * CARD COMPONENT - Reusable Card Container
 * Supports: basic card, interactive card, shadow variants
 */

import React from 'react';

export const Card = ({ 
  children, 
  className = '', 
  shadow = 'md',
  hover = false,
  interactive = false,
  ...props 
}) => {
  const shadowClasses = {
    none: '',
    sm: 'shadow-sm',
    md: 'shadow-card',
    lg: 'shadow-lg',
    xl: 'shadow-xl',
  };

  const hoverClass = hover ? 'hover:shadow-lg transition-shadow duration-300' : '';
  const interactiveClass = interactive ? 'cursor-pointer active:scale-95 transition-transform duration-200' : '';

  return (
    <div
      className={`bg-white rounded-lg p-6 border border-neutral-100 ${shadowClasses[shadow]} ${hoverClass} ${interactiveClass} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ children, className = '' }) => (
  <div className={`mb-4 pb-4 border-b border-neutral-100 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children, className = '' }) => (
  <h3 className={`text-h4 font-bold text-neutral-900 ${className}`}>
    {children}
  </h3>
);

export const CardSubtitle = ({ children, className = '' }) => (
  <p className={`text-body-small text-neutral-600 mt-1 ${className}`}>
    {children}
  </p>
);

export const CardBody = ({ children, className = '' }) => (
  <div className={`space-y-4 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ children, className = '' }) => (
  <div className={`mt-6 pt-6 border-t border-neutral-100 flex gap-3 ${className}`}>
    {children}
  </div>
);

export default Card;
