import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/slices/authSlice';
import { isUserAdmin, isUserManager } from '../types/auth';
import { 
  LayoutDashboard, 
  LineChart, 
  LogOut, 
  User, 
  Settings, 
  UserCircle,
  Menu,
  X,
  Calendar,
  Clock,
  Shield,
  Users,
  Briefcase,
  ClipboardList,
  CalendarCheck,
  FileCheck
} from 'lucide-react';
import { Disclosure, Transition } from '@headlessui/react';

// Define NavItem interface to fix type issues
interface NavItem {
  name: string;
  to: string;
  icon: React.ReactNode;
  active: boolean;
  onPrefetch?: (() => Promise<any>) | undefined;
}

const Navigation: React.FC = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAdmin, isManager, systemRole } = useSelector((state: RootState) => state.auth);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const handleLogout = () => {
    dispatch(logout());
  };

  // Import lazy components for prefetching
  const { prefetchableTimeline } = require('../utils/lazyComponents');
  
  // Define admin-specific navigation items with prefetch handlers
  const adminNavItems: NavItem[] = [
    {
      name: 'Admin Dashboard',
      to: '/admin/dashboard',
      icon: <Shield className="w-5 h-5" />,
      active: location.pathname === '/admin/dashboard',
      onPrefetch: () => import(/* webpackChunkName: "admin" */ '../pages/admin/AdminDashboard')
    },
    {
      name: 'User Management',
      to: '/admin/users',
      icon: <Users className="w-5 h-5" />,
      active: location.pathname === '/admin/users',
      onPrefetch: () => import(/* webpackChunkName: "admin" */ '../pages/admin/UserManagement')
    },
    {
      name: 'Projects',
      to: '/admin/projects',
      icon: <Briefcase className="w-5 h-5" />,
      active: location.pathname.startsWith('/admin/projects'),
      onPrefetch: () => import(/* webpackChunkName: "admin" */ '../pages/admin/ProjectManagement')
    },
    {
      name: 'Attendance',
      to: '/admin/attendance',
      icon: <CalendarCheck className="w-5 h-5" />,
      active: location.pathname === '/admin/attendance',
      onPrefetch: () => import(/* webpackChunkName: "admin" */ '../pages/admin/AttendanceManagement')
    }
  ];
  
  // Define manager-specific navigation items
  const managerNavItems: NavItem[] = [
    {
      name: 'Team Dashboard',
      to: '/manager/dashboard',
      icon: <Users className="w-5 h-5" />,
      active: location.pathname === '/manager/dashboard',
      onPrefetch: undefined // This page doesn't exist yet
    },
    {
      name: 'Team Activity Logs',
      to: '/manager/activity-logs',
      icon: <ClipboardList className="w-5 h-5" />,
      active: location.pathname === '/manager/activity-logs',
      onPrefetch: undefined // This page doesn't exist yet
    },
    {
      name: 'Project Management',
      to: '/manager/projects',
      icon: <Briefcase className="w-5 h-5" />,
      active: location.pathname.startsWith('/manager/projects'),
      onPrefetch: undefined // This page doesn't exist yet
    }
  ];
  
  // Define user navigation items with prefetch handlers
  const userNavItems: NavItem[] = [
    {
      name: 'Dashboard',
      to: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      active: location.pathname === '/dashboard',
      onPrefetch: () => import(/* webpackChunkName: "dashboard" */ '../pages/Dashboard')
    },
    {
      name: 'Timeline',
      to: '/timeline',
      icon: <Calendar className="w-5 h-5" />,
      active: location.pathname === '/timeline',
      onPrefetch: () => prefetchableTimeline.prefetch()
    },
    {
      name: 'Activity Logs',
      to: '/activity-logs',
      icon: <Clock className="w-5 h-5" />,
      active: location.pathname === '/activity-logs',
      onPrefetch: undefined // This page doesn't exist yet
    },
    {
      name: 'Analytics',
      to: '/analytics',
      icon: <LineChart className="w-5 h-5" />,
      active: location.pathname === '/analytics',
      onPrefetch: undefined // This page doesn't exist yet
    },
    {
      name: 'Profile',
      to: '/profile',
      icon: <User className="w-5 h-5" />,
      active: location.pathname === '/profile',
      onPrefetch: () => import(/* webpackChunkName: "profile" */ '../pages/Profile')
    }
  ];
  
  const renderNavLinks = () => (
    <ul className="space-y-2">
      {/* Admin section if user is admin */}
      {isAdmin && (
        <>
          <li className="mt-2 mb-2">
            <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Administration
            </h3>
          </li>
          
          {adminNavItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.to} 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-red-700 text-white' 
                    : 'text-red-300 hover:text-white hover:bg-red-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                onMouseEnter={() => {
                  // Prefetch the component when user hovers
                  if (item.onPrefetch) {
                    item.onPrefetch();
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </>
      )}
      
      {/* Manager section if user is manager but not admin */}
      {isManager && !isAdmin && (
        <>
          <li className="mt-2 mb-2">
            <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Team Management
            </h3>
          </li>
          
          {managerNavItems.map((item) => (
            <li key={item.name}>
              <Link 
                to={item.to} 
                className={`flex items-center p-3 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-amber-700 text-white' 
                    : 'text-amber-300 hover:text-white hover:bg-amber-800'
                }`}
                onClick={() => setMobileMenuOpen(false)}
                onMouseEnter={() => {
                  // Prefetch the component when user hovers
                  if (item.onPrefetch) {
                    item.onPrefetch();
                  }
                }}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </>
      )}
      
      {/* User section heading */}
      <li className="mt-4 mb-2">
        <h3 className="px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {(isAdmin || isManager) ? 'User Functions' : 'Navigation'}
        </h3>
      </li>
      
      {userNavItems.map((item) => (
        <li key={item.name}>
          <Link 
            to={item.to} 
            className={`flex items-center p-3 rounded-lg transition-colors ${
              item.active
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-300 hover:text-white hover:bg-gray-700'
            }`}
            onClick={() => setMobileMenuOpen(false)}
            onMouseEnter={() => {
              // Prefetch the component when user hovers
              if (item.onPrefetch) {
                item.onPrefetch();
              }
            }}
          >
            <span className="mr-3">{item.icon}</span>
            <span>{item.name}</span>
          </Link>
        </li>
      ))}
    </ul>
  );
  
  // Desktop sidebar
  const DesktopSidebar = () => (
    <div className="hidden md:flex md:flex-col bg-gray-800 text-white w-64 min-h-screen fixed">
      {/* App title/logo */}
      <div className="p-5 border-b border-gray-700">
        <h1 className="text-xl font-bold">Activity Tracker</h1>
        <p className="text-gray-400 text-sm">Track your daily productivity</p>
      </div>
      
      {/* User profile summary */}
      <div className="p-5 border-b border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
            {user?.picture ? (
              <img 
                src={user.picture} 
                alt={user?.name || 'User'} 
                className="w-10 h-10 rounded-full" 
              />
            ) : (
              <UserCircle className="text-white w-5 h-5" />
            )}
          </div>
          <div>
            <p className="font-medium">{user?.name || 'User'}</p>
            <p className="text-gray-400 text-sm truncate" title={user?.email || ''}>
              {user?.email || ''}
            </p>
            {isAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-red-800 text-red-100">
                Admin
              </span>
            )}
            {isManager && !isAdmin && (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-amber-800 text-amber-100">
                Manager
              </span>
            )}
            {user?.systemRole && !isAdmin && !isManager && (
              <span className="inline-flex items-center px-2 py-0.5 mt-1 rounded-full text-xs font-medium bg-indigo-800 text-indigo-100">
                {user.systemRole}
              </span>
            )}
          </div>
        </div>
      </div>
      
      {/* Navigation links */}
      <nav className="flex-1 p-5 overflow-y-auto">
        {renderNavLinks()}
      </nav>
      
      {/* Bottom actions */}
      <div className="p-5 border-t border-gray-700">
        <ul className="space-y-2">
          <li>
            <Link 
              to="/settings" 
              className="flex items-center p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
            >
              <Settings className="w-5 h-5 mr-3" />
              <span>Settings</span>
            </Link>
          </li>
          <li>
            <button 
              onClick={handleLogout}
              className="flex items-center p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 w-full text-left transition-colors"
              aria-label="Logout"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </li>
        </ul>
      </div>
    </div>
  );

  // Mobile navigation header
  const MobileNav = () => (
    <div className="md:hidden">
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <h1 className="text-xl font-bold text-white">Activity Tracker</h1>
                  </div>
                </div>
                <div className="-mr-2">
                  <Disclosure.Button 
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    aria-label={open ? 'Close menu' : 'Open menu'}
                  >
                    {open ? (
                      <X className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Menu className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>
            
            <Transition
              enter="transition duration-100 ease-out"
              enterFrom="transform scale-95 opacity-0"
              enterTo="transform scale-100 opacity-100"
              leave="transition duration-75 ease-out"
              leaveFrom="transform scale-100 opacity-100"
              leaveTo="transform scale-95 opacity-0"
            >
              <Disclosure.Panel className="px-4 pt-2 pb-3 space-y-1">
                {/* User profile for mobile */}
                <div className="flex items-center p-3 border-b border-gray-700 mb-3">
                  <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center mr-3">
                    {user?.picture ? (
                      <img 
                        src={user.picture} 
                        alt={user?.name || 'User'} 
                        className="w-10 h-10 rounded-full" 
                      />
                    ) : (
                      <UserCircle className="text-white w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.name || 'User'}</p>
                    <p className="text-gray-400 text-sm truncate" title={user?.email || ''}>
                      {user?.email || ''}
                    </p>
                    <div className="mt-1">
                      {isAdmin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-800 text-red-100">
                          Admin
                        </span>
                      )}
                      {isManager && !isAdmin && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-800 text-amber-100">
                          Manager
                        </span>
                      )}
                      {user?.systemRole && !isAdmin && !isManager && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-800 text-indigo-100">
                          {user.systemRole}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mobile navigation */}
                <nav className="space-y-1">
                  {renderNavLinks()}
                </nav>
                
                {/* Bottom actions */}
                <div className="pt-4 border-t border-gray-700 mt-4">
                  <ul className="space-y-2">
                    <li>
                      <Link 
                        to="/settings" 
                        className="flex items-center p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
                      >
                        <Settings className="w-5 h-5 mr-3" />
                        <span>Settings</span>
                      </Link>
                    </li>
                    <li>
                      <button 
                        onClick={handleLogout}
                        className="flex items-center p-3 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 w-full text-left transition-colors"
                        aria-label="Logout"
                      >
                        <LogOut className="w-5 h-5 mr-3" />
                        <span>Logout</span>
                      </button>
                    </li>
                  </ul>
                </div>
              </Disclosure.Panel>
            </Transition>
          </>
        )}
      </Disclosure>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <DesktopSidebar />
      
      {/* Mobile header */}
      <MobileNav />
      
      {/* Spacer for desktop layout */}
      <div className="hidden md:block w-64" aria-hidden="true">
        {/* Ensures content doesn't go underneath the fixed sidebar */}
      </div>
    </>
  );
};

export default Navigation;