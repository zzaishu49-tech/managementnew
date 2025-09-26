import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { ProjectCard } from '../Projects/ProjectCard';
import { EmployeeTaskCard } from '../Tasks/EmployeeTaskCard';
import { ProjectCommentSection } from '../Comments/ProjectCommentSection';
import { BrochureDesign } from '../Brochure/BrochureDesign';
import { Project } from '../../types';
import { StorageManager } from '../Storage/StorageManager';
import { 
  Briefcase, 
  Clock, 
  CheckCircle, 
  ListTodo, 
  BarChart3, 
  TrendingUp,
  Calendar,
  User,
  FolderOpen,
  Search,
  Filter,
  Users,
  Eye,
  CheckSquare,
  FileText,
  MessageSquare
} from 'lucide-react';

interface EmployeeDashboardProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function EmployeeDashboard({ activeView, onViewChange }: EmployeeDashboardProps) {
  const { user } = useAuth();
  const { projects, commentTasks, stages, tasks, brochureProjects, updateProject } = useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  // const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [projectDetailTab, setProjectDetailTab] = useState('tasks');

  // Filter projects assigned to current employee
  const assignedProjects = projects.filter(project => 
    project.assigned_employees.includes(user?.id || '')
  );

  // Get tasks assigned to current employee
  const myTasks = commentTasks.filter(task => task.assigned_to === user?.id);
  const actualTasks = tasks.filter(task => task.assigned_to === user?.id);

  const openTasks = actualTasks.filter(task => task.status === 'open');
  const inProgressTasks = actualTasks.filter(task => task.status === 'in-progress');
  const completedTasks = actualTasks.filter(task => task.status === 'done');

  // Filter projects for the projects section
  const filteredProjects = assignedProjects.filter(project => {
    const matchesSearch = project.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         project.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || project.priority === filterPriority;
    return matchesSearch && matchesFilter && matchesPriority;
  });

  const getProjectStats = () => {
    const total = assignedProjects.length;
    const active = assignedProjects.filter(p => p.status === 'active').length;
    const avgProgress = assignedProjects.reduce((sum, p) => sum + p.progress_percentage, 0) / total || 0;
    
    return { total, active, avgProgress: Math.round(avgProgress) };
  };

  const stats = getProjectStats();

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
    setProjectDetailTab('tasks');
  };

  const renderMyTasks = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <p className="text-gray-600">Track and complete your assigned tasks</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tasks</p>
              <p className="text-3xl font-bold text-orange-600">{openTasks.length}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-blue-600">{inProgressTasks.length}</p>
            </div>
            <ListTodo className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{completedTasks.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Task Sections */}
      <div className="space-y-6">
        {/* Open Tasks */}
        {openTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-orange-500 mr-2" />
              Open Tasks ({openTasks.length})
            </h3>
            <div className="space-y-4">
              {openTasks.map(task => (
                <EmployeeTaskCard key={task.id} task={task} showProject={true} />
              ))}
            </div>
          </div>
        )}

        {/* In Progress Tasks */}
        {inProgressTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <ListTodo className="w-5 h-5 text-blue-500 mr-2" />
              In Progress ({inProgressTasks.length})
            </h3>
            <div className="space-y-4">
              {inProgressTasks.map(task => (
                <EmployeeTaskCard key={task.id} task={task} showProject={true} />
              ))}
            </div>
          </div>
        )}

        {/* Completed Tasks */}
        {completedTasks.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
              Recently Completed ({completedTasks.slice(0, 5).length})
            </h3>
            <div className="space-y-4">
              {completedTasks.slice(0, 5).map(task => (
                <EmployeeTaskCard key={task.id} task={task} showProject={true} />
              ))}
            </div>
          </div>
        )}

        {myTasks.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <ListTodo className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks assigned</h3>
            <p className="text-gray-600">Check back later for new assignments</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProjectDetail = () => {
    if (!selectedProject) return null;

    const handleProgressUpdate = async (newProgress: number) => {
      try {
        await updateProject(selectedProject.id, { progress_percentage: newProgress });
        setSelectedProject(prev => prev ? { ...prev, progress_percentage: newProgress } : null);
      } catch (error) {
        console.error('Error updating project progress:', error);
        alert('Error updating project progress. Please try again.');
      }
    };

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProjectDetail(false)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Projects
            </button>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{selectedProject.title}</h2>
              <p className="text-gray-600">{selectedProject.description}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            selectedProject.status === 'active' ? 'bg-green-100 text-green-800' :
            selectedProject.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {selectedProject.status}
          </span>
        </div>

        {/* Project Info */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Client</h4>
              <p className="text-gray-600">{selectedProject.client_name}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Deadline</h4>
              <p className="text-gray-600">{new Date(selectedProject.deadline).toLocaleDateString()}</p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Progress</h4>
              {user?.role === 'employee' ? (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={selectedProject.progress_percentage}
                      onChange={(e) => handleProgressUpdate(parseInt(e.target.value))}
                      className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                      style={{ '--value': `${selectedProject.progress_percentage}%` } as React.CSSProperties}
                    />
                    <span className="text-sm font-medium text-gray-900 min-w-[40px]">{selectedProject.progress_percentage}%</span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0%</span>
                    <span>50%</span>
                    <span>100%</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 bg-green-600 rounded-full"
                      style={{ width: `${selectedProject.progress_percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-gray-900">{selectedProject.progress_percentage}%</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              { id: 'storage', label: 'Storage', icon: FolderOpen },
              { id: 'brochure', label: 'Brochure Design', icon: FileText },
              { id: 'comments', label: 'Comments', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProjectDetailTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    projectDetailTab === tab.id
                      ? 'border-green-600 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {projectDetailTab === 'tasks' && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Project Tasks</h3>
              {myTasks.filter(task => task.project_id === selectedProject.id).map(task => (
                <EmployeeTaskCard key={task.id} task={task} showProject={false} />
              ))}
              {myTasks.filter(task => task.project_id === selectedProject.id).length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p>No tasks for this project</p>
                </div>
              )}
            </div>
          )}
          {projectDetailTab === 'storage' && (
            <StorageManager projectId={selectedProject.id} />
          )}
          {projectDetailTab === 'brochure' && (() => {
            // Find the brochure project for this client
            const clientBrochureProject = brochureProjects.find(bp => bp.project_id === selectedProject.id);
            
            return (
              <BrochureDesign 
                initialBrochureProject={clientBrochureProject}
                projectId={selectedProject.id}
                onBack={() => setProjectDetailTab('tasks')}
              />
            );
          })()}
          {projectDetailTab === 'comments' && (
            <ProjectCommentSection project={selectedProject} />
          )}
        </div>
      </div>
    );
  };

  // Show project detail if selected
  if (showProjectDetail && selectedProject) {
    return (
      <div className="p-6">
        {renderProjectDetail()}
      </div>
    );
  }

  const renderProjects = () => {
    return (
      <div className="space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">My Projects</h2>
            <p className="text-gray-600 text-lg">Projects assigned to me</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-gray-50 rounded-xl p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="on_hold">On Hold</option>
            </select>
          </div>
          <div className="relative">
            <TrendingUp className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="pl-10 pr-8 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white shadow-sm"
            >
              <option value="all">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>
        </div>

        {/* Projects List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Project</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Client</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Priority</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Deadline</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Progress</th>
                  <th className="px-6 py-4 text-left text-sm font-bold text-gray-700 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredProjects.map(project => (
                  <tr key={project.id} className="hover:bg-green-50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-base font-bold text-gray-900">{project.title}</div>
                        <div className="text-sm text-gray-600 line-clamp-2 max-w-xs">{project.description}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{project.client_name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {project.priority && (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${
                          project.priority === 'high' ? 'bg-red-100 text-red-800' :
                          project.priority === 'medium' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {project.priority}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-600">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>{new Date(project.deadline).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2 mr-3" style={{ width: '100px' }}>
                          <div
                            className="h-2 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                            style={{ width: `${project.progress_percentage}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 min-w-[40px]">{project.progress_percentage}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleProjectClick(project)}
                        className="text-green-600 hover:text-green-900 hover:bg-green-100 px-3 py-1 rounded-lg transition-all duration-200 flex items-center space-x-1"
                      >
                        <Eye className="w-4 h-4" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {filteredProjects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Filter className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No projects found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6">
      {/* Content based on active section */}
      {activeView === 'dashboard' && (
        <div className="space-y-6">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
            <p className="text-gray-600">Overview of your assigned projects and tasks</p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-sm border border-green-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-700">Total Projects</p>
                  <p className="text-3xl font-bold text-green-800">{stats.total}</p>
                </div>
                <div className="bg-green-600 p-3 rounded-full">
                  <Briefcase className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl shadow-sm border border-blue-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-blue-700">Active Projects</p>
                  <p className="text-3xl font-bold text-blue-800">{stats.active}</p>
                </div>
                <div className="bg-blue-600 p-3 rounded-full">
                  <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                    <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl shadow-sm border border-orange-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-orange-700">Open Tasks</p>
                  <p className="text-3xl font-bold text-orange-800">{openTasks.length}</p>
                </div>
                <div className="bg-orange-600 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-sm border border-purple-200 p-6 hover:shadow-md transition-all duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-purple-700">Avg Progress</p>
                  <p className="text-3xl font-bold text-purple-800">{stats.avgProgress}%</p>
                </div>
                <div className="bg-purple-600 p-3 rounded-full">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Recent Projects */}
          <div className="bg-gray-50 rounded-xl border border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-6">My Recent Projects</h3>
            {assignedProjects.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {assignedProjects.slice(0, 6).map(project => (
                  <div key={project.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-lg hover:border-green-300 transition-all duration-200 cursor-pointer transform hover:scale-[1.02]"
                       onClick={() => handleProjectClick(project)}>
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-gray-900 truncate">{project.title}</h4>
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        project.status === 'active' ? 'bg-green-100 text-green-800' :
                        project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {project.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-4 font-medium">{project.client_name}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className="h-3 bg-gradient-to-r from-green-500 to-green-600 rounded-full transition-all duration-300"
                        style={{ width: `${project.progress_percentage}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-600 mt-2 font-medium">{project.progress_percentage}% Complete</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Briefcase className="w-8 h-8 text-gray-400" />
                </div>
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Projects Assigned</h4>
                <p className="text-gray-600">You don't have any projects assigned yet.</p>
              </div>
            )}
          </div>

          {/* Recent Tasks */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Tasks</h3>
            {actualTasks.slice(0, 5).length > 0 ? (
              <div className="space-y-3">
                {actualTasks.slice(0, 5).map(task => (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${
                        task.status === 'done' ? 'bg-green-500' :
                        task.status === 'in-progress' ? 'bg-blue-500' :
                        'bg-orange-500'
                      }`} />
                      <span className="font-medium text-gray-900 truncate max-w-xs">{task.title}</span>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      task.status === 'done' ? 'bg-green-100 text-green-800' :
                      task.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {task.status.replace('-', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <ListTodo className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-600">No recent tasks</p>
              </div>
            )}
          </div>
        </div>
      )}
      {activeView === 'mytasks' && renderMyTasks()}
      {activeView === 'projects' && renderProjects()}
    </div>
  );
}