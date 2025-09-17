import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Header from '../components/organisms/Header';
import TabNavigation from '../components/molecules/TabNavigation';
import SolicitarAsesoria from '../components/organisms/SolicitarAsesoria';
import MisSolicitudes from '../components/organisms/MisSolicitudes';
import HistorialEstudiante from '../components/organisms/HistorialEstudiante';

const EstudianteDashboard = () => {
  const [activeTab, setActiveTab] = useState('solicitar');
  const { user } = useAuth();
  const { solicitudes } = useAppData();

  // Calcular notificaciones
  const solicitudesConRespuesta = solicitudes.filter(s => 
    s.estudianteId === user?.id && 
    (s.status === 'aceptada' || s.status === 'rechazada' || s.status === 'reprogramada')
  ).length;

  const tabs = [
    {
      id: 'solicitar',
      label: 'Solicitar Asesoría',
      icon: 'PlusCircle'
    },
    {
      id: 'mis-solicitudes',
      label: 'Mis Solicitudes',
      icon: 'List',
      badge: solicitudesConRespuesta > 0 ? solicitudesConRespuesta : null
    },
    {
      id: 'historial',
      label: 'Historial de Asesorías',
      icon: 'History'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'solicitar':
        return <SolicitarAsesoria />;
      case 'mis-solicitudes':
        return <MisSolicitudes />;
      case 'historial':
        return <HistorialEstudiante />;
      default:
        return <SolicitarAsesoria />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      <Header />
      
      <main className="max-w-7xl mx-auto p-10">
        <TabNavigation
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-0"
        />
        
        <div className="bg-white rounded-b-2xl shadow-2xl p-10 min-h-[650px]">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default EstudianteDashboard;

