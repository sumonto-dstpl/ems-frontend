import { ReactNode, useEffect } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
}

const AuthLayout = ({ children }: AuthLayoutProps) => {
  // Simple fade-in animation for elements
  useEffect(() => {
    const elements = [
      document.getElementById('logo'),
      document.getElementById('greeting'),
      document.getElementById('login-options')
    ];

    elements.forEach((element, index) => {
      if (element) {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        element.style.transition = 'opacity 0.5s ease, transform 0.5s ease';

        setTimeout(() => {
          element.style.opacity = '1';
          element.style.transform = 'translateY(0)';
        }, 300 + (index * 200));
      }
    });
  }, []);

  return (
    <div className="flex min-h-screen bg-white">
      {/* Left Section - Form */}
      <div className="w-full md:w-1/2 flex flex-col justify-center px-8 md:px-16 py-12">
        {children}
      </div>
      
      {/* Right Section - Illustration */}
      <div id="illustration-section" className="hidden md:block md:w-1/2 bg-white">
        <div className="h-full flex items-center justify-center p-8">
          <div className="max-w-lg">
            <img 
              className="w-full rounded-xl shadow-lg" 
              src="https://storage.googleapis.com/uxpilot-auth.appspot.com/d593726762-d13901faea1b379e3d87.png" 
              alt="minimalist line art illustration of digital security, shield with lock icon, cybersecurity concept with abstract geometric patterns, clean professional style, black and white with subtle blue accents" 
            />

            <div className="mt-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Enterprise-Grade Security</h2>
              <p className="text-gray-600">DigiShield protects your digital workspace with advanced security features and seamless authentication.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
