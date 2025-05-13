import React, { useEffect, useState, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import PrivateRoute from './components/PrivateRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingState from './components/LoadingState';
import Layout from './components/Layout';
import { checkAuthStatus } from './store/slices/authSlice';
import { AppDispatch, RootState } from './store';
import { saveLastRoute, getLastRoute } from './utils/storageUtils';

// Import lazy-loaded components
import {
  Login,
  AuthCallback,
  Dashboard,
  Timeline,
  Profile,
  Settings,
  Unauthorized,
  AdminLogin,
  AdminDashboard,
  UserManagement,
  ProjectManagement,
  ApprovalManagement,
  AttendanceManagement,
  ManagerDashboard,
  TeamActivityLogs,
  ManagerProjectManagement
} from './utils/lazyComponents';

const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const location = useLocation();
  const { loading, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  // Initial auth check
  useEffect(() => {
    const checkAuth = async () => {
      await dispatch(checkAuthStatus());
      setInitialCheckDone(true);
    };
    
    checkAuth();
  }, [dispatch]);

  // Save the current route when it changes (if authenticated)
  useEffect(() => {
    // Only save authenticated routes (not login or callback)
    const isPublicRoute = ['/login', '/auth/callback'].includes(location.pathname);
    
    if (isAuthenticated && !isPublicRoute) {
      saveLastRoute(location.pathname);
    }
  }, [location.pathname, isAuthenticated]);

  // Show application loading state during initial auth check
  if (!initialCheckDone) {
    return (
      <LoadingState
        loading={true}
        fullScreen={true}
        message="Starting application..."
        spinnerSize="large"
      >
        <div />
      </LoadingState>
    );
  }

  // Component loading fallback
  const PageLoadingFallback = () => (
    <LoadingState
      loading={true}
      message="Loading page..."
      spinnerSize="large"
      fullScreen={true}
    >
      <div />
    </LoadingState>
  );

  return (
    <ErrorBoundary>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <Login />
          </Suspense>
        } />
        <Route path="/admin/login" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <AdminLogin />
          </Suspense>
        } />
        <Route path="/auth/callback" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <AuthCallback />
          </Suspense>
        } />
        <Route path="/unauthorized" element={
          <Suspense fallback={<PageLoadingFallback />}>
            <Unauthorized />
          </Suspense>
        } />
        
        {/* Regular user routes - require basic authentication */}
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute requiresAnyRole>
              <Suspense fallback={<PageLoadingFallback />}>
                <Dashboard />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/timeline" 
          element={
            <PrivateRoute requiresAnyRole>
              <Suspense fallback={<PageLoadingFallback />}>
                <Timeline />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/profile" 
          element={
            <PrivateRoute>
              <Suspense fallback={<PageLoadingFallback />}>
                <Profile />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <PrivateRoute>
              <Suspense fallback={<PageLoadingFallback />}>
                <Settings />
              </Suspense>
            </PrivateRoute>
          } 
        />
        
        {/* Admin routes - require admin role */}
        <Route 
          path="/admin/dashboard" 
          element={
            <PrivateRoute adminOnly>
              <Suspense fallback={<PageLoadingFallback />}>
                <AdminDashboard />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/users" 
          element={
            <PrivateRoute adminOnly>
              <Suspense fallback={<PageLoadingFallback />}>
                <UserManagement />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/projects" 
          element={
            <PrivateRoute adminOnly>
              <Suspense fallback={<PageLoadingFallback />}>
                <ProjectManagement />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/admin/approvals" 
          element={
            <PrivateRoute adminOnly>
              <Suspense fallback={<PageLoadingFallback />}>
                <ApprovalManagement />
              </Suspense>
            </PrivateRoute>
          } 
        />
        
        <Route 
          path="/admin/attendance" 
          element={
            <PrivateRoute adminOnly>
              <Suspense fallback={<PageLoadingFallback />}>
                <AttendanceManagement />
              </Suspense>
            </PrivateRoute>
          } 
        />
        
        {/* Manager routes - require manager role */}
        <Route 
          path="/manager/dashboard" 
          element={
            <PrivateRoute managerOnly>
              <Suspense fallback={<PageLoadingFallback />}>
                <ManagerDashboard />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/manager/activity-logs" 
          element={
            <PrivateRoute managerOnly>
              <Suspense fallback={<PageLoadingFallback />}>
                <TeamActivityLogs />
              </Suspense>
            </PrivateRoute>
          } 
        />
        <Route 
          path="/manager/projects" 
          element={
            <PrivateRoute managerOnly>
              <Suspense fallback={<PageLoadingFallback />}>
                <ManagerProjectManagement />
              </Suspense>
            </PrivateRoute>
          } 
        />
        
        {/* Default routes */}
        <Route path="/" element={
          <Navigate to={getLastRoute() || "/dashboard"} replace />
        } />
        <Route path="*" element={
          <Navigate to={getLastRoute() || "/dashboard"} replace />
        } />
      </Routes>
    </ErrorBoundary>
  );
};

export default App;