import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { RootState } from '../store';
import { Shield, ArrowLeft, LogIn } from 'lucide-react';

/**
 * Unauthorized page displayed when user tries to access restricted content
 */
const Unauthorized: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <Shield className="h-6 w-6 text-red-600" />
            </div>
            <h1 className="mt-3 text-xl font-medium text-gray-900">Access Denied</h1>
            <p className="mt-2 text-sm text-gray-500">
              You don't have permission to access this page.
            </p>
            
            {isAuthenticated ? (
              <div className="mt-6">
                <p className="text-sm text-gray-700">
                  Hi {user?.name || 'there'}, it seems you don't have the required permissions
                  to view this page. If you believe this is an error, please contact your
                  administrator.
                </p>
                <div className="mt-6">
                  <button
                    onClick={() => navigate(-1)}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Go Back
                  </button>
                  <Link
                    to="/dashboard"
                    className="mt-3 w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Go to Dashboard
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-6">
                <p className="text-sm text-gray-700">
                  Please log in to access this page or contact your administrator if you
                  need assistance.
                </p>
                <div className="mt-6">
                  <Link
                    to="/login"
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    <LogIn className="h-4 w-4 mr-2" />
                    Log In
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;