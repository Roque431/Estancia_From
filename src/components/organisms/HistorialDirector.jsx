// En: src/components/organisms/HistorialDirector.jsx

import React, { useState, useMemo } from 'react';
import { useAppData } from '../../context/AppDataContext';
import Card from '../molecules/Card';
import Table from '../molecules/Table';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';
import FormGroup from '../molecules/FormGroup';

const HistorialDirector = () => {
  const { solicitudes } = useAppData();

  const [filtros, setFiltros] = useState({
    terminoBusqueda: '',
    estado: 'todos',
  });

  // ==================================================================
  // 1. FUNCIÓN DE TRADUCCIÓN AÑADIDA
  // ==================================================================
  const traducirEstado = (status) => {
    const traducciones = {
      completed: 'Completado',
      accepted: 'Aceptado',
      rejected: 'Rechazado',
      rescheduled: 'Reprogramado',
      pending: 'Pendiente',
    };
    return traducciones[status] || status;
  };

  const datosFiltrados = useMemo(() => {
    let datos = solicitudes;

    if (filtros.estado !== 'todos') {
      datos = datos.filter(s => s.status === filtros.estado);
    }

    if (filtros.terminoBusqueda) {
      const busquedaLower = filtros.terminoBusqueda.toLowerCase();
      datos = datos.filter(s => 
        s.professor?.user?.name.toLowerCase().includes(busquedaLower) ||
        (s.student?.user?.name || s.studentName || '').toLowerCase().includes(busquedaLower) ||
        (s.studentMatricula || '').toLowerCase().includes(busquedaLower)
      );
    }
    return datos;
  }, [solicitudes, filtros]);

  const statsGenerales = useMemo(() => ({
    total: solicitudes.length,
    completed: solicitudes.filter(a => a.status === 'completed').length,
    accepted: solicitudes.filter(a => a.status === 'accepted').length,
    profesores: [...new Set(solicitudes.map(a => a.professorId))].length
  }), [solicitudes]);

  const columns = [
    { key: 'date', label: 'Fecha', render: (date) => new Date(date).toLocaleDateString('es-ES', { timeZone: 'UTC' }) },
    { key: 'professor', label: 'Profesor', render: (p) => p?.user?.name || 'N/A' },
    { 
      key: 'student', 
      label: 'Estudiante', 
      render: (s, row) => s?.user?.name || row.studentName || 'N/A' 
    },
    // ==================================================================
    // 2. NUEVA COLUMNA DE MATRÍCULA
    // ==================================================================
    { 
      key: 'studentMatricula', 
      label: 'Matrícula', 
      render: (matricula, row) => {
        // Múltiples formas de obtener la matrícula
        const studentMatricula = matricula || 
                                row.student?.studentCode || 
                                row.student?.matricula || 
                                row.student?.user?.matricula || 
                                'N/A';
        return <span className="font-mono text-sm">{studentMatricula}</span>;
      }
    },
    { key: 'subject', label: 'Materia' },
    {
      key: 'status',
      label: 'Estado',
      // ==================================================================
      // 3. CAMBIO APLICADO EN LA COLUMNA PARA USAR LA TRADUCCIÓN
      // ==================================================================
      render: (status) => {
        const textoTraducido = traducirEstado(status);
        return <Badge variant={status}>{textoTraducido}</Badge>;
      }
    },
    { key: 'type', label: 'Tipo', render: (type) => type ? (type.charAt(0).toUpperCase() + type.slice(1)) : 'Individual' },
    // ==================================================================
    // 4. NUEVA COLUMNA DE OBSERVACIONES
    // ==================================================================
    { 
      key: 'observations', 
      label: 'Observaciones', 
      render: (observations, row) => {
        const obs = observations || 
                   row.observaciones || 
                   row.description || 
                   row.rejectionReason || 
                   '';
        
        if (!obs || obs.trim() === '') {
          return <span className="text-gray-400 italic">Sin observaciones</span>;
        }
        
        // Si las observaciones son muy largas, las truncamos
        const maxLength = 50;
        const truncated = obs.length > maxLength ? obs.substring(0, maxLength) + '...' : obs;
        
        return (
          <span 
            className="text-sm cursor-help" 
            title={obs} // Tooltip con el texto completo
          >
            {truncated}
          </span>
        );
      }
    },
  ];

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({ ...prev, [campo]: valor }));
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <CardStat icon="BookOpen" label="Total Asesorías" value={statsGenerales.total} color="blue" />
        <CardStat icon="CheckCircle" label="Completadas" value={statsGenerales.completed} color="green" />
        <CardStat icon="Clock" label="Aceptadas" value={statsGenerales.accepted} color="yellow" />
        <CardStat icon="Users" label="Total Profesores" value={statsGenerales.profesores} color="purple" />
      </div>

      <Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup
            label="Buscar por Profesor, Estudiante o Matrícula"
            icon="Search"
            type="text"
            placeholder="Escriba un nombre o matrícula..."
            value={filtros.terminoBusqueda}
            onChange={(e) => handleFiltroChange('terminoBusqueda', e.target.value)}
          />
          <FormGroup
            label="Filtrar por Estado"
            icon="Flag"
            type="select"
            value={filtros.estado}
            onChange={(e) => handleFiltroChange('estado', e.target.value)}
            options={[
              { value: 'todos', label: 'Todos los Estados' },
              { value: 'completed', label: 'Completadas' },
              { value: 'accepted', label: 'Aceptadas' },
              { value: 'pending', label: 'Pendientes' },
              { value: 'rescheduled', label: 'Reprogramadas' },
              { value: 'rejected', label: 'Rechazadas' },
            ]}
          />
        </div>
      </Card>

      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resultados del Historial ({datosFiltrados.length} encontrados)
        </h3>
        <Table
          columns={columns}
          data={datosFiltrados}
          emptyMessage="No se encontraron asesorías con los filtros seleccionados."
        />
      </Card>
    </div>
  );
};

const CardStat = ({ icon, label, value, color }) => {
  const colors = {
    blue: 'text-blue-600 bg-blue-100',
    green: 'text-green-600 bg-green-100',
    yellow: 'text-yellow-600 bg-yellow-100',
    purple: 'text-purple-600 bg-purple-100',
  };
  return (
    <Card>
      <div className="flex items-center">
        <div className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon name={icon} className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-600">{label}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
    </Card>
  );
};

export default HistorialDirector;