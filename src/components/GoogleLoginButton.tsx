// import { useAppDispatch } from "@/hooks";
import { useState, useEffect } from "react";
// import { useLocation } from "wouter";
// import { useToast } from "@/hooks/use-toast";

const GoogleLoginButton = (props: any) => {
  const [isLoading, setIsLoading] = useState(false);
  // const dispatch = useAppDispatch();
  // const [location, setLocation] = useLocation();
  // const { toast } = useToast();

  // Check for auth token in URL (from Google OAuth callback)
  // useEffect(() => {
  //   if (location.includes('/auth/callback')) {
  //     const params = new URLSearchParams(window.location.search);
  //     const token = params.get('token');
      
  //     if (token) {
  //       // Store token in localStorage
  //       localStorage.setItem('auth_token', token);
        
  //       // Redirect to timeline page
  //       setLocation('/timeline');
        
  //       toast({
  //         title: 'Login Successful',
  //         description: 'You have been signed in with Google',
  //         variant: 'default',
  //       });
  //     } else if (params.get('error')) {
  //       toast({
  //         title: 'Authentication Error',
  //         description: 'Failed to sign in with Google. Please try again.',
  //         variant: 'destructive',
  //       });
  //     }
  //   }
  // }, [location, setLocation, toast]);

  // const handleGoogleLogin = async () => {
  //   setIsLoading(true);
  //   try {
  //     // Redirect to the backend Google OAuth endpoint
  //     window.location.href = '/api/auth/google';
  //   } catch (error) {
  //     console.error("Google login error:", error);
  //     toast({
  //       title: 'Authentication Error',
  //       description: 'Failed to initialize Google login. Please try again.',
  //       variant: 'destructive',
  //     });
  //     setIsLoading(false);
  //   }
  // };

  return (
    <div id="login-options">
      <button 
        className="w-full flex items-center justify-center border border-gray-300 text-gray-800 font-medium py-4 rounded-xl hover:bg-gray-50 transition duration-200 mb-6"
        type="button"
        onClick={props.handleGoogleLogin}
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin h-5 w-5 mr-3 text-gray-800" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Signing in...</span>
          </>
        ) : (
          <>
            <svg className="h-5 w-5 mr-3 text-lg" viewBox="0 0 24 24" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
              </g>
            </svg>
            <span>Sign in with Google</span>
          </>
        )}
      </button>

      <p className="text-sm text-gray-600 text-center mb-8">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-4 h-4 inline-block mr-1 text-gray-400"
        >
          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836.042-.02a.75.75 0 01.67 1.34l-.04.022c-1.147.573-2.438-.463-2.127-1.706l.71-2.836-.042.02a.75.75 0 11-.671-1.34l.041-.022zM12 9a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
        </svg>
        Sign in with your work email to access your account
      </p>

      <div id="help-section" className="mt-16 border-t border-gray-200 pt-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-[#007BFF] hover:underline cursor-pointer">Need help?</span>
          <span className="text-[#007BFF] hover:underline cursor-pointer">Privacy Policy</span>
        </div>
      </div>
    </div>
  );
};

export default GoogleLoginButton;