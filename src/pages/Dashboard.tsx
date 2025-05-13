import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { 
  fetchActivityLogSummary, 
  fetchPaginatedActivityLogs, 
  setCurrentPage 
} from '../store/slices/activityLogSlice';
import { format } from 'date-fns';
import PaginationControls from '../components/PaginationControls';
import ErrorMessage from '../components/ErrorMessage';
import LoadingState from '../components/LoadingState';
import { 
  User,
  AlertTriangle,
  Clock,
  Calendar,
  Video,
  Check,
  MessageSquare,
  AlertCircle,
  FileText,
  Eye,
  Download,
  TrendingUp,
  BarChart,
  Clock8
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DashboardPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user } = useSelector((state: RootState) => state.auth);
  const { 
    activityLogs, 
    summary, 
    loading, 
    error,
    currentPage,
    pageSize,
    totalPages
  } = useSelector((state: RootState) => state.activityLog);
  
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Fetch summary and activity logs when component mounts
  useEffect(() => {
    const loadDashboardData = async () => {
      await Promise.all([
        dispatch(fetchActivityLogSummary()),
        dispatch(fetchPaginatedActivityLogs({ page: currentPage, size: pageSize }))
      ]);
      setInitialLoad(false);
    };
    
    loadDashboardData();
  }, [dispatch, currentPage, pageSize]);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    dispatch(setCurrentPage(page));
  };
  
  // Get pending tasks (activity logs with DRAFT status)
  const pendingLogs = activityLogs.filter(log => log.status === 'DRAFT');
  
  // Find the most recent submitted log
  const recentSubmittedLog = [...activityLogs]
    .filter(log => log.status === 'SUBMITTED' || log.status === 'APPROVED')
    .sort((a, b) => new Date(b.submittedAt || b.createdAt).getTime() - new Date(a.submittedAt || a.createdAt).getTime())[0];
  
  // Format user name for display
  const userName = user?.name?.split(' ')[0] || 'User';
  
  return (
    <div className="flex-1 overflow-auto p-4 md:p-6">
      <LoadingState loading={initialLoad} message="Loading dashboard data..." fullScreen={true}>
        {error ? (
          <div className="rounded-lg bg-white p-6 shadow-md">
            <ErrorMessage message={error} />
          </div>
        ) : (
          <>
            {/* Welcome Section */}
            <div id="welcome-section" className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Hi {userName} 👋</h1>
              <p className="text-gray-500">Welcome back! Here's what's happening with your time tracking today.</p>
            </div>

            {/* Profile Completion Alert */}
            <div className="mb-6 bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="bg-indigo-100 rounded-full p-3 mr-4">
                  <User className="text-indigo-600 h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-indigo-800">Complete your profile</h3>
                  <p className="text-sm text-indigo-600">Your profile is 65% complete. Add your skills and work preferences to improve team matching.</p>
                </div>
              </div>
              <Link 
                to="/profile"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 transition duration-150 text-center md:text-left"
              >
                Complete Now
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
              {/* Total Hours Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <LoadingState loading={loading && !initialLoad} overlay={true}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Total Hours This Week</h3>
                    <span className="bg-green-100 text-green-700 text-xs px-2 py-1 rounded-full">
                      {(summary?.statistics?.averageHoursPerDay ?? 0) > 0 ? '+' : ''}
                      {(summary?.statistics?.averageHoursPerDay ?? 0).toFixed(1)}%
                    </span>
                  </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold mr-2">
                      {summary?.totalHoursSpent || 0}
                    </span>
                    <span className="text-gray-500 text-sm mb-1">hours</span>
                  </div>
                  <div className="mt-4 h-2 bg-gray-100 rounded-full">
                    <div 
                      className="h-2 bg-green-500 rounded-full" 
                      style={{ width: `${Math.min(100, (summary?.completionRate || 0) * 100)}%` }}
                    ></div>
                  </div>
                  <div className="mt-2 flex justify-between text-xs text-gray-500">
                    <span>Target: 40h</span>
                    <span>{Math.round((summary?.completionRate || 0) * 100)}% completed</span>
                  </div>
                </LoadingState>
              </div>

              {/* Pending Tasks Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <LoadingState loading={loading && !initialLoad} overlay={true}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Pending Tasks</h3>
                    {pendingLogs.length > 0 && (
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full">Action Needed</span>
                    )}
                  </div>
                  <div className="flex items-end">
                    <span className="text-3xl font-bold mr-2">{pendingLogs.length}</span>
                    <span className="text-gray-500 text-sm mb-1">items</span>
                  </div>
                  {pendingLogs.length > 0 ? (
                    <ul className="mt-4 text-sm">
                      {pendingLogs.slice(0, 2).map((log) => (
                        <li key={log.id} className="flex items-center text-gray-700 mb-2">
                          <AlertCircle className="text-yellow-500 h-4 w-4 mr-2" />
                          <span className="truncate">{log.tasks.split('\n')[0]}</span>
                        </li>
                      ))}
                      {pendingLogs.length > 2 && (
                        <li className="text-indigo-600 text-xs mt-2">
                          +{pendingLogs.length - 2} more items
                        </li>
                      )}
                    </ul>
                  ) : (
                    <p className="mt-4 text-sm text-gray-500">No pending tasks</p>
                  )}
                </LoadingState>
              </div>

              {/* Last Report Card */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <LoadingState loading={loading && !initialLoad} overlay={true}>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-medium text-gray-500">Last Report Summary</h3>
                    <span className="text-xs text-gray-400">
                      {recentSubmittedLog ? format(new Date(recentSubmittedLog.submittedAt || recentSubmittedLog.createdAt), 'MMMM d, yyyy') : 'N/A'}
                    </span>
                  </div>
                  {recentSubmittedLog ? (
                    <>
                      <div className="flex items-center mb-4">
                        <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                          <FileText className="text-blue-500 h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="font-medium">Activity Report</h4>
                          <p className="text-xs text-gray-500">
                            {recentSubmittedLog.status === 'APPROVED' ? 'Approved' : 'Submitted'} on time
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <button className="text-blue-600 hover:text-blue-800 flex items-center">
                          <Eye className="h-4 w-4 mr-1" /> View Report
                        </button>
                        <button className="text-gray-500 hover:text-gray-700 flex items-center">
                          <Download className="h-4 w-4 mr-1" /> Download
                        </button>
                      </div>
                    </>
                  ) : (
                    <p className="text-sm text-gray-500">No reports submitted yet</p>
                  )}
                </LoadingState>
              </div>
            </div>

            {/* Timeline Alerts */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium">Timeline Alerts</h2>
                <Link to="/timeline" className="text-indigo-600 text-sm hover:underline">View All</Link>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <LoadingState loading={loading && !initialLoad} overlay={true}>
                  {/* Generate alerts based on activity logs */}
                  {pendingLogs.length > 0 && (
                    <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center">
                      <div className="bg-red-100 rounded-full p-2 mr-4 mb-3 md:mb-0 self-start">
                        <AlertTriangle className="text-red-500 h-5 w-5" />
                      </div>
                      <div className="flex-1 mb-3 md:mb-0">
                        <h3 className="font-medium">Missing daily update</h3>
                        <p className="text-sm text-gray-500">
                          You have {pendingLogs.length} incomplete {pendingLogs.length === 1 ? 'entry' : 'entries'} that need submission
                        </p>
                      </div>
                      <Link 
                        to="/timeline"
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm hover:bg-red-700 text-center"
                      >
                        Submit Now
                      </Link>
                    </div>
                  )}
                  
                  {/* Weekly report alert - this would use real data in a production app */}
                  <div className="p-4 border-b border-gray-100 flex flex-col md:flex-row md:items-center">
                    <div className="bg-yellow-100 rounded-full p-2 mr-4 mb-3 md:mb-0 self-start">
                      <Clock className="text-yellow-500 h-5 w-5" />
                    </div>
                    <div className="flex-1 mb-3 md:mb-0">
                      <h3 className="font-medium">Weekly report due soon</h3>
                      <p className="text-sm text-gray-500">Your weekly report is due in 2 days ({format(new Date(new Date().setDate(new Date().getDate() + 2)), 'MMMM d, yyyy')})</p>
                    </div>
                    <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
                      Prepare Report
                    </button>
                  </div>
                  
                  {/* Team sync meeting alert - this would use real data in a production app */}
                  <div className="p-4 flex flex-col md:flex-row md:items-center">
                    <div className="bg-indigo-100 rounded-full p-2 mr-4 mb-3 md:mb-0 self-start">
                      <Calendar className="text-indigo-500 h-5 w-5" />
                    </div>
                    <div className="flex-1 mb-3 md:mb-0">
                      <h3 className="font-medium">Team sync meeting</h3>
                      <p className="text-sm text-gray-500">Scheduled for today at 3:00 PM - Don't forget to prepare your updates</p>
                    </div>
                    <button className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-lg text-sm hover:bg-indigo-200 flex items-center justify-center">
                      <Video className="h-4 w-4 mr-1" /> Join
                    </button>
                  </div>
                </LoadingState>
              </div>
            </div>

            {/* Recent Activity */}
            <div>
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-4">
                <h2 className="text-lg font-medium mb-2 md:mb-0">Recent Activity</h2>
                <div className="flex flex-col md:flex-row md:items-center space-y-2 md:space-y-0 md:space-x-2 w-full md:w-auto">
                  <select className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                    <option>Last 7 days</option>
                    <option>Last 30 days</option>
                    <option>All time</option>
                  </select>
                  <Link to="/timeline" className="text-indigo-600 text-sm hover:underline">View All</Link>
                </div>
              </div>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                <LoadingState 
                  loading={loading && !initialLoad} 
                  overlay={true}
                >
                  {activityLogs.length > 0 ? (
                    // Render activities based on real data
                    <div className="divide-y divide-gray-100">
                      {activityLogs
                        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
                        .slice(0, 5) // Show only the most recent 5 activities
                        .map((log) => (
                          <div key={log.id} className="p-4 flex">
                            <div className="mr-4">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                log.status === 'APPROVED' 
                                  ? 'bg-green-100'
                                  : log.status === 'SUBMITTED'
                                    ? 'bg-blue-100'
                                    : 'bg-yellow-100'
                              }`}>
                                {log.status === 'APPROVED' ? (
                                  <Check className="h-5 w-5 text-green-500" />
                                ) : log.status === 'SUBMITTED' ? (
                                  <FileText className="h-5 w-5 text-blue-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-yellow-500" />
                                )}
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                                <h3 className="font-medium">
                                  {log.status === 'APPROVED' 
                                    ? 'Entry approved'
                                    : log.status === 'SUBMITTED'
                                      ? 'Submitted daily entry'
                                      : 'Created draft entry'
                                  }
                                </h3>
                                <span className="text-xs text-gray-500">
                                  {format(new Date(log.updatedAt), 'MMM d, yyyy, h:mm a')}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mt-1">
                                {log.tasks.split('\n')[0]}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-2">
                                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                                  {log.hoursSpent} hours
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  log.status === 'APPROVED' 
                                    ? 'bg-green-100 text-green-700' 
                                    : log.status === 'SUBMITTED'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                  {log.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <Clock8 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-gray-500">No activity logs available</p>
                      <p className="text-sm text-gray-400 mt-1">Start tracking your time to see activity here</p>
                      <Link 
                        to="/timeline"
                        className="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700"
                      >
                        Start Tracking
                      </Link>
                    </div>
                  )}
                </LoadingState>
              </div>
              
              {/* Pagination Controls */}
              {activityLogs.length > 0 && totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <PaginationControls
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    disabled={loading}
                  />
                </div>
              )}
            </div>
          </>
        )}
      </LoadingState>
    </div>
  );
};

export default DashboardPage;