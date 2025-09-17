import React from 'react';
import Icon from './Icon';

const CustomButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md',
  icon = null,
  onClick,
  disabled = false,
  className = '',
  type = 'button',
  ...props 
}) => {
  const baseClasses = `
    inline-flex items-center gap-3 
    font-semibold rounded-xl 
    transition-all duration-300 ease-in-out
    border-none cursor-pointer
    relative overflow-hidden
    shadow-md hover:shadow-xl
    transform hover:-translate-y-1
    disabled:opacity-50 disabled:cursor-not-allowed
    disabled:transform-none disabled:shadow-md
  `;

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  };

  const variants = {
    primary: 'bg-primary text-primary-foreground hover:brightness-110',
    success: 'bg-success text-white hover:brightness-110',
    warning: 'bg-warning text-yellow-800 hover:brightness-110',
    danger: 'bg-error text-white hover:brightness-110',
    info: 'bg-primary text-white hover:brightness-110',
    secondary: 'bg-secondary text-secondary-foreground hover:brightness-110'
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
      {children}
    </button>
  );
};

export default CustomButton;

