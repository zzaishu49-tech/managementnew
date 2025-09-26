import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { Project } from '../../types';
import { MessageSquare, Send, User, Clock } from 'lucide-react';

interface ProjectCommentSectionProps {
  project: Project;
}

export function ProjectCommentSection({ project }: ProjectCommentSectionProps) {
  const { user } = useAuth();
  const { globalComments, addGlobalComment } = useData();
  const [newComment, setNewComment] = useState('');

  // Get comments for this project
  const projectComments = globalComments
    .filter(comment => comment.project_id === project.id)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Check if user has access to this project
  const hasAccess = () => {
    if (!user) return false;
    
    // Manager has access to all projects
    if (user.role === 'manager') return true;
    
    // Client has access if they are assigned to the project
    if (user.role === 'client' && project.client_id === user.id) return true;
    
    // Employee has access if they are assigned to the project
    if (user.role === 'employee' && project.assigned_employees.includes(user.id)) return true;
    
    return false;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user || !hasAccess()) return;

    addGlobalComment({
      project_id: project.id,
      text: newComment.trim(),
      added_by: user.id,
      author_name: user.name,
      author_role: user.role
    });

    setNewComment('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getThemeColors = () => {
    switch (user?.role) {
      case 'manager': return {
        primary: 'bg-blue-600 hover:bg-blue-700',
        secondary: 'bg-blue-50 border-blue-200',
        focus: 'focus:ring-blue-500 focus:border-blue-500'
      };
      case 'employee': return {
        primary: 'bg-green-600 hover:bg-green-700',
        secondary: 'bg-green-50 border-green-200',
        focus: 'focus:ring-green-500 focus:border-green-500'
      };
      case 'client': return {
        primary: 'bg-red-600 hover:bg-red-700',
        secondary: 'bg-red-50 border-red-200',
        focus: 'focus:ring-red-500 focus:border-red-500'
      };
      default: return {
        primary: 'bg-gray-600 hover:bg-gray-700',
        secondary: 'bg-gray-50 border-gray-200',
        focus: 'focus:ring-gray-500 focus:border-gray-500'
      };
    }
  };

  if (!hasAccess()) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center">
          <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Access Restricted</h3>
          <p className="text-gray-600">You don't have permission to view comments for this project</p>
        </div>
      </div>
    );
  }

  const theme = getThemeColors();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Project Comments
        </h3>
        <span className="text-sm text-gray-500">{projectComments.length} comments</span>
      </div>

      {/* Add Comment Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Add a comment
            </label>
            <textarea
              id="comment"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Share your thoughts, updates, or questions about this project..."
              rows={4}
              className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${theme.focus} resize-none`}
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!newComment.trim()}
              className={`${theme.primary} disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2`}
            >
              <Send className="w-4 h-4" />
              <span>Post Comment</span>
            </button>
          </div>
        </form>
      </div>

      {/* Comments List */}
      <div className="space-y-4">
        {projectComments.map(comment => (
          <div key={comment.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-gray-600" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">{comment.author_name}</span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(comment.author_role)}`}>
                      {comment.author_role}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(comment.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="ml-13">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.text}</p>
            </div>
          </div>
        ))}
        
        {projectComments.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
            <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No comments yet</h3>
            <p className="text-gray-600">Be the first to share your thoughts about this project</p>
          </div>
        )}
      </div>
    </div>
  );
}