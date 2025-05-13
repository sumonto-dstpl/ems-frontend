import React from 'react';
import { Calendar, Palmtree, Home } from 'lucide-react';
import { ActivityLogType } from '../../types/activityLog';

interface SpecialActivityIndicatorProps {
  type: ActivityLogType;
  label?: string;
  className?: string;
}

/**
 * Component to display a special activity type indicator (holiday, leave, WFH)
 * Used in timeline and activity log views
 */
const SpecialActivityIndicator: React.FC<SpecialActivityIndicatorProps> = ({ 
  type, 
  label,
  className = ''
}) => {
  // Default styling
  const baseClassName = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
  
  // Set display properties based on type
  let icon = null;
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let displayLabel = label;
  
  switch (type) {
    case ActivityLogType.HOLIDAY:
      icon = <Calendar className="w-3 h-3 mr-1" />;
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      displayLabel = displayLabel || "Holiday";
      break;
    case ActivityLogType.LEAVE:
      icon = <Palmtree className="w-3 h-3 mr-1" />;
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      displayLabel = displayLabel || "Leave";
      break;
    case ActivityLogType.WFH:
      icon = <Home className="w-3 h-3 mr-1" />;
      bgColor = "bg-purple-100";
      textColor = "text-purple-800";
      displayLabel = displayLabel || "WFH";
      break;
    default:
      return null; // Don't render anything for regular activities
  }
  
  return (
    <span className={`${baseClassName} ${bgColor} ${textColor} ${className}`}>
      {icon}
      {displayLabel}
    </span>
  );
};

export default SpecialActivityIndicator;