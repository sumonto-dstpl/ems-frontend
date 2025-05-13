import { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, getDay, addMonths, subMonths, isSameDay, isFuture, isPast, isToday } from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaLock, FaExclamationCircle } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { AppDispatch, RootState } from '../../store';
import { fetchActivityLogByDate, fetchAllActivityLogs } from '../../store/slices/activityLogSlice';
import { DayStatus, DayInfo } from '../../types/activityLog';

interface CalendarProps {
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

const Calendar = ({ selectedDate, onDateSelect }: CalendarProps) => {
  const dispatch = useDispatch<AppDispatch>();
  const { activityLogs } = useSelector((state: RootState) => state.activityLog);
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [dateStatuses, setDateStatuses] = useState<DayInfo[]>([]);
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  
  // Load all activity logs when component mounts
  useEffect(() => {
    dispatch(fetchAllActivityLogs());
  }, [dispatch]);
  
  // Process activity logs to determine day statuses
  useEffect(() => {
    if (activityLogs && activityLogs.length > 0) {
      const statuses: DayInfo[] = activityLogs.map(log => {
        // Convert string date to Date object
        const logDate = new Date(log.date);
        
        // Determine status based on activity log status
        let status: DayStatus = 'none';
        if (log.status === 'APPROVED') {
          status = 'completed';
        } else if (log.status === 'SUBMITTED') {
          status = 'pending';
        } else if (log.status === 'DRAFT' && isPast(logDate) && !isToday(logDate)) {
          status = 'missing';
        } else if (log.status === 'DRAFT') {
          status = 'pending';
        }
        
        return {
          date: logDate,
          status
        };
      });
      
      setDateStatuses(statuses);
    }
  }, [activityLogs]);
  
  // If selectedDate month changes, update current month view
  useEffect(() => {
    if (selectedDate.getMonth() !== currentMonth.getMonth() || 
        selectedDate.getFullYear() !== currentMonth.getFullYear()) {
      setCurrentMonth(new Date(selectedDate.getFullYear(), selectedDate.getMonth()));
    }
  }, [selectedDate, currentMonth]);
  
  const getDayStatus = (date: Date): DayStatus => {
    const dayInfo = dateStatuses.find(d => isSameDay(d.date, date));
    if (dayInfo) {
      return dayInfo.status;
    }
    
    if (isFuture(date)) {
      return 'future';
    }
    
    return 'none';
  };
  
  const getStatusColor = (status: DayStatus) => {
    switch (status) {
      case 'completed': return 'bg-green-500 dark:bg-green-600';
      case 'pending': return 'bg-yellow-500 dark:bg-yellow-600';
      case 'missing': return 'bg-red-500 dark:bg-red-600';
      default: return '';
    }
  };
  
  const handleDateClick = (date: Date) => {
    // Only allow selecting non-future dates
    if (!isFuture(date)) {
      onDateSelect(date);
      
      // Format date to YYYY-MM-DD for API call
      const formattedDate = format(date, 'yyyy-MM-dd');
      dispatch(fetchActivityLogByDate(formattedDate));
    }
  };
  
  const handleDateMouseEnter = (date: Date) => {
    setHoverDate(date);
  };
  
  const handleDateMouseLeave = () => {
    setHoverDate(null);
  };

  const goToPreviousMonth = () => {
    setCurrentMonth(prevMonth => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth(prevMonth => addMonths(prevMonth, 1));
  };

  // Get days in current month
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = monthStart;
  const startDay = getDay(startDate); // 0 = Sunday, 1 = Monday, etc.

  // Create calendar days array
  const generateCalendarDays = () => {
    // Previous month days (visible in current calendar)
    const prevMonthDays = [];
    for (let i = 0; i < startDay; i++) {
      const prevMonthLastDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 0).getDate();
      const day = prevMonthLastDate - startDay + i + 1;
      prevMonthDays.push(<div key={`prev-${i}`} className="h-10 flex items-center justify-center text-sm text-gray-400 dark:text-gray-600">
        {day}
      </div>);
    }

    // Current month days
    const daysInMonth = [];
    const totalDays = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
    
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
      const isSelected = isSameDay(date, selectedDate);
      const isHovered = hoverDate && isSameDay(date, hoverDate);
      const status = getDayStatus(date);
      const statusColor = getStatusColor(status);
      const isDateInFuture = isFuture(date);
      
      // Style classes based on state
      const baseClasses = "h-10 flex items-center justify-center text-sm rounded-full relative";
      const cursorClass = isDateInFuture ? "cursor-not-allowed" : "cursor-pointer";
      const textColorClass = isDateInFuture ? "text-gray-400 dark:text-gray-600" : "dark:text-white";
      const hoverClass = !isDateInFuture ? "hover:bg-gray-100 dark:hover:bg-gray-700" : "";
      const selectedClass = isSelected ? "bg-indigo-600 dark:bg-indigo-700 text-white" : "";
      const hoveredClass = isHovered && !isSelected ? "bg-gray-100 dark:bg-gray-700" : "";
      
      daysInMonth.push(
        <div 
          key={day}
          onClick={() => handleDateClick(date)}
          onMouseEnter={() => handleDateMouseEnter(date)}
          onMouseLeave={handleDateMouseLeave}
          className={`${baseClasses} ${cursorClass} ${textColorClass} ${hoverClass} ${selectedClass} ${hoveredClass}`}
        >
          {day}
          {statusColor && (
            <span className={`absolute bottom-1 w-1 h-1 rounded-full ${statusColor}`}></span>
          )}
          {isToday(date) && (
            <span className="absolute inset-0 rounded-full border-2 border-indigo-400 dark:border-indigo-500"></span>
          )}
        </div>
      );
    }

    // Next month days (visible in current calendar)
    const nextMonthDays = [];
    const totalCells = 42; // 7 columns x 6 rows
    const remainingCells = totalCells - (prevMonthDays.length + daysInMonth.length);
    
    for (let i = 1; i <= remainingCells; i++) {
      nextMonthDays.push(
        <div 
          key={`next-${i}`} 
          className="h-10 flex items-center justify-center text-sm text-gray-400 dark:text-gray-600"
        >
          {i}
        </div>
      );
    }

    return [...prevMonthDays, ...daysInMonth, ...nextMonthDays];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-medium dark:text-white">{format(currentMonth, 'MMMM yyyy')}</h3>
        <div className="flex space-x-2">
          <button 
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded"
            onClick={goToPreviousMonth}
          >
            <FaChevronLeft />
          </button>
          <button 
            className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded"
            onClick={goToNextMonth}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>
        
      {/* Calendar Days Header */}
      <div className="grid grid-cols-7 text-center mb-2">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Su</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Mo</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Tu</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">We</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Th</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Fr</span>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Sa</span>
      </div>
        
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {generateCalendarDays()}
      </div>
        
      {/* Calendar Legend */}
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
        <div className="flex items-center">
          <span className="w-3 h-3 inline-block rounded-full bg-green-500 dark:bg-green-600 mr-2"></span>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 inline-block rounded-full bg-yellow-500 dark:bg-yellow-600 mr-2"></span>
          <span>Pending</span>
        </div>
        <div className="flex items-center">
          <span className="w-3 h-3 inline-block rounded-full bg-red-500 dark:bg-red-600 mr-2"></span>
          <span>Missing</span>
        </div>
      </div>
        
      {/* Locked Days Info */}
      <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm flex items-center">
        <FaLock className="text-gray-500 dark:text-gray-400 mr-2" />
        <span className="text-gray-600 dark:text-gray-300">Days are locked for editing after 8:00 PM</span>
      </div>
    </div>
  );
};

export default Calendar;