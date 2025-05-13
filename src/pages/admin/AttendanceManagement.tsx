import React, { useState } from 'react';
import { Calendar, Upload, CalendarDays, FileText } from 'lucide-react';
import TabButton from '../../components/attendance/TabButton';
import DailyAttendance from '../../components/attendance/DailyAttendance';
import AttendanceUpload from '../../components/attendance/AttendanceUpload';
import HolidayManagement from '../../components/attendance/HolidayManagement';
import AttendanceReports from '../../components/attendance/AttendanceReports';
import { AdminOnly } from '../../components/RoleBasedAuth';

/**
 * Main attendance management page for administrators
 */
const AttendanceManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'daily' | 'upload' | 'holidays' | 'reports'>('daily');

  return (
    <AdminOnly>
      <div className="flex-1 p-6 overflow-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Attendance Management</h1>
          <p className="text-gray-500">Track and manage employee attendance</p>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex -mb-px space-x-8">
            <TabButton 
              active={activeTab === 'daily'} 
              onClick={() => setActiveTab('daily')}
            >
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-2" />
                Daily Attendance
              </div>
            </TabButton>
            
            <TabButton 
              active={activeTab === 'upload'} 
              onClick={() => setActiveTab('upload')}
            >
              <div className="flex items-center">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </div>
            </TabButton>
            
            <TabButton 
              active={activeTab === 'holidays'} 
              onClick={() => setActiveTab('holidays')}
            >
              <div className="flex items-center">
                <CalendarDays className="w-4 h-4 mr-2" />
                Holidays
              </div>
            </TabButton>
            
            <TabButton 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')}
            >
              <div className="flex items-center">
                <FileText className="w-4 h-4 mr-2" />
                Reports
              </div>
            </TabButton>
          </nav>
        </div>
        
        {/* Tab Content */}
        {activeTab === 'daily' && <DailyAttendance />}
        {activeTab === 'upload' && <AttendanceUpload />}
        {activeTab === 'holidays' && <HolidayManagement />}
        {activeTab === 'reports' && <AttendanceReports />}
      </div>
    </AdminOnly>
  );
};

export default AttendanceManagement;