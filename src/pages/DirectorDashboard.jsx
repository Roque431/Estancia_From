import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/organisms/Header';
import TabNavigation from '../components/molecules/TabNavigation';
import HistorialDirector from '../components/organisms/HistorialDirector';
import ReportesDirector from '../components/organisms/ReportesDirector';

const DirectorDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('historial');

  const tabs = [
    { id: 'historial', label: 'Historial General', icon: 'History' },
    { id: 'reportes', label: 'Reportes', icon: 'FileText' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'historial':
        return <HistorialDirector />;
      case 'reportes':
        return <ReportesDirector />;
      default:
        return <HistorialDirector />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Panel del Director" 
        subtitle={`Bienvenido, ${user?.email || 'Director'}`}
        userType="director"
      />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />
        
        <div className="mt-6">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default DirectorDashboard;

