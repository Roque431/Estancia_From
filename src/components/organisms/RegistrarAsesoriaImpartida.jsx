import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAppData } from '../../context/AppDataContext';
import Card from '../molecules/Card';
import FormGroup from '../molecules/FormGroup';
import CustomButton from '../atoms/CustomButton';
import Icon from '../atoms/Icon';

const RegistrarAsesoriaImpartida = () => {
  const { user, getAuthHeaders, API_BASE_URL } = useAuth();
  const { profesores } = useAppData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    fecha: '',
    horaInicio: '',
    horaFin: '',
    materia: '',
    tema: '',
    tipoAsesoria: 'individual',
    descripcion: '',
    estudianteNombre: '',
    estudianteEmail: ''
  });

  // Opciones para tipo de asesoría
  const tiposAsesoria = [
    { value: 'individual', label: 'Individual' },
    { value: 'grupal', label: 'Grupal' }
  ];

  // Horas disponibles (07:00 - 18:00)
  const horas = Array.from({ length: 12 }, (_, i) => {
    const hora = i + 7;
    return {
      value: `${hora.toString().padStart(2, '0')}:00`,
      label: `${hora.toString().padStart(2, '0')}:00`
    };
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (!formData.fecha || !formData.horaInicio || !formData.horaFin || 
        !formData.materia || !formData.tema || !formData.estudianteNombre) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    if (formData.horaInicio >= formData.horaFin) {
      alert('La hora de inicio debe ser anterior a la hora de fin');
      return;
    }

    // Verificar que la fecha no sea futura
    const fechaSeleccionada = new Date(formData.fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    if (fechaSeleccionada > hoy) {
      alert('No se pueden registrar asesorías futuras. Solo asesorías ya impartidas.');
      return;
    }

    setIsSubmitting(true);

    try {
      const asesoriaData = {
        date: formData.fecha,
        timeSlot: `${formData.horaInicio} - ${formData.horaFin}`,
        subject: formData.materia,
        topic: formData.tema,
        type: formData.tipoAsesoria,
        description: formData.descripcion,
        studentName: formData.estudianteNombre,
        studentEmail: formData.estudianteEmail,
        status: 'completed', // Marcar como completada ya que ya fue impartida
        isManualEntry: true // Indicar que es una entrada manual
      };

      const response = await fetch(`${API_BASE_URL}/advisories/manual`, {
        method: 'POST',
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(asesoriaData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar la asesoría');
      }

      const result = await response.json();
      
      alert('Asesoría registrada exitosamente');
      
      // Limpiar formulario
      setFormData({
        fecha: '',
        horaInicio: '',
        horaFin: '',
        materia: '',
        tema: '',
        tipoAsesoria: 'individual',
        descripcion: '',
        estudianteNombre: '',
        estudianteEmail: ''
      });

    } catch (error) {
      console.error('Error registrando asesoría:', error);
      alert(`Error al registrar la asesoría: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-blue-600 mb-8 flex items-center gap-3">
        <Icon name="PlusCircle" size={28} />
        Registrar Asesoría Impartida
      </h2>

      <Card
        header={
          <h5 className="text-xl font-bold flex items-center gap-2">
            <Icon name="BookOpen" size={20} />
            Datos de la Asesoría
          </h5>
        }
      >
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Información básica */}
            <FormGroup
              label="Fecha de la Asesoría"
              icon="Calendar"
              type="date"
              value={formData.fecha}
              onChange={(e) => handleInputChange('fecha', e.target.value)}
              required
              max={new Date().toISOString().split('T')[0]} // No permitir fechas futuras
            />

            <FormGroup
              label="Tipo de Asesoría"
              icon="Users"
              type="select"
              value={formData.tipoAsesoria}
              onChange={(e) => handleInputChange('tipoAsesoria', e.target.value)}
              options={tiposAsesoria}
              required
            />

            <FormGroup
              label="Hora de Inicio"
              icon="Clock"
              type="select"
              value={formData.horaInicio}
              onChange={(e) => handleInputChange('horaInicio', e.target.value)}
              options={horas}
              placeholder="Seleccione hora de inicio"
              required
            />

            <FormGroup
              label="Hora de Fin"
              icon="Clock"
              type="select"
              value={formData.horaFin}
              onChange={(e) => handleInputChange('horaFin', e.target.value)}
              options={horas.slice(1)}
              placeholder="Seleccione hora de fin"
              required
            />

            <FormGroup
              label="Materia"
              icon="Book"
              type="text"
              value={formData.materia}
              onChange={(e) => handleInputChange('materia', e.target.value)}
              placeholder="Ej: Matemáticas, Física, Química..."
              required
            />

            <FormGroup
              label="Tema de la Asesoría"
              icon="FileText"
              type="text"
              value={formData.tema}
              onChange={(e) => handleInputChange('tema', e.target.value)}
              placeholder="Ej: Ecuaciones diferenciales, Cinemática..."
              required
            />

            <FormGroup
              label="Nombre del Estudiante"
              icon="User"
              type="text"
              value={formData.estudianteNombre}
              onChange={(e) => handleInputChange('estudianteNombre', e.target.value)}
              placeholder="Nombre completo del estudiante"
              required
            />

            <FormGroup
              label="Email del Estudiante (Opcional)"
              icon="Mail"
              type="email"
              value={formData.estudianteEmail}
              onChange={(e) => handleInputChange('estudianteEmail', e.target.value)}
              placeholder="email@ejemplo.com"
            />
          </div>

          <FormGroup
            label="Descripción de la Asesoría"
            icon="MessageSquare"
            type="textarea"
            value={formData.descripcion}
            onChange={(e) => handleInputChange('descripcion', e.target.value)}
            placeholder="Describa brevemente los temas tratados, metodología utilizada, resultados obtenidos..."
            rows={4}
          />

          <div className="mt-8 text-sm text-gray-600 bg-yellow-50 p-4 rounded-lg mb-6">
            <Icon name="AlertTriangle" size={16} className="inline mr-2" />
            <strong>Importante:</strong>
            <ul className="mt-2 ml-4 list-disc">
              <li>Solo registre asesorías que ya hayan sido impartidas</li>
              <li>No se pueden registrar asesorías futuras</li>
              <li>Asegúrese de que toda la información sea correcta antes de enviar</li>
              <li>Esta asesoría se marcará automáticamente como completada</li>
            </ul>
          </div>

          <div className="flex justify-end gap-4">
            <CustomButton
              type="button"
              variant="secondary"
              icon="X"
              onClick={() => {
                if (window.confirm('¿Está seguro de que desea cancelar? Se perderán todos los datos ingresados.')) {
                  setFormData({
                    fecha: '',
                    horaInicio: '',
                    horaFin: '',
                    materia: '',
                    tema: '',
                    tipoAsesoria: 'individual',
                    descripcion: '',
                    estudianteNombre: '',
                    estudianteEmail: ''
                  });
                }
              }}
            >
              Cancelar
            </CustomButton>

            <CustomButton
              type="submit"
              variant="success"
              icon="Save"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Asesoría'}
            </CustomButton>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default RegistrarAsesoriaImpartida;

