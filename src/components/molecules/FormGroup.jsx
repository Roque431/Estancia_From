import React from 'react';
import Input from '../atoms/Input';
import Select from '../atoms/Select';
import Icon from '../atoms/Icon';

const FormGroup = ({ 
  label, 
  icon,
  type = 'input',
  error,
  className = '',
  children,
  ...props 
}) => {
  const renderInput = () => {
    if (children) {
      return children;
    }
    
    switch (type) {
      case 'select':
        return <Select {...props} />;
      case 'textarea':
        return (
          <textarea
            className={`
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
              resize-vertical
            `}
            {...props}
          />
        );
      default:
        return <Input type={type} {...props} />;
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <label className="flex items-center gap-2 font-semibold text-gray-700 mb-3 text-base">
          {icon && <Icon name={icon} size={18} />}
          {label}
        </label>
      )}
      {renderInput()}
      {error && (
        <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
          <Icon name="AlertCircle" size={16} />
          {error}
        </p>
      )}
    </div>
  );
};

export default FormGroup;

