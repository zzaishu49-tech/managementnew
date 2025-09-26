import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Project } from '../../types';
import { StorageManager } from '../Storage/StorageManager';
import { CommentManager } from '../Comments/CommentManager';
import { BrochureDesign } from '../Brochure/BrochureDesign';
import { ProjectCommentSection } from '../Comments/ProjectCommentSection';
import { ClientFeedbackReport } from '../Reports/ClientFeedbackReport';
import { CheckSquare, Layers, Upload, MessageSquare, Eye, TrendingUp, Clock, CheckCircle, BarChart3, Briefcase, FileText, User, Calendar } from 'lucide-react';

interface ClientDashboardProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function ClientDashboard({ activeView, onViewChange }: ClientDashboardProps) {
  const { user } = useAuth();
  const { projects, stages, commentTasks, brochureProjects } = useData();
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [projectDetailTab, setProjectDetailTab] = useState('stages');
  const [showFeedbackReport, setShowFeedbackReport] = useState(false);
  const [selectedBrochureProject, setSelectedBrochureProject] = useState(null);

  // Get client's projects
  const clientProjects = projects.filter(project => project.client_id === user?.id);
  
  // Show message if no projects assigned
  if (activeView === 'dashboard' && clientProjects.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h3>
          <p className="text-gray-600">Contact your project manager to get started</p>
        </div>
      </div>
    );
  }

  const clientProject = clientProjects[0]; // Focus on first project for dashboard

  const projectStages = stages.filter(stage => stage.project_id === clientProject?.id)
                            .sort((a, b) => a.order - b.order);
  
  const pendingApprovals = clientProject ? projectStages.filter(stage => stage.approval_status === 'pending') : [];
  const openTasks = commentTasks.filter(task => 
    clientProject && task.project_id === clientProject.id && 
    task.author_role === 'client' && 
    task.status === 'open'
  );

  // Get client's brochure projects
  const clientBrochureProjects = brochureProjects.filter(bp => bp.client_id === user?.id);

  const handleProjectClick = (project: Project) => {
    setSelectedProject(project);
    setShowProjectDetail(true);
    setProjectDetailTab('brochure');
  };

  const renderDashboard = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
        <p className="text-gray-600">Overview of your project progress and activities</p>
      </div>

      {!clientProject ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Layers className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h3>
          <p className="text-gray-600">Contact your project manager to get started</p>
        </div>
      ) : (
        <>
      {/* Project Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">{clientProject.title}</h1>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            clientProject.status === 'active' ? 'bg-green-100 text-green-800' :
            clientProject.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {clientProject.status}
          </span>
        </div>
        <p className="text-gray-600 mb-4">{clientProject.description}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>Deadline: {new Date(clientProject.deadline).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>Progress: {clientProject.progress_percentage}%</span>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <CheckCircle className="w-4 h-4" />
            <span>Client: {clientProject.client_name}</span>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className="h-3 bg-red-600 rounded-full transition-all duration-300"
            style={{ width: `${clientProject.progress_percentage}%` }}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pending Approvals</p>
              <p className="text-3xl font-bold text-red-600">{pendingApprovals.length}</p>
            </div>
            <CheckSquare className="w-8 h-8 text-red-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Stages awaiting your review</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Open Tasks</p>
              <p className="text-3xl font-bold text-orange-600">{openTasks.length}</p>
            </div>
            <MessageSquare className="w-8 h-8 text-orange-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Your feedback items</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed Stages</p>
              <p className="text-3xl font-bold text-green-600">
                {projectStages.filter(s => s.approval_status === 'approved').length}
              </p>
            </div>
            <Layers className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-sm text-gray-500 mt-2">Out of {projectStages.length} total</p>
        </div>
      </div>

      {/* Stage Progress Overview */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Project Stages Overview</h3>
        <div className="space-y-3">
          {projectStages.map(stage => (
            <div key={stage.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${
                  stage.approval_status === 'approved' ? 'bg-green-500' :
                  stage.approval_status === 'rejected' ? 'bg-red-500' :
                  'bg-orange-500'
                }`} />
                <span className="font-medium text-gray-900">{stage.name}</span>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">{stage.progress_percentage}%</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  stage.approval_status === 'approved' ? 'bg-green-100 text-green-800' :
                  stage.approval_status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-orange-100 text-orange-800'
                }`}>
                  {stage.approval_status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">What you can do:</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700 mb-4">
          <div className="space-y-2">
            <p><strong>✓ Review Stages:</strong> Approve or request changes for each project phase</p>
            <p><strong>✓ Upload Files:</strong> Share reference materials and requirements</p>
          </div>
          <div className="space-y-2">
            <p><strong>✓ Add Comments:</strong> Provide feedback that becomes tasks for the team</p>
            <p><strong>✓ Track Progress:</strong> Monitor real-time project advancement</p>
          </div>
        </div>
        
        {/* Brochure Feedback Report Button */}
        {clientBrochureProjects.length > 0 && (
          <div className="pt-4 border-t border-red-200">
            <button
              onClick={() => {
                setSelectedBrochureProject(clientBrochureProjects[0]);
                setShowFeedbackReport(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
            >
              <CheckSquare className="w-4 h-4" />
              <span>View Brochure Feedback Report</span>
            </button>
          </div>
        )}
      </div>
        </>
      )}
    </div>
  );

  const renderProjectOverview = () => (
    <div className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Project Overview</h2>
        <p className="text-gray-600">Click on your project to view detailed information</p>
      </div>

      {clientProjects.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {clientProjects.map(project => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md cursor-pointer transition-all hover:border-red-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">{project.title}</h3>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  project.status === 'active' ? 'bg-green-100 text-green-800' :
                  project.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {project.status}
                </span>
              </div>
              
              <p className="text-gray-600 mb-4">{project.description}</p>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Deadline: {new Date(project.deadline).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Progress: {project.progress_percentage}%</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <User className="w-4 h-4" />
                  <span>Client: {project.client_name}</span>
                </div>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="h-3 bg-red-600 rounded-full transition-all duration-300"
                  style={{ width: `${project.progress_percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No projects assigned</h3>
          <p className="text-gray-600">Contact your project manager to get started</p>
        </div>
      )}
    </div>
  );

  const renderProjectDetail = () => {
    if (!selectedProject) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowProjectDetail(false)}
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              ← Back to Project Overview
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
              <div className="flex items-center space-x-3">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 bg-red-600 rounded-full"
                    style={{ width: `${selectedProject.progress_percentage}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-gray-900">{selectedProject.progress_percentage}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {[
              { id: 'brochure', label: 'Brochure Design', icon: FileText },
              { id: 'storage', label: 'Storage', icon: Layers },
              { id: 'comments', label: 'Comments', icon: MessageSquare },
              { id: 'project-comments', label: 'Project Discussion', icon: MessageSquare }
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setProjectDetailTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                    projectDetailTab === tab.id
                      ? 'border-red-600 text-red-600'
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
          {projectDetailTab === 'brochure' && (
            <BrochureDesign 
              projectId={selectedProject.id}
            />
          )}
          {projectDetailTab === 'storage' && (
            <StorageManager projectId={selectedProject.id} />
          )}
          {projectDetailTab === 'comments' && <CommentManager />}
          {projectDetailTab === 'project-comments' && (
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

  return (
    <div className="p-6">
      {/* Content based on active section */}
      {activeView === 'dashboard' && renderDashboard()}
      {activeView === 'project-overview' && renderProjectOverview()}
      
      {/* Feedback Report Modal */}
      {showFeedbackReport && selectedBrochureProject && (
        <ClientFeedbackReport
          project={selectedBrochureProject}
          onClose={() => {
            setShowFeedbackReport(false);
            setSelectedBrochureProject(null);
          }}
        />
      )}
    </div>
  );
}