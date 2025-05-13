import React, { useState, useEffect } from 'react';
import { CalendarCheck, Download, BarChart2, FileText } from 'lucide-react';
import LoadingSpinner from '../LoadingSpinner';
import ErrorMessage from '../ErrorMessage';
import attendanceService from '../../services/attendanceService';
import { AttendanceReport, AttendanceSummary } from '../../types/attendance';

/**
 * Component to generate and display attendance reports
 */
const AttendanceReports: React.FC = () => {
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [reportData, setReportData] = useState<AttendanceReport[]>([]);
  const [summary, setSummary] = useState<AttendanceSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  // Set default dates based on report type
  useEffect(() => {
    const now = new Date();
    
    if (reportType === 'weekly') {
      // Set to current week (Monday to Sunday)
      const monday = new Date(now);
      monday.setDate(now.getDate() - now.getDay() + 1);
      
      const sunday = new Date(monday);
      sunday.setDate(monday.getDate() + 6);
      
      setStartDate(monday.toISOString().split('T')[0]);
      setEndDate(sunday.toISOString().split('T')[0]);
    } 
    else if (reportType === 'monthly') {
      // Set to current month
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    }
    else if (reportType === 'yearly') {
      // Set to current year
      const firstDay = new Date(now.getFullYear(), 0, 1);
      const lastDay = new Date(now.getFullYear(), 11, 31);
      
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    }
    // If custom, we keep the existing dates
  }, [reportType]);

  // Generate attendance report
  const generateReport = async () => {
    if (!startDate || !endDate) {
      setError('Please select a date range');
      return;
    }
    
    if (new Date(startDate) > new Date(endDate)) {
      setError('Start date cannot be after end date');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await attendanceService.getAttendanceReport(startDate, endDate);
      setReportData(data);
      
      // Get summary statistics
      const summaryData = await attendanceService.getAttendanceSummary(startDate, endDate);
      setSummary(summaryData);
    } catch (err) {
      console.error('Error generating report:', err);
      setError('Failed to generate report. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Export report to Excel
  const handleExportExcel = async () => {
    if (!startDate || !endDate) {
      setError('Please select a date range');
      return;
    }
    
    setExporting(true);
    
    try {
      const excelBlob = await attendanceService.exportAttendanceReport(startDate, endDate);
      
      // Create download link
      const url = window.URL.createObjectURL(excelBlob);
      const link = document.createElement('a');
      link.href = url;
      
      // Generate filename based on report type and dates
      const formattedStartDate = startDate.replace(/-/g, '');
      const formattedEndDate = endDate.replace(/-/g, '');
      const filename = `attendance_report_${formattedStartDate}_${formattedEndDate}.xlsx`;
      
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Format percentage value
  const formatPercentage = (value: number): string => {
    return `${value.toFixed(1)}%`;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-medium mb-6">Attendance Reports</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Report Type
          </label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value as any)}
            className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
          >
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
              reportType !== 'custom' ? 'bg-gray-50' : ''
            }`}
            disabled={reportType !== 'custom'}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={`shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md ${
              reportType !== 'custom' ? 'bg-gray-50' : ''
            }`}
            disabled={reportType !== 'custom'}
          />
        </div>
        
        <div className="flex items-end">
          <button
            onClick={generateReport}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <BarChart2 className="w-4 h-4 mr-2" />
            Generate Report
          </button>
        </div>
      </div>
      
      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}
      
      {loading ? (
        <div className="text-center py-10">
          <LoadingSpinner size="large" />
          <p className="mt-4 text-gray-500">Generating report...</p>
        </div>
      ) : reportData.length > 0 ? (
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-md font-medium">
              Attendance Summary: {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
            </h3>
            <button
              onClick={handleExportExcel}
              disabled={exporting}
              className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {exporting ? (
                <>
                  <LoadingSpinner size="small" />
                  <span className="ml-2">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1" />
                  Export to Excel
                </>
              )}
            </button>
          </div>
          
          {/* Summary Cards */}
          {summary && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-indigo-50 p-4 rounded-lg shadow-sm">
                <div className="text-xs text-indigo-600 uppercase font-semibold tracking-wide mb-1">Period</div>
                <div className="text-lg font-bold text-indigo-900">{summary.period}</div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                <div className="text-xs text-blue-600 uppercase font-semibold tracking-wide mb-1">Working Days</div>
                <div className="text-lg font-bold text-blue-900">{summary.totalWorkingDays}</div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg shadow-sm">
                <div className="text-xs text-green-600 uppercase font-semibold tracking-wide mb-1">Avg. Attendance</div>
                <div className="text-lg font-bold text-green-900">{formatPercentage(summary.averageAttendance)}</div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg shadow-sm">
                <div className="text-xs text-purple-600 uppercase font-semibold tracking-wide mb-1">Total Users</div>
                <div className="text-lg font-bold text-purple-900">{summary.totalUsers}</div>
              </div>
              
              <div className="bg-yellow-50 p-4 rounded-lg shadow-sm">
                <div className="text-xs text-yellow-600 uppercase font-semibold tracking-wide mb-1">Status Report</div>
                <div className="flex space-x-2 text-xs font-medium">
                  <span className="px-1.5 py-0.5 bg-green-100 text-green-800 rounded-full">P: {summary.statusBreakdown.present}</span>
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-800 rounded-full">A: {summary.statusBreakdown.absent}</span>
                  <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded-full">L: {summary.statusBreakdown.late}</span>
                </div>
              </div>
            </div>
          )}
          
          {/* Report Table */}
          <div className="mt-4 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Working Days
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Present
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Absent
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Late
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Leave
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          WFH
                        </th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Attendance %
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {reportData.map((employee) => (
                        <tr key={employee.userId}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{employee.userName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            {employee.totalWorkingDays}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              {employee.presentCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                              {employee.absentCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                              {employee.lateCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                              {employee.leaveCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                              {employee.wfhCount}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            <div className="flex items-center justify-center">
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                employee.attendancePercentage >= 90 ? 'bg-green-100 text-green-800' :
                                employee.attendancePercentage >= 75 ? 'bg-blue-100 text-blue-800' :
                                employee.attendancePercentage >= 60 ? 'bg-yellow-100 text-yellow-800' :
                                'bg-red-100 text-red-800'
                              }`}>
                                {formatPercentage(employee.attendancePercentage)}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <CalendarCheck className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No Report Generated</h3>
          <p className="text-gray-500 max-w-md mx-auto mb-6">
            Select a date range and click "Generate Report" to view attendance statistics.
          </p>
        </div>
      )}
    </div>
  );
};

export default AttendanceReports;