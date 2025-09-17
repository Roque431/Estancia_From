import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, size = 20, className = '', ...props }) => {
  const IconComponent = LucideIcons[name];
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in Lucide icons`);
    return null;
  }

  return (
    <IconComponent 
      size={size} 
      className={className} 
      {...props} 
    />
  );
};

export default Icon;

