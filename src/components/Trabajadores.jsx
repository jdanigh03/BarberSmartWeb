import React from 'react';
import './Trabajadores.css'; // Importa el archivo CSS para esta página

function TrabajadoresPage() {
  const trabajadores = [
    { id: 101, nombre: 'Ana Gómez', cargo: 'Médico General', telefono: '555-1234', email: 'ana.gomez@example.com' },
    { id: 102, nombre: 'Luis Torres', cargo: 'Enfermero', telefono: '555-5678', email: 'luis.torres@example.com' },
    { id: 103, nombre: 'Sofía Ramos', cargo: 'Administrativo', telefono: '555-9012', email: 'sofia.ramos@example.com' },
    { id: 104, nombre: 'Pedro Diaz', cargo: 'Recepcionista', telefono: '555-3456', email: 'pedro.diaz@example.com' },
  ];

  return (
    <div className="trabajadores-page-container">
      <h1 className="trabajadores-page-title">Lista de Trabajadores</h1>
      <div className="trabajadores-actions">
        <button className="trabajadores-add-button">Agregar Nuevo Trabajador</button>
        <input type="text" placeholder="Buscar trabajador..." className="trabajadores-search-input" />
      </div>
      <div className="trabajadores-table-wrapper">
        <table className="trabajadores-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Completo</th>
              <th>Cargo</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trabajadores.map((trabajador) => (
              <tr key={trabajador.id}>
                <td>{trabajador.id}</td>
                <td>{trabajador.nombre}</td>
                <td>{trabajador.cargo}</td>
                <td>{trabajador.telefono}</td>
                <td>{trabajador.email}</td>
                <td>
                  <button className="trabajadores-action-button view">Ver Detalles</button>
                  <button className="trabajadores-action-button edit">Editar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default TrabajadoresPage;