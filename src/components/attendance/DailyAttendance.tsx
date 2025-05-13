import React, { useState, useEffect } from 'react';
import Calendar from 'react-calendar';
import { isSameDay, isWeekend } from 'date-fns';
import LoadingSpinner from '../LoadingSpinner';
import StatusBadge from './StatusBadge';
import StatusButton from './StatusButton';
import { AttendanceStatus, HolidayEntry, UserAttendance } from '../../types/attendance';
import attendanceService from '../../services/attendanceService';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import ErrorMessage from '../ErrorMessage';
import 'react-calendar/dist/Calendar.css';
import '../../styles/calendar.css';

interface User {
  id: number;
  name: string;
  email: string;
}

/**
 * Daily attendance management component
 */
const DailyAttendance: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [attendanceData, setAttendanceData] = useState<UserAttendance[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [holidays, setHolidays] = useState<HolidayEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user: currentUser } = useSelector((state: RootState) => state.auth);

  // Load holidays for the current year
  useEffect(() => {
    const loadHolidays = async () => {
      try {
        const data = await attendanceService.getHolidays(selectedDate.getFullYear());
        setHolidays(data);
      } catch (err) {
        console.error('Error loading holidays:', err);
      }
    };

    loadHolidays();
  }, [selectedDate.getFullYear()]);

  // Load users and attendance data when date changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Format date to ISO string (YYYY-MM-DD)
        const formattedDate = selectedDate.toISOString().split('T')[0];
        
        // Fetch all users (if not already loaded)
        if (users.length === 0) {
          // In a real app, this would fetch users from an API
          // This is a placeholder for now
          const usersResponse = await fetch('/api/users');
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }

        // Fetch attendance data for the selected date
        const attendanceData = await attendanceService.getDailyAttendance(formattedDate);
        setAttendanceData(attendanceData);
      } catch (err) {
        console.error('Error loading attendance data:', err);
        setError('Failed to load attendance data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [selectedDate]);

  // Check if a date is a holiday
  const isHoliday = (date: Date): boolean => {
    return holidays.some(holiday => {
      const holidayDate = new Date(holiday.date);
      return isSameDay(date, holidayDate);
    });
  };

  // Get holiday name for a date
  const getHolidayName = (date: Date): string => {
    const holiday = holidays.find(h => {
      const holidayDate = new Date(h.date);
      return isSameDay(date, holidayDate);
    });
    return holiday ? holiday.name : '';
  };

  // Get attendance status for a user
  const getUserAttendanceStatus = (userId: number): AttendanceStatus | undefined => {
    const record = attendanceData.find(a => a.userId === userId);
    return record?.status;
  };

  // Handle marking attendance for a user
  const handleMarkAttendance = async (userId: number, status: AttendanceStatus) => {
    try {
      const formattedDate = selectedDate.toISOString().split('T')[0];
      await attendanceService.markAttendance(userId, formattedDate, status);
      
      // Refresh attendance data
      const updatedData = await attendanceService.getDailyAttendance(formattedDate);
      setAttendanceData(updatedData);
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to update attendance. Please try again.');
    }
  };

  // Tile class name for calendar
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    // Highlight holidays
    if (isHoliday(date)) {
      return 'bg-red-100';
    }

    // Highlight weekends
    if (isWeekend(date)) {
      return 'bg-gray-100';
    }

    return null;
  };

  // Tile content for calendar
  const tileContent = ({ date, view }: { date: Date; view: string }) => {
    if (view !== 'month') return null;

    // Show holiday indicator
    if (isHoliday(date)) {
      return (
        <div className="text-xs text-red-500 overflow-hidden whitespace-nowrap text-ellipsis">
          {getHolidayName(date)}
        </div>
      );
    }

    return null;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Column */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="text-lg font-medium mb-4">Select Date</h2>
          <div className="calendar-container">
            <Calendar
              value={selectedDate}
              onChange={(value) => setSelectedDate(value as Date)}
              tileClassName={tileClassName}
              tileContent={tileContent}
              className="w-full border-0"
            />
          </div>
          <div className="mt-4">
            <h3 className="font-medium">Legend</h3>
            <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
              <div className="flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded mr-2"></div>
                <span>Holiday</span>
              </div>
              <div className="flex items-center">
                <div className="w-4 h-4 bg-gray-100 rounded mr-2"></div>
                <span>Weekend</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Attendance Marking Column */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium">
              Attendance for {selectedDate.toLocaleDateString()}
            </h2>
            {isHoliday(selectedDate) && (
              <div className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                Holiday: {getHolidayName(selectedDate)}
              </div>
            )}
          </div>

          {error && (
            <div className="mb-4">
              <ErrorMessage message={error} />
            </div>
          )}

          {loading ? (
            <div className="text-center py-10">
              <LoadingSpinner size="medium" />
              <p className="mt-2 text-gray-500">Loading attendance data...</p>
            </div>
          ) : isHoliday(selectedDate) ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-600">This day is marked as a holiday.</p>
              <p className="text-gray-500 text-sm mt-1">No attendance needed for holidays.</p>
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-lg">
              <p className="text-gray-600">No users found in the system.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map(user => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={getUserAttendanceStatus(user.id)} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <StatusButton 
                            status={AttendanceStatus.PRESENT}
                            onClick={() => handleMarkAttendance(user.id, AttendanceStatus.PRESENT)}
                            active={getUserAttendanceStatus(user.id) === AttendanceStatus.PRESENT}
                          />
                          <StatusButton 
                            status={AttendanceStatus.ABSENT}
                            onClick={() => handleMarkAttendance(user.id, AttendanceStatus.ABSENT)}
                            active={getUserAttendanceStatus(user.id) === AttendanceStatus.ABSENT}
                          />
                          <StatusButton 
                            status={AttendanceStatus.LATE}
                            onClick={() => handleMarkAttendance(user.id, AttendanceStatus.LATE)}
                            active={getUserAttendanceStatus(user.id) === AttendanceStatus.LATE}
                          />
                          <StatusButton 
                            status={AttendanceStatus.LEAVE}
                            onClick={() => handleMarkAttendance(user.id, AttendanceStatus.LEAVE)}
                            active={getUserAttendanceStatus(user.id) === AttendanceStatus.LEAVE}
                          />
                          <StatusButton 
                            status={AttendanceStatus.WFH}
                            onClick={() => handleMarkAttendance(user.id, AttendanceStatus.WFH)}
                            active={getUserAttendanceStatus(user.id) === AttendanceStatus.WFH}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DailyAttendance;