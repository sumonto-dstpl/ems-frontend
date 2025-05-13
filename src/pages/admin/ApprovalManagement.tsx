import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Calendar, 
  User, 
  Filter,
  Search,
  Info
} from 'lucide-react';
import { format } from 'date-fns';
import { ActivityLog, ActivityLogStatus } from '../../types/activityLog';

interface ApprovalLog extends ActivityLog {
  userName: string;
  userEmail: string;
}

/**
 * Approval Management page for administrators to review and approve activity logs
 */
const ApprovalManagement: React.FC = () => {
  const { isAdmin } = useSelector((state: RootState) => state.auth);
  const [logs, setLogs] = useState<ApprovalLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLog, setSelectedLog] = useState<ApprovalLog | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  type StatusFilter = ActivityLogStatus | 'ALL';
  // const [statusFilter, setStatusFilter] = useState<ActivityLogStatus | 'ALL'>(ActivityLogStatus.SUBMITTED);
  
const [statusFilter, setStatusFilter] = useState<StatusFilter>(ActivityLogStatus.SUBMITTED);
  const [dateRange, setDateRange] = useState({
    start: format(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // Last 30 days
    end: format(new Date(), 'yyyy-MM-dd')
  });

  // Simulate fetching pending approvals
  useEffect(() => {
    const loadApprovals = async () => {
      try {
        // This would be replaced with a real API call
        // In a real application, this would fetch from the backend
        setTimeout(() => {
          const mockLogs: ApprovalLog[] =[];
          setLogs(mockLogs);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error loading approval logs:', error);
        setLoading(false);
      }
    };
    
    loadApprovals();
  }, []);

  // Filter logs based on search term and status
  const filteredLogs = logs.filter(log => {
    // Status filter
    if (statusFilter !== 'ALL' && log.status !== statusFilter) {
      return false;
    }
    
    // Search term filter
    const searchTermLower = searchTerm.toLowerCase();
    return (
      log.userName.toLowerCase().includes(searchTermLower) ||
      log.userEmail.toLowerCase().includes(searchTermLower) ||
      log.tasks.toLowerCase().includes(searchTermLower) ||
      log.accomplishments?.toLowerCase().includes(searchTermLower)
    );
  });

  const handleViewDetails = (log: ApprovalLog) => {
    setSelectedLog(log);
    setShowDetailsModal(true);
  };

  const handleApprove = (id: number) => {
    // In a real app, this would call an API to approve the log
    setLogs(logs.map(log => 
      log.id === id 
        ? { 
            ...log, 
            status: 'APPROVED' as ActivityLogStatus,
            approvedAt: new Date().toISOString(),
            approvedById: 1 // Current admin user ID would be used here
          } 
        : log
    ));
    
    if (selectedLog?.id === id) {
      setSelectedLog({
        ...selectedLog,
        status: 'APPROVED',
        approvedAt: new Date().toISOString(),
        approvedById: 1
      });
    }
  };

  const handleReject = (id: number) => {
    // In a real app, this would call an API to reject the log
    // For this implementation, we'll just change the status back to DRAFT
    setLogs(logs.map(log => 
      log.id === id 
        ? { 
            ...log, 
            status: 'DRAFT' as ActivityLogStatus,
            submittedAt: undefined
          } 
        : log
    ));
    
    if (selectedLog?.id === id) {
      setSelectedLog({
        ...selectedLog,
        status: 'DRAFT',
        submittedAt: undefined
      });
    }
  };

  const formatDateTime = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a');
  };

  // Status badge component
  const StatusBadge: React.FC<{ status: ActivityLogStatus }> = ({ status }) => {
    let bgColor = 'bg-gray-100 text-gray-800';
    let icon = <Info className="h-4 w-4 mr-1" />;
    
    switch(status) {
      case 'DRAFT':
        bgColor = 'bg-gray-100 text-gray-800';
        icon = <Info className="h-4 w-4 mr-1" />;
        break;
      case 'SUBMITTED':
        bgColor = 'bg-yellow-100 text-yellow-800';
        icon = <Clock className="h-4 w-4 mr-1" />;
        break;
      case 'APPROVED':
        bgColor = 'bg-green-100 text-green-800';
        icon = <CheckCircle className="h-4 w-4 mr-1" />;
        break;
    }
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bgColor}`}>
        {icon}
        {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Approval Management</h1>
            <p className="mt-2 text-sm text-gray-700">
              Review and approve activity logs submitted by users.
            </p>
          </div>
        </div>
        
        {/* Filters and search */}
        <div className="mt-6 space-y-4 sm:flex sm:items-center sm:space-y-0 sm:space-x-4">
          <div className="flex items-center">
            <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mr-2">
              Status:
            </label>
            <select
              id="status-filter"
              className="rounded-md border-gray-300 py-2 px-3 text-sm"
              value={statusFilter}
              onChange={(e) => {
                // setStatusFilter(e.target.value as ActivityLogStatus | 'ALL');
                const value = e.target.value;
                  if (value === 'ALL' || Object.values(ActivityLogStatus).includes(value as ActivityLogStatus)) {
                    setStatusFilter(value as StatusFilter);
                  }

              }}
            >
              <option value="ALL">All</option>
              <option value="SUBMITTED">Pending Approval</option>
              <option value="APPROVED">Approved</option>
              <option value="DRAFT">Drafts</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <label htmlFor="date-from" className="block text-sm font-medium text-gray-700 mr-2">
              From:
            </label>
            <input
              type="date"
              id="date-from"
              className="rounded-md border-gray-300 py-2 px-3 text-sm"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
            />
          </div>
          
          <div className="flex items-center">
            <label htmlFor="date-to" className="block text-sm font-medium text-gray-700 mr-2">
              To:
            </label>
            <input
              type="date"
              id="date-to"
              className="rounded-md border-gray-300 py-2 px-3 text-sm"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
            />
          </div>
          
          <div className="relative flex-grow max-w-xs">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search logs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Logs table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        User
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Date
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Tasks
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Hours
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Status
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Submitted
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="flex items-center">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-gray-500" />
                            </div>
                            <div className="ml-4">
                              <div className="font-medium text-gray-900">{log.userName}</div>
                              <div className="text-gray-500">{log.userEmail}</div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                            {format(new Date(log.date), 'MMM d, yyyy')}
                          </div>
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {log.tasks}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {log.hoursSpent}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <StatusBadge status={log.status as ActivityLogStatus} />
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {log.submittedAt && (
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              {formatDateTime(log.submittedAt)}
                            </div>
                          )}
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewDetails(log)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="View Details"
                            >
                              <Info className="h-5 w-5" />
                              <span className="sr-only">View details for log {log.id}</span>
                            </button>
                            
                            {log.status === 'SUBMITTED' && (
                              <>
                                <button
                                  onClick={() => handleApprove(log.id)}
                                  className="text-green-600 hover:text-green-900"
                                  title="Approve"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                  <span className="sr-only">Approve log {log.id}</span>
                                </button>
                                <button
                                  onClick={() => handleReject(log.id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Reject"
                                >
                                  <XCircle className="h-5 w-5" />
                                  <span className="sr-only">Reject log {log.id}</span>
                                </button>
                              </>
                            )}
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
        
        {filteredLogs.length === 0 && (
          <div className="text-center py-12">
            <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No logs found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {statusFilter === 'SUBMITTED' 
                ? 'There are no pending approvals at this time.' 
                : 'No logs match your search criteria.'}
            </p>
          </div>
        )}

        {/* Log Details Modal */}
        {showDetailsModal && selectedLog && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Calendar className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                        Activity Log Details
                        <StatusBadge status={selectedLog.status as ActivityLogStatus} />
                      </h3>
                      
                      <div className="mt-4 bg-gray-50 p-4 rounded-md">
                        <div className="flex justify-between border-b border-gray-200 pb-2">
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">User:</span> {selectedLog.userName}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Email:</span> {selectedLog.userEmail}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Date:</span> {format(new Date(selectedLog.date), 'MMM d, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            <span className="font-medium">Hours:</span> {selectedLog.hoursSpent}
                          </div>
                        </div>

                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Tasks</h4>
                          <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                            {selectedLog.tasks}
                          </p>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Accomplishments</h4>
                          <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                            {selectedLog.accomplishments}
                          </p>
                        </div>
                        
                        <div className="mt-4">
                          <h4 className="text-sm font-medium text-gray-900">Blockers</h4>
                          <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">
                            {selectedLog.blockers || 'None reported'}
                          </p>
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <div className="flex flex-col space-y-2">
                            <div className="text-xs text-gray-500">
                              <span className="font-medium">Created:</span> {formatDateTime(selectedLog.createdAt)}
                            </div>
                            {selectedLog.submittedAt && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Submitted:</span> {formatDateTime(selectedLog.submittedAt)}
                              </div>
                            )}
                            {selectedLog.approvedAt && (
                              <div className="text-xs text-gray-500">
                                <span className="font-medium">Approved:</span> {formatDateTime(selectedLog.approvedAt)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  {selectedLog.status === 'SUBMITTED' && (
                    <>
                      <button
                        type="button"
                        className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => {
                          handleApprove(selectedLog.id);
                          setShowDetailsModal(false);
                        }}
                      >
                        <CheckCircle className="h-4 w-4 mr-1.5" />
                        Approve
                      </button>
                      <button
                        type="button"
                        className="mt-3 w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                        onClick={() => {
                          handleReject(selectedLog.id);
                          setShowDetailsModal(false);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-1.5" />
                        Reject
                      </button>
                    </>
                  )}
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowDetailsModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default ApprovalManagement;