// En: src/components/organisms/AsesoriasProgramadas.jsx

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import Badge from '../atoms/Badge';
import Icon from '../atoms/Icon';
import CustomButton from '../atoms/CustomButton';
import Modal from '../molecules/Modal';
import FormGroup from '../molecules/FormGroup';

const AsesoriasProgramadas = () => {
  const { user } = useAuth();
  const { solicitudes, actualizarSolicitud, generarHorariosDisponibles } = useAppData();

  // ==================================================================
  // 1. AÑADIMOS UN NUEVO ESTADO PARA EL MODAL DE COMPLETAR
  // ==================================================================
  const [modalCompletar, setModalCompletar] = useState({ isOpen: false, solicitudId: null, observaciones: '' });
  
  const [modalReprogramar, setModalReprogramar] = useState({ isOpen: false, solicitud: null });
  const [formReprogramar, setFormReprogramar] = useState({ nuevaFecha: '', nuevoHorario: '', motivo: '' });
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);

  const professorId = user?.professor?.id;
  const asesoriasProgramadas = solicitudes.filter(
    s => s.professorId === professorId && (s.status === 'accepted' || s.status === 'rescheduled')
  );

  // ==================================================================
  // 2. MODIFICAMOS LA FUNCIÓN PARA ABRIR EL NUEVO MODAL
  // ==================================================================
  const handleAbrirModalCompletar = (solicitudId) => {
    setModalCompletar({ isOpen: true, solicitudId, observaciones: '' });
  };

  // ==================================================================
  // 3. CREAMOS LA FUNCIÓN PARA CONFIRMAR Y ENVIAR LAS OBSERVACIONES
  // ==================================================================
  const handleConfirmarCompletada = () => {
    if (!modalCompletar.observaciones) {
      alert("Por favor, añade una observación sobre la asesoría.");
      return;
    }
    
    actualizarSolicitud(modalCompletar.solicitudId, { 
      status: 'completed',
      // ¡Enviamos las observaciones al backend!
      // Usamos el campo 'rejectionReason' que ya existe en el modelo.
      rejectionReason: modalCompletar.observaciones 
    });

    // Cerramos el modal
    setModalCompletar({ isOpen: false, solicitudId: null, observaciones: '' });
  };

  const handleCancelarAsesoria = (solicitudId) => {
    const motivo = prompt("Por favor, introduce el motivo de la cancelación:");
    if (motivo) {
      actualizarSolicitud(solicitudId, {
        status: 'rejected',
        rejectionReason: motivo
      });
    } else if (motivo === "") {
      alert("El motivo de la cancelación no puede estar vacío.");
    }
  };

  // --- El resto de las funciones de reprogramación no cambian ---
  const handleAbrirModalReprogramar = (solicitud) => {
    setModalReprogramar({ isOpen: true, solicitud });
    setFormReprogramar({
      nuevaFecha: solicitud.date.split('T')[0],
      nuevoHorario: '',
      motivo: ''
    });
  };

   const handleConfirmarReprogramacion = async () => {
    const { solicitud } = modalReprogramar;
    const { nuevaFecha, nuevoHorario, motivo } = formReprogramar;

    if (!nuevaFecha || !nuevoHorario) {
      alert('Por favor, completa la nueva fecha y el nuevo horario.');
      return;
    }

    const horarioSeleccionado = horariosDisponibles.find(h => h.id === parseInt(nuevoHorario));
    if (!horarioSeleccionado) {
      alert('Horario no válido.');
      return;
    }
    const timeSlotString = `${horarioSeleccionado.startTime.slice(0, 5)} - ${horarioSeleccionado.endTime.slice(0, 5)}`;
    const fechaUTC = new Date(nuevaFecha + 'T00:00:00');

    actualizarSolicitud(solicitud.id, {
      status: 'rescheduled',
      date: fechaUTC,
      timeSlot: timeSlotString,
      rejectionReason: motivo || 'Reprogramado por el profesor'
    });

    setModalReprogramar({ isOpen: false, solicitud: null });
  };

  useEffect(() => {
    const fetchHorarios = async () => {
      if (modalReprogramar.solicitud && formReprogramar.nuevaFecha) {
        const horarios = await generarHorariosDisponibles(modalReprogramar.solicitud.professorId, formReprogramar.nuevaFecha);
        setHorariosDisponibles(horarios);
        setFormReprogramar(prev => ({ ...prev, nuevoHorario: '' }));
      }
    };
    fetchHorarios();
  }, [modalReprogramar.solicitud, formReprogramar.nuevaFecha, generarHorariosDisponibles]);

  const diasSemanaTraductor = {
    monday: 'Lunes', tuesday: 'Martes', wednesday: 'Miércoles',
    thursday: 'Jueves', friday: 'Viernes', saturday: 'Sábado', sunday: 'Domingo'
  };

  const estadosTraductor = {
    accepted: 'Aceptada',
    rescheduled: 'Reprogramada',
  };

  if (!professorId) return <div>Cargando...</div>;

  if (asesoriasProgramadas.length === 0) {
    return (
      <div className="text-center py-16">
        <Icon name="CalendarX" size={64} className="mx-auto mb-6 text-gray-400" />
        <h2 className="text-2xl font-bold text-gray-700 mb-4">No tienes asesorías programadas</h2>
        <p className="text-gray-500 text-lg">Las solicitudes que aceptes aparecerán aquí.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-lg p-4">
      <table className="min-w-full text-sm text-left text-gray-700">
        {/* ... (thead no cambia) ... */}
        <thead className="bg-blue-500 text-white rounded-t-lg">
          <tr>
            <th scope="col" className="p-4">FECHA</th>
            <th scope="col" className="p-4">HORARIO</th>
            <th scope="col" className="p-4">ESTUDIANTE</th>
            <th scope="col" className="p-4">TEMA</th>
            <th scope="col" className="p-4">ESTADO</th>
            <th scope="col" className="p-4">ACCIONES</th>
          </tr>
        </thead>
        <tbody>
          {asesoriasProgramadas.map((solicitud) => (
            <tr key={solicitud.id} className="border-b hover:bg-gray-50">
              <td className="p-4">{new Date(solicitud.date).toLocaleDateString('es-ES', { timeZone: 'UTC' })}</td>
              <td className="p-4">{solicitud.timeSlot}</td>
              <td className="p-4 font-medium">{solicitud.student?.user?.name || 'No disponible'}</td>
              <td className="p-4">{solicitud.topic}</td>
              <td className="p-4">
                <Badge variant={solicitud.status}>{estadosTraductor[solicitud.status] || solicitud.status}</Badge>
              </td>
              <td className="p-4 flex gap-2">
                {/* ================================================================== */}
                {/* 4. ACTUALIZAMOS EL BOTÓN PARA QUE ABRA EL MODAL */}
                {/* ================================================================== */}
                <CustomButton onClick={() => handleAbrirModalCompletar(solicitud.id)} variant="success" size="sm" icon="CheckCircle" title="Marcar como Completada">Completar</CustomButton>
                <CustomButton onClick={() => handleAbrirModalReprogramar(solicitud)} variant="info" size="sm" icon="Calendar" title="Reprogramar Asesoría">Reprogramar</CustomButton>
                <CustomButton onClick={() => handleCancelarAsesoria(solicitud.id)} variant="danger" size="sm" icon="XCircle" title="Cancelar Asesoría">Cancelar</CustomButton>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* ================================================================== */}
      {/* 5. AÑADIMOS EL NUEVO MODAL AL FINAL DEL COMPONENTE */}
      {/* ================================================================== */}
      <Modal 
        isOpen={modalCompletar.isOpen} 
        onClose={() => setModalCompletar({ isOpen: false, solicitudId: null, observaciones: '' })}
        title={<div className="flex items-center gap-2"><Icon name="CheckCircle" size={20} /> Completar Asesoría</div>}
        footer={
          <div className="flex gap-3 justify-end">
            <CustomButton variant="secondary" onClick={() => setModalCompletar({ isOpen: false, solicitudId: null, observaciones: '' })}>Cancelar</CustomButton>
            <CustomButton variant="success" icon="Check" onClick={handleConfirmarCompletada}>Confirmar y Completar</CustomButton>
          </div>
        }
      >
        <FormGroup 
          label="Observaciones Finales" 
          icon="MessageSquare" 
          type="textarea" 
          value={modalCompletar.observaciones} 
          onChange={(e) => setModalCompletar(prev => ({ ...prev, observaciones: e.target.value }))} 
          placeholder="Añade un resumen de los temas tratados, el progreso del estudiante, etc." 
          rows={4}
          required
        />
        <p className="text-xs text-gray-500 mt-2">Estas observaciones se guardarán como evidencia en el historial de la asesoría.</p>
      </Modal>

      {/* --- Modal de Reprogramar (no cambia) --- */}
      <Modal isOpen={modalReprogramar.isOpen} onClose={() => setModalReprogramar({ isOpen: false, solicitud: null })}
        title={<div className="flex items-center gap-2"><Icon name="Calendar" size={20} /> Reprogramar Asesoría</div>}
        footer={
          <div className="flex gap-3 justify-end">
            <CustomButton variant="secondary" onClick={() => setModalReprogramar({ isOpen: false, solicitud: null })}>Cancelar</CustomButton>
            <CustomButton variant="primary" icon="Check" onClick={handleConfirmarReprogramacion}>Confirmar Reprogramación</CustomButton>
          </div>
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormGroup label="Nueva Fecha" icon="Calendar" type="date" value={formReprogramar.nuevaFecha} onChange={(e) => setFormReprogramar(prev => ({ ...prev, nuevaFecha: e.target.value }))} required />
          <FormGroup label="Nuevo Horario" icon="Clock" type="select" value={formReprogramar.nuevoHorario}
            onChange={(e) => setFormReprogramar(prev => ({ ...prev, nuevoHorario: e.target.value }))}
            options={horariosDisponibles.map(h => ({
              value: h.id,
              label: `${diasSemanaTraductor[h.dayOfWeek] || h.dayOfWeek} ${h.startTime.slice(0, 5)} - ${h.endTime.slice(0, 5)}`
            }))}
            placeholder="Seleccione un horario" required
            disabled={horariosDisponibles.length === 0}
          />
        </div>
        <FormGroup label="Motivo de la reprogramación (Opcional)" icon="MessageSquare" type="textarea" value={formReprogramar.motivo} onChange={(e) => setFormReprogramar(prev => ({ ...prev, motivo: e.target.value }))} placeholder="Explique el motivo de la reprogramación..." rows={3} />
      </Modal>
    </div>
  );
};

export default AsesoriasProgramadas;
