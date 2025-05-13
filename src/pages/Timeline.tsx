import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchActivityLogByDate, fetchAllActivityLogs } from '../store/slices/activityLogSlice';
import Calendar from '../components/timeline/Calendar';
import PastEntries from '../components/timeline/PastEntries';
import DailyEntryForm from '../components/timeline/DailyEntryForm';
import { format, isToday, isPast } from 'date-fns';
import LoadingState from '../components/LoadingState';
import ErrorMessage from '../components/ErrorMessage';
import { Calendar as CalendarIcon } from 'lucide-react';

const TimelinePage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { currentActivityLog, loading, error } = useSelector((state: RootState) => state.activityLog);
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [mobileView, setMobileView] = useState<'calendar' | 'entry'>('calendar');
  
  // Fetch all activity logs for the calendar and past entries
  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchAllActivityLogs()).then(() => {
        setInitialLoadComplete(true);
      });
    }
  }, [dispatch, isAuthenticated]);
  
  // Fetch the selected date's entry
  useEffect(() => {
    if (isAuthenticated) {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      dispatch(fetchActivityLogByDate(formattedDate));
      
      // On mobile, switch to entry view when a date is selected
      if (window.innerWidth < 1024) {
        setMobileView('entry');
      }
    }
  }, [dispatch, selectedDate, isAuthenticated]);
  
  // Handle date selection from calendar
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
  };
  
  // Toggle between calendar and entry views on mobile
  const toggleMobileView = () => {
    setMobileView(prev => prev === 'calendar' ? 'entry' : 'calendar');
  };
  
  // Determine if the selected date is editable (only today and future dates are editable)
  const isEditable = !isPast(selectedDate) || isToday(selectedDate);
  
  // Format the selected date for display
  const formattedSelectedDate = format(selectedDate, 'MMMM d, yyyy');
  
  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2 md:mb-0">Timeline</h1>
        
        {/* Mobile toggle button */}
        <div className="flex items-center md:hidden">
          <span className="text-sm text-gray-500 mr-2">
            {mobileView === 'calendar' ? 'Calendar View' : formattedSelectedDate}
          </span>
          <button 
            onClick={toggleMobileView}
            className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-md text-sm flex items-center"
            aria-label={mobileView === 'calendar' ? 'Switch to entry view' : 'Switch to calendar view'}
          >
            <CalendarIcon className="w-4 h-4 mr-1" />
            {mobileView === 'calendar' ? 'View Entry' : 'View Calendar'}
          </button>
        </div>
      </div>
      
      <LoadingState loading={loading && !initialLoadComplete} message="Loading timeline data...">
        {error ? (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <ErrorMessage message={error} />
          </div>
        ) : (
          <div className="container mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Calendar Section - Hidden on mobile when in 'entry' view */}
              <div 
                id="calendar-section" 
                className={`lg:col-span-1 ${mobileView === 'entry' ? 'hidden lg:block' : ''}`}
              >
                <div className="bg-white rounded-lg shadow-md overflow-hidden p-4">
                  <Calendar 
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                  />
                  <div className="mt-6">
                    <PastEntries onEntrySelect={handleDateSelect} />
                  </div>
                </div>
              </div>
              
              {/* Daily Entry Form - Hidden on mobile when in 'calendar' view */}
              <div 
                className={`lg:col-span-2 ${mobileView === 'calendar' ? 'hidden lg:block' : ''}`}
              >
                <LoadingState 
                  loading={loading && initialLoadComplete} 
                  message="Loading entry data..."
                  overlay={true}
                >
                  <DailyEntryForm 
                    selectedDate={selectedDate}
                    entry={currentActivityLog}
                    isEditable={isEditable}
                    onDateSelect={handleDateSelect}
                  />
                </LoadingState>
              </div>
            </div>
          </div>
        )}
      </LoadingState>
    </div>
  );
};

export default TimelinePage;