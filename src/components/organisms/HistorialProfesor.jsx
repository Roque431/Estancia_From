// En: src/components/organisms/HistorialProfesor.jsx

import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import Table from '../molecules/Table';
import Badge from '../atoms/Badge';
import CustomButton from '../atoms/CustomButton';
import Icon from '../atoms/Icon';
import Card from '../molecules/Card';
import FormGroup from '../molecules/FormGroup';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const HistorialProfesor = () => {
  const { user } = useAuth();
  const { solicitudes } = useAppData();
  const [loadingPDF, setLoadingPDF] = useState(false);

  // ==================================================================
  // ESTADO PARA FILTROS DEL PDF (SIMILAR AL DIRECTOR)
  // ==================================================================
  const [filtrosPDF, setFiltrosPDF] = useState({
    fechaInicio: '',
    fechaFin: '',
    periodo: '',
  });

  const professorId = user?.professor?.id;
  const historial = solicitudes.filter(s => 
    s.professorId === professorId && ['completed', 'rejected'].includes(s.status)
  );

  const traducirEstado = (status) => {
    switch (status) {
      case 'completed': return 'Completado';
      case 'rejected': return 'Rechazado';
      default: return status;
    }
  };

  // ==================================================================
  // COLUMNAS ACTUALIZADAS CON MATRÍCULA
  // ==================================================================
  const columns = [
    {
      key: 'date',
      label: 'Fecha',
      icon: 'Calendar',
      render: (date) => new Date(date).toLocaleDateString('es-ES', { timeZone: 'UTC' })
    },
    {
      key: 'student',
      label: 'Estudiante',
      icon: 'User',
      render: (student, row) => {
        return row.student?.user?.name || row.studentName || 'N/A';
      }
    },
    {
      key: 'studentMatricula',
      label: 'Matrícula',
      icon: 'CreditCard',
      render: (_, row) => row.student?.studentCode || row.student?.matricula || row.studentMatricula || 'N/A'
    },
    {
      key: 'type',
      label: 'Tipo',
      icon: 'Users',
      render: (type) => (
        <div className="flex items-center gap-2">
          <Icon name={type === 'grupal' ? 'Users' : 'User'} size={16} className="text-gray-500" />
          <span className="capitalize">{type || 'Individual'}</span>
        </div>
      )
    },
    { key: 'topic', label: 'Tema', icon: 'BookOpen' },
    { key: 'subject', label: 'Materia', icon: 'Book' },
    {
      key: 'status',
      label: 'Estado Final',
      icon: 'Flag',
      render: (status) => <Badge variant={status}>{traducirEstado(status)}</Badge>
    },
    {
      key: 'rejectionReason',
      label: 'Observaciones',
      icon: 'MessageSquare',
      render: (_, row) => row.description || row.rejectionReason || row.observations || row.observaciones || '-'
    }
  ];

  // ==================================================================
  // GENERACIÓN DE PDF MEJORADA CON FILTROS Y NUEVA ESTRUCTURA
  // ==================================================================
  const handleGeneratePDF = () => {
    setLoadingPDF(true);
    
    setTimeout(() => {
      // Filtrar datos según fechas si se especificaron
      let datosParaPdf = [...historial];
      
      if (filtrosPDF.fechaInicio) {
        const inicio = new Date(filtrosPDF.fechaInicio + 'T00:00:00');
        datosParaPdf = datosParaPdf.filter(s => new Date(s.date) >= inicio);
      }
      if (filtrosPDF.fechaFin) {
        const fin = new Date(filtrosPDF.fechaFin + 'T23:59:59');
        datosParaPdf = datosParaPdf.filter(s => new Date(s.date) <= fin);
      }

      const doc = new jsPDF();

      // ==================================================================
      // NUEVA ESTRUCTURA DEL PDF (SIMILAR AL DIRECTOR)
      // ==================================================================
      // Encabezado reorganizado
      doc.setFontSize(16);
      doc.text('Universidad Politécnica de Chiapas', 14, 15);
      
      doc.setFontSize(14);
      doc.text('Historial de Asesorías del Profesor', 14, 25);
      
      doc.setFontSize(12);
      doc.text(`Periodo que corresponde: ${filtrosPDF.periodo || '_________________________'}`, 14, 35);

      // Información adicional del reporte
      doc.setFontSize(10);
      doc.text(`Profesor: ${user.name}`, 14, 45);
      doc.text(`Fecha de generación: ${new Date().toLocaleDateString('es-ES')}`, 14, 52);
      if (filtrosPDF.fechaInicio || filtrosPDF.fechaFin) {
        const fInicio = filtrosPDF.fechaInicio ? new Date(filtrosPDF.fechaInicio+'T00:00:00').toLocaleDateString('es-ES') : '...';
        const fFin = filtrosPDF.fechaFin ? new Date(filtrosPDF.fechaFin+'T00:00:00').toLocaleDateString('es-ES') : '...';
        doc.text(`Periodo del reporte: ${fInicio} al ${fFin}`, 14, 59);
      }

      // Tabla con matrícula y observaciones
      const tableColumn = ["Fecha", "Estudiante", "Matrícula", "Tipo", "Materia", "Tema", "Estado", "Observaciones"];
      
      const tableRows = datosParaPdf.map(item => [
        new Date(item.date).toLocaleDateString('es-ES', { timeZone: 'UTC' }),
        item.student?.user?.name || item.studentName || 'N/A',
        item.student?.studentCode || item.student?.matricula || item.studentMatricula || 'N/A',
        item.type ? item.type.charAt(0).toUpperCase() + item.type.slice(1) : 'Individual',
        item.subject,
        item.topic,
        traducirEstado(item.status),
        item.description || item.rejectionReason || item.observations || item.observaciones || '-'
      ]);

      autoTable(doc, {
        head: [tableColumn],
        body: tableRows,
        startY: 65,
        theme: 'grid',
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 8 },
        columnStyles: {
          2: { cellWidth: 25 }, // Matrícula
          7: { cellWidth: 30 }  // Observaciones
        },
        didDrawPage: (data) => {
          // Footer con número de página
          doc.setFontSize(10);
          doc.text('Página ' + doc.internal.getNumberOfPages(), data.settings.margin.left, doc.internal.pageSize.height - 10);
        }
      });

      // ==================================================================
      // FIRMA DEL PROFESOR CENTRADA AL FINAL
      // ==================================================================
      // Firma del Profesor centrada al final
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;
      const signatureY = pageHeight - 40;
      const lineLength = 80;

      // Línea para la firma centrada
      doc.line(pageWidth / 2 - lineLength / 2, signatureY, pageWidth / 2 + lineLength / 2, signatureY);
      
      // Texto centrado
      doc.setFontSize(10);
      doc.text('Firma del Profesor', pageWidth / 2, signatureY + 8, { align: 'center' });

      doc.save(`Historial_Asesorias_${user.name.replace(/\s/g, '_')}.pdf`);
      setLoadingPDF(false);
    }, 500);
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltrosPDF(prev => ({ ...prev, [campo]: valor }));
  };

  if (!professorId) {
    return <div className="text-center py-16">Cargando datos del profesor...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-blue-600 mb-4 sm:mb-0 flex items-center gap-3">
          <Icon name="History" size={28} />
          Historial de Asesorías
        </h2>
      </div>

      {/* ==================================================================
      // NUEVA SECCIÓN DE FILTROS PARA EL PDF
      // ================================================================== */}
      <Card>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Configuración del PDF</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <FormGroup label="Fecha de Inicio (PDF)" icon="Calendar">
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filtrosPDF.fechaInicio} 
              onChange={(e) => handleFiltroChange('fechaInicio', e.target.value)} 
            />
          </FormGroup>
          <FormGroup label="Fecha de Fin (PDF)" icon="Calendar">
            <input 
              type="date" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filtrosPDF.fechaFin} 
              onChange={(e) => handleFiltroChange('fechaFin', e.target.value)} 
            />
          </FormGroup>
          <FormGroup label="Periodo (PDF)" icon="Calendar">
            <input 
              type="text" 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              value={filtrosPDF.periodo} 
              onChange={(e) => handleFiltroChange('periodo', e.target.value)} 
              placeholder="Ej: Enero - Junio 2025" 
            />
          </FormGroup>
        </div>
        <div className="mt-4">
          <CustomButton
            onClick={handleGeneratePDF}
            variant="secondary"
            icon="Download"
            disabled={loadingPDF || historial.length === 0}
            className="w-full sm:w-auto"
          >
            {loadingPDF ? 'Generando PDF...' : 'Descargar Historial PDF'}
          </CustomButton>
        </div>
      </Card>

      <Card variant="info">
        <div className="flex items-center gap-4">
          <Icon name="Info" size={24} className="text-blue-500" />
          <div>
            <h4 className="font-bold text-blue-800">Reporte PDF</h4>
            <p className="text-gray-600">
              El PDF incluirá todas las asesorías de tu historial con matrícula, tipo y observaciones. Puedes filtrar por fechas específicas.
            </p>
          </div>
        </div>
      </Card>

      <Table
        columns={columns}
        data={historial}
        emptyMessage="No tienes asesorías en tu historial."
      />
    </div>
  );
};

export default HistorialProfesor;