import React from 'react';

const Card = ({ 
  children, 
  className = '',
  header,
  footer,
  variant = 'default'
}) => {
  const baseClasses = `
    bg-white 
    rounded-2xl 
    shadow-lg 
    transition-all duration-300 ease-in-out
    hover:transform hover:-translate-y-1 
    hover:shadow-xl
    overflow-hidden
    border border-blue-100
  `;

  const variants = {
    default: '',
    solicitud: 'mb-8'
  };

  return (
    <div className={`${baseClasses} ${variants[variant]} ${className}`}>
      {header && (
        <div className="bg-primary text-primary-foreground px-8 py-6 flex justify-between items-center">
          {header}
        </div>
      )}
      <div className="p-8">
        {children}
      </div>
      {footer && (
        <div className="px-8 py-6 bg-blue-50 border-t border-gray-200 flex gap-4 justify-end flex-wrap">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;

