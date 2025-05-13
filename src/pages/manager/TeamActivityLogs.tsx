import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  Calendar, 
  Filter, 
  Download, 
  ChevronDown, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Search,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import { ActivityLog, ActivityLogStatus } from '../../types/activityLog';
import { TeamActivityLog } from '../../types/team';
import teamManagementService from '../../services/teamManagementService';
import userManagementService from '../../services/userManagementService';

/**
 * Team Activity Logs Component
 * 
 * Displays and manages activity logs for the entire team
 * Only accessible to users with MANAGER role
 */
const TeamActivityLogs: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [teamLogs, setTeamLogs] = useState<TeamActivityLog[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [userCache, setUserCache] = useState<{[key: number]: string}>({});
  
  // Fetch team activity logs from API
  const fetchTeamLogs = async () => {
    setLoading(true);
    setError(null);
    try {
      // Convert from 1-based to 0-based pagination for API
      const apiPage = currentPage - 1;
      
      // Call the API with filters
      const response = await teamManagementService.getTeamActivityLogs(
        apiPage,
        itemsPerPage,
        statusFilter !== 'all' ? statusFilter : undefined,
        dateRange.start,
        dateRange.end
      );
      
      // Update state with response data
      setTeamLogs(response.content);
      setTotalPages(response.totalPages);
      setTotalItems(response.totalElements);
      
      // Fetch user names for logs that don't have them
      const userIds = response.content
        .filter(log => !log.userName)
        .map(log => log.userId)
        .filter((id, index, self) => id && self.indexOf(id) === index); // Get unique user IDs
      
      if (userIds.length > 0) {
        await fetchUserNames(userIds);
      }
    } catch (err) {
      console.error('Error fetching team logs:', err);
      setError('Failed to load team activity logs. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user names for logs
  const fetchUserNames = async (userIds: number[]) => {
    try {
      // Only fetch users we don't already have in cache
      const idsToFetch = userIds.filter(id => !userCache[id]);
      
      if (idsToFetch.length === 0) return;
      
      // Create a new cache object to avoid mutation
      const newCache = { ...userCache };
      
      // Fetch each user in parallel and update cache
      await Promise.all(
        idsToFetch.map(async (userId) => {
          try {
            const userData = await userManagementService.getUserById(userId);
            newCache[userId] = `${userData.firstName} ${userData.lastName}`;
          } catch (err) {
            console.error(`Error fetching user ${userId}:`, err);
            newCache[userId] = `User ${userId}`;
          }
        })
      );
      
      // Update the cache state
      setUserCache(newCache);
      
      // Update team logs with user names
      setTeamLogs(prevLogs => 
        prevLogs.map(log => ({
          ...log,
          userName: log.userName || newCache[log.userId] || `User ${log.userId}`
        }))
      );
    } catch (err) {
      console.error('Error fetching user names:', err);
    }
  };

  // Filter logs for searching without refetching from API
  const filteredLogs = teamLogs.filter(log => 
    searchTerm ? (
      (log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) || false) || 
      log.tasks.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.accomplishments?.toLowerCase().includes(searchTerm.toLowerCase()) || false)
    ) : true
  );

  // Get current logs for pagination
  const indexOfLastLog = currentPage * itemsPerPage;
  const indexOfFirstLog = indexOfLastLog - itemsPerPage;
  const currentLogs = filteredLogs;
  
  // Change page
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };
  
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1);
    }
  };
  
  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1);
    }
  };

  // Approve an activity log
  const handleApproveLog = async (logId: number) => {
    try {
      setLoading(true);
      const updatedLog = await teamManagementService.approveActivityLog(logId);
      
      // Update the log in the local state
      setTeamLogs(prevLogs => 
        prevLogs.map(log => 
          log.id === logId ? { ...log, ...updatedLog } : log
        )
      );
    } catch (err) {
      console.error('Error approving log:', err);
      setError('Failed to approve activity log. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Approved
        </span>;
      case 'SUBMITTED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" /> Pending
        </span>;
      case 'DRAFT':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertCircle className="w-3 h-3 mr-1" /> Draft
        </span>;
      default:
        return <span className="text-gray-500">{status}</span>;
    }
  };

  // Load data when component mounts or filters change
  useEffect(() => {
    fetchTeamLogs();
  }, [currentPage, statusFilter, dateRange.start, dateRange.end]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <ErrorMessage message={error} />
        </div>
      )}
      
      <LoadingState loading={loading}>
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Team Activity Logs</h1>
              <p className="text-gray-500">Review and approve your team's activity logs</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Calendar className="w-4 h-4" />
                <span>Date Range</span>
              </button>
              <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Filter className="w-4 h-4" />
                <span>Filters</span>
              </button>
              <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Export</span>
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search by team member or task..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
                <div>
                  <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="APPROVED">Approved</option>
                    <option value="SUBMITTED">Pending</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mb-1">
                    From
                  </label>
                  <input
                    type="date"
                    id="date-from"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                  />
                </div>
                <div>
                  <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mb-1">
                    To
                  </label>
                  <input
                    type="date"
                    id="date-to"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Activity Logs Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Team Member
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tasks
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hours
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentLogs.length > 0 ? (
                    currentLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {new Date(log.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2">{log.tasks}</div>
                          {log.blockers && (
                            <div className="text-xs text-red-600 mt-1">
                              <span className="font-semibold">Blocker:</span> {log.blockers}
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{log.hoursSpent} hrs</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formatStatus(log.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {log.status === 'SUBMITTED' && (
                            <button
                              onClick={() => handleApproveLog(log.id)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              Approve
                            </button>
                          )}
                          <button className="text-indigo-600 hover:text-indigo-900">
                            View
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500">
                        {loading ? (
                          <p>Loading activity logs...</p>
                        ) : (
                          <p>No activity logs found matching your criteria.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg border border-gray-200">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">{indexOfFirstLog + 1}</span> to{' '}
                    <span className="font-medium">
                      {Math.min(indexOfLastLog, totalItems)}
                    </span>{' '}
                    of <span className="font-medium">{totalItems}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button
                      onClick={prevPage}
                      disabled={currentPage === 1}
                      className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 text-sm font-medium ${
                        currentPage === 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Previous</span>
                      <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                      <button
                        key={number}
                        onClick={() => paginate(number)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === number
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {number}
                      </button>
                    ))}
                    
                    <button
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                      className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 text-sm font-medium ${
                        currentPage === totalPages
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      <span className="sr-only">Next</span>
                      <ChevronRight className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      </LoadingState>
    </div>
  );
};

export default TeamActivityLogs;