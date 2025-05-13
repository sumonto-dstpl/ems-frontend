import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { RootState } from '../../store';
import Layout from '../../components/Layout';
import { 
  Users, 
  Briefcase, 
  LineChart, 
  Clock, 
  User, 
  CheckCircle, 
  AlertTriangle, 
  X 
} from 'lucide-react';

/**
 * Admin Dashboard - Main control panel for administrators
 */
const AdminDashboard: React.FC = () => {
  const { user, isAdmin } = useSelector((state: RootState) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    userCount: 0,
    projectCount: 0,
    activityLogsToday: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // In a real application, this would be an API call
        // For now, we'll simulate the data loading
        setTimeout(() => {
          setStats({
            userCount: 24,
            projectCount: 8,
            activityLogsToday: 18,
            pendingApprovals: 5
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error loading admin stats:', error);
        setLoading(false);
      }
    };

    loadStats();
  }, []);

  const StatCard: React.FC<{
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    link: string;
  }> = ({ title, value, icon, color, link }) => (
    <Link 
      to={link}
      className="bg-white overflow-hidden shadow rounded-lg transition-transform hover:transform hover:scale-105"
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className={`flex-shrink-0 ${color} rounded-md p-3`}>
            {icon}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-medium text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </Link>
  );

  const RecentActivityCard: React.FC<{
    title: string;
    items: Array<{
      id: number;
      user: string;
      action: string;
      time: string;
      status?: 'success' | 'warning' | 'error';
    }>;
  }> = ({ title, items }) => (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
        <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3>
      </div>
      <div className="divide-y divide-gray-200">
        {items.map((item) => (
          <div key={item.id} className="px-4 py-4 sm:px-6">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-indigo-600 truncate">{item.user}</p>
              <div className="ml-2 flex-shrink-0 flex">
                {item.status === 'success' && (
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Success
                  </p>
                )}
                {item.status === 'warning' && (
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                    <AlertTriangle className="h-4 w-4 mr-1" />
                    Pending
                  </p>
                )}
                {item.status === 'error' && (
                  <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                    <X className="h-4 w-4 mr-1" />
                    Error
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 flex justify-between">
              <div className="flex">
                <div className="flex items-center text-sm text-gray-500">
                  <p>{item.action}</p>
                </div>
              </div>
              <div className="text-sm text-gray-500">{item.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Sample data for recent activity
  const recentActivity = [
    {
      id: 1,
      user: 'Jane Doe',
      action: 'Submitted activity log',
      time: '10 minutes ago',
      status: 'success' as const
    },
    {
      id: 2,
      user: 'John Smith',
      action: 'Created new project',
      time: '1 hour ago',
      status: 'success' as const
    },
    {
      id: 3,
      user: 'Alice Johnson',
      action: 'Requested approval for log',
      time: '2 hours ago',
      status: 'warning' as const
    },
    {
      id: 4,
      user: 'Bob Wilson',
      action: 'Failed to submit log',
      time: '3 hours ago',
      status: 'error' as const
    },
    {
      id: 5,
      user: 'Emma Davis',
      action: 'Changed project settings',
      time: 'Yesterday',
      status: 'success' as const
    }
  ];

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="mt-2 text-sm text-gray-700">
              Overview of system statistics and recent activity.
            </p>
          </div>
        </div>

        {/* Admin welcome card */}
        <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-indigo-700 text-white">
            <h3 className="text-lg leading-6 font-medium">
              Welcome back, {user?.name || 'Admin'}
            </h3>
            <p className="mt-1 max-w-2xl text-sm">
              You have {stats.pendingApprovals} pending approvals to review.
            </p>
          </div>
        </div>

        {/* Stats overview */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Overview</h2>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Users"
              value={stats.userCount}
              icon={<Users className="h-6 w-6 text-white" />}
              color="bg-blue-500"
              link="/admin/users"
            />
            <StatCard
              title="Projects"
              value={stats.projectCount}
              icon={<Briefcase className="h-6 w-6 text-white" />}
              color="bg-green-500"
              link="/admin/projects"
            />
            <StatCard
              title="Today's Activity Logs"
              value={stats.activityLogsToday}
              icon={<Clock className="h-6 w-6 text-white" />}
              color="bg-purple-500"
              link="/admin/logs"
            />
            <StatCard
              title="Pending Approvals"
              value={stats.pendingApprovals}
              icon={<CheckCircle className="h-6 w-6 text-white" />}
              color="bg-amber-500"
              link="/admin/approvals"
            />
          </div>
        </div>

        {/* Quick links */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Quick Actions</h2>
          <div className="mt-2 grid grid-cols-1 gap-5 sm:grid-cols-1 lg:grid-cols-2">
            <div className="rounded-lg bg-white overflow-hidden shadow divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <Link
                  to="/admin/users"
                  className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">Manage Users</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Add, edit, or remove user accounts
                    </p>
                  </div>
                </Link>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <Link
                  to="/admin/projects"
                  className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                    <Briefcase className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">Manage Projects</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Create, edit, or archive projects
                    </p>
                  </div>
                </Link>
              </div>
            </div>

            <div className="rounded-lg bg-white overflow-hidden shadow divide-y divide-gray-200">
              <div className="px-4 py-5 sm:p-6">
                <Link
                  to="/admin/approvals"
                  className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                    <CheckCircle className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">Review Approvals</p>
                    <p className="mt-1 text-sm text-gray-500">
                      Approve or reject pending activity logs
                    </p>
                  </div>
                </Link>
              </div>

              <div className="px-4 py-5 sm:p-6">
                <Link
                  to="/admin/reports"
                  className="flex items-center p-3 -m-3 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-shrink-0 flex items-center justify-center h-10 w-10 rounded-md bg-indigo-600 text-white">
                    <LineChart className="h-6 w-6" />
                  </div>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">Reports</p>
                    <p className="mt-1 text-sm text-gray-500">
                      View activity and productivity reports
                    </p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="mt-8">
          <h2 className="text-lg font-medium text-gray-900">Recent Activity</h2>
          <div className="mt-2">
            <RecentActivityCard title="System Activity" items={recentActivity} />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;