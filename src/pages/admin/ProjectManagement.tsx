import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Layout from '../../components/Layout';
import LoadingSpinner from '../../components/LoadingSpinner';
import { 
  Briefcase, 
  FileSymlink, 
  Edit, 
  Trash, 
  AlertTriangle, 
  Users,
  Clock,
  Plus,
  Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { Project, ProjectRole } from '../../types/roles';

interface ProjectWithMembers extends Project {
  memberCount: number;
  activityCount: number;
  lastActivity: string;
}

/**
 * Project Management page for administrators
 * Provides CRUD operations for projects and project membership
 */
const ProjectManagement: React.FC = () => {
  const { isAdmin } = useSelector((state: RootState) => state.auth);
  const [projects, setProjects] = useState<ProjectWithMembers[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProject, setSelectedProject] = useState<ProjectWithMembers | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);

  // Simulate fetching projects
  useEffect(() => {
    const loadProjects = async () => {
      try {
        // This would be a real API call in production
        // For now we'll simulate loading
        setTimeout(() => {
          const mockProjects: ProjectWithMembers[] = [
            {
              id: 1,
              name: 'Web Platform Redesign',
              description: 'Redesign of the company web platform with improved UX',
              createdAt: '2023-02-15T10:30:00Z',
              updatedAt: '2023-05-01T14:45:00Z',
              ownerId: 1,
              memberCount: 8,
              activityCount: 145,
              lastActivity: '2023-05-09T11:20:00Z'
            },
            {
              id: 2,
              name: 'Mobile App Development',
              description: 'New mobile app for customer engagement',
              createdAt: '2023-01-10T09:15:00Z',
              updatedAt: '2023-04-28T16:30:00Z',
              ownerId: 3,
              memberCount: 5,
              activityCount: 98,
              lastActivity: '2023-05-08T13:10:00Z'
            },
            {
              id: 3,
              name: 'API Integration Project',
              description: 'Integration with third-party APIs for payment processing',
              createdAt: '2023-03-20T11:45:00Z',
              updatedAt: '2023-05-05T10:20:00Z',
              ownerId: 2,
              memberCount: 4,
              activityCount: 67,
              lastActivity: '2023-05-07T09:30:00Z'
            }
          ];
          setProjects(mockProjects);
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Error loading projects:', error);
        setLoading(false);
      }
    };
    
    loadProjects();
  }, []);

  // Filter projects based on search term
  const filteredProjects = projects.filter(project => 
    project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    project.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditProject = (project: ProjectWithMembers) => {
    setSelectedProject(project);
    setShowEditModal(true);
  };

  const handleDeleteProject = (project: ProjectWithMembers) => {
    setSelectedProject(project);
    setShowDeleteModal(true);
  };

  const handleManageMembers = (project: ProjectWithMembers) => {
    setSelectedProject(project);
    setShowMembersModal(true);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <LoadingSpinner size="large" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all projects including their details, members, and activity status.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none"
              onClick={() => {
                setSelectedProject(null);
                setShowEditModal(true);
              }}
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              New Project
            </button>
          </div>
        </div>
        
        {/* Search bar */}
        <div className="mt-6 mb-4">
          <div className="relative rounded-md shadow-sm max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Projects table */}
        <div className="mt-8 flex flex-col">
          <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Project Name
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Description
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Created
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Members
                      </th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                        Activity
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {filteredProjects.map((project) => (
                      <tr key={project.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-indigo-600 sm:pl-6">
                          {project.name}
                        </td>
                        <td className="px-3 py-4 text-sm text-gray-500 max-w-xs truncate">
                          {project.description}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {formatDate(project.createdAt)}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1 text-gray-400" />
                            {project.memberCount}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1 text-gray-400" />
                              Last: {formatDate(project.lastActivity)}
                            </div>
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                              {project.activityCount} logs
                            </div>
                          </div>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleManageMembers(project)}
                              className="text-blue-600 hover:text-blue-900"
                              title="Manage Members"
                            >
                              <Users className="h-5 w-5" />
                              <span className="sr-only">Manage members for {project.name}</span>
                            </button>
                            <button
                              onClick={() => handleEditProject(project)}
                              className="text-indigo-600 hover:text-indigo-900"
                              title="Edit Project"
                            >
                              <Edit className="h-5 w-5" />
                              <span className="sr-only">Edit {project.name}</span>
                            </button>
                            <button
                              onClick={() => handleDeleteProject(project)}
                              className="text-red-600 hover:text-red-900"
                              title="Delete Project"
                            >
                              <Trash className="h-5 w-5" />
                              <span className="sr-only">Delete {project.name}</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <Briefcase className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No projects found</h3>
            <p className="mt-1 text-sm text-gray-500">
              No projects match your search criteria.
            </p>
          </div>
        )}

        {/* Edit/Create Project Modal */}
        {showEditModal && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Briefcase className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {selectedProject ? 'Edit Project' : 'Create New Project'}
                      </h3>
                      <div className="mt-4 space-y-4">
                        <div>
                          <label htmlFor="project-name" className="block text-sm font-medium text-gray-700">
                            Project Name
                          </label>
                          <input
                            type="text"
                            name="project-name"
                            id="project-name"
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            defaultValue={selectedProject?.name || ''}
                          />
                        </div>
                        <div>
                          <label htmlFor="project-description" className="block text-sm font-medium text-gray-700">
                            Description
                          </label>
                          <textarea
                            id="project-description"
                            name="project-description"
                            rows={3}
                            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                            defaultValue={selectedProject?.description || ''}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    {selectedProject ? 'Save Changes' : 'Create Project'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowEditModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Project Modal */}
        {showDeleteModal && selectedProject && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Delete Project
                      </h3>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          Are you sure you want to delete the project "{selectedProject.name}"? This action cannot be undone.
                          All associated activity logs and memberships will be permanently removed.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    <Trash className="h-4 w-4 mr-1.5" />
                    Delete
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowDeleteModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Manage Members Modal */}
        {showMembersModal && selectedProject && (
          <div className="fixed z-10 inset-0 overflow-y-auto">
            <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Manage Project Members
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        {selectedProject.name} - Current members: {selectedProject.memberCount}
                      </p>
                      
                      <div className="mt-4">
                        <div className="flex justify-between mb-4">
                          <input
                            type="text"
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                            placeholder="Search users to add..."
                          />
                          <button
                            type="button"
                            className="ml-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                          >
                            <Plus className="-ml-1 mr-1 h-4 w-4" />
                            Add
                          </button>
                        </div>
                        
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg max-h-80 overflow-y-auto">
                          <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                              <tr>
                                <th scope="col" className="py-3 pl-4 pr-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  User
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Role
                                </th>
                                <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  Joined
                                </th>
                                <th scope="col" className="relative py-3 pl-3 pr-4">
                                  <span className="sr-only">Actions</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {/* This would be populated with actual project members */}
                              <tr>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8">
                                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-xs font-medium">JS</span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">John Smith</div>
                                      <div className="text-sm text-gray-500">john@example.com</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  <select className="text-sm text-gray-700 border-gray-300 rounded-md">
                                    <option value="PROJECT_ADMIN">Project Admin</option>
                                    <option value="PROJECT_MANAGER">Project Manager</option>
                                    <option value="PROJECT_MEMBER">Member</option>
                                    <option value="PROJECT_VIEWER">Viewer</option>
                                  </select>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                  Mar 15, 2023
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-red-600 hover:text-red-900">
                                    <Trash className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                              <tr>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="flex-shrink-0 h-8 w-8">
                                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                                        <span className="text-xs font-medium">JD</span>
                                      </div>
                                    </div>
                                    <div className="ml-4">
                                      <div className="text-sm font-medium text-gray-900">Jane Doe</div>
                                      <div className="text-sm text-gray-500">jane@example.com</div>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap">
                                  <select className="text-sm text-gray-700 border-gray-300 rounded-md">
                                    <option value="PROJECT_ADMIN">Project Admin</option>
                                    <option value="PROJECT_MANAGER" selected>Project Manager</option>
                                    <option value="PROJECT_MEMBER">Member</option>
                                    <option value="PROJECT_VIEWER">Viewer</option>
                                  </select>
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-500">
                                  Apr 2, 2023
                                </td>
                                <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button className="text-red-600 hover:text-red-900">
                                    <Trash className="h-4 w-4" />
                                  </button>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="button"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowMembersModal(false)}
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowMembersModal(false)}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </Layout>
  );
};

export default ProjectManagement;