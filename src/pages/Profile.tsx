import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../store';
import { fetchCurrentUserProfile, updateUserProfile } from '../store/slices/profileSlice';
import { ProfileUpdateRequest } from '../types/profile';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';
import Layout from '../components/Layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faBriefcase, faBuilding, faList, faCog, faSave } from '@fortawesome/free-solid-svg-icons';

const Profile: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, error } = useSelector((state: RootState) => state.profile);
  const [formData, setFormData] = useState<ProfileUpdateRequest>({
    name: '',
    bio: '',
    jobTitle: '',
    department: '',
    skills: [],
    preferences: {}
  });
  const [newSkill, setNewSkill] = useState('');
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formSuccess, setFormSuccess] = useState(false);

  // Load the user profile
  useEffect(() => {
    dispatch(fetchCurrentUserProfile());
  }, [dispatch]);

  // Update form data when profile changes
  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        bio: profile.bio || '',
        jobTitle: profile.jobTitle || '',
        department: profile.department || '',
        skills: profile.skills || [],
        preferences: profile.preferences || {}
      });
    }
  }, [profile]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !formData.skills?.includes(newSkill.trim())) {
      setFormData((prev) => ({
        ...prev,
        skills: [...(prev.skills || []), newSkill.trim()]
      }));
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setFormData((prev) => ({
      ...prev,
      skills: prev.skills?.filter((s) => s !== skill) || []
    }));
  };

  const handleAddPreference = (key: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: { ...(prev.preferences || {}), [key]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);
    
    try {
      await dispatch(updateUserProfile(formData)).unwrap();
      setFormSuccess(true);
      setTimeout(() => setFormSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setFormSubmitted(false);
    }
  };

  if (loading && !profile) {
    return <LoadingSpinner />;
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">My Profile</h1>

        {error && <ErrorMessage message={error} />}

        {formSuccess && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
            Profile updated successfully!
          </div>
        )}

        {profile && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Profile Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col items-center text-center mb-6">
                  <div className="w-20 h-20 mb-3 rounded-full bg-gray-200 overflow-hidden">
                    {profile.picture ? (
                      <img src={profile.picture} alt={profile.name || 'User'} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-indigo-500 text-white text-2xl">
                        {profile.name ? profile.name.charAt(0) : 'U'}
                      </div>
                    )}
                  </div>
                  <h2 className="text-xl font-semibold dark:text-white">{profile.name}</h2>
                  <p className="text-gray-600 dark:text-gray-400">{profile.email}</p>
                </div>

                <div className="mb-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Profile Completion</div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-500 h-2.5 rounded-full" 
                      style={{ width: `${profile.profileCompletion}%` }}
                    />
                  </div>
                  <div className="text-sm text-right mt-1 dark:text-gray-400">{profile.profileCompletion}%</div>
                </div>
              </div>
            </div>

            {/* Profile Form */}
            <div className="lg:col-span-3">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
                <form onSubmit={handleSubmit}>
                  {/* Basic Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">
                      <FontAwesomeIcon icon={faUser} className="mr-2 text-indigo-500" />
                      Basic Information
                    </h3>
                    <div className="mb-4">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                    <div className="mb-4">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Work Information */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">
                      <FontAwesomeIcon icon={faBriefcase} className="mr-2 text-indigo-500" />
                      Work Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Job Title
                        </label>
                        <input
                          type="text"
                          id="jobTitle"
                          name="jobTitle"
                          value={formData.jobTitle || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                      <div>
                        <label htmlFor="department" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Department
                        </label>
                        <input
                          type="text"
                          id="department"
                          name="department"
                          value={formData.department || ''}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold mb-4 dark:text-white">
                      <FontAwesomeIcon icon={faList} className="mr-2 text-indigo-500" />
                      Skills
                    </h3>
                    <div className="flex mb-3">
                      <input
                        type="text"
                        id="skill"
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill"
                        className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      />
                      <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-indigo-500 text-white rounded-r-md hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Add
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.skills?.map((skill) => (
                        <div
                          key={skill}
                          className="px-3 py-1 bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200 rounded-full text-sm flex items-center"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="ml-2 text-indigo-500 dark:text-indigo-300 hover:text-indigo-700 dark:hover:text-indigo-100 focus:outline-none"
                          >
                            &times;
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-8 flex justify-end">
                    <button
                      type="submit"
                      disabled={formSubmitted}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center"
                    >
                      <FontAwesomeIcon icon={faSave} className="mr-2" />
                      {formSubmitted ? 'Saving...' : 'Save Profile'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Profile;