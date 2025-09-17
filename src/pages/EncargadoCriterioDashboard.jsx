import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/organisms/Header';
import TabNavigation from '../components/molecules/TabNavigation';
import ReportesEncargadoCriterio from '../components/organisms/ReportesEncargadoCriterio';

const EncargadoCriterioDashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('reportes');

  const tabs = [
    { id: 'reportes', label: 'Reportes PDF', icon: 'FileText' }
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'reportes':
        return <ReportesEncargadoCriterio />;
      default:
        return <ReportesEncargadoCriterio />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        title="Panel del Encargado de Criterio" 
        subtitle={`Bienvenido, ${user?.email || 'Encargado de Criterio'}`}
        userType="encargado_criterio"
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

export default EncargadoCriterioDashboard;

