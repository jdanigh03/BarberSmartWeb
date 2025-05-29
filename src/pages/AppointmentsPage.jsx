import React, { useState, useEffect } from 'react';
import axios from 'axios';

const AppointmentsPage = () => {
  // Estado para todas las citas del sistema
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(''); // Para mensajes como "no hay citas"

  // === FUNCIÓN CLAVE: Para cargar TODAS las citas ===
  const fetchAllAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      setMessage('');
      // Aquí usamos la ruta para obtener TODAS las citas
      const response = await axios.get(`http://localhost:3001/api/appointments/all`);
      
      if (response.data.success) {
        if (response.data.appointments.length === 0) {
          setMessage(`No hay citas programadas en el sistema.`);
        }
        setAllAppointments(response.data.appointments);
      } else {
        setError(response.data.message || `Error al obtener todas las citas.`);
      }
    } catch (err) {
      console.error(`Error al cargar todas las citas:`, err);
      if (err.response) {
        setError(`Error del servidor: ${err.response.status} - ${err.response.data.message || 'Error desconocido'}`);
      } else if (err.request) {
        setError('No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando.');
      } else {
        setError('Error al enviar la petición para cargar todas las citas.');
      }
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar TODAS las citas al montar el componente
  useEffect(() => {
    fetchAllAppointments(); // Cargar todas las citas al iniciar
  }, []); // El array de dependencias vacío asegura que se ejecuta solo una vez al montar

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Gestión de Citas BarberSmart</h1>
      <p>Bienvenido a la página de gestión de citas.</p>

      {/* Sección para mostrar TODAS las Citas */}
      <div style={{ marginTop: '50px', border: '1px solid #e0e0e0', padding: '25px', borderRadius: '10px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Todas las Citas Programadas</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>Cargando todas las citas...</p>
        ) : error ? (
          <p style={{ color: '#dc3545', textAlign: 'center', padding: '20px', border: '1px solid #dc3545', borderRadius: '5px', backgroundColor: '#f8d7da' }}>{error}</p>
        ) : message ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d', border: '1px solid #ffc107', borderRadius: '5px', backgroundColor: '#fff3cd' }}>{message}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {allAppointments.map(apt => (
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
                <p><strong>Estado:</strong> <span style={{ fontWeight: 'bold', color: apt.status === 'Pendiente' ? '#ffc107' : apt.status === 'Confirmada' ? '#28a745' : '#dc3545' }}>{apt.status || 'N/A'}</span></p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AppointmentsPage;