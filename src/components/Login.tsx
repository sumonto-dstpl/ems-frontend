import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginWithGoogle, resetAuthError } from '../store/slices/authSlice';
import { AppDispatch, RootState } from '../store';
import { Helmet } from 'react-helmet';
import AuthLayout from './layout/AuthLayout';
import GoogleLoginButton from './GoogleLoginButton';
import Logo from './common/Logo';
import ErrorMessage from './ErrorMessage';
import LoadingSpinner from './LoadingSpinner';

const Login: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Check for error in query params (e.g., from failed OAuth callback)
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const errorParam = queryParams.get('error');
    
    if (errorParam) {
      switch (errorParam) {
        case 'invalid_callback':
          setLoginError('Invalid authentication callback. Please try again.');
          break;
        case 'authentication_failed':
          setLoginError('Authentication failed. Please try again.');
          break;
        default:
          setLoginError('An error occurred during sign in. Please try again.');
      }
    } else {
      setLoginError(null);
    }
  }, [location.search]);

  // Clear any auth errors when component mounts
  useEffect(() => {
    dispatch(resetAuthError());
  }, [dispatch]);

  // Redirect to dashboard if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleLogin = () => {
    // Use the loginWithGoogle action which now uses environment variables
    dispatch(loginWithGoogle());
  };

  return (
    <>
      <Helmet>
        <title>Login | TimeTrack</title>
        <meta name="description" content="Sign in to access your time tracking dashboard" />
      </Helmet>
      
      <AuthLayout>
        <div className="max-w-md mx-auto w-full">
          <Logo />
          
          <div id="greeting" className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Welcome back
            </h1>
            <p className="text-gray-700">
              Sign in to access your time tracking dashboard
            </p>
          </div>
          
          <GoogleLoginButton handleGoogleLogin ={handleGoogleLogin}/>
        </div>
      </AuthLayout>
    </>
    // <div className="flex min-h-screen bg-white">
    //   {/* Left Section - Login Form */}
    //   <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
    //     <div id="login-container" className="max-w-md mx-auto w-full">
    //       <div className="text-center mb-10">
    //         <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
    //         <p className="text-gray-600">Sign in to your account to continue</p>
    //       </div>

    //       {/* Display either redux error or URL param error */}
    //       {(error || loginError) && <ErrorMessage message={error || loginError || ''} />}

    //       <div className="mt-8">
    //         <button 
    //           onClick={handleGoogleLogin} 
    //           disabled={loading}
    //           className="w-full flex items-center justify-center gap-2 border border-gray-300 text-gray-700 rounded-md p-3 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition"
    //           aria-label="Sign in with Google"
    //         >
    //           {loading ? (
    //             <LoadingSpinner size="small" />
    //           ) : (
    //             <>
    //               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    //                 <path d="M21.8055 10.0415H21V10H12V14H17.6515C16.827 16.3285 14.6115 18 12 18C8.6865 18 6 15.3135 6 12C6 8.6865 8.6865 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C6.4775 2 2 6.4775 2 12C2 17.5225 6.4775 22 12 22C17.5225 22 22 17.5225 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#FFC107"/>
    //                 <path d="M3.15295 7.3455L6.43845 9.755C7.32745 7.554 9.48045 6 12 6C13.5295 6 14.921 6.577 15.9805 7.5195L18.809 4.691C17.023 3.0265 14.634 2 12 2C8.15895 2 4.82795 4.1685 3.15295 7.3455Z" fill="#FF3D00"/>
    //                 <path d="M12 22C14.583 22 16.93 21.0115 18.7045 19.404L15.6095 16.785C14.5718 17.5742 13.3038 18.001 12 18C9.39903 18 7.19053 16.3415 6.35853 14.027L3.09753 16.5395C4.75253 19.778 8.11353 22 12 22Z" fill="#4CAF50"/>
    //                 <path d="M21.8055 10.0415H21V10H12V14H17.6515C17.2571 15.1082 16.5467 16.0766 15.608 16.7855L15.6095 16.7845L18.7045 19.4035C18.4855 19.6025 22 17 22 12C22 11.3295 21.931 10.675 21.8055 10.0415Z" fill="#1976D2"/>
    //               </svg>
    //               <span>Sign in with Google</span>
    //             </>
    //           )}
    //         </button>
    //       </div>

    //       <div className="mt-8 text-center text-sm text-gray-600">
    //         <p>By signing in, you agree to our <a href="#" className="text-indigo-600 hover:underline">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:underline">Privacy Policy</a>.</p>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Right Section - Image */}
    //   <div className="hidden md:block md:w-1/2 bg-indigo-600">
    //     <div className="flex h-full items-center justify-center p-8">
    //       <div className="max-w-2xl text-white text-center">
    //         <h2 className="text-4xl font-bold mb-6">Activity Tracker</h2>
    //         <p className="text-xl">Track your daily activities, monitor your productivity, and gain insights into how you spend your time.</p>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Login;