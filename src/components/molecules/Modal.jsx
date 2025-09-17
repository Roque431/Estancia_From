import React from 'react';
import Icon from '../atoms/Icon';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  className = '',
  size = 'md'
}) => {
  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className={`
        relative bg-white rounded-2xl shadow-2xl 
        w-full mx-4 ${sizes[size]} ${className}
        transform transition-all duration-300 ease-in-out
        animate-in fade-in-0 zoom-in-95
      `}>
        {/* Header */}
        {title && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-6 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold flex items-center gap-2">
                {title}
              </h3>
              <button
                onClick={onClose}
                className="text-white hover:text-gray-200 transition-colors"
              >
                <Icon name="X" size={24} />
              </button>
            </div>
          </div>
        )}
        
        {/* Body */}
        <div className="p-8">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="px-8 py-6 bg-gray-50 rounded-b-2xl border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Modal;

