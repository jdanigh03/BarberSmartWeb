import React from 'react';
import './Usuarios.css'; // Importa el archivo CSS para esta página

function UsuariosPage() {
  const usuarios = [
    { id: 1, nombre: 'admin', rol: 'Administrador', ultimoAcceso: '2025-05-21 14:30' },
    { id: 2, nombre: 'jefe.medico', rol: 'Jefe de Departamento', ultimoAcceso: '2025-05-20 09:00' },
    { id: 3, nombre: 'recepcion', rol: 'Recepcionista', ultimoAcceso: '2025-05-21 10:15' },
    { id: 4, nombre: 'dr.perez', rol: 'Médico', ultimoAcceso: '2025-05-19 16:00' },
  ];

  return (
    <div className="usuarios-page-container">
      <h1 className="usuarios-page-title">Lista de Usuarios</h1>
      <div className="usuarios-actions">
        <button className="usuarios-add-button">Crear Nuevo Usuario</button>
        <input type="text" placeholder="Buscar usuario..." className="usuarios-search-input" />
      </div>
      <div className="usuarios-table-wrapper">
        <table className="usuarios-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre de Usuario</th>
              <th>Rol</th>
              <th>Último Acceso</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.nombre}</td>
                <td>{usuario.rol}</td>
                <td>{usuario.ultimoAcceso}</td>
                <td>
                  <button className="usuarios-action-button edit">Editar</button>
                  <button className="usuarios-action-button delete">Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UsuariosPage;