import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LogOut, User } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  
  const getThemeColors = () => {
    switch (user?.role) {
      case 'manager': return 'bg-blue-600 text-white';
      case 'employee': return 'bg-green-600 text-white';
      case 'client': return 'bg-red-600 text-white';
      default: return 'bg-gray-600 text-white';
    }
  };

  const getRoleDisplay = () => {
    switch (user?.role) {
      case 'manager': return 'Manager Dashboard';
      case 'employee': return 'Employee Dashboard';
      case 'client': return 'Client Portal';
      default: return 'Dashboard';
    }
  };

  return (
    <header className={`${getThemeColors()} shadow-lg`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold">XeeTrack</h1>
            <span className="ml-4 text-sm opacity-90">
              {getRoleDisplay()} - Professional Project Management
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span className="text-sm">{user?.name}</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-white bg-opacity-20 hover:bg-opacity-30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="text-sm">Logout</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}