import React from 'react';
import { CommentTask } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CheckCircle, Clock, Play, User, Calendar } from 'lucide-react';

interface TaskCardProps {
  task: CommentTask;
  showProject?: boolean;
}

export function TaskCard({ task, showProject = false }: TaskCardProps) {
  const { user } = useAuth();
  const { updateCommentTaskStatus, projects } = useData();

  const getStatusIcon = () => {
    switch (task.status) {
      case 'done': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress': return <Play className="w-5 h-5 text-blue-500" />;
      default: return <Clock className="w-5 h-5 text-orange-500" />;
    }
  };

  const getStatusColor = () => {
    switch (task.status) {
      case 'done': return 'bg-green-50 border-green-200';
      case 'in-progress': return 'bg-blue-50 border-blue-200';
      default: return 'bg-orange-50 border-orange-200';
    }
  };

  const getRoleColor = () => {
    switch (task.author_role) {
      case 'manager': return 'bg-blue-100 text-blue-800';
      case 'employee': return 'bg-green-100 text-green-800';
      case 'client': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canUpdateStatus = user?.role === 'employee' || user?.role === 'manager';
  const project = projects.find(p => p.id === task.project_id);

  const handleStatusChange = (newStatus: 'open' | 'in-progress' | 'done') => {
    if (canUpdateStatus) {
      updateCommentTaskStatus(task.id, newStatus);
    }
  };

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRoleColor()}`}>
            {task.author_role}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {new Date(task.timestamp).toLocaleDateString()}
        </span>
      </div>

      <p className="text-gray-800 mb-3 leading-relaxed">{task.text}</p>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        <div className="flex items-center space-x-1">
          <User className="w-4 h-4" />
          <span>{task.author_name}</span>
        </div>
        {task.deadline && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span>{new Date(task.deadline).toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {showProject && project && (
        <div className="text-sm text-gray-600 mb-3">
          <strong>Project:</strong> {project.title}
        </div>
      )}

      {canUpdateStatus && task.status !== 'done' && (
        <div className="flex space-x-2">
          {task.status === 'open' && (
            <button
              onClick={() => handleStatusChange('in-progress')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Start Task
            </button>
          )}
          {task.status === 'in-progress' && (
            <button
              onClick={() => handleStatusChange('done')}
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Mark Done
            </button>
          )}
        </div>
      )}
    </div>
  );
}