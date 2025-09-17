import React from 'react';
import Icon from '../atoms/Icon';

const TabNavigation = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`bg-white rounded-t-2xl shadow-lg overflow-hidden ${className}`}>
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              flex-1 px-8 py-5 font-semibold text-base
              transition-all duration-300 ease-in-out
              relative
              ${activeTab === tab.id 
                ? 'bg-primary text-primary-foreground shadow-lg' 
                : 'text-gray-600 hover:bg-primary hover:text-primary-foreground hover:transform hover:-translate-y-1'
              }
            `}
          >
            <div className="flex items-center justify-center gap-2">
              {tab.icon && <Icon name={tab.icon} size={20} />}
              {tab.label}
              {tab.badge && (
                <span className="bg-red-500 text-white text-xs font-bold rounded-full px-2 py-1 min-w-6 h-6 flex items-center justify-center">
                  {tab.badge}
                </span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabNavigation;

