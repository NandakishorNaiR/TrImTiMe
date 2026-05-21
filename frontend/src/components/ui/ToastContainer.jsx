import React from 'react';
import { useToast } from '../../context/ToastContext';

const ToastContainer = () => {
  const { toasts, removeToast } = useToast();

  const typeStyles = {
    success: {
      bg: 'bg-green-500',
      icon: '✓',
      textColor: 'text-green-50',
    },
    error: {
      bg: 'bg-red-500',
      icon: '✕',
      textColor: 'text-red-50',
    },
    warning: {
      bg: 'bg-yellow-500',
      icon: '!',
      textColor: 'text-yellow-50',
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'ℹ',
      textColor: 'text-blue-50',
    },
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 space-y-2 pointer-events-none">
      {toasts.map((toast) => {
        const style = typeStyles[toast.type] || typeStyles.info;
        return (
          <div
            key={toast.id}
            className={`${style.bg} ${style.textColor} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 pointer-events-auto animate-in slide-in-from-right-4 fade-in`}
            role="alert"
          >
            <span className="font-bold">{style.icon}</span>
            <span>{toast.message}</span>
            <button
              onClick={() => removeToast(toast.id)}
              className="ml-2 hover:opacity-70"
              aria-label="Close"
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default ToastContainer;
