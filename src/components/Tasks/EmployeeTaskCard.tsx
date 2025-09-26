import React from 'react';
import { Task } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { CheckCircle, Clock, Play, User, Calendar, AlertTriangle } from 'lucide-react';

interface EmployeeTaskCardProps {
  task: Task;
  showProject?: boolean;
}

export function EmployeeTaskCard({ task, showProject = false }: EmployeeTaskCardProps) {
  const { user } = useAuth();
  const { updateTaskStatus, projects } = useData();

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

  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'low': return 'bg-gray-100 text-gray-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const canUpdateStatus = user?.id === task.assigned_to;
  const project = projects.find(p => p.id === task.project_id);

  const handleStatusChange = async (newStatus: 'open' | 'in-progress' | 'done') => {
    if (canUpdateStatus) {
      try {
        await updateTaskStatus(task.id, newStatus);
      } catch (error) {
        console.error('Error updating task status:', error);
        alert('Error updating task status. Please try again.');
      }
    }
  };

  const isOverdue = task.deadline && new Date(task.deadline) < new Date() && task.status !== 'done';

  return (
    <div className={`rounded-lg border p-4 ${getStatusColor()} transition-all hover:shadow-md`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor()}`}>
            {task.priority || 'medium'} priority
          </span>
          {isOverdue && (
            <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 flex items-center">
              <AlertTriangle className="w-3 h-3 mr-1" />
              Overdue
            </span>
          )}
        </div>
        <span className="text-xs text-gray-500">
          {new Date(task.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="mb-3">
        <h4 className="font-semibold text-gray-900 mb-1">{task.title}</h4>
        <p className="text-gray-700 text-sm leading-relaxed">{task.description}</p>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
        {task.deadline && (
          <div className="flex items-center space-x-1">
            <Calendar className="w-4 h-4" />
            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
              Due: {new Date(task.deadline).toLocaleDateString()}
            </span>
          </div>
        )}
      </div>

      {showProject && project && (
        <div className="text-sm text-gray-600 mb-3">
          <strong>Project:</strong> {project.title}
        </div>
      )}

      {canUpdateStatus && (
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
          {task.status === 'done' && (
            <button
              onClick={() => handleStatusChange('in-progress')}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
            >
              Reopen
            </button>
          )}
        </div>
      )}

      {!canUpdateStatus && (
        <div className="text-xs text-gray-500 mt-2">
          Assigned to: {task.assigned_to === user?.id ? 'You' : 'Another employee'}
        </div>
      )}
    </div>
  );
}