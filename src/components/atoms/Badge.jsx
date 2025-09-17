import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  const baseClasses = 'inline-block px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide shadow-sm';
  
  const variants = {
    default: 'bg-gray-100 text-gray-800',
    pendiente: 'bg-gradient-to-r from-yellow-200 to-orange-200 text-yellow-800',
    aceptada: 'bg-gradient-to-r from-teal-200 to-green-200 text-white',
    rechazada: 'bg-gradient-to-r from-red-400 to-red-500 text-white',
    reprogramada: 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
  };

  return (
    <span className={`${baseClasses} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;

