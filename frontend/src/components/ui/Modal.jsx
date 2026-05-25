/**
 * MODAL COMPONENT - Dialog/Modal Overlay
 */

import React from 'react';

export const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  footer,
  size = 'md',
  closeButton = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-4xl',
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-modal flex items-center justify-center p-4">
        <div
          className={`bg-white rounded-lg shadow-2xl ${sizeClasses[size]} w-full`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-neutral-100">
            <h2 className="text-h4 font-bold text-neutral-900">{title}</h2>
            {closeButton && (
              <button
                onClick={onClose}
                className="p-1 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <span className="text-2xl">✕</span>
              </button>
            )}
          </div>

          {/* Body */}
          <div className="p-6 max-h-[60vh] overflow-y-auto">
            {children}
          </div>

          {/* Footer */}
          {footer && (
            <div className="p-6 border-t border-neutral-100 flex gap-3 justify-end">
              {footer}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Modal;
