import React from 'react';
import { CheckCircle, X, Clock, Umbrella, Home } from 'lucide-react';
import { AttendanceStatus } from '../../types/attendance';

interface StatusButtonProps {
  status: AttendanceStatus;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
}

/**
 * Component for button to mark attendance status
 */
const StatusButton: React.FC<StatusButtonProps> = ({ 
  status, 
  onClick, 
  active = false,
  disabled = false
}) => {
  const getButtonStyle = () => {
    let baseClasses = 'p-1.5 rounded-md flex items-center justify-center transition-colors';
    
    if (disabled) {
      return `${baseClasses} opacity-50 cursor-not-allowed bg-gray-100 text-gray-400`;
    }
    
    if (active) {
      switch (status) {
        case AttendanceStatus.PRESENT:
          return `${baseClasses} bg-green-100 text-green-700 hover:bg-green-200`;
        case AttendanceStatus.ABSENT:
          return `${baseClasses} bg-red-100 text-red-700 hover:bg-red-200`;
        case AttendanceStatus.LATE:
          return `${baseClasses} bg-yellow-100 text-yellow-700 hover:bg-yellow-200`;
        case AttendanceStatus.LEAVE:
          return `${baseClasses} bg-blue-100 text-blue-700 hover:bg-blue-200`;
        case AttendanceStatus.WFH:
          return `${baseClasses} bg-purple-100 text-purple-700 hover:bg-purple-200`;
        default:
          return `${baseClasses} bg-gray-100 text-gray-700 hover:bg-gray-200`;
      }
    }
    
    return `${baseClasses} bg-gray-50 hover:bg-gray-100 text-gray-600`;
  };

  const getIcon = () => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return <CheckCircle className="w-4 h-4" />;
      case AttendanceStatus.ABSENT:
        return <X className="w-4 h-4" />;
      case AttendanceStatus.LATE:
        return <Clock className="w-4 h-4" />;
      case AttendanceStatus.LEAVE:
        return <Umbrella className="w-4 h-4" />;
      case AttendanceStatus.WFH:
        return <Home className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTooltip = () => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return 'Mark as Present';
      case AttendanceStatus.ABSENT:
        return 'Mark as Absent';
      case AttendanceStatus.LATE:
        return 'Mark as Late';
      case AttendanceStatus.LEAVE:
        return 'Mark as Leave';
      case AttendanceStatus.WFH:
        return 'Mark as Work From Home';
      default:
        return 'Mark Attendance';
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={getButtonStyle()}
      disabled={disabled}
      title={getTooltip()}
    >
      {getIcon()}
    </button>
  );
};

export default StatusButton;