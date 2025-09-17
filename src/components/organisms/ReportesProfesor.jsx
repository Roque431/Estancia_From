// En: src/components/organisms/ReportesProfesor.jsx

import React, { useState, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import FormGroup from '../molecules/FormGroup';
import CustomButton from '../atoms/CustomButton';
import Icon from '../atoms/Icon';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';

// Registro de componentes de Chart.js (sin cambios)
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ReportesProfesor = () => {
  const { user } = useAuth();
  const { solicitudes } = useAppData(); // Datos reales del contexto
  
  // Estado para los filtros. Ahora con fechas de inicio y fin.
  const [filtros, setFiltros] = useState({
    fechaInicio: '',
    fechaFin: ''
  });

  // ==================================================================
  // 1. LÓGICA DE FILTRADO CON DATOS REALES
  // ==================================================================
  // `useMemo` recalcula los datos solo cuando las solicitudes o los filtros cambian.
  // Esto hace que la página sea mucho más rápida y eficiente.
  const datosFiltrados = useMemo(() => {
    const { fechaInicio, fechaFin } = filtros;
    
    // Si no hay fechas de filtro, usamos todas las asesorías completadas del profesor.
    if (!fechaInicio || !fechaFin) {
      return solicitudes.filter(s => 
        s.professorId === user?.professor?.id && s.status === 'completed'
      );
    }

    const inicio = new Date(fechaInicio + 'T00:00:00');
    const fin = new Date(fechaFin + 'T23:59:59');

    return solicitudes.filter(s => {
      const fechaAsesoria = new Date(s.date);
      return (
        s.professorId === user?.professor?.id &&
        s.status === 'completed' &&
        fechaAsesoria >= inicio &&
        fechaAsesoria <= fin
      );
    });
  }, [solicitudes, filtros, user?.professor?.id]);


  // ==================================================================
  // 2. CÁLCULO DE ESTADÍSTICAS BASADO EN DATOS FILTRADOS
  // ==================================================================
  const totalAsesorias = datosFiltrados.length;
  const estudiantesUnicos = [...new Set(datosFiltrados.map(a => a.studentId || a.studentName))].length;
  const materiasUnicas = [...new Set(datosFiltrados.map(a => a.subject))].length;
  const tasaAceptacion = (() => {
    const solicitudesTotalesPeriodo = solicitudes.filter(s => {
        if (s.professorId !== user?.professor?.id) return false;
        if (!filtros.fechaInicio || !filtros.fechaFin) return true;
        const fechaCreacion = new Date(s.createdAt);
        const inicio = new Date(filtros.fechaInicio + 'T00:00:00');
        const fin = new Date(filtros.fechaFin + 'T23:59:59');
        return fechaCreacion >= inicio && fechaCreacion <= fin;
    }).length;
    const aceptadasPeriodo = solicitudes.filter(s => s.professorId === user?.professor?.id && s.status === 'completed').length;
    return solicitudesTotalesPeriodo > 0 ? Math.round((aceptadasPeriodo / solicitudesTotalesPeriodo) * 100) : 0;
  })();


  // ==================================================================
  // 3. PREPARACIÓN DE DATOS PARA LOS GRÁFICOS (TODO CON DATOS REALES)
  // ==================================================================
  const datosMaterias = datosFiltrados.reduce((acc, a) => {
    acc[a.subject] = (acc[a.subject] || 0) + 1;
    return acc;
  }, {});

  const datosTipo = datosFiltrados.reduce((acc, a) => {
    const tipo = a.type.charAt(0).toUpperCase() + a.type.slice(1); // Capitalizamos
    acc[tipo] = (acc[tipo] || 0) + 1;
    return acc;
  }, {});

  const datosMensual = datosFiltrados.reduce((acc, a) => {
    const mes = new Date(a.date).toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    acc[mes] = (acc[mes] || 0) + 1;
    return acc;
  }, {});

  // Opciones y datos para los gráficos (sin cambios en la estructura)
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { position: 'top' } },
  };

  const chartColors = [
    'rgba(102, 126, 234, 0.8)', 'rgba(118, 75, 162, 0.8)',
    'rgba(78, 205, 196, 0.8)', 'rgba(255, 107, 107, 0.8)',
    'rgba(255, 206, 86, 0.8)', 'rgba(153, 102, 255, 0.8)'
  ];

  const materiasChartData = {
    labels: Object.keys(datosMaterias),
    datasets: [{ data: Object.values(datosMaterias), backgroundColor: chartColors }],
  };

  const tipoChartData = {
    labels: Object.keys(datosTipo),
    datasets: [{ data: Object.values(datosTipo), backgroundColor: chartColors }],
  };

  const mensualChartData = {
    labels: Object.keys(datosMensual),
    datasets: [{
      label: 'Número de Asesorías',
      data: Object.values(datosMensual),
      backgroundColor: 'rgba(102, 126, 234, 0.7)',
    }],
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-8 flex items-center gap-3">
        <Icon name="BarChart3" size={28} />
        Reportes Estadísticos
      </h2>

      {/* Filtros */}
      <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup
            label="Fecha de Inicio"
            icon="Calendar"
            type="date"
            value={filtros.fechaInicio}
            onChange={(e) => setFiltros(prev => ({ ...prev, fechaInicio: e.target.value }))}
          />
          <FormGroup
            label="Fecha de Fin"
            icon="Calendar"
            type="date"
            value={filtros.fechaFin}
            onChange={(e) => setFiltros(prev => ({ ...prev, fechaFin: e.target.value }))}
          />
        </div>
        <p className="text-xs text-gray-500 mt-4">
          Seleccione un rango de fechas para generar el reporte. Si no selecciona fechas, se mostrarán los datos de todo el historial.
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Icon name="CheckSquare" size={32} className="mx-auto mb-4 text-blue-500" />
          <div className="text-3xl font-bold text-blue-600 mb-2">{totalAsesorias}</div>
          <div className="text-gray-600 font-medium">Asesorías Completadas</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Icon name="Users" size={32} className="mx-auto mb-4 text-green-500" />
          <div className="text-3xl font-bold text-green-600 mb-2">{estudiantesUnicos}</div>
          <div className="text-gray-600 font-medium">Estudiantes Atendidos</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Icon name="BookOpen" size={32} className="mx-auto mb-4 text-purple-500" />
          <div className="text-3xl font-bold text-purple-600 mb-2">{materiasUnicas}</div>
          <div className="text-gray-600 font-medium">Materias Diferentes</div>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-lg text-center">
          <Icon name="Percent" size={32} className="mx-auto mb-4 text-orange-500" />
          <div className="text-3xl font-bold text-orange-600 mb-2">{tasaAceptacion}%</div>
          <div className="text-gray-600 font-medium">Tasa de Aceptación</div>
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Distribución por Materia</h3>
          <div className="h-80">
            {totalAsesorias > 0 ? <Pie data={materiasChartData} options={chartOptions} /> : <p className="text-center text-gray-500 mt-16">No hay datos para mostrar.</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Asesorías por Mes</h3>
          <div className="h-80">
            {totalAsesorias > 0 ? <Bar data={mensualChartData} options={chartOptions} /> : <p className="text-center text-gray-500 mt-16">No hay datos para mostrar.</p>}
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-blue-600 mb-4">Distribución por Tipo</h3>
          <div className="h-80">
            {totalAsesorias > 0 ? <Pie data={tipoChartData} options={chartOptions} /> : <p className="text-center text-gray-500 mt-16">No hay datos para mostrar.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportesProfesor;
