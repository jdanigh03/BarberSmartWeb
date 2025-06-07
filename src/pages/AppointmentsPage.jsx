import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentsPage = () => {
  // --- Estado para TODAS las citas del sistema (existente) ---
  const [allAppointments, setAllAppointments] = useState([]);
  const [loadingAllAppointments, setLoadingAllAppointments] = useState(true);
  const [errorAllAppointments, setErrorAllAppointments] = useState(null);
  const [messageAllAppointments, setMessageAllAppointments] = useState('');

  // --- Estado para el formulario de NUEVA CITA ---
  const [formData, setFormData] = useState({
    usuario_id: '',
    barberia_id: '',
    barbero_id: '',
    fecha: '',
    hora: '',
    servicio_ids: [],
  });
  const [users, setUsers] = useState([]);
  const [barbers, setBarbers] = useState([]);
  const [barberias, setBarberias] = useState([]);
  const [services, setServices] = useState([]);
  const [loadingFormOptions, setLoadingFormOptions] = useState(true);
  const [errorFormOptions, setErrorFormOptions] = useState(null);
  const [submitMessage, setSubmitMessage] = useState(null);

  // === FUNCIÓN CLAVE: Para cargar TODAS las citas ===
  const fetchAllAppointments = async () => {
    try {
      setLoadingAllAppointments(true);
      setErrorAllAppointments(null);
      setMessageAllAppointments('');
      const response = await axios.get('http://localhost:3001/api/appointments/all');
      
      if (response.data.success) {
        if (response.data.appointments.length === 0) {
          setMessageAllAppointments('No hay citas programadas en el sistema.');
        }
        // Asegurarse de que allAppointments siempre sea un array
        setAllAppointments(Array.isArray(response.data.appointments) ? response.data.appointments : []);
      } else {
        setErrorAllAppointments(response.data.message || 'Error al obtener todas las citas.');
        setAllAppointments([]); // En caso de error, asegurar que es un array vacío
      }
    } catch (err) {
      console.error('Error al cargar todas las citas:', err);
      if (err.response) {
        setErrorAllAppointments(`Error del servidor: ${err.response.status} - ${err.response.data.message || 'Error desconocido'}`);
      } else if (err.request) {
        setErrorAllAppointments('No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando.');
      } else {
        setErrorAllAppointments('Error al enviar la petición para cargar todas las citas.');
      }
      setAllAppointments([]); // En caso de error, asegurar que es un array vacío
    } finally {
      setLoadingAllAppointments(false);
    }
  };

  // === FUNCIÓN: Para cargar opciones del formulario (usuarios, barberos, barberías, servicios) ===
  const fetchFormOptions = async () => {
    try {
      setLoadingFormOptions(true);
      setErrorFormOptions(null);

      const [usersRes, barbersRes, barberiasRes, servicesRes] = await Promise.all([
        axios.get('http://localhost:3001/api/users'), 
        axios.get('http://localhost:3001/api/barberos'), 
        axios.get('http://localhost:3001/api/barberias'), 
        axios.get('http://localhost:3001/api/servicios') 
      ]);

      setUsers(Array.isArray(usersRes.data) ? usersRes.data : []); 
      setBarbers(Array.isArray(barbersRes.data.barberos) ? barbersRes.data.barberos : []); 
      setBarberias(Array.isArray(barberiasRes.data.barberias) ? barberiasRes.data.barberias : []); 
      setServices(Array.isArray(servicesRes.data.servicios) ? servicesRes.data.servicios : []); 

    } catch (err) {
      console.error('Error al cargar opciones del formulario:', err);
      setErrorFormOptions('Error al cargar datos para el formulario. Intenta de nuevo.');
      // Asegurar que los estados sean arrays vacíos en caso de error
      setUsers([]);
      setBarbers([]);
      setBarberias([]);
      setServices([]);
    } finally {
      setLoadingFormOptions(false);
    }
  };

  useEffect(() => {
    fetchAllAppointments();
    fetchFormOptions();
    
    const interval = setInterval(() => {
        fetchAllAppointments();
    }, 60000); // Cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleServiceChange = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions);
    const serviceIds = selectedOptions.map(option => option.value);
    setFormData(prev => ({ ...prev, servicio_ids: serviceIds }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitMessage(null);

    if (!formData.usuario_id || !formData.barberia_id || !formData.barbero_id || !formData.fecha || !formData.hora || formData.servicio_ids.length === 0) {
      setSubmitMessage({ type: 'error', text: 'Por favor, completa todos los campos y selecciona al menos un servicio.' });
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/appointments', formData);
      if (response.data.success) {
        setSubmitMessage({ type: 'success', text: response.data.message || 'Cita creada exitosamente.' });
        setFormData({
          usuario_id: '',
          barberia_id: '',
          barbero_id: '',
          fecha: '',
          hora: '',
          servicio_ids: [],
        });
        fetchAllAppointments(); 
      } else {
        setSubmitMessage({ type: 'error', text: response.data.message || 'Error al crear la cita.' });
      }
    } catch (err) {
      console.error('Error al crear cita:', err);
      if (err.response) {
        setSubmitMessage({ type: 'error', text: `Error del servidor: ${err.response.status} - ${err.response.data.message || 'Error desconocido'}` });
      } else if (err.request) {
        setSubmitMessage({ type: 'error', text: 'No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando.' });
      } else {
        setSubmitMessage({ type: 'error', text: 'Error al enviar la petición para crear la cita.' });
      }
    }
  };

  // FUNCIÓN REFINADA: Determina el estado a mostrar de la cita
  const getAppointmentDisplayStatus = (originalDateString, horaCitaString, originalStatus) => {
    // Si el estado ya es 'Confirmada' o 'Cancelada', mantenemos ese estado.
    if (originalStatus?.toLowerCase() === 'confirmada' || originalStatus?.toLowerCase() === 'cancelada') {
      return originalStatus;
    }

    // --- Validación de entradas ---
    if (typeof originalDateString !== 'string' || typeof horaCitaString !== 'string') {
      console.warn('getAppointmentDisplayStatus: fecha u hora no son cadenas.', { originalDateString, horaCitaString });
      return originalStatus || 'Pendiente (Datos inválidos)';
    }

    const dateParts = originalDateString.split('-');
    const timeParts = horaCitaString.split(':');

    if (dateParts.length !== 3 || timeParts.length < 2) { // Permitir HH:MM o HH:MM:SS
      console.warn('getAppointmentDisplayStatus: formato de fecha u hora incorrecto.', { originalDateString, horaCitaString });
      return originalStatus || 'Pendiente (Formato inválido)';
    }

    const year = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10); // Mes es 1-12 desde la BD
    const day = parseInt(dateParts[2], 10);
    
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const seconds = timeParts[2] ? parseInt(timeParts[2], 10) : 0;

    if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hours) || isNaN(minutes) || isNaN(seconds)) {
      console.warn('getAppointmentDisplayStatus: componentes de fecha/hora no numéricos.', { year, month, day, hours, minutes, seconds });
      return originalStatus || 'Pendiente (Componentes inválidos)';
    }

    // --- Creación de la fecha de la cita en UTC para una comparación consistente ---
    // Date.UTC espera mes 0-11, por eso month - 1
    const appointmentTimeInMsUTC = Date.UTC(year, month - 1, day, hours, minutes, seconds);
    
    // Obtener la fecha y hora actuales del cliente y también sus milisegundos en UTC.
    const now = new Date(); 
    const nowTimeInMsUTC = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes(), now.getUTCSeconds(), now.getUTCMilliseconds());

    // --- LOGGING PARA DEPURACIÓN (opcional, puedes mantenerlo o quitarlo) ---
    // console.log(`--- Cita: ${originalDateString} ${horaCitaString} (Status Original: ${originalStatus}) ---`);
    // console.log(`Fecha/Hora Cita (Componentes): Y=${year}, M=${month}, D=${day}, H=${hours}, Min=${minutes}, S=${seconds}`);
    // console.log(`Cita (ms UTC): ${appointmentTimeInMsUTC} (${new Date(appointmentTimeInMsUTC).toISOString()})`);
    // console.log(`Actual (ms UTC): ${nowTimeInMsUTC} (${new Date(nowTimeInMsUTC).toISOString()})`);
    // console.log(`Comparación (Ahora > Cita): ${nowTimeInMsUTC > appointmentTimeInMsUTC}`);
    // --- FIN LOGGING ---

    if (nowTimeInMsUTC > appointmentTimeInMsUTC) {
      return 'Terminada'; 
    }
    
    return originalStatus || 'Pendiente';
  };

  const getStatusColor = (displayStatus) => {
    switch (displayStatus?.toLowerCase()) {
      case 'pendiente':
        return '#ffc107'; 
      case 'confirmada':
        return '#28a745'; 
      case 'cancelada':
        return '#dc3545'; 
      case 'terminada': 
        return '#6c757d'; // Cambiado a gris para 'Terminada' para diferenciar de 'Cancelada'
                            // o puedes usar el mismo rojo: return '#dc3545';
      default:
        return '#6c757d'; 
    }
  };

  // Función auxiliar para formatear la fecha de manera segura
  const formatDate = (dateString) => {
    try {
      // const date = new Date(dateString); //Aqui la declaramos pero no lo usa para na, porque  la lógica siguiente opera directamente con dateString para crear localDate.
      // Verificar si la fecha es válida. El getTime() en una fecha inválida devuelve NaN.
      // También, la fecha de la cita podría ser solo la parte de la fecha,
      // y new Date() puede interpretarla como UTC, ajustando al huso horario local.
      // Para ser más precisos con fechas sin hora, y evitar corrimientos de día:
      const [year, month, day] = dateString.split('-').map(Number);
      const localDate = new Date(year, month - 1, day);

      if (isNaN(localDate.getTime())) {
        return 'Fecha inválida';
      }
      return localDate.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    } catch (error) {
      console.error("Error formateando fecha:", dateString, error);
      return dateString || 'N/A'; // Devuelve la original o N/A si es nula
    }
  };

  // Función auxiliar para formatear la hora de manera segura
  const formatTime = (timeString) => {
    if (typeof timeString === 'string' && timeString.includes(':')) {
      return timeString.substring(0, 5); // Muestra solo HH:MM
    }
    return timeString || 'N/A';
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Gestión de Citas BarberSmart</h1>
      <p>Bienvenido a la página de gestión de citas.</p>

      {/* Formulario de Nueva Cita */}
      <div style={{ marginBottom: '50px', border: '1px solid #e0e0e0', padding: '25px', borderRadius: '10px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Agendar Nueva Cita</h2>
        
        {loadingFormOptions ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>Cargando opciones para el formulario...</p>
        ) : errorFormOptions ? (
          <p style={{ color: '#dc3545', textAlign: 'center', padding: '20px', border: '1px solid #dc3545', borderRadius: '5px', backgroundColor: '#f8d7da' }}>{errorFormOptions}</p>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label htmlFor="usuario_id" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Cliente:</label>
              <select
                id="usuario_id"
                name="usuario_id"
                value={formData.usuario_id}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              >
                <option value="">Selecciona un cliente</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.name} ({user.email})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="barberia_id" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barbería:</label>
              <select
                id="barberia_id"
                name="barberia_id"
                value={formData.barberia_id}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              >
                <option value="">Selecciona una barbería</option>
                {barberias.map(barberia => (
                  <option key={barberia.id} value={barberia.id}>{barberia.nombre}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="barbero_id" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Barbero:</label>
              <select
                id="barbero_id"
                name="barbero_id"
                value={formData.barbero_id}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              >
                <option value="">Selecciona un barbero</option>
                {barbers.map(barber => (
                  <option key={barber.barbero_id} value={barber.barbero_id}>{barber.name} ({barber.especialidad})</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="fecha" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Fecha:</label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </div>

            <div>
              <label htmlFor="hora" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Hora:</label>
              <input
                type="time"
                id="hora"
                name="hora"
                value={formData.hora}
                onChange={handleChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px' }}
              />
            </div>

            <div>
              <label htmlFor="servicio_ids" style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Servicios:</label>
              <select
                id="servicio_ids"
                name="servicio_ids"
                multiple
                value={formData.servicio_ids}
                onChange={handleServiceChange}
                required
                style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '5px', minHeight: '100px' }}
              >
                {services.map(service => (
                  <option key={service.id} value={service.id}>{service.nombre_servicio} (${service.precio})</option>
                ))}
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / 3', textAlign: 'center' }}>
              {submitMessage && (
                <p style={{
                  color: submitMessage.type === 'success' ? '#28a745' : '#dc3545',
                  backgroundColor: submitMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                  border: `1px solid ${submitMessage.type === 'success' ? '#28a745' : '#dc3545'}`,
                  borderRadius: '5px',
                  padding: '10px',
                  marginTop: '15px'
                }}>
                  {submitMessage.text}
                </p>
              )}
            </div>

            <div style={{ gridColumn: '1 / 3', textAlign: 'center' }}>
              <button
                type="submit"
                style={{
                  padding: '12px 25px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1em',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
              >
                Agendar Cita
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Listado de Todas las Citas */}
      <div style={{ marginTop: '50px', border: '1px solid #e0e0e0', padding: '25px', borderRadius: '10px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Todas las Citas Programadas</h2>
        
        {loadingAllAppointments ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>Cargando todas las citas...</p>
        ) : errorAllAppointments ? (
          <p style={{ color: '#dc3545', textAlign: 'center', padding: '20px', border: '1px solid #dc3545', borderRadius: '5px', backgroundColor: '#f8d7da' }}>{errorAllAppointments}</p>
        ) : messageAllAppointments ? (
          <p style={{ textAlign: 'center', padding: '20px', color: 'rgb(125 108 108)', border: '1px solid #ffc107', borderRadius: '5px', backgroundColor: '#fff3cd' }}>{messageAllAppointments}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {allAppointments.map(apt => {
              if (!apt || typeof apt.appointment_id === 'undefined') { // Chequeo básico de validez del objeto apt
                console.warn("Elemento de cita inválido o sin ID:", apt);
                return null; // No renderizar este elemento si es inválido
              }
              const displayStatus = getAppointmentDisplayStatus(apt.fecha, apt.hora, apt.status);
              const statusColor = getStatusColor(displayStatus);

              return (
                <div key={apt.appointment_id} style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}>
                  <h3 style={{ color: '#007bff', marginBottom: '10px', fontSize: '1.2em' }}>Cita #{apt.appointment_id}</h3>
                  <p><strong>Cliente:</strong> {apt.client_name || 'N/A'}</p>
                  <p><strong>Barbero:</strong> {apt.barber_name || 'N/A'}</p>
                  <p><strong>Barbería:</strong> {apt.barberia_nombre || 'N/A'}</p>
                  <p><strong>Fecha:</strong> {formatDate(apt.fecha)}</p>
                  <p><strong>Hora:</strong> {formatTime(apt.hora)}</p>
                  <p><strong>Servicios:</strong> 
                    {Array.isArray(apt.servicio_nombres) 
                      ? apt.servicio_nombres.join(', ') 
                      : (apt.servicio_nombres || 'N/A')}
                  </p>
                  <p>
                    <strong>Estado:</strong> 
                    <span style={{ fontWeight: 'bold', color: statusColor }}>
                      {displayStatus || 'N/A'}
                    </span>
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;