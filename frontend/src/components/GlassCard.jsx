import React from 'react';

export default function GlassCard({ title, children, className = '', ...props }) {
  return (
    <div
      className={`bg-white/60 backdrop-blur-sm border border-gray-200/30 rounded-card shadow-glass p-4 ${className}`}
      {...props}
    >
      {title && <h3 className="text-lg font-semibold text-primary mb-2">{title}</h3>}
      <div className="text-sm text-primary/90">{children}</div>
    </div>
  );
}
