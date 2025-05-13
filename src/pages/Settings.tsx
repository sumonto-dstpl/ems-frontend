import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  Bell,
  Moon,
  Sun,
  Globe,
  Lock,
  User,
  FileText,
  Clock,
  Save
} from 'lucide-react';

/**
 * Settings page component
 * Provides user interface for configuring application preferences
 */
const Settings: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  
  // Theme settings
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>('system');
  
  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  
  // Time format settings
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  
  // Privacy settings
  const [shareActivity, setShareActivity] = useState(false);
  
  const handleSaveSettings = () => {
    // In a real implementation, this would dispatch an action to save settings
    console.log('Saving settings', {
      theme,
      emailNotifications,
      pushNotifications,
      timeFormat,
      shareActivity
    });
    
    // Show success message
    alert('Settings saved successfully');
  };
  
  return (
    <div className="flex-1 p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center mb-4">
          <User className="h-5 w-5 text-indigo-500 mr-2" />
          <h2 className="text-lg font-medium">Account Settings</h2>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center mb-6 pb-6 border-b border-gray-100">
          <div className="flex-1 mb-4 md:mb-0">
            <h3 className="font-medium text-gray-800">Profile Information</h3>
            <p className="text-sm text-gray-500">Update your profile information and email address</p>
          </div>
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">
            Edit Profile
          </button>
        </div>
        
        <div className="flex flex-col md:flex-row md:items-center">
          <div className="flex-1 mb-4 md:mb-0">
            <h3 className="font-medium text-gray-800">Password</h3>
            <p className="text-sm text-gray-500">Change your password or enable two-factor authentication</p>
          </div>
          <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300">
            Change Password
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Bell className="h-5 w-5 text-indigo-500 mr-2" />
          <h2 className="text-lg font-medium">Notifications</h2>
        </div>
        
        <div className="mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-gray-800">Email Notifications</h3>
              <p className="text-sm text-gray-500">Receive notifications about activity via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                className="sr-only peer" 
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Push Notifications</h3>
            <p className="text-sm text-gray-500">Receive notifications about activity via browser</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={pushNotifications}
              onChange={() => setPushNotifications(!pushNotifications)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Globe className="h-5 w-5 text-indigo-500 mr-2" />
          <h2 className="text-lg font-medium">Appearance & Localization</h2>
        </div>
        
        <div className="mb-4 pb-4 border-b border-gray-100">
          <h3 className="font-medium text-gray-800 mb-2">Theme</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              className={`flex items-center px-4 py-2 rounded-lg border ${theme === 'light' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setTheme('light')}
            >
              <Sun className="h-4 w-4 mr-2" />
              Light
            </button>
            <button 
              className={`flex items-center px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setTheme('dark')}
            >
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </button>
            <button 
              className={`flex items-center px-4 py-2 rounded-lg border ${theme === 'system' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setTheme('system')}
            >
              <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 6C2 4.89543 2.89543 4 4 4H20C21.1046 4 22 4.89543 22 6V18C22 19.1046 21.1046 20 20 20H4C2.89543 20 2 19.1046 2 18V6Z" stroke="currentColor" strokeWidth="2" />
                <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              System
            </button>
          </div>
        </div>
        
        <div>
          <h3 className="font-medium text-gray-800 mb-2">Time Format</h3>
          <div className="flex flex-wrap gap-3">
            <button 
              className={`flex items-center px-4 py-2 rounded-lg border ${timeFormat === '12h' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setTimeFormat('12h')}
            >
              <Clock className="h-4 w-4 mr-2" />
              12-hour (2:30 PM)
            </button>
            <button 
              className={`flex items-center px-4 py-2 rounded-lg border ${timeFormat === '24h' ? 'bg-indigo-50 border-indigo-500 text-indigo-700' : 'border-gray-200 hover:bg-gray-50'}`}
              onClick={() => setTimeFormat('24h')}
            >
              <Clock className="h-4 w-4 mr-2" />
              24-hour (14:30)
            </button>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center mb-4">
          <Lock className="h-5 w-5 text-indigo-500 mr-2" />
          <h2 className="text-lg font-medium">Privacy</h2>
        </div>
        
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">Share Activity</h3>
            <p className="text-sm text-gray-500">Allow others to see your activity information</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              className="sr-only peer" 
              checked={shareActivity}
              onChange={() => setShareActivity(!shareActivity)}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
          </label>
        </div>
      </div>
      
      <div className="flex justify-end">
        <button 
          className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700 font-medium flex items-center"
          onClick={handleSaveSettings}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;