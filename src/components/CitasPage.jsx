import React from 'react';
import './CitasPage.css'; // Importa el archivo CSS para esta página

function CitasPage() {
  const citas = [
    { id: 1, paciente: 'Juan Pérez', fecha: '2025-05-22', hora: '10:00 AM', motivo: 'Corte' },
    { id: 2, paciente: 'María García', fecha: '2025-05-22', hora: '11:30 AM', motivo: 'Consulta de seguimiento' },
    { id: 3, paciente: 'Carlos López', fecha: '2025-05-23', hora: '09:00 AM', motivo: 'Tratamiento de cabello' },
  ];

  return (
    <div className="citas-page-container">
      <h1 className="citas-page-title">Gestión de Citas</h1>
      <div className="citas-actions">
        <button className="citas-add-button">Agendar Nueva Cita</button>
        <input type="text" placeholder="Buscar cita..." className="citas-search-input" />
      </div>
      <div className="citas-table-wrapper">
        <table className="citas-table">
          <thead>
            <tr>
              <th>ID Cita</th>
              <th>Paciente</th>
              <th>Fecha</th>
              <th>Hora</th>
              <th>Motivo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {citas.map((cita) => (
              <tr key={cita.id}>
                <td>{cita.id}</td>
                <td>{cita.paciente}</td>
                <td>{cita.fecha}</td>
                <td>{cita.hora}</td>
                <td>{cita.motivo}</td>
                <td>
                  <button className="citas-action-button view">Ver</button>
                  <button className="citas-action-button edit">Editar</button>
                  <button className="citas-action-button delete">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default CitasPage;