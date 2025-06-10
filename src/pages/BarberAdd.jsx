import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './BarbersPage.css';

const BarberAdd = ({ onClose }) => {
  const [clientes, setClientes] = useState([]);
  const [barberias, setBarberias] = useState([]);
  const [formData, setFormData] = useState({
    usuario_id: '',
    especialidad: '',
    descripcion_profesional: '',
    calificacion_promedio: '',
    barberia_id: ''
  });

  useEffect(() => {
    fetchClientes();
    fetchBarberias();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/clients');
      setClientes(res.data.clients);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const fetchBarberias = async () => {
    try {
      const res = await axios.get('http://localhost:3001/api/barberias');
      setBarberias(res.data.barberias);
    } catch (error) {
      console.error('Error al obtener barberías:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Verificar si ya está registrado como barbero
      const existentes = await axios.get('http://localhost:3001/api/barberos');
      const yaExiste = existentes.data.barberos.some(b => b.usuario_id === parseInt(formData.usuario_id));
      if (yaExiste) {
        alert("Este usuario ya está registrado como barbero.");
        return;
      }

      // Cambiar rol del usuario a 'Barbero'
      await axios.put(`http://localhost:3001/api/users/${formData.usuario_id}`, {
        rol: 'Barbero'
      });

      // Insertar en tabla barberos
      const res = await axios.post('http://localhost:3001/api/barberos/update', formData);
      if (res.data.success) {
        alert('Cliente convertido a barbero exitosamente.');
        onClose();
      }
    } catch (error) {
      console.error('Error al registrar barbero:', error);
      alert('Ocurrió un error al registrar el barbero.');
    }
  };

  return (
    <div className="modal-fondo">
      <div className="modal-contenido">
        <h2>Registrar Nuevo Barbero</h2>
        <form onSubmit={handleSubmit}>
          <label>Cliente a convertir:</label>
          <select
            value={formData.usuario_id}
            onChange={e => setFormData({ ...formData, usuario_id: e.target.value })}
            required
          >
            <option value="">Seleccione un cliente</option>
            {clientes.map(c => (
              <option key={c.id} value={c.id}>{c.name} ({c.email})</option>
            ))}
          </select>

          <label>Especialidad:</label>
          <input
            type="text"
            value={formData.especialidad}
            onChange={e => setFormData({ ...formData, especialidad: e.target.value })}
            required
          />

          <label>Descripción Profesional:</label>
          <textarea
            value={formData.descripcion_profesional}
            onChange={e => setFormData({ ...formData, descripcion_profesional: e.target.value })}
            required
          />

          <label>Calificación Promedio (0 a 5):</label>
          <input
            type="number"
            step="0.01"
            min="0"
            max="5"
            value={formData.calificacion_promedio}
            onChange={e => setFormData({ ...formData, calificacion_promedio: e.target.value })}
            required
          />
          <div className="btn-group" style={{ marginTop: '20px' }}>
            <button type="submit" className="btn-guardar">Guardar</button>
            <button type="button" className="btn-eliminar" onClick={onClose}>Cancelar</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BarberAdd;
