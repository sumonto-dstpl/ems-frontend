import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { 
  Users, 
  ClipboardCheck, 
  TrendingUp, 
  Calendar, 
  Download, 
  Clock, 
  FileText, 
  Plus,
  ChevronDown,
  CheckCircle,
  AlertCircle 
} from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import teamManagementService from '../../services/teamManagementService';
import { format, parse } from 'date-fns';

/**
 * Manager Dashboard Component
 * 
 * Displays team performance metrics, pending approvals, and team member activity status
 * Only accessible to users with MANAGER role
 */
const ManagerDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'MMMM yyyy'));
  
  // State for API data
  const [teamActivity, setTeamActivity] = useState({
    percentage: 0,
    target: 0,
    status: ''
  });
  
  const [pendingApprovals, setPendingApprovals] = useState<Array<{
    id: number;
    type: string;
    user: string;
    userId: number;
    icon: string;
    date: string;
    details?: string;
  }>>([]);
  
  const [teamProgress, setTeamProgress] = useState({
    completedTasks: 0,
    totalTasks: 0,
    overdueTasks: 0
  });
  
  const [teamMembers, setTeamMembers] = useState<Array<{
    id: number;
    name: string;
    role: string;
    status: string;
    lastActive: string;
    completionRate: number;
  }>>([]);

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Format selected month for API
      const monthParam = selectedMonth 
        ? format(parse(selectedMonth, 'MMMM yyyy', new Date()), 'yyyy-MM')
        : undefined;
      
      // Get team activity metrics
      const activityMetrics = await teamManagementService.getTeamActivityMetrics(monthParam);
      
      // Set team activity data
      setTeamActivity({
        percentage: Math.round(activityMetrics.completionRate * 100) || 0,
        target: 85, // Target is often a fixed/configured value
        status: activityMetrics.totalMembers > 0 ? 'Active' : 'Inactive'
      });
      
      // Get team task metrics
      const taskMetrics = await teamManagementService.getTeamTaskMetrics(monthParam);
      setTeamProgress(taskMetrics);
      
      // Get pending approvals
      const approvals = await teamManagementService.getPendingApprovalRequests();
      setPendingApprovals(approvals);
      
      // Get team members
      const teamMembersResponse = await teamManagementService.getTeamMembers();
      
      // Transform team members data to match the expected format
      const membersData = teamMembersResponse.content.map(member => ({
        id: member.id,
        name: member.name || `${member.firstName} ${member.lastName}`,
        role: member.jobTitle || member.department || 'Team Member',
        status: member.lastActive ? 'active' : 'inactive',
        lastActive: member.lastActive || 'Not available',
        completionRate: member.completionRate || 0
      }));
      
      setTeamMembers(membersData);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [selectedMonth]);

  // Calculate team progress percentage
  const progressPercentage = Math.round((teamProgress.completedTasks / (teamProgress.totalTasks || 1)) * 100);

  // Get icon based on type
  const getIcon = (iconType: string) => {
    switch (iconType) {
      case 'clock':
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case 'file-text':
        return <FileText className="w-4 h-4 text-yellow-500" />;
      case 'clipboard':
        return <ClipboardCheck className="w-4 h-4 text-yellow-500" />;
      case 'users':
        return <Users className="w-4 h-4 text-yellow-500" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

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
              <h1 className="text-2xl font-bold text-gray-800">Team Management Dashboard</h1>
              <p className="text-gray-500">Manage your team's performance and activities</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <div className="relative">
                <select 
                  className="appearance-none bg-white border border-gray-300 rounded-lg pl-4 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {["April 2025", "March 2025", "February 2025", "January 2025"].map(month => (
                    <option key={month} value={month}>{month}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <button className="flex items-center space-x-2 bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50">
                <Download className="w-4 h-4" />
                <span className="hidden md:inline">Download Report</span>
              </button>
            </div>
          </div>
          
          {/* Quick Stats Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Team Activity Rate */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Team Activity Rate</h3>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100 text-indigo-800">
                  {teamActivity.status}
                </div>
              </div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-3xl font-bold text-gray-800">{teamActivity.percentage}%</div>
                <div className="text-sm text-gray-500">Target: {teamActivity.target}%</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`h-2.5 rounded-full ${teamActivity.percentage >= teamActivity.target ? 'bg-green-500' : 'bg-yellow-500'}`}
                  style={{ width: `${teamActivity.percentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Team Progress */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Team Progress</h3>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-green-100 text-green-800">
                  On Track
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{teamProgress.completedTasks}</div>
                  <div className="text-xs text-gray-500">Completed</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{teamProgress.totalTasks}</div>
                  <div className="text-xs text-gray-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800">{teamProgress.overdueTasks}</div>
                  <div className="text-xs text-gray-500">Overdue</div>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="h-2.5 rounded-full bg-blue-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>
            
            {/* Pending Approvals */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Pending Approvals</h3>
                <div className="text-xs font-medium px-2 py-1 rounded-full bg-yellow-100 text-yellow-800">
                  {pendingApprovals.length} Items
                </div>
              </div>
              <div className="space-y-4">
                {pendingApprovals.length > 0 ? (
                  pendingApprovals.slice(0, 3).map(approval => (
                    <div key={approval.id} className="flex items-start">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center mr-3">
                        {getIcon(approval.icon)}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{approval.type}</p>
                        <p className="text-xs text-gray-500">{approval.user}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">No pending approvals</p>
                  </div>
                )}
                
                {pendingApprovals.length > 3 && (
                  <button className="w-full text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                    View all {pendingApprovals.length} approvals
                  </button>
                )}
              </div>
            </div>
          </div>
          
          {/* Team Members */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Team Members</h3>
              <button className="flex items-center space-x-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium">
                <Plus className="w-4 h-4" />
                <span>Add Member</span>
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.length > 0 ? (
                    teamMembers.map((member) => (
                      <tr key={member.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-indigo-800">
                                {member.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{member.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            member.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {member.lastActive}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2 w-24">
                            <div 
                              className={`h-2 rounded-full ${
                                member.completionRate >= 90 ? 'bg-green-500' : 
                                member.completionRate >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${member.completionRate}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500 mt-1">{member.completionRate}%</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                        No team members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </LoadingState>
    </div>
  );
};

export default ManagerDashboard;