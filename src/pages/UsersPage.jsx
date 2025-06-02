import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Importa useNavigate

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate(); // Inicializa useNavigate

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axios.get('http://localhost:3001/api/users');
        setUsers(response.data);
      } catch (err) {
        console.error('Error al cargar clientes:', err);
        if (err.response) {
          setError(`Error del servidor: ${err.response.status} - ${err.response.data.message || 'Error desconocido'}`);
        } else if (err.request) {
          setError('No se pudo conectar con el servidor. Asegúrate de que el backend esté funcionando.');
        } else {
          setError('Error al enviar la petición para cargar clientes.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Función para manejar la navegación a la página de citas del usuario
  const handleViewAppointments = (userId, userName) => {
    navigate(`/admin/appointments/${userId}`, { state: { userName: userName } });
    // Redirige a /admin/appointments/:userId y pasa el nombre del usuario como estado
  };

  return (
    <div>
      <h1>Gestión de Clientes</h1>
      <p>Aquí podrás ver la información de los Clientes registrados en BarberSmart.</p>
      <div style={{ marginTop: '20px', border: '1px solid var(--color-border)', padding: '15px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
        <h2>Listado de Clientes</h2>
        {loading ? (
          <p>Cargando clientes...</p>
        ) : error ? (
          <p style={{ color: 'red' }}>{error}</p>
        ) : users.length === 0 ? (
          <p>No hay clientes registrados.</p>
        ) : (
          users.map(user => (
            <div
              key={user.id}
              style={{
                marginBottom: '10px',
                paddingBottom: '10px',
                borderBottom: '1px solid #eee',
                display: 'flex', // Usar flexbox para alinear contenido y botón
                justifyContent: 'space-between', // Espaciar contenido y botón
                alignItems: 'center', // Centrar verticalmente
              }}
            >
              <div>
                <strong>{user.name || 'Nombre Desconocido'}</strong> ({user.email || 'Correo Desconocido'})
                <br />
                Teléfono: {user.telefono || 'N/A'}
              </div>
              <button
                onClick={() => handleViewAppointments(user.id, user.name)}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#007bff', // Un color de botón azul, puedes ajustar
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.9em',
                  transition: 'background-color 0.2s',
                }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#0056b3')}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#007bff')}
              >
                Citas
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UsersPage;