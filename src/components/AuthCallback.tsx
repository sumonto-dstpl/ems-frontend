import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { processOAuthCallback, resetAuthError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import LoadingState from './LoadingState';
import ErrorMessage from './ErrorMessage';

const AuthCallback: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  const [processingStarted, setProcessingStarted] = useState(false);
  const [processingTime, setProcessingTime] = useState(0);

  useEffect(() => {
    // Clean up any previous errors
    dispatch(resetAuthError());
    
    // Get query parameters from the URL
    const queryParams = new URLSearchParams(location.search);
    
    // Check if required parameters exist
    const token = queryParams.get('token');
    const refreshToken = queryParams.get('refreshToken');
    
    if (token && refreshToken) {
      dispatch(processOAuthCallback(queryParams));
      setProcessingStarted(true);
    } else {
      // If required parameters are missing, navigate back to login with an error
      console.error('Missing required OAuth parameters');
      navigate('/login?error=invalid_callback');
    }
  }, [dispatch, location.search, navigate]);

  // Redirect to dashboard if authentication is successful
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  // Timer to show how long the process has been running
  useEffect(() => {
    if (loading && processingStarted) {
      const timer = setInterval(() => {
        setProcessingTime(prev => prev + 1);
      }, 1000);
      
      return () => {
        clearInterval(timer);
      };
    }
  }, [loading, processingStarted]);

  // If processing takes too long, show a message
  const getWaitingMessage = () => {
    if (processingTime < 5) {
      return "Please wait while we complete your sign in...";
    } else if (processingTime < 10) {
      return "Still working on it, please wait a moment...";
    } else {
      return "This is taking longer than expected. Please be patient...";
    }
  };

  const handleRetry = () => {
    // Reset error and restart login process
    dispatch(resetAuthError());
    navigate('/login');
  };

  // Content to display when not loading
  const content = (
    <div className="text-center">
      <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
        Sign In Failed
      </h1>
      <div className="mt-4">
        <ErrorMessage message={error || 'Authentication failed. Please try again.'} />
        <div className="mt-4 text-center">
          <button
            onClick={handleRetry}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            aria-label="Retry sign in"
          >
            Retry Sign In
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 justify-center items-center">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <LoadingState 
          loading={loading} 
          message={getWaitingMessage()}
        >
          {error ? content : (
            <div className="text-center">
              <h1 className="mt-6 text-3xl font-extrabold text-gray-900">
                Completing Sign In
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                You will be redirected once authentication is complete.
              </p>
            </div>
          )}
        </LoadingState>
      </div>
    </div>
  );
};

export default AuthCallback;