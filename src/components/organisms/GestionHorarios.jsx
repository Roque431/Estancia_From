import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import Card from '../molecules/Card';
import FormGroup from '../molecules/FormGroup';
import CustomButton from '../atoms/CustomButton';
import Icon from '../atoms/Icon';

const GestionHorarios = () => {
  const { user } = useAuth();
  const { horarios, agregarHorario, eliminarHorario, toggleDisponibilidadHorario } = useAppData();

  const [formHorario, setFormHorario] = useState({
    dia: '',
    horaInicio: '',
    horaFin: ''
  });

  // ==================================================================
  // MODIFICACIÓN CLAVE
  // =================================  =================================
  // 1. Obtenemos el ID del perfil de profesor. Es crucial que 'user.professor' exista.
  //    Si no existe, significa que los datos del usuario aún no están completos o no es un profesor.
  const professorId = user?.professor?.id;

  // 2. Buscamos los horarios usando ese ID. Si professorId es undefined, horariosProfesor será un array vacío,
  //    lo cual es el comportamiento correcto hasta que los datos del usuario se carguen.
  const horariosProfesor = professorId ? horarios[professorId] || [] : [];

  // Días traducidos al formato que espera el backend
  const diasSemana = [
    { value: 'monday', label: 'Lunes' },
    { value: 'tuesday', label: 'Martes' },
    { value: 'wednesday', label: 'Miércoles' },
    { value: 'thursday', label: 'Jueves' },
    { value: 'friday', label: 'Viernes' },
    { value: 'saturday', label: 'Sábado' },
    { value: 'sunday', label: 'Domingo' }
  ];

  // Horas disponibles (07:00 - 18:00)
  const horas = Array.from({ length: 12 }, (_, i) => {
    const hora = i + 7;
    return {
      value: `${hora.toString().padStart(2, '0')}:00`,
      label: `${hora.toString().padStart(2, '0')}:00`
    };
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    // 3. Nos aseguramos de que tengamos un professorId antes de intentar agregar un horario.
    if (!professorId) {
        alert("No se pudo identificar al profesor. Por favor, recargue la página.");
        return;
    }

    if (!formHorario.dia || !formHorario.horaInicio || !formHorario.horaFin) {
      alert('Por favor complete todos los campos');
      return;
    }

    if (formHorario.horaInicio >= formHorario.horaFin) {
      alert('La hora de inicio debe ser menor que la hora de fin');
      return;
    }

    const hayConflicto = horariosProfesor.some(h =>
      h.dayOfWeek.toLowerCase() === formHorario.dia.toLowerCase() &&
      (
        (formHorario.horaInicio >= h.startTime && formHorario.horaInicio < h.endTime) ||
        (formHorario.horaFin > h.startTime && formHorario.horaFin <= h.endTime) ||
        (formHorario.horaInicio <= h.startTime && formHorario.horaFin >= h.endTime)
      )
    );

    if (hayConflicto) {
      alert('Este horario se solapa con un horario existente');
      return;
    }

    const nuevoHorario = {
      // Ya no necesitamos pasar professorId aquí si el backend no lo requiere para esta acción específica.
      // Sin embargo, la función agregarHorario lo espera, así que lo mantenemos.
      dayOfWeek: formHorario.dia.toLowerCase(),
      startTime: formHorario.horaInicio,
      endTime: formHorario.horaFin,
      isAvailable: true
    };
    
    agregarHorario(professorId, nuevoHorario);

    setFormHorario({ dia: '', horaInicio: '', horaFin: '' });
    alert('Horario agregado correctamente');
  };

  const handleEliminarHorario = (horarioId) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este horario?')) {
      eliminarHorario(professorId, horarioId);
    }
  };

  const handleToggleDisponibilidad = (horarioId) => {
    toggleDisponibilidadHorario(professorId, horarioId);
  };

  // Si los datos del usuario o el perfil del profesor aún no se han cargado,
  // podríamos mostrar un estado de carga para mejorar la experiencia.
  if (!professorId) {
    return (
        <div className="text-center py-12">
            <p className="text-gray-500 text-lg">Cargando datos del profesor...</p>
        </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-8 flex items-center gap-3">
        <Icon name="Clock" size={28} />
        Gestión de Horarios
      </h2>

      {/* Formulario para agregar horario */}
      <Card
        className="mb-8"
        header={
          <h5 className="text-xl font-bold flex items-center gap-2">
            <Icon name="Plus" size={20} />
            Registrar Nuevo Horario
          </h5>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <FormGroup
              label="Día"
              icon="CalendarDays"
              type="select"
              value={formHorario.dia}
              onChange={(e) => setFormHorario(prev => ({ ...prev, dia: e.target.value }))}
              options={diasSemana}
              placeholder="Seleccione un día"
              required
            />

            <FormGroup
              label="Hora Inicio"
              icon="Play"
              type="select"
              value={formHorario.horaInicio}
              onChange={(e) => setFormHorario(prev => ({ ...prev, horaInicio: e.target.value }))}
              options={horas}
              placeholder="Seleccione hora"
              required
            />

            <FormGroup
              label="Hora Fin"
              icon="Square"
              type="select"
              value={formHorario.horaFin}
              onChange={(e) => setFormHorario(prev => ({ ...prev, horaFin: e.target.value }))}
              options={horas.slice(1)}
              placeholder="Seleccione hora"
              required
            />

            <div className="flex items-end">
              <CustomButton
                type="submit"
                variant="success"
                icon="Plus"
                className="w-full"
              >
                Agregar
              </CustomButton>
            </div>
          </div>
        </form>
      </Card>

      {/* Horarios actuales */}
      <Card
        header={
          <h5 className="text-xl font-bold flex items-center gap-2">
            <Icon name="CalendarDays" size={20} />
            Mis Horarios Disponibles
          </h5>
        }
      >
        {horariosProfesor.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Clock" size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-500 text-lg">No tienes horarios registrados.</p>
            <p className="text-gray-400">Agrega tus horarios disponibles para que los estudiantes puedan solicitar asesorías.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {horariosProfesor.map((horario) => (
              <div
                key={horario.id}
                className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg
                  ${horario.isAvailable 
                    ? 'border-green-300 bg-green-50' 
                    : 'border-red-300 bg-red-50'
                  }
                `}
              >
                <div className="text-center mb-4">
                  <div className="font-bold text-lg text-blue-600 capitalize mb-2 flex items-center justify-center gap-2">
                    <Icon name="CalendarDays" size={18} />
                    {diasSemana.find(d => d.value === horario.dayOfWeek)?.label}
                  </div>
                  <div className="text-xl font-semibold text-gray-800 flex items-center justify-center gap-2">
                    <Icon name="Clock" size={18} />
                    {horario.startTime} - {horario.endTime}
                  </div>
                </div>

                <div className="flex gap-2 justify-center">
                  <CustomButton
                    variant={horario.isAvailable ? 'warning' : 'success'}
                    size="sm"
                    icon={horario.isAvailable ? 'Pause' : 'Play'}
                    onClick={() => handleToggleDisponibilidad(horario.id)}
                  >
                    {horario.isAvailable ? 'Pausar' : 'Activar'}
                  </CustomButton>

                  <CustomButton
                    variant="danger"
                    size="sm"
                    icon="Trash2"
                    onClick={() => handleEliminarHorario(horario.id)}
                  >
                    Eliminar
                  </CustomButton>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default GestionHorarios;
