import React from 'react';

interface TabButtonProps {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}

/**
 * Tab button component for the attendance management navigation
 */
const TabButton: React.FC<TabButtonProps> = ({ children, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 font-medium text-sm border-b-2 whitespace-nowrap ${
        active
          ? 'border-indigo-500 text-indigo-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {children}
    </button>
  );
};

export default TabButton;