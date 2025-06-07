// src/pages/UsersPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './UsersPage.css'; // Crearemos o actualizaremos este archivo

// Componente Modal para Editar/Crear Usuario
// src/pages/UsersPage.jsx - DENTRO DEL UserModal

const UserModal = ({ user, onClose, onSave, rolesDisponibles }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefono: '',
    rol: 'Cliente',
    forma_rostro: '',
    avatar: '', // Campo para la URL del avatar
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        telefono: user.telefono || '',
        rol: user.rol || 'Cliente',
        forma_rostro: user.forma_rostro || '',
        avatar: user.avatar || '', // Carga la URL existente
      });
    } else {
      setFormData({ name: '', email: '', telefono: '', rol: 'Cliente', forma_rostro: '', avatar: '' });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteAvatarField = () => {
    // Simplemente borra la URL del formulario, el guardado real lo hace onSave
    setFormData(prev => ({ ...prev, avatar: '' })); 
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user ? user.id : null, formData); // formData ahora incluye la URL del avatar
  };

  return (
    <div className="modal-backdrop-users">
      <div className="modal-content-users">
        <button onClick={onClose} className="modal-close-button-users">×</button>
        <h3>{user ? 'Editar Usuario' : 'Crear Usuario'}</h3>
        <form onSubmit={handleSubmit}>
          {formData.avatar && (
            <div className="avatar-preview">
              <img src={formData.avatar} alt="Avatar actual" /> 
            </div>
          )}
          <div>
            <label>URL del Avatar:</label>
            <input type="text" name="avatar" placeholder="https://ejemplo.com/imagen.jpg" value={formData.avatar} onChange={handleChange} />
            {formData.avatar && 
              <button type="button" onClick={handleDeleteAvatarField} className="delete-avatar-btn" style={{marginLeft: '10px', marginTop: '5px'}}>
                Borrar URL del Avatar
              </button>
            }
          </div>
          {/* Otros campos como antes (name, email, telefono, rol, forma_rostro) */}
          <div>
            <label>Nombre:</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required />
          </div>
          <div>
            <label>Email:</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>
          <div>
            <label>Teléfono:</label>
            <input type="tel" name="telefono" value={formData.telefono} onChange={handleChange} />
          </div>
          <div>
            <label>Rol:</label>
            <select name="rol" value={formData.rol} onChange={handleChange}>
              {rolesDisponibles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div>
            <label>Forma del Rostro:</label>
            <input type="text" name="forma_rostro" value={formData.forma_rostro} onChange={handleChange} />
          </div>
          <div className="modal-actions-users">
            <button type="submit" className="save-button-users">Guardar Cambios</button>
            <button type="button" onClick={onClose} className="cancel-button-users">Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};


const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // Para el modal de edición
  const [showModal, setShowModal] = useState(false);

  const rolesDisponibles = ['Cliente', 'Barbero', 'Administrador']; // Define los roles posibles

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      // Usar el nuevo endpoint que trae todos los usuarios y más datos
      const response = await axios.get('http://localhost:3001/api/admin/all-users');
      if (response.data.success) {
        setUsers(response.data.users);
      } else {
        setError(response.data.message || 'Error al cargar usuarios.');
      }
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(`Error al cargar usuarios: ${err.response?.data?.message || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setEditingUser(user);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (userId, userData /*, avatarFile */) => {
    // Aquí es donde la lógica de subir el avatarFile primero sería necesaria si se implementa
    // const formDataWithAvatar = new FormData();
    // Object.keys(userData).forEach(key => formDataWithAvatar.append(key, userData[key]));
    // if (avatarFile) {
    //   formDataWithAvatar.append('avatarImage', avatarFile); // 'avatarImage' debe coincidir con el backend
    // }
    
    try {
      let response;
      if (userId) { // Editando
        response = await axios.put(`http://localhost:3001/api/users/${userId}`, userData); // Sin 'avatarFile' por ahora
      } else { // Creando (no implementado el botón de crear aún)
        // response = await axios.post('http://localhost:3001/api/users', userData);
      }

      if (response.data.success) {
        fetchUsers(); // Recargar lista de usuarios
        handleCloseModal();
        alert(response.data.message || 'Operación exitosa.');
      } else {
        alert(response.data.message || 'Error guardando usuario.');
      }
    } catch (err) {
      console.error('Error guardando usuario:', err);
      alert(`Error guardando usuario: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar al usuario ${userName} (ID: ${userId})? Esta acción no se puede deshacer.`)) {
      try {
        const response = await axios.delete(`http://localhost:3001/api/users/${userId}`);
        if (response.data.success) {
          fetchUsers(); // Recargar lista
          alert(response.data.message);
        } else {
          alert(response.data.message || 'Error al eliminar usuario.');
        }
      } catch (err) {
        console.error('Error al eliminar usuario:', err);
        alert(`Error al eliminar usuario: ${err.response?.data?.message || err.message}`);
      }
    }
  };
  
  const API_BASE_URL_STATIC = 'http://localhost:3001'; // Para construir URL de avatares

  return (
    <div className="users-page-container">
      <header className="users-header">
        <h1>Gestión de Usuarios</h1>
        <p>Administra todos los usuarios registrados en el sistema.</p>
        {/* <button className="add-user-button" onClick={() => handleEditUser(null)}>+ Añadir Nuevo Usuario</button> */}
      </header>

      {loading && <div className="loading-message-users">Cargando usuarios...</div>}
      {error && <div className="error-message-users">Error: {error}</div>}
      
      {!loading && !error && (
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Avatar</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Rol</th>
              <th>Forma Rostro</th>
              <th>Registrado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr><td colSpan="9" className="no-users-message">No hay usuarios registrados.</td></tr>
            ) : (
              users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>
                    {user.avatar ? (
                      <img 
                        src={user.avatar}
                        alt={`Avatar de ${user.name}`} 
                        className="user-avatar-thumbnail"
                        onError={(e) => { e.target.style.display='none';}} 
                      />
                    ) : (
                      <span className="no-avatar-placeholder">Sin Avatar</span>
                    )}
                  </td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.telefono || '-'}</td>
                  <td><span className={`role-badge role-${user.rol?.toLowerCase()}`}>{user.rol}</span></td>
                  <td>{user.forma_rostro || '-'}</td>
                  <td>{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td>
                  <td>
                    <button onClick={() => handleEditUser(user)} className="action-button-users edit">Editar</button>
                    <button onClick={() => handleDeleteUser(user.id, user.name)} className="action-button-users delete">Eliminar</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      {showModal && editingUser && (
        <UserModal 
          user={editingUser} 
          onClose={handleCloseModal} 
          onSave={handleSaveUser} 
          rolesDisponibles={rolesDisponibles}
        />
      )}
       {/* Para crear un nuevo usuario, se pasaría null al UserModal: */}
       {/* {showModal && !editingUser && ( <UserModal user={null} ... /> )} */}
    </div>
  );
};

export default UsersPage;