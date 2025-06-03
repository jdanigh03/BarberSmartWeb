import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DashboardPage = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const res = await axios.get('http://localhost:3001/api/summary');
        console.log('Resumen recibido:', res.data);
        setSummary(res.data);
      } catch (err) {
        const msg = err.response?.data?.message || 'Error al cargar el resumen del sistema.';
        setError(msg);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, []);

  if (loading) return <p>Cargando resumen...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  const { lastUser, nextAppointment, pendingPayments, totalAppointments } = summary || {};

  return (
    <div style={{ padding: 20, fontFamily: 'Arial, sans-serif' }}>
      <h1>Dashboard</h1>
      <p>Bienvenido al panel de administración de BarberSmart.</p>

      <div
        style={{
          display: 'grid',
          gap: 20,
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          marginTop: 20,
        }}
      >
        <div style={cardStyle}>
          <h3>👤 Último Cliente Registrado</h3>
          {lastUser ? (
            <>
              <p><strong>Nombre:</strong> {lastUser.name}</p>
              <p><strong>Email:</strong> {lastUser.email}</p>
            </>
          ) : (
            <p>No hay clientes registrados.</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3>📆 Próxima Cita</h3>
          {nextAppointment && nextAppointment.fecha ? (
            <>
              <p><strong>Fecha:</strong> {new Date(nextAppointment.fecha).toLocaleDateString()}</p>
              <p><strong>Hora:</strong> {nextAppointment.hora || 'No disponible'}</p>
              <p><strong>ID Cita:</strong> #{nextAppointment.id}</p>
            </>
          ) : (
            <p>No hay citas programadas.</p>
          )}
        </div>

        <div style={cardStyle}>
          <h3>💸 Pagos Pendientes</h3>
          <p>{typeof pendingPayments === 'number' ? pendingPayments : '0'} pagos pendientes</p>
        </div>

        <div style={cardStyle}>
          <h3>📋 Total de Citas</h3>
          <p>{typeof totalAppointments === 'number' ? totalAppointments : '0'} citas en el sistema</p>
        </div>
      </div>
    </div>
  );
};

const cardStyle = {
  backgroundColor: '#fff',
  border: '1px solid #ddd',
  padding: 20,
  borderRadius: 10,
  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
};

export default DashboardPage;
