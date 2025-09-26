import React, { useState } from 'react';
import { useData } from '../../context/DataContext';
import { useAuth } from '../../context/AuthContext';
import { MessageSquare, Send, User, Filter } from 'lucide-react';
import { TaskCard } from '../Tasks/TaskCard';

export function CommentManager() {
  const { user } = useAuth();
  const { commentTasks, globalComments, addCommentTask, addGlobalComment, projects } = useData();
  const [newComment, setNewComment] = useState('');
  const [selectedProject, setSelectedProject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  const getAccessibleProjects = () => {
    if (user?.role === 'manager') return projects;
    if (user?.role === 'employee') {
      return projects.filter(p => p.assigned_employees.includes(user.id));
    }
    if (user?.role === 'client') {
      return projects.filter(p => p.client_id === user.id);
    }
    return [];
  };

  const accessibleProjects = getAccessibleProjects();

  const getFilteredCommentTasks = () => {
    let filtered = commentTasks.filter(task => {
      const project = projects.find(p => p.id === task.project_id);
      if (!project) return false;
      
      // Role-based filtering
      if (user?.role === 'employee' && !project.assigned_employees.includes(user.id)) {
        return false;
      }
      if (user?.role === 'client' && project.client_id !== user.id) {
        return false;
      }
      
      return true;
    });

    if (selectedProject !== 'all') {
      filtered = filtered.filter(task => task.project_id === selectedProject);
    }

    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || selectedProject === 'all') return;

    // Client comments automatically become tasks
    if (user?.role === 'client') {
      addCommentTask({
        project_id: selectedProject,
        text: newComment.trim(),
        added_by: user.id,
        author_name: user.name,
        author_role: user.role,
        status: 'open'
      });
    } else {
      addGlobalComment({
        project_id: selectedProject,
        text: newComment.trim(),
        added_by: user.id,
        author_name: user.name,
        author_role: user.role
      });
    }

    setNewComment('');
  };

  const filteredTasks = getFilteredCommentTasks();

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Comments & Tasks</h2>
        <p className="text-gray-600">
          {user?.role === 'client' 
            ? 'Your comments automatically create tasks for the team'
            : 'Manage project communication and task assignments'
          }
        </p>
      </div>

      {/* Add Comment Form */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Comment</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="all">Select Project</option>
              {accessibleProjects.map(project => (
                <option key={project.id} value={project.id}>{project.title}</option>
              ))}
            </select>
          </div>
          
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={user?.role === 'client' 
              ? "Describe what you need or any feedback (this will create a task for the team)..."
              : "Add a comment or create a task..."
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
            required
          />
          
          <button
            type="submit"
            disabled={!newComment.trim() || selectedProject === 'all'}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>{user?.role === 'client' ? 'Create Task' : 'Add Comment'}</span>
          </button>
        </form>
      </div>

      {/* Filters */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Projects</option>
          {accessibleProjects.map(project => (
            <option key={project.id} value={project.id}>{project.title}</option>
          ))}
        </select>

        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Status</option>
          <option value="open">Open</option>
          <option value="in-progress">In Progress</option>
          <option value="done">Done</option>
        </select>
      </div>

      {/* Comments/Tasks List */}
      <div className="space-y-4">
        {filteredTasks.map(task => (
          <TaskCard key={task.id} task={task} showProject={selectedProject === 'all'} />
        ))}
      </div>

      {filteredTasks.length === 0 && (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-12 h-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No comments found</h3>
          <p className="text-gray-600">Start the conversation by adding a comment above</p>
        </div>
      )}
    </div>
  );
}