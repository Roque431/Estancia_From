import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useAppData } from '../context/AppDataContext';
import Header from '../components/organisms/Header';
import TabNavigation from '../components/molecules/TabNavigation';
import SolicitudesRecibidas from '../components/organisms/SolicitudesRecibidas';
import AsesoriasProgramadas from '../components/organisms/AsesoriasProgramadas';
import GestionHorarios from '../components/organisms/GestionHorarios';
import HistorialProfesor from '../components/organisms/HistorialProfesor';
import ReportesProfesor from '../components/organisms/ReportesProfesor';
import RegistrarAsesoriaImpartida from '../components/organisms/RegistrarAsesoriaImpartida';

const ProfesorDashboard = () => {
  const [activeTab, setActiveTab] = useState('solicitudes-recibidas');
  const { user } = useAuth();
  const { solicitudes } = useAppData();

  // Calcular notificaciones
  const solicitudesPendientes = solicitudes.filter(s => 
    s.profesor === user?.nombre && s.status === 'pendiente'
  ).length;

  const tabs = [
    {
      id: 'solicitudes-recibidas',
      label: 'Solicitudes Recibidas',
      icon: 'Inbox',
      badge: solicitudesPendientes > 0 ? solicitudesPendientes : null
    },
    {
      id: 'asesorias-programadas',
      label: 'Asesorías Programadas',
      icon: 'CalendarCheck'
    },
    {
      id: 'gestion-horarios',
      label: 'Gestión de Horarios',
      icon: 'Clock'
    },
    {
      id: 'registrar-asesoria',
      label: 'Registrar Asesoría',
      icon: 'PlusCircle'
    },
    {
      id: 'historial',
      label: 'Historial',
      icon: 'History'
    },
    {
      id: 'reportes',
      label: 'Reportes',
      icon: 'BarChart3'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'solicitudes-recibidas':
        return <SolicitudesRecibidas />;
      case 'asesorias-programadas':
        return <AsesoriasProgramadas />;
      case 'gestion-horarios':
        return <GestionHorarios />;
      case 'registrar-asesoria':
        return <RegistrarAsesoriaImpartida />;
      case 'historial':
        return <HistorialProfesor />;
      case 'reportes':
        return <ReportesProfesor />;
      default:
        return <SolicitudesRecibidas />;
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

export default ProfesorDashboard;

