import React from 'react';

const UsersPage = () => {
  // En el futuro, aquí cargarías y mostrarías la lista de usuarios/clientes
   const dummyUsers = [
    { id: 101, name: 'Juan Rodríguez', lastCut: 'Degradado Medio', paymentStatus: 'Al día' },
    { id: 102, name: 'Ana Gómez', lastCut: 'Corte de Puntas', paymentStatus: 'Pendiente' },
  ];

  return (
    <div>
      <h1>Gestión de Usuarios (Clientes)</h1>
      <p>Aquí podrás ver la información de los clientes, sus cortes y estado de pagos.</p>
      <div style={{ marginTop: '20px', border: '1px solid var(--color-border)', padding: '15px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
        <h2>Listado de Usuarios (Ejemplo)</h2>
        {dummyUsers.map(user => (
          <div key={user.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            <strong>{user.name}</strong>
            <br />
            Último Corte: {user.lastCut} | Estado de Pago: {user.paymentStatus}
             {/* En el futuro: Botones para ver detalle, etc. */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UsersPage;