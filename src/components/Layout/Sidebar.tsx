import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { 
  FolderOpen, 
  Users, 
  BarChart3, 
  Calendar,
  CheckSquare,
  Layers,
  Upload,
  MessageSquare,
  Eye,
  ListTodo,
  FileText,
  TrendingUp
} from 'lucide-react';

interface SidebarProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Sidebar({ activeView, onViewChange }: SidebarProps) {
  const { user } = useAuth();

  const getManagerMenuItems = () => [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
    { id: 'employees', label: 'Employees', icon: Users },
    { id: 'leads', label: 'Leads', icon: TrendingUp }
  ];

  const getEmployeeMenuItems = () => [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'mytasks', label: 'My Tasks', icon: ListTodo },
    { id: 'projects', label: 'Projects', icon: FolderOpen },
  ];

  const getClientMenuItems = () => [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'project-overview', label: 'Project Overview', icon: Eye }
  ];

  const getMenuItems = () => {
    switch (user?.role) {
      case 'manager': return getManagerMenuItems();
      case 'employee': return getEmployeeMenuItems();
      case 'client': return getClientMenuItems();
      default: return [];
    }
  };

  const getThemeColors = () => {
    switch (user?.role) {
      case 'manager': return 'bg-blue-50 border-blue-200';
      case 'employee': return 'bg-green-50 border-green-200';
      case 'client': return 'bg-red-50 border-red-200';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  const getActiveColors = () => {
    switch (user?.role) {
      case 'manager': return 'bg-blue-600 text-white';
      case 'employee': return 'bg-green-600 text-white';
      case 'client': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  return (
    <aside className={`w-64 ${getThemeColors()} border-r min-h-screen`}>
      <div className="p-6">
        <nav className="space-y-2">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            const isActive = activeView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive 
                    ? getActiveColors()
                    : 'text-gray-700 hover:bg-white hover:bg-opacity-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {user?.role === 'client' && (
          <div className="mt-8 p-4 bg-white rounded-lg border border-red-200">
            <h3 className="font-semibold text-gray-900 mb-2">Quick Guide</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>• View project progress</p>
              <p>• Approve/reject stages</p>
              <p>• Upload reference files</p>
              <p>• Add feedback comments</p>
              <p>• Track team responses</p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}