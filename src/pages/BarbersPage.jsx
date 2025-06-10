import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BarbersPage.css';
import BarberAdd from './BarberAdd';

const BarbersPage = () => {
  const [barberos, setBarberos] = useState([]);
  const [barberias, setBarberias] = useState([]);
  const [editando, setEditando] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({
    especialidad: '',
    descripcion_profesional: '',
    calificacion_promedio: '',
    barberia_id: ''
  });

  useEffect(() => {
    fetchBarberos();
    fetchBarberias();
  }, []);

  const fetchBarberos = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/barberos');
      if (res.data.success) {
        const filtrados = res.data.barberos.filter(b => b.rol === 'Barbero');
        setBarberos(filtrados);
      }
    } catch (error) {
      console.error('Error al obtener barberos:', error);
    }
  };

  const fetchBarberias = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/barberias');
      if (res.data.success) {
        setBarberias(res.data.barberias);
      }
    } catch (error) {
      console.error('Error al obtener barberías:', error);
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

  const getNombreBarberia = (id) => {
    const barberia = barberias.find(b => b.id === Number(id));
    return barberia ? barberia.nombre : 'No asignada';
  };

  return (
    <div>
      <h1>Gestión de Barberos</h1>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
        <button className="btn-guardar" onClick={() => setMostrarFormulario(true)}>+ Añadir Barbero</button>
      </div>

      {mostrarFormulario && (
        <BarberAdd onClose={() => { setMostrarFormulario(false); fetchBarberos(); }} />
      )}

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
                  min="0"
                  max="5"
                  step="0.01"
                  value={formData.calificacion_promedio}
                  onChange={(e) => setFormData({ ...formData, calificacion_promedio: e.target.value })}
                />
                <div className="barber-actions">
                  <button className="btn-guardar" onClick={() => handleSave(barber.usuario_id)}>Guardar</button>
                  <button className="btn-eliminar" onClick={() => setEditando(null)}>Cancelar</button>
                </div>
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
