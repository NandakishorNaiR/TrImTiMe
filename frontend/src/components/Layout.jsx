import React from 'react';

export default function Layout({ children, className = '' }) {
  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">{children}</div>
    </div>
  );
}
