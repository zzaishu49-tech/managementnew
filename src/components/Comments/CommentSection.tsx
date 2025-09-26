import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, CheckCircle, User } from 'lucide-react';

interface CommentSectionProps {
  stageId: string;
}

export function CommentSection({ stageId }: CommentSectionProps) {
  const { user } = useAuth();
  const { commentTasks, addCommentTask, stages, updateCommentTaskStatus } = useData();
  const [newComment, setNewComment] = useState('');

  const stageComments = commentTasks.filter(comment => comment.stage_id === stageId)
                              .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    // Find the project ID for this stage
    const stage = stages.find(s => s.id === stageId);
    if (stage) {
      addCommentTask({
        stage_id: stageId,
        project_id: stage.project_id,
        text: newComment.trim(),
        added_by: user?.id || '',
        author_name: user?.name || 'Unknown',
        author_role: user?.role || 'employee',
        status: 'open'
      });
    }
    setNewComment('');
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'manager': return 'text-blue-600 bg-blue-100';
      case 'employee': return 'text-green-600 bg-green-100';
      case 'client': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h4 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5" />
          <span>Comments & Feedback</span>
        </h4>
        <span className="text-sm text-gray-500">{stageComments.length} comments</span>
      </div>

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="mb-6">
        <div className="flex space-x-3">
          <div className="flex-1">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment or feedback..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            />
          </div>
          <button
            type="submit"
            disabled={!newComment.trim()}
            className="self-end bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {stageComments.map(comment => (
          <div key={comment.id} className={`border rounded-lg p-4 ${
            comment.marked_done ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <User className="w-4 h-4 text-gray-400" />
                <span className="font-medium text-gray-900">{comment.author_name}</span>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(comment.author_role)}`}>
                  {comment.author_role}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                {comment.marked_done && (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                )}
                <span className="text-xs text-gray-500">
                  {new Date(comment.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
            
            <p className="text-gray-700 mb-3">{comment.text}</p>
            
            {user?.role === 'employee' && comment.status !== 'done' && comment.author_role !== 'employee' && (
              <button
                onClick={() => updateCommentTaskStatus(comment.id, 'done')}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors flex items-center space-x-1"
              >
                <CheckCircle className="w-3 h-3" />
                <span>Mark Done</span>
              </button>
            )}
          </div>
        ))}
        
        {stageComments.length === 0 && (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-600">No comments yet</p>
            <p className="text-sm text-gray-500">Start the conversation by adding a comment</p>
          </div>
        )}
      </div>
    </div>
  );
}