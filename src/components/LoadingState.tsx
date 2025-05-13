import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface LoadingStateProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
  fullScreen?: boolean;
  overlay?: boolean;
  spinnerSize?: 'small' | 'medium' | 'large';
}

/**
 * LoadingState component - wraps content with conditional loading spinner
 * 
 * @param loading - Whether content is loading
 * @param children - Content to display when not loading
 * @param message - Optional message to display during loading
 * @param fullScreen - Whether loading spinner should take up the full screen
 * @param overlay - Whether to show content with a loading overlay on top
 * @param spinnerSize - Size of loading spinner
 */
const LoadingState: React.FC<LoadingStateProps> = ({
  loading,
  children,
  message = 'Loading...',
  fullScreen = false,
  overlay = false,
  spinnerSize = 'medium'
}) => {
  // If not loading, just render children
  if (!loading && !overlay) {
    return <>{children}</>;
  }

  // For overlay mode, show children with spinner on top
  if (overlay) {
    return (
      <div className="relative">
        {children}
        {loading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 flex flex-col items-center justify-center z-10">
            <LoadingSpinner size={spinnerSize} />
            {message && <p className="mt-4 text-gray-700 font-medium">{message}</p>}
          </div>
        )}
      </div>
    );
  }

  // Full screen loading
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
        <LoadingSpinner size="large" />
        {message && <p className="mt-4 text-gray-700 font-medium">{message}</p>}
      </div>
    );
  }

  // Default loading state (replaces content)
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <LoadingSpinner size={spinnerSize} />
      {message && <p className="mt-4 text-gray-700 font-medium">{message}</p>}
    </div>
  );
};

export default LoadingState;