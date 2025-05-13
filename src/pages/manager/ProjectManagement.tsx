import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
  Plus,
  Search,
  Filter,
  MoreVertical,
  Users,
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  Briefcase,
  ChevronDown,
  Edit,
  Trash2,
  UserPlus
} from 'lucide-react';
import LoadingState from '../../components/LoadingState';
import ErrorMessage from '../../components/ErrorMessage';
import { Project, ProjectRole } from '../../types/roles';
import projectService from '../../services/projectService';
import teamManagementService from '../../services/teamManagementService';

/**
 * Project Management Component for Managers
 * 
 * Allows managers to view and manage projects assigned to their team
 * Only accessible to users with MANAGER role
 */
const ProjectManagement: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useSelector((state: RootState) => state.auth);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Array<Project & { 
    status: string; 
    completionRate: number; 
    teamSize: number;
    memberCount: number;
    activityCount: number;
    lastActivity: string;
  }>>([]);
  const [projectStats, setProjectStats] = useState<Record<number, {
    memberCount: number;
    completionRate: number; 
    activityCount: number;
    lastActivity: string;
  }>>({});
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);

  // Load projects from API
  const loadProjects = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get team projects for the manager
      const response = await teamManagementService.getTeamProjects(page, pageSize);
      
      const projectsData = response.content;
      setTotalPages(response.totalPages);
      setTotalElements(response.totalElements);
      
      // Get stats for each project
      const projectWithStats = await Promise.all(
        projectsData.map(async (project) => {
          try {
            const stats = await projectService.getProjectStats(project.id);
            return {
              ...project,
              status: project.status || 'In Progress',
              completionRate: stats.completionRate,
              teamSize: stats.memberCount,
              memberCount: stats.memberCount,
              activityCount: stats.activityCount,
              lastActivity: stats.lastActivity
            };
          } catch (err) {
            console.error(`Error fetching stats for project ${project.id}:`, err);
            return {
              ...project,
              status: project.status || 'In Progress',
              completionRate: 0,
              teamSize: 0,
              memberCount: 0,
              activityCount: 0,
              lastActivity: 'N/A'
            };
          }
        })
      );
      
      setProjects(projectWithStats);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Failed to load projects. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [page, pageSize]);

  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    // Apply search filter
    const matchesSearch = 
      project.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      (project.description && project.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Apply status filter
    const matchesStatus = statusFilter === 'all' || project.status.toLowerCase() === statusFilter.toLowerCase();
    
    return matchesSearch && matchesStatus;
  });

  // Handle adding a new project
  const handleAddProject = () => {
    setShowAddProjectModal(true);
  };

  // Handle selecting a project for member management
  const handleManageProjectMembers = (project: Project) => {
    setSelectedProject(project);
    setShowAddMemberModal(true);
  };

  // Get status badge color based on status
  const getStatusBadge = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" /> Completed
        </span>;
      case 'in progress':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <Clock className="w-3 h-3 mr-1" /> In Progress
        </span>;
      case 'planning':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Calendar className="w-3 h-3 mr-1" /> Planning
        </span>;
      case 'on hold':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          <AlertTriangle className="w-3 h-3 mr-1" /> On Hold
        </span>;
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <ErrorMessage message={error} />
        </div>
      )}
      
      <LoadingState loading={loading}>
        <div className="flex-1 p-6 overflow-auto">
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Project Management</h1>
              <p className="text-gray-500">Manage and monitor team projects</p>
            </div>
            <div className="flex items-center space-x-3 mt-4 md:mt-0">
              <button 
                onClick={handleAddProject}
                className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
              <div className="flex-1 mb-4 md:mb-0">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label htmlFor="status-filter" className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <div className="relative">
                  <select
                    id="status-filter"
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="in progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="planning">Planning</option>
                    <option value="on hold">On Hold</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                    <ChevronDown className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Projects Grid */}
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map((project) => (
                <div 
                  key={project.id} 
                  className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col"
                >
                  <div className="px-4 py-4 border-b border-gray-200 flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900 truncate max-w-[180px]">{project.name}</h3>
                    {getStatusBadge(project.status)}
                  </div>
                  <div className="p-4 flex-1">
                    <p className="text-sm text-gray-500 line-clamp-2 mb-4">
                      {project.description || 'No description provided'}
                    </p>
                    <div className="mt-2 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500">Completion</span>
                        <span className="text-xs font-medium text-gray-700">{project.completionRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            project.completionRate >= 90 ? 'bg-green-500' : 
                            project.completionRate >= 50 ? 'bg-blue-500' : 
                            project.completionRate >= 25 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${project.completionRate}%` }}
                        ></div>
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{project.teamSize} members</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex justify-between">
                    <button 
                      onClick={() => handleManageProjectMembers(project)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Manage Team
                    </button>
                    <div className="relative inline-block text-left">
                      <button className="flex items-center text-gray-400 hover:text-gray-600 focus:outline-none">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                      {/* Dropdown menu would go here */}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center">
              <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No projects found</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || statusFilter !== 'all' 
                  ? "No projects match your search criteria. Try adjusting your filters."
                  : "Start by adding a new project for your team."
                }
              </p>
              <button 
                onClick={handleAddProject}
                className="inline-flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" />
                <span>Add Project</span>
              </button>
            </div>
          )}
          
          {/* Pagination would go here */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-6">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => setPage(Math.max(0, page - 1))}
                  disabled={page === 0}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    page === 0 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Previous</span>
                  <ChevronDown className="h-5 w-5 transform -rotate-90" aria-hidden="true" />
                </button>
                {/* Page Numbers */}
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                      page === i
                        ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                        : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
                  disabled={page === totalPages - 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    page === totalPages - 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  <span className="sr-only">Next</span>
                  <ChevronDown className="h-5 w-5 transform rotate-90" aria-hidden="true" />
                </button>
              </nav>
            </div>
          )}
        </div>
      </LoadingState>
      
      {/* Add Project Modal would go here */}
      
      {/* Manage Team Members Modal would go here */}
    </div>
  );
};

export default ProjectManagement;