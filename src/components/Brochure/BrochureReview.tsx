import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { BrochureProject, BrochurePage } from '../../types';
import { BrochurePageViewer } from './BrochurePageViewer';
import { PageComments } from './PageComments';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  XCircle, 
  Clock,
  FileText,
  Eye,
  MessageSquare,
  Calendar,
  User
} from 'lucide-react';

export function BrochureReview() {
  const { user } = useAuth();
  const { 
    getBrochureProjectsForReview, 
    getBrochurePages, 
    approveBrochurePage,
    lockBrochurePage,
    unlockBrochurePage
  } = useData();

  const [selectedProject, setSelectedProject] = useState<BrochureProject | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [approvalAction, setApprovalAction] = useState<'approved' | 'rejected'>('approved');
  const [approvalComment, setApprovalComment] = useState('');

  const projects = getBrochureProjectsForReview();
  const pages = selectedProject ? getBrochurePages(selectedProject.id) : [];
  const currentPageData = pages.find(p => p.page_number === currentPage);

  // Get total pages dynamically
  const getTotalPages = () => {
    if (!selectedProject) return 1;
    const projectPages = getBrochurePages(selectedProject.id);
    return projectPages.length > 0 ? Math.max(...projectPages.map(p => p.page_number)) : 1;
  };

  const totalPages = getTotalPages();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'rejected': return <XCircle className="w-5 h-5 text-red-500" />;
      default: return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-orange-100 text-orange-800 border-orange-200';
    }
  };

  const getPageTitle = (pageNumber: number) => {
    switch (pageNumber) {
      case 1: return 'Project Details';
      case 2: return 'Company Information';
      default: return `Content Page ${pageNumber - 2}`;
    }
  };

  const handleLockToggle = () => {
    if (!currentPageData) return;
    
    if (currentPageData.is_locked) {
      unlockBrochurePage(currentPageData.id);
    } else {
      lockBrochurePage(currentPageData.id);
    }
  };
  const handleApproval = () => {
    if (!currentPageData) return;
    
    approveBrochurePage(
      currentPageData.id, 
      approvalAction, 
      approvalComment.trim() || undefined
    );
    
    setShowApprovalModal(false);
    setApprovalComment('');
  };

  const getThemeColors = () => {
    switch (user?.role) {
      case 'manager': return {
        primary: 'bg-blue-600 hover:bg-blue-700',
        secondary: 'bg-blue-50 border-blue-200',
        text: 'text-blue-600',
        border: 'border-blue-600'
      };
      case 'employee': return {
        primary: 'bg-green-600 hover:bg-green-700',
        secondary: 'bg-green-50 border-green-200',
        text: 'text-green-600',
        border: 'border-green-600'
      };
      default: return {
        primary: 'bg-gray-600 hover:bg-gray-700',
        secondary: 'bg-gray-50 border-gray-200',
        text: 'text-gray-600',
        border: 'border-gray-600'
      };
    }
  };

  const theme = getThemeColors();

  if (!selectedProject) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Brochure Review</h2>
          <p className="text-gray-600">Review and approve client brochure submissions</p>
        </div>

        {projects.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No brochures to review</h3>
            <p className="text-gray-600">Check back when clients submit brochure projects</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Brochure Projects for Review</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {projects.map(project => {
                const projectPages = getBrochurePages(project.id);
                const approvedPages = projectPages.filter(p => p.approval_status === 'approved').length;
                const totalPages = projectPages.length;
                const progress = totalPages > 0 ? Math.round((approvedPages / totalPages) * 100) : 0;

                return (
                  <div
                    key={project.id}
                    onClick={() => setSelectedProject(project)}
                    className={`bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md cursor-pointer transition-all ${theme.secondary}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900">Brochure Project</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        project.status === 'ready_for_design' ? 'bg-blue-100 text-blue-800' :
                        project.status === 'in_design' ? 'bg-orange-100 text-orange-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <User className="w-4 h-4" />
                        <span>Client: {project.client_name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Submitted: {new Date(project.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Review Progress</span>
                          <span className={theme.text}>{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              user?.role === 'manager' ? 'bg-blue-600' : 'bg-green-600'
                            }`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          {approvedPages} of {totalPages} pages approved
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <button
              onClick={() => setSelectedProject(null)}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors mb-2"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Projects
            </button>
            <h2 className="text-2xl font-bold text-gray-900">Brochure Review</h2>
            <p className="text-gray-600">
              Page {currentPage} - {getPageTitle(currentPage)}
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-600">Client: {selectedProject.client_name}</span>
            {currentPageData && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(currentPageData.approval_status)}`}>
                {getStatusIcon(currentPageData.approval_status)}
                <span className="ml-2">{currentPageData.approval_status}</span>
              </span>
            )}
          </div>
        </div>

        {/* Page Status Overview */}
        <div className="flex flex-wrap gap-2 mb-4">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => {
            const page = pages.find(p => p.page_number === pageNum);
            const status = page?.approval_status || 'pending';
            return (
            <button
              key={pageNum}
              onClick={() => setCurrentPage(pageNum)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-sm font-medium transition-all ${
                currentPage === pageNum
                  ? `${theme.primary} text-white`
                  : `bg-white text-gray-700 border-gray-300 hover:${theme.secondary}`
              }`}
            >
              {getStatusIcon(status)}
              {page?.is_locked && <span className="text-xs">🔒</span>}
              <span>Page {pageNum}</span>
            </button>
          );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          {currentPageData ? (
            <BrochurePageViewer 
              page={currentPageData}
              project={selectedProject}
            />
          ) : (
            <div className="bg-gray-50 rounded-lg p-12 border-2 border-dashed border-gray-300">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Content</h3>
                <p className="text-gray-600">This page hasn't been filled out by the client yet</p>
              </div>
            </div>
          )}

          {/* Approval Actions - Manager Only */}
          {user?.role === 'manager' && currentPageData && currentPageData.approval_status === 'pending' && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">Page Approval</h4>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setApprovalAction('approved');
                    setShowApprovalModal(true);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve Page</span>
                </button>
                <button
                  onClick={() => {
                    setApprovalAction('rejected');
                    setShowApprovalModal(true);
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  <XCircle className="w-5 h-5" />
                  <span>Request Changes</span>
                </button>
              </div>
            </div>
          )}

          {/* Page Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            <div className="flex items-center space-x-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                    currentPage === pageNum
                      ? `${theme.primary} text-white`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comments Sidebar */}
        <div className="lg:col-span-1">
          {/* Lock/Unlock Controls */}
          {currentPageData && (
            <div className="mb-6 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <span className="text-lg mr-2">{currentPageData.is_locked ? '🔒' : '🔓'}</span>
                Page Access Control
              </h4>
              
              {currentPageData.is_locked ? (
                <div className="space-y-3">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Page is locked</strong>
                      {currentPageData.locked_by_name && (
                        <span className="block mt-1">
                          Locked by: {currentPageData.locked_by_name}
                        </span>
                      )}
                      {currentPageData.locked_at && (
                        <span className="block text-xs text-yellow-600">
                          {new Date(currentPageData.locked_at).toLocaleString()}
                        </span>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={handleLockToggle}
                    className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🔓</span>
                    <span>Unlock Page</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-800">
                      <strong>Page is unlocked</strong><br />
                      Client can edit this page
                    </p>
                  </div>
                  <button
                    onClick={handleLockToggle}
                    className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                  >
                    <span>🔒</span>
                    <span>Lock Page</span>
                  </button>
                </div>
              )}
              
              <div className="mt-3 text-xs text-gray-500">
                Locking prevents client from editing this page until unlocked.
              </div>
            </div>
          )}

          {currentPageData && (
            <PageComments 
              pageId={currentPageData.id}
              projectId={selectedProject.id}
              pageNumber={currentPage}
            />
          )}
        </div>
      </div>

      {/* Approval Modal */}
      {showApprovalModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {approvalAction === 'approved' ? 'Approve Page' : 'Request Changes'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {approvalAction === 'approved' ? 'Approval Note (Optional)' : 'What changes are needed?'}
                </label>
                <textarea
                  value={approvalComment}
                  onChange={(e) => setApprovalComment(e.target.value)}
                  placeholder={
                    approvalAction === 'approved' 
                      ? "Add any notes about the approval..."
                      : "Describe the changes needed..."
                  }
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required={approvalAction === 'rejected'}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowApprovalModal(false);
                    setApprovalComment('');
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleApproval}
                  disabled={approvalAction === 'rejected' && !approvalComment.trim()}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors text-white ${
                    approvalAction === 'approved'
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-red-600 hover:bg-red-700'
                  } disabled:bg-gray-400`}
                >
                  {approvalAction === 'approved' ? 'Approve' : 'Request Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}