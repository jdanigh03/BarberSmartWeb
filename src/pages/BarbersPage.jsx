import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BarbersPage.css';

const BarbersPage = () => {
  const [barberos, setBarberos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [formData, setFormData] = useState({
    especialidad: '',
    descripcion_profesional: '',
    calificacion_promedio: '',
    barberia_id: ''
  });

  useEffect(() => {
    fetchBarberos();
  }, []);

  const fetchBarberos = async () => {
    const res = await axios.get('http://localhost:3001/api/barberos');
    if (res.data.success) {
      const barberosFiltrados = res.data.barberos.filter(barber => barber.rol === 'Barbero');
      setBarberos(barberosFiltrados);
    }
  };

  const handleEditClick = (barbero) => {
    setEditando(barbero.usuario_id);
    setFormData({
      especialidad: barbero.especialidad || '',
      descripcion_profesional: barbero.descripcion_profesional || '',
      calificacion_promedio: barbero.calificacion_promedio || '',
      barberia_id: barbero.barberia_id || ''
    });
  };

  const handleSave = async (usuario_id) => {
    try {
      const res = await axios.post('http://localhost:3001/api/barberos/update', {
        usuario_id,
        ...formData
      });
      if (res.data.success) {
        setEditando(null);
        fetchBarberos();
      }
    } catch (err) {
      console.error('Error al guardar:', err);
    }
  };

  const handleDelete = async (usuario_id) => {
    if (!window.confirm('¿Deseas eliminar los datos de este barbero?')) return;
    try {
      await axios.post('http://localhost:3001/api/barberos/delete', { usuario_id });
      fetchBarberos();
    } catch (err) {
      console.error('Error al eliminar:', err);
    }
  };

  return (
    <div>
      <h1>Gestión de Barberos</h1>
      <div className="barber-list">
        {barberos.map(barber => (
          <div key={barber.usuario_id} className="barber-card">
            <h3 className="barber-name">{barber.name}</h3>

            <div className="barber-detail">
              <strong>Especialidad:</strong> {barber.especialidad || <em>No definida</em>}
            </div>

            <div className="barber-detail">
              <strong>Descripción:</strong> {barber.descripcion_profesional || <em>No definida</em>}
            </div>

            <div className="barber-detail">
              <strong>Calificación:</strong> {barber.calificacion_promedio || <em>No registrada</em>}
            </div>

            <div className="barber-detail">
              <strong>Barbería ID:</strong> {barber.barberia_id || <em>No asignada</em>}
            </div>

            {editando === barber.usuario_id ? (
              <div className="barber-form">
                <input
                  placeholder="Especialidad"
                  value={formData.especialidad}
                  onChange={(e) => setFormData({ ...formData, especialidad: e.target.value })}
                />
                <input
                  placeholder="Descripción"
                  value={formData.descripcion_profesional}
                  onChange={(e) => setFormData({ ...formData, descripcion_profesional: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Calificación"
                  value={formData.calificacion_promedio}
                  onChange={(e) => setFormData({ ...formData, calificacion_promedio: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Barbería ID"
                  value={formData.barberia_id}
                  onChange={(e) => setFormData({ ...formData, barberia_id: e.target.value })}
                />
                <button className="btn-guardar" onClick={() => handleSave(barber.usuario_id)}>Guardar</button>
              </div>
            ) : (
              <div className="barber-actions">
                <button className="btn-editar" onClick={() => handleEditClick(barber)}>Editar</button>
                <button className="btn-eliminar" onClick={() => handleDelete(barber.usuario_id)}>Eliminar</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarbersPage;
