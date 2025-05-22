import React from 'react';

const BarbersPage = () => {
  // En el futuro, aquí cargarías y mostrarías la lista de barberos desde la BD
  const dummyBarbers = [
    { id: 1, name: 'Carlos Pérez', specialty: 'Cortes Clásicos', appointmentsToday: 3, historyCount: 150 },
    { id: 2, name: 'Lucía Méndez', specialty: 'Color y Barbas', appointmentsToday: 5, historyCount: 210 },
  ];

  return (
    <div>
      <h1>Gestión de Barberos</h1>
      <p>Aquí podrás ver, agregar, editar y eliminar barberos.</p>
      {/* Tabla o lista de barberos */}
      <div style={{ marginTop: '20px', border: '1px solid var(--color-border)', padding: '15px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
        <h2>Listado de Barberos (Ejemplo)</h2>
        {dummyBarbers.map(barber => (
          <div key={barber.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <strong>{barber.name}</strong> ({barber.specialty})
            <br />
            Citas Hoy: {barber.appointmentsToday} | Cortes Históricos: {barber.historyCount}
            <br />
            {/* En el futuro: Botones para ver detalle, editar, etc. */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarbersPage;