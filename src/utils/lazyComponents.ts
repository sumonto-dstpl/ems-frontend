import { lazy } from 'react';

/**
 * Lazy-loaded components with chunk naming and error handling
 * 
 * These components will only be loaded when they are needed, reducing the initial
 * bundle size and improving application performance.
 */

export const Login = lazy(() => import(/* webpackChunkName: "auth" */ '../components/Login'));
export const AuthCallback = lazy(() => import(/* webpackChunkName: "auth" */ '../components/AuthCallback'));
export const Unauthorized = lazy(() => import(/* webpackChunkName: "auth" */ '../pages/Unauthorized'));

// Admin
export const AdminLogin = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/AdminLogin'));
export const AdminDashboard = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/admin/AdminDashboard'));
export const UserManagement = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/admin/UserManagement'));
export const ProjectManagement = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/admin/ProjectManagement'));
export const ApprovalManagement = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/admin/ApprovalManagement'));
export const AttendanceManagement = lazy(() => import(/* webpackChunkName: "admin" */ '../pages/admin/AttendanceManagement'));

// Manager
export const ManagerDashboard = lazy(() => import(/* webpackChunkName: "manager" */ '../pages/manager/ManagerDashboard'));
export const TeamActivityLogs = lazy(() => import(/* webpackChunkName: "manager" */ '../pages/manager/TeamActivityLogs'));
export const ManagerProjectManagement = lazy(() => import(/* webpackChunkName: "manager" */ '../pages/manager/ProjectManagement'));

// Others
export const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard" */ '../pages/Dashboard'));
export const Timeline = lazy(() => import(/* webpackChunkName: "timeline" */ '../pages/Timeline'));
export const Profile = lazy(() => import(/* webpackChunkName: "profile" */ '../pages/Profile'));
export const Settings = lazy(() => import(/* webpackChunkName: "settings" */ '../pages/Settings'));

/**
 * Utility to create a prefetchable lazy component
 * 
 * @param importFn - Dynamic import function to load the component
 * @param chunkName - Name of the webpack chunk for debugging
 * @returns An object with the lazy component and a prefetch method
 */
// export const createPrefetchableComponent = (
//   importFn: () => Promise<any>,
//   chunkName: string
// ) => {
//   const LazyComponent = lazy(() => 
//     importFn()
//       .then(module => ({
//         default: module.default
//       }))
//       .catch(error => {
//         console.error(Error loading ${chunkName} component:, error);
//         return { default: () => <div>Error loading component</div> };
//       })
//   );
  
//   return {
//     Component: LazyComponent,
//     prefetch: () => {
//       // Trigger the import but don't wait for it
//       importFn().catch(error => {
//         console.error(Error prefetching ${chunkName}:, error);
//       });
//     }
//   };
export const createPrefetchableComponent = (
  importFn: () => Promise<any>,
  chunkName: string
) => {
  const LazyComponent = lazy(importFn); // Simple lazy import
  
  return {
    Component: LazyComponent,
    prefetch: () => {
      importFn().catch(error => {
        console.error(`Error prefetching ${chunkName}:`, error);
      });
    }
  };
};



// Example of prefetchable component (can be used in the future)
export const prefetchableTimeline = createPrefetchableComponent(
  () => import(/* webpackChunkName: "timeline" */ '../pages/Timeline'),
  'Timeline'
);