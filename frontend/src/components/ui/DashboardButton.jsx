import React from 'react';
import { Link } from 'react-router-dom';

const variants = {
  primary: 'px-4 py-2 rounded-md text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-purple-500 shadow-sm hover:from-purple-700 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-300 focus:ring-offset-1 transition',
  outline: 'px-4 py-2 rounded-md text-sm font-medium text-purple-700 bg-white/90 border border-purple-200 hover:bg-white focus:outline-none focus:ring-2 focus:ring-purple-200 focus:ring-offset-1 transition'
};

export default function DashboardButton({ to = '#', variant = 'primary', ariaLabel, children, ...rest }) {
  const cls = variants[variant] || variants.primary;
  return (
    <Link to={to} role="button" aria-label={ariaLabel} className={cls} {...rest}>
      {children}
    </Link>
  );
}
