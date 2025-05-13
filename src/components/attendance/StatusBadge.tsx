import React from 'react';
import { CheckCircle, X, Clock, Umbrella, Home } from 'lucide-react';
import { AttendanceStatus } from '../../types/attendance';

interface StatusBadgeProps {
  status: AttendanceStatus | undefined;
}

/**
 * Component to display attendance status as a colored badge
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  if (!status) {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
        Not Marked
      </span>
    );
  }

  switch (status) {
    case AttendanceStatus.PRESENT:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Present
        </span>
      );
    case AttendanceStatus.ABSENT:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <X className="w-3 h-3 mr-1" /> Absent
        </span>
      );
    case AttendanceStatus.LATE:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" /> Late
        </span>
      );
    case AttendanceStatus.LEAVE:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Umbrella className="w-3 h-3 mr-1" /> Leave
        </span>
      );
    case AttendanceStatus.WFH:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <Home className="w-3 h-3 mr-1" /> WFH
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>
      );
  }
};

export default StatusBadge;