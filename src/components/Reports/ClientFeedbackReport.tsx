import React, { useState, useEffect } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { BrochureProject, BrochurePage, PageComment } from '../../types';
import { 
  FileText, 
  Download, 
  Calendar, 
  User, 
  MessageSquare, 
  CheckCircle, 
  XCircle, 
  Clock,
  Edit,
  Eye,
  Building,
  Mail
} from 'lucide-react';

interface ClientFeedbackReportProps {
  project: BrochureProject;
  onClose: () => void;
}

export function ClientFeedbackReport({ project, onClose }: ClientFeedbackReportProps) {
  const { getBrochurePages, getPageComments } = useData();
  const { user } = useAuth();
  const [reportData, setReportData] = useState<any>(null);
  const [isGenerating, setIsGenerating] = useState(true);

  useEffect(() => {
    generateReport();
  }, [project]);

  const generateReport = () => {
    setIsGenerating(true);
    
    const pages = getBrochurePages(project.id);
    const reportSections: any[] = [];
    
    // Executive Summary
    const totalPages = pages.length;
    const approvedPages = pages.filter(p => p.approval_status === 'approved').length;
    const rejectedPages = pages.filter(p => p.approval_status === 'rejected').length;
    const pendingPages = pages.filter(p => p.approval_status === 'pending').length;
    
    // Collect all feedback by page
    pages.forEach(page => {
      const comments = getPageComments(page.id);
      if (comments.length > 0) {
        const pageTitle = getPageTitle(page.page_number);
        const managerComments = comments.filter(c => c.author_role === 'manager');
        const employeeComments = comments.filter(c => c.author_role === 'employee');
        
        reportSections.push({
          pageNumber: page.page_number,
          pageTitle,
          approvalStatus: page.approval_status,
          managerComments,
          employeeComments,
          totalComments: comments.length,
          lastUpdated: page.updated_at
        });
      }
    });

    const report = {
      projectInfo: {
        name: project.client_name + "'s Brochure Project",
        status: project.status,
        createdDate: project.created_at,
        lastUpdated: project.updated_at,
        totalPages,
        approvedPages,
        rejectedPages,
        pendingPages,
        completionPercentage: Math.round((approvedPages / totalPages) * 100)
      },
      sections: reportSections,
      summary: {
        totalFeedbackItems: reportSections.reduce((sum, section) => sum + section.totalComments, 0),
        managerFeedbackItems: reportSections.reduce((sum, section) => sum + section.managerComments.length, 0),
        employeeFeedbackItems: reportSections.reduce((sum, section) => sum + section.employeeComments.length, 0)
      }
    };

    setReportData(report);
    setIsGenerating(false);
  };

  const getPageTitle = (pageNumber: number) => {
    switch (pageNumber) {
      case 1: return 'Project Details & Company Overview';
      case 2: return 'Company Information & Contact Details';
      default: return `Content Section ${pageNumber - 2}`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'rejected': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-orange-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-50 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-50 text-red-800 border-red-200';
      default: return 'bg-orange-50 text-orange-800 border-orange-200';
    }
  };

  const exportReport = () => {
    if (!reportData) return;
    
    const reportContent = generateTextReport();
    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Brochure_Feedback_Report_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const generateTextReport = () => {
    if (!reportData) return '';

    return `
BROCHURE PROJECT FEEDBACK REPORT
===============================

Project: ${reportData.projectInfo.name}
Generated: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}
Report Period: ${new Date(reportData.projectInfo.createdDate).toLocaleDateString()} - ${new Date(reportData.projectInfo.lastUpdated).toLocaleDateString()}

EXECUTIVE SUMMARY
================
Project Status: ${reportData.projectInfo.status.toUpperCase().replace('_', ' ')}
Completion Progress: ${reportData.projectInfo.completionPercentage}%

Page Approval Status:
- Total Pages: ${reportData.projectInfo.totalPages}
- Approved: ${reportData.projectInfo.approvedPages}
- Pending Review: ${reportData.projectInfo.pendingPages}
- Requiring Changes: ${reportData.projectInfo.rejectedPages}

Feedback Summary:
- Total Feedback Items: ${reportData.summary.totalFeedbackItems}
- Management Feedback: ${reportData.summary.managerFeedbackItems}
- Design Team Feedback: ${reportData.summary.employeeFeedbackItems}

DETAILED FEEDBACK BY SECTION
============================

${reportData.sections.map((section: any) => `
${section.pageTitle.toUpperCase()} (Page ${section.pageNumber})
${'='.repeat(section.pageTitle.length + 10)}
Status: ${section.approvalStatus.toUpperCase()}
Last Updated: ${new Date(section.lastUpdated).toLocaleDateString()}

${section.managerComments.length > 0 ? `
MANAGEMENT FEEDBACK:
${section.managerComments.map((comment: any, index: number) => `
${index + 1}. ${comment.text}
   - By: ${comment.author_name}
   - Date: ${new Date(comment.timestamp).toLocaleDateString()}
   - Status: ${comment.marked_done ? 'RESOLVED' : 'PENDING'}
`).join('')}` : ''}

${section.employeeComments.length > 0 ? `
DESIGN TEAM FEEDBACK:
${section.employeeComments.map((comment: any, index: number) => `
${index + 1}. ${comment.text}
   - By: ${comment.author_name}
   - Date: ${new Date(comment.timestamp).toLocaleDateString()}
   - Status: ${comment.marked_done ? 'RESOLVED' : 'PENDING'}
`).join('')}` : ''}
`).join('\n')}

NEXT STEPS
==========
${reportData.projectInfo.rejectedPages > 0 ? 
`- Please review and address feedback for ${reportData.projectInfo.rejectedPages} page(s) requiring changes
- Resubmit updated content for approval` : 
reportData.projectInfo.pendingPages > 0 ?
`- ${reportData.projectInfo.pendingPages} page(s) are currently under review
- You will be notified once review is complete` :
`- All pages have been approved
- Project is ready to proceed to design phase`}

For questions or clarification on any feedback items, please contact your project manager.

---
This report was automatically generated by XeeTrack Project Management System
    `.trim();
  };

  if (isGenerating) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating Report</h3>
            <p className="text-gray-600">Compiling feedback and project data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!reportData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-red-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FileText className="w-8 h-8" />
              <div>
                <h2 className="text-2xl font-bold">Project Feedback Report</h2>
                <p className="text-red-100">{reportData.projectInfo.name}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={exportReport}
                className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-red-50 transition-colors flex items-center space-x-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Report</span>
              </button>
              <button
                onClick={onClose}
                className="text-white hover:text-red-200 transition-colors"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Executive Summary */}
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-red-600" />
              Executive Summary
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Project Status</span>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    reportData.projectInfo.status === 'completed' ? 'bg-green-100 text-green-800' :
                    reportData.projectInfo.status === 'in_design' ? 'bg-blue-100 text-blue-800' :
                    'bg-orange-100 text-orange-800'
                  }`}>
                    {reportData.projectInfo.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{reportData.projectInfo.completionPercentage}%</p>
                <p className="text-sm text-gray-600">Complete</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Page Status</span>
                  <Eye className="w-4 h-4 text-gray-400" />
                </div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-green-600">Approved:</span>
                    <span className="font-medium">{reportData.projectInfo.approvedPages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-orange-600">Pending:</span>
                    <span className="font-medium">{reportData.projectInfo.pendingPages}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-red-600">Changes Needed:</span>
                    <span className="font-medium">{reportData.projectInfo.rejectedPages}</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Feedback Items</span>
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900">{reportData.summary.totalFeedbackItems}</p>
                <div className="text-xs text-gray-600 mt-1">
                  <span>{reportData.summary.managerFeedbackItems} from management, </span>
                  <span>{reportData.summary.employeeFeedbackItems} from design team</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-blue-900 mb-2">Report Period</h4>
              <div className="flex items-center space-x-4 text-sm text-blue-800">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>From: {new Date(reportData.projectInfo.createdDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>To: {new Date(reportData.projectInfo.lastUpdated).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Feedback Sections */}
          <div className="p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Edit className="w-5 h-5 mr-2 text-red-600" />
              Detailed Feedback by Section
            </h3>

            {reportData.sections.length === 0 ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg">
                <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No Feedback Yet</h4>
                <p className="text-gray-600">Your brochure is currently under review. Feedback will appear here once available.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {reportData.sections.map((section: any) => (
                  <div key={section.pageNumber} className="border border-gray-200 rounded-lg overflow-hidden">
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">
                            Page {section.pageNumber}: {section.pageTitle}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Last updated: {new Date(section.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                        <div className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${getStatusColor(section.approvalStatus)}`}>
                          {getStatusIcon(section.approvalStatus)}
                          <span className="text-sm font-medium">{section.approvalStatus.toUpperCase()}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Manager Comments */}
                      {section.managerComments.length > 0 && (
                        <div className="mb-6">
                          <h5 className="font-semibold text-blue-900 mb-3 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Management Feedback ({section.managerComments.length})
                          </h5>
                          <div className="space-y-3">
                            {section.managerComments.map((comment: any, index: number) => (
                              <div key={comment.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-blue-900">{comment.author_name}</span>
                                    <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">Manager</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {comment.marked_done && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    <span className="text-xs text-blue-600">
                                      {new Date(comment.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-700">{comment.text}</p>
                                {comment.marked_done && (
                                  <div className="mt-2 text-xs text-green-600 font-medium">✓ Resolved</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Employee Comments */}
                      {section.employeeComments.length > 0 && (
                        <div>
                          <h5 className="font-semibold text-green-900 mb-3 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Design Team Feedback ({section.employeeComments.length})
                          </h5>
                          <div className="space-y-3">
                            {section.employeeComments.map((comment: any, index: number) => (
                              <div key={comment.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium text-green-900">{comment.author_name}</span>
                                    <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">Designer</span>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    {comment.marked_done && <CheckCircle className="w-4 h-4 text-green-600" />}
                                    <span className="text-xs text-green-600">
                                      {new Date(comment.timestamp).toLocaleDateString()}
                                    </span>
                                  </div>
                                </div>
                                <p className="text-gray-700">{comment.text}</p>
                                {comment.marked_done && (
                                  <div className="mt-2 text-xs text-green-600 font-medium">✓ Resolved</div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Next Steps */}
          <div className="p-6 bg-gray-50 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-red-600" />
              Next Steps
            </h3>
            
            <div className="bg-white border border-gray-200 rounded-lg p-4">
              {reportData.projectInfo.rejectedPages > 0 ? (
                <div className="flex items-start space-x-3">
                  <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-red-900 mb-1">Action Required</h4>
                    <p className="text-gray-700 mb-2">
                      {reportData.projectInfo.rejectedPages} page(s) require changes based on feedback above.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Review all feedback items marked as requiring changes</li>
                      <li>• Update your brochure content accordingly</li>
                      <li>• Resubmit for approval once changes are complete</li>
                    </ul>
                  </div>
                </div>
              ) : reportData.projectInfo.pendingPages > 0 ? (
                <div className="flex items-start space-x-3">
                  <Clock className="w-5 h-5 text-orange-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-orange-900 mb-1">Under Review</h4>
                    <p className="text-gray-700 mb-2">
                      {reportData.projectInfo.pendingPages} page(s) are currently being reviewed by our team.
                    </p>
                    <p className="text-sm text-gray-600">
                      You will receive notifications once the review is complete.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex items-start space-x-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-green-900 mb-1">Ready to Proceed</h4>
                    <p className="text-gray-700 mb-2">
                      All pages have been approved! Your brochure is ready to move to the design phase.
                    </p>
                    <p className="text-sm text-gray-600">
                      Our design team will begin working on your brochure layout and visual design.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">Need Help?</h4>
                  <p className="text-sm text-blue-800">
                    For questions or clarification on any feedback items, please contact your project manager 
                    or use the comment system within your brochure project.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}