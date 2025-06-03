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
      // CORRECCIÓN: La URL debe ser una cadena de texto (string)
      const response = await axios.get('http://localhost:3001/api/appointments/all');
      
      if (response.data.success) {
        if (response.data.appointments.length === 0) {
          // CORRECCIÓN: El mensaje debe ser una cadena de texto
          setMessageAllAppointments('No hay citas programadas en el sistema.');
        }
        setAllAppointments(response.data.appointments);
      } else {
        // CORRECCIÓN: El mensaje debe ser una cadena de texto
        setErrorAllAppointments(response.data.message || 'Error al obtener todas las citas.');
      }
    } catch (err) {
      // CORRECCIÓN: El texto del error debe ser una cadena de texto
      console.error('Error al cargar todas las citas:', err);
      if (err.response) {
        // CORRECCIÓN: El texto del error debe estar dentro de un template literal (` `)
        setErrorAllAppointments(`Error del servidor: ${err.response.status} - ${err.response.data.message || 'Error desconocido'}`);
      } else if (err.request) {
        setErrorAllAppointments('No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando.');
      } else {
        setErrorAllAppointments('Error al enviar la petición para cargar todas las citas.');
      }
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

      setUsers(usersRes.data); 
      setBarbers(barbersRes.data.barberos); 
      setBarberias(barberiasRes.data.barberias); 
      setServices(servicesRes.data.servicios); 

    } catch (err) {
      console.error('Error al cargar opciones del formulario:', err);
      setErrorFormOptions('Error al cargar datos para el formulario. Intenta de nuevo.');
    } finally {
      setLoadingFormOptions(false);
    }
  };

  useEffect(() => {
    fetchAllAppointments();
    fetchFormOptions();
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
        // CORRECCIÓN: El texto del error debe estar dentro de un template literal (` `)
        setSubmitMessage({ type: 'error', text: `Error del servidor: ${err.response.status} - ${err.response.data.message || 'Error desconocido'}` });
      } else if (err.request) {
        setSubmitMessage({ type: 'error', text: 'No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando.' });
      } else {
        setSubmitMessage({ type: 'error', text: 'Error al enviar la petición para crear la cita.' });
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Gestión de Citas BarberSmart</h1>
      <p>Bienvenido a la página de gestión de citas.</p>

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
                {/* Asumiendo que users es un array y cada user tiene 'id', 'name', 'email' */}
                {users && users.map(user => (
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
                {/* Asumiendo que barberias es un array y cada barberia tiene 'id', 'nombre' */}
                {barberias && barberias.map(barberia => (
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
                 {/* Asumiendo que barbers es un array y cada barber tiene 'barbero_id', 'name', 'especialidad' */}
                {barbers && barbers.map(barber => (
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
                 {/* Asumiendo que services es un array y cada service tiene 'id', 'nombre_servicio', 'precio' */}
                {services && services.map(service => (
                  <option key={service.id} value={service.id}>{service.nombre_servicio} (${service.precio})</option>
                ))}
              </select>
            </div>
            
            <div style={{ gridColumn: '1 / 3', textAlign: 'center' }}>
              {submitMessage && (
                <p style={{
                  color: submitMessage.type === 'success' ? '#28a745' : '#dc3545',
                  backgroundColor: submitMessage.type === 'success' ? '#d4edda' : '#f8d7da',
                  // CORRECCIÓN: El valor de 'border' debe ser una cadena completa, usando template literals
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

      <div style={{ marginTop: '50px', border: '1px solid #e0e0e0', padding: '25px', borderRadius: '10px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Todas las Citas Programadas</h2>
        
        {loadingAllAppointments ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>Cargando todas las citas...</p>
        ) : errorAllAppointments ? (
          <p style={{ color: '#dc3545', textAlign: 'center', padding: '20px', border: '1px solid #dc3545', borderRadius: '5px', backgroundColor: '#f8d7da' }}>{errorAllAppointments}</p>
        ) : messageAllAppointments ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d', border: '1px solid #ffc107', borderRadius: '5px', backgroundColor: '#fff3cd' }}>{messageAllAppointments}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {/* Añadida comprobación para allAppointments antes de mapear */}
            {allAppointments && allAppointments.map(apt => (
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
                <p><strong>Fecha:</strong> {new Date(apt.fecha).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p><strong>Hora:</strong> {apt.hora}</p>
                <p><strong>Servicios:</strong> {apt.servicio_nombres ? apt.servicio_nombres.join(', ') : 'N/A'}</p>
                <p><strong>Estado:</strong> <span style={{ fontWeight: 'bold', color: apt.status === 'Pendiente' ? '#ffc107' : apt.status === 'Confirmada' ? '#28a745' : apt.status === 'Cancelada' ? '#dc3545' : '#6c757d' }}>{apt.status || 'N/A'}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;