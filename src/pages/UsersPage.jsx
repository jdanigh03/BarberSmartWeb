import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './UsersPage.css';

// Componente Modal para Editar Usuario
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
    if (user) { // Editando
      setFormData({
        name: user.name || '',
        email: user.email || '',
        telefono: user.telefono || '',
        rol: user.rol || 'Cliente',
        forma_rostro: user.forma_rostro || '',
        avatar: user.avatar || '', 
      });
    } else { // Creando (si se implementara)
      setFormData({ name: '', email: '', telefono: '', rol: 'Cliente', forma_rostro: '', avatar: '' });
    }
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDeleteAvatarField = () => {
    setFormData(prev => ({ ...prev, avatar: '' }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(user ? user.id : null, formData);
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
              <button type="button" onClick={handleDeleteAvatarField} className="delete-avatar-btn" style={{ marginLeft: '10px', marginTop: '5px' }}>
                Borrar URL del Avatar
              </button>
            }
          </div>
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
  const [editingUser, setEditingUser] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('Todos');

  const rolesDisponiblesParaFiltro = ['Todos', 'Cliente', 'Barbero', 'Administrador'];
  const rolesParaModal = ['Cliente', 'Barbero', 'Administrador']; // Sin 'Todos' para el select del modal

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
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

  const handleSaveUser = async (userId, userData) => {
    try {
      let response;
      if (userId) { // Editando
        response = await axios.put(`http://localhost:3001/api/users/${userId}`, userData);
      } else {
        // Implementar creación de usuario si es necesario
        alert("Funcionalidad de crear nuevo usuario no implementada.");
        return;
      }

      if (response.data.success) {
        fetchUsers();
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
          fetchUsers();
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

  const filteredUsers = useMemo(() => {
    return users
      .filter(user => {
        if (roleFilter === 'Todos') return true;
        return user.rol === roleFilter;
      })
      .filter(user => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return (
          user.name?.toLowerCase().includes(term) ||
          user.email?.toLowerCase().includes(term) ||
          user.telefono?.toLowerCase().includes(term)
        );
      });
  }, [users, searchTerm, roleFilter]);

  return (
    <div className="users-page-container">
      <header className="users-header">
        <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administra todos los usuarios registrados en el sistema.</p>
        </div>
      </header>

      <div className="users-filters-container">
        <input
          type="text"
          placeholder="Buscar por nombre, email, teléfono..."
          className="users-search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="users-role-filter" 
          value={roleFilter} 
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          {rolesDisponiblesParaFiltro.map(role => (
            <option key={role} value={role}>{role === 'Todos' ? 'Todos los Roles' : role}</option>
          ))}
        </select>
      </div>

      {loading && <div className="loading-message-users">Cargando usuarios...</div>}
      {error && <div className="error-message-users">Error: {error}</div>}
      
      {!loading && !error && (
        <div className="table-responsive-users">
          <table className="users-table">
            <thead>
              <tr>
                {/* Se oculta la columna ID visualmente */}
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
              {filteredUsers.length === 0 ? (
                <tr><td colSpan="7" className="no-users-message"> {/* colSpan ahora es 7 */}
                    No hay usuarios que coincidan con los filtros.
                </td></tr>
              ) : (
                filteredUsers.map(user => (
                  <tr key={user.id}>
                    <td>
                      {user.avatar ? (
                        <img 
                          src={user.avatar}
                          alt={`Avatar de ${user.name}`} 
                          className="user-avatar-thumbnail" 
                        />
                      ) : (
                        <span className="no-avatar-placeholder">S/A</span>
                      )}
                    </td>
                    <td>{user.name}</td>
                    <td>{user.email}</td>
                    <td>{user.telefono || '-'}</td>
                    <td><span className={`role-badge role-${user.rol?.toLowerCase()}`}>{user.rol}</span></td>
                    <td>{user.forma_rostro || '-'}</td>
                    <td>{user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '-'}</td>
                    <td>
                      <button onClick={() => handleEditUser(user)} className="action-button-users edit">Editar</button>
                      <button onClick={() => handleDeleteUser(user.id, user.name)} className="action-button-users delete">Eliminar</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && editingUser && (
        <UserModal 
          user={editingUser} 
          onClose={handleCloseModal} 
          onSave={handleSaveUser} 
          rolesDisponibles={rolesParaModal}
        />
      )}
    </div>
  );
};

export default UsersPage;