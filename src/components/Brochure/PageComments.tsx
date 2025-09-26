import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { MessageSquare, Send, CheckCircle, User, Clock } from 'lucide-react';

interface PageCommentsProps {
  pageId: string;
  projectId: string;
  pageNumber: number;
}

export function PageComments({ pageId, projectId, pageNumber }: PageCommentsProps) {
  const { user } = useAuth();
  const { addPageComment, getPageComments, markCommentDone } = useData();
  const [newComment, setNewComment] = useState('');

  const comments = getPageComments(pageId);
  const canAddComments = user?.role === 'manager' || user?.role === 'employee';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !user) return;

    addPageComment({
      page_id: pageId,
      text: newComment.trim(),
      added_by: user.id,
      author_name: user.name,
      author_role: user.role,
      marked_done: false
    });

    setNewComment('');
  };

  const handleMarkDone = (commentId: string) => {
    markCommentDone(commentId);
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPageTitle = (pageNumber: number) => {
    switch (pageNumber) {
      case 1: return 'Project Details';
      case 2: return 'Company Info';
      default: return `Page ${pageNumber - 2}`;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-gray-900 flex items-center">
          <MessageSquare className="w-4 h-4 mr-2 text-red-600" />
          Comments
        </h4>
        <span className="text-xs text-gray-500">{getPageTitle(pageNumber)}</span>
      </div>

      {/* Add Comment Form */}
      {canAddComments && (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="space-y-3">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or feedback for this page..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm resize-none"
            />
            <button
              type="submit"
              disabled={!newComment.trim()}
              className={`w-full px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 text-sm text-white ${
                user?.role === 'manager' 
                  ? 'bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400'
                  : 'bg-green-600 hover:bg-green-700 disabled:bg-gray-400'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Add Comment</span>
            </button>
          </div>
        </form>
      )}

      {/* Comments List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {comments.map(comment => (
          <div 
            key={comment.id} 
            className={`border rounded-lg p-3 text-sm ${
              comment.marked_done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-3 h-3 text-gray-400" />
                <span className="font-medium text-gray-900 text-xs">{comment.author_name}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getRoleColor(comment.author_role)}`}>
                  {comment.author_role}
                </span>
                {comment.action_type && (
                  <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                    comment.action_type === 'lock' ? 'bg-red-100 text-red-800' :
                    comment.action_type === 'unlock' ? 'bg-green-100 text-green-800' :
                    comment.action_type === 'approval' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {comment.action_type}
                  </span>
                )}
              </div>
              {comment.marked_done && (
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
              )}
            </div>
            
            <p className="text-gray-700 mb-2">{comment.text}</p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <Clock className="w-3 h-3" />
                <span>{new Date(comment.timestamp).toLocaleString()}</span>
              </div>
              
              {!comment.marked_done && user?.role !== 'client' && (
                <button
                  onClick={() => handleMarkDone(comment.id)}
                  className="text-green-600 hover:text-green-800 text-xs font-medium transition-colors"
                >
                  Mark Done
                </button>
              )}
            </div>
          </div>
        ))}
        
        {comments.length === 0 && (
          <div className="text-center py-6">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-gray-500 text-sm">No comments yet</p>
            <p className="text-gray-400 text-xs">Add feedback for this page</p>
          </div>
        )}
      </div>
    </div>
  );
}