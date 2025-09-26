import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import { LoginForm } from './components/LoginForm';
import { Header } from './components/Layout/Header';
import { Sidebar } from './components/Layout/Sidebar';
import { ManagerDashboard } from './components/Dashboards/ManagerDashboard';
import { EmployeeDashboard } from './components/Dashboards/EmployeeDashboard';
import { ClientDashboard } from './components/Dashboards/ClientDashboard';

function AppContent() {
  const { isAuthenticated, user } = useAuth();
  const [activeView, setActiveView] = useState('projects');

  // Update active view when user changes
  React.useEffect(() => {
    if (user?.role) {
      switch (user.role) {
        case 'manager':
          setActiveView('dashboard');
          break;
        case 'employee':
          setActiveView('dashboard');
          break;
        case 'client':
          setActiveView('dashboard');
          break;
        default:
          setActiveView('projects');
      }
    }
  }, [user?.role]);

  if (!isAuthenticated) {
    return <LoginForm />;
  }

  const renderContent = () => {
    if (user?.role === 'manager') {
      return <ManagerDashboard activeView={activeView} onViewChange={setActiveView} />;
    } else if (user?.role === 'employee') {
      return <EmployeeDashboard activeView={activeView} onViewChange={setActiveView} />;
    } else if (user?.role === 'client') {
      return <ClientDashboard activeView={activeView} onViewChange={setActiveView} />;
    } else {
      return (
        <div className="p-6">
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Invalid user role</h3>
            <p className="text-gray-600">Please contact your administrator</p>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <DataProvider>
        <AppContent />
      </DataProvider>
    </AuthProvider>
  );
}

export default App;