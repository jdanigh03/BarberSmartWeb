// src/components/UserAppointmentsPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useLocation } from 'react-router-dom'; // Importa useLocation

const UserAppointmentsPage = () => {
  const { userId } = useParams(); // Obtiene el userId de la URL
  const location = useLocation(); // Obtiene el objeto location
  const { userName } = location.state || {}; // Accede al userName del estado de la navegación

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const fetchUserAppointments = async () => {
      try {
        setLoading(true);
        setError(null);
        setMessage('');

        // Usamos la nueva ruta específica para citas de usuario
        const response = await axios.get(`http://localhost:3001/api/appointments/user/${userId}`);
        
        if (response.data.success) {
          if (response.data.appointments.length === 0) {
            setMessage(`No hay citas programadas para este usuario.`);
          }
          setAppointments(response.data.appointments);
        } else {
          setError(response.data.message || `Error al obtener las citas del usuario.`);
        }
      } catch (err) {
        console.error(`Error al cargar citas del usuario ${userId}:`, err);
        if (err.response) {
          setError(`Error del servidor: ${err.response.status} - ${err.response.data.message || 'Error desconocido'}`);
        } else if (err.request) {
          setError('No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando.');
        } else {
          setError('Error al enviar la petición para cargar las citas del usuario.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (userId) { // Solo si tenemos un userId, intentamos cargar las citas
      fetchUserAppointments();
    }
  }, [userId]); // El array de dependencias asegura que se ejecuta cuando userId cambia

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
      <h1>Citas de {userName ? userName : `Usuario #${userId}`}</h1>
      <p>Aquí puedes ver todas las citas programadas para este cliente.</p>

      <div style={{ marginTop: '50px', border: '1px solid #e0e0e0', padding: '25px', borderRadius: '10px', backgroundColor: '#ffffff', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginBottom: '20px', color: '#333' }}>Citas del Cliente</h2>
        
        {loading ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d' }}>Cargando citas del usuario...</p>
        ) : error ? (
          <p style={{ color: '#dc3545', textAlign: 'center', padding: '20px', border: '1px solid #dc3545', borderRadius: '5px', backgroundColor: '#f8d7da' }}>{error}</p>
        ) : message ? (
          <p style={{ textAlign: 'center', padding: '20px', color: '#6c757d', border: '1px solid #ffc107', borderRadius: '5px', backgroundColor: '#fff3cd' }}>{message}</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {appointments.map(apt => (
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
                {/* Puedes añadir botones para editar o cancelar si lo necesitas */}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserAppointmentsPage;