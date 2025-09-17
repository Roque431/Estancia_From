import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import Card from '../molecules/Card';
import FormGroup from '../molecules/FormGroup';
import CustomButton from '../atoms/CustomButton';
import Icon from '../atoms/Icon';

const ReportesEncargadoCriterio = () => {
  const { getAuthHeaders, API_BASE_URL } = useAuth();
  const { profesores } = useAppData();
  const [selectedProfesor, setSelectedProfesor] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  // Opciones para el selector de profesores
  const profesorOptions = [
    { value: '', label: 'Todos los profesores' },
    ...profesores.map(prof => ({
      value: prof.id,
      label: prof.name
    }))
  ];

  const handleGenerarReporte = async () => {
    if (!fechaInicio || !fechaFin) {
      alert('Por favor seleccione las fechas de inicio y fin');
      return;
    }

    if (new Date(fechaInicio) > new Date(fechaFin)) {
      alert('La fecha de inicio debe ser anterior a la fecha de fin');
      return;
    }

    setIsGenerating(true);

    try {
      const params = new URLSearchParams({
        startDate: fechaInicio,
        endDate: fechaFin,
        ...(selectedProfesor && { professorId: selectedProfesor })
      });

      const response = await fetch(`${API_BASE_URL}/reports/advisories?${params}`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al generar reporte: ${response.status}`);
      }

      // Descargar el PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      const profesorName = selectedProfesor 
        ? profesores.find(p => p.id === parseInt(selectedProfesor))?.name || 'profesor'
        : 'todos-profesores';
      
      a.download = `reporte-asesorias-${profesorName}-${fechaInicio}-${fechaFin}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Reporte generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando reporte:', error);
      alert('Error al generar el reporte. Por favor intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerarReporteCompleto = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch(`${API_BASE_URL}/reports/advisories/complete`, {
        method: 'GET',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Error al generar reporte completo: ${response.status}`);
      }

      // Descargar el PDF
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `reporte-completo-asesorias-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      alert('Reporte completo generado y descargado exitosamente');
    } catch (error) {
      console.error('Error generando reporte completo:', error);
      alert('Error al generar el reporte completo. Por favor intente nuevamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-8 flex items-center gap-3">
        <Icon name="FileText" size={28} />
        Reportes PDF de Asesorías
      </h2>

      {/* Reporte por Fechas y Profesor */}
      <Card
        className="mb-8"
        header={
          <h5 className="text-xl font-bold flex items-center gap-2">
            <Icon name="Calendar" size={20} />
            Generar Reporte Personalizado
          </h5>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <FormGroup
            label="Profesor"
            icon="User"
            type="select"
            value={selectedProfesor}
            onChange={(e) => setSelectedProfesor(e.target.value)}
            options={profesorOptions}
            placeholder="Seleccione un profesor"
          />

          <FormGroup
            label="Fecha de Inicio"
            icon="Calendar"
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            required
          />

          <FormGroup
            label="Fecha de Fin"
            icon="Calendar"
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            required
          />

          <div className="flex items-end">
            <CustomButton
              onClick={handleGenerarReporte}
              variant="primary"
              icon="Download"
              className="w-full"
              disabled={isGenerating}
            >
              {isGenerating ? 'Generando...' : 'Generar PDF'}
            </CustomButton>
          </div>
        </div>

        <div className="text-sm text-gray-600 bg-blue-50 p-4 rounded-lg">
          <Icon name="Info" size={16} className="inline mr-2" />
          <strong>Instrucciones:</strong>
          <ul className="mt-2 ml-4 list-disc">
            <li>Seleccione un profesor específico o deje en blanco para incluir todos los profesores</li>
            <li>Seleccione el rango de fechas para el reporte</li>
            <li>El reporte incluirá todas las asesorías en el período seleccionado</li>
          </ul>
        </div>
      </Card>

      {/* Reporte Completo */}
      <Card
        header={
          <h5 className="text-xl font-bold flex items-center gap-2">
            <Icon name="FileBarChart" size={20} />
            Reporte Completo del Sistema
          </h5>
        }
      >
        <div className="text-center py-8">
          <Icon name="FileBarChart" size={48} className="mx-auto mb-4 text-blue-500" />
          <h3 className="text-lg font-semibold mb-2">Reporte Completo de Asesorías</h3>
          <p className="text-gray-600 mb-6">
            Genere un reporte completo con todas las asesorías registradas en el sistema,
            incluyendo estadísticas generales y detalles por profesor.
          </p>
          
          <CustomButton
            onClick={handleGenerarReporteCompleto}
            variant="success"
            icon="Download"
            size="lg"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generando Reporte...' : 'Descargar Reporte Completo'}
          </CustomButton>
        </div>

        <div className="mt-6 text-sm text-gray-600 bg-green-50 p-4 rounded-lg">
          <Icon name="CheckCircle" size={16} className="inline mr-2" />
          <strong>El reporte completo incluye:</strong>
          <ul className="mt-2 ml-4 list-disc">
            <li>Resumen estadístico general del sistema</li>
            <li>Detalles de todas las asesorías por profesor</li>
            <li>Análisis de tendencias y patrones</li>
            <li>Información de horarios y disponibilidad</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default ReportesEncargadoCriterio;

