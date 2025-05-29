import React from 'react';

const AppointmentsPage = () => {
  const dummyAppointments = [
    { id: 1, dateTime: '2024-07-30 10:00', barber: 'Carlos Pérez', client: 'Juan Rodríguez', service: 'Corte Clásico', status: 'Confirmada' },
    { id: 2, dateTime: '2024-07-30 11:30', barber: 'Lucía Méndez', client: 'Ana Gómez', service: 'Diseño de Barba', status: 'Pendiente' },
  ];

  return (
    <div>
      <h1>Gestión de Citas</h1>
      <div style={{ marginTop: '20px', border: '1px solid var(--color-border)', padding: '15px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
        <h2>Listado de Citas</h2>
        {dummyAppointments.map(apt => (
          <div key={apt.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <strong>{apt.service}</strong> - {apt.status}
            <br />
            Fecha: {apt.dateTime} | Barbero: {apt.barber} | Cliente: {apt.client}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AppointmentsPage;