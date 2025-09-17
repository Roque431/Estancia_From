import React from 'react';

const Select = ({ 
  options = [], 
  value, 
  onChange, 
  placeholder = 'Seleccione una opción',
  className = '',
  required = false,
  ...props 
}) => {
  const baseClasses = `
    w-full px-4 py-3 
    border-2 border-gray-200 
    rounded-xl 
    bg-gray-50 
    text-gray-900 
    transition-all duration-300 ease-in-out
    focus:border-blue-500 
    focus:bg-white 
    focus:outline-none 
    focus:ring-4 
    focus:ring-blue-100
    focus:transform 
    focus:-translate-y-0.5
    cursor-pointer
  `;

  return (
    <select
      value={value}
      onChange={onChange}
      required={required}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      <option value="">{placeholder}</option>
      {options.map((option, index) => (
        <option key={index} value={option.value || option}>
          {option.label || option}
        </option>
      ))}
    </select>
  );
};

export default Select;

