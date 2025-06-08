import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './AppointmentsPage.css'; // ¡Importamos el archivo CSS aquí!

const AppointmentsPage = () => {
  // Estados para datos y UI (sin cambios)
  const [allAppointments, setAllAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  
  // Estados para filtros (sin cambios)
  const [searchTerm, setSearchTerm] = useState('');
  const [barbers, setBarbers] = useState([]);
  const [selectedBarber, setSelectedBarber] = useState('');

  // Estados para paginación (sin cambios)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    totalPages: 1,
    total: 0,
  });

  // --- LÓGICA DE DATOS (sin cambios) ---
  const fetchBarbers = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/barberos');
      if (response.data.success) setBarbers(response.data.barberos);
    } catch (err) {
      console.error("Error al cargar barberos:", err);
    }
  };

  const fetchAllAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    setMessage('');
    try {
      const params = {
        search: searchTerm,
        barberId: selectedBarber,
        page: pagination.page,
        limit: pagination.limit,
      };

      const response = await axios.get('http://localhost:3001/api/appointments/all', { params });
      
      if (response.data.success) {
        setAllAppointments(response.data.appointments || []);
        setPagination(response.data.pagination);
        if (response.data.appointments.length === 0) {
          setMessage('No se encontraron citas con los filtros seleccionados.');
        }
      } else {
        setError(response.data.message || 'Error al obtener las citas.');
      }
    } catch (err) {
      setError('No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedBarber, pagination.page, pagination.limit]);

  // --- EFECTOS (LIFECYCLE) (sin cambios) ---
  useEffect(() => {
    fetchBarbers();
  }, []);

  useEffect(() => {
    setPagination(p => ({ ...p, page: 1 }));
  }, [searchTerm, selectedBarber]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchAllAppointments();
    }, 500);
    return () => clearTimeout(handler);
  }, [fetchAllAppointments]);

  // --- MANEJADORES DE EVENTOS (sin cambios) ---
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= pagination.totalPages) {
      setPagination(p => ({ ...p, page: newPage }));
    }
  };

  // --- FUNCIONES AUXILIARES DE FORMATO (sin cambios) ---
  const getAppointmentDisplayStatus = (originalDateString, horaCitaString, originalStatus) => {
    if (originalStatus?.toLowerCase() === 'confirmada' || originalStatus?.toLowerCase() === 'cancelada') return originalStatus;
    if (!originalDateString || !horaCitaString) return originalStatus || 'Pendiente (Datos inválidos)';
    const dateTimeString = `${originalDateString.split('T')[0]}T${horaCitaString}`;
    const appointmentTime = new Date(dateTimeString);
    if (isNaN(appointmentTime.getTime())) return originalStatus || 'Pendiente (Fecha/Hora inválida)';
    return new Date() > appointmentTime ? 'Terminada' : (originalStatus || 'Pendiente');
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Fecha inválida';
      return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' });
    } catch (error) { return dateString; }
  };

  const formatTime = (timeString) => {
    if (typeof timeString === 'string' && timeString.includes(':')) return timeString.substring(0, 5);
    return timeString || 'N/A';
  };

  return (
    <div className="pageContainer">
      <h1 className="title">Gestión de Citas</h1>
      <p className="subTitle">
        Busca y filtra todas las citas registradas en el sistema.
      </p>
      
      <div className="filterContainer">
        <input
          type="text"
          placeholder="Buscar por nombre de cliente..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="input"
        />
        <select
          value={selectedBarber}
          onChange={(e) => setSelectedBarber(e.target.value)}
          className="select"
        >
          <option value="">Todos los barberos</option>
          {barbers.map(barber => (
            <option key={barber.barbero_id} value={barber.barbero_id}>
              {barber.name}
            </option>
          ))}
        </select>
      </div>

      <div className="tableContainer">
        <table className="table">
          <thead className="tableHeader">
            <tr>
              <th className="tableHeaderCell">Cliente</th>
              <th className="tableHeaderCell">Barbero</th>
              <th className="tableHeaderCell">Fecha</th>
              <th className="tableHeaderCell">Hora</th>
              <th className="tableHeaderCell">Servicios</th>
              <th className="tableHeaderCell">Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="messageCell">Cargando citas...</td></tr>
            ) : error ? (
              <tr><td colSpan="6" className="errorCell">{error}</td></tr>
            ) : allAppointments.length > 0 ? (
              allAppointments.map(apt => {
                const displayStatus = getAppointmentDisplayStatus(apt.fecha, apt.hora, apt.status);
                return (
                  <tr key={apt.appointment_id} className="tableRow">
                    <td className="tableCell">{apt.client_name}</td>
                    <td className="tableCell">{apt.barber_name}</td>
                    <td className="tableCell">{formatDate(apt.fecha)}</td>
                    <td className="tableCell">{formatTime(apt.hora)}</td>
                    <td className="tableCell">{apt.servicio_nombres?.join(', ') || 'N/A'}</td>
                    <td className="tableCell">
                      <span className={`statusPill ${displayStatus.toLowerCase()}`}>
                        {displayStatus}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" className="messageCell">{message}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="paginationContainer">
        <span>
          Mostrando <strong>{allAppointments.length}</strong> de <strong>{pagination.total}</strong> resultados
        </span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => handlePageChange(pagination.page - 1)} 
            disabled={pagination.page <= 1}
            className="paginationButton"
          >
            Anterior
          </button>
          <span>
            Página <strong>{pagination.page}</strong> de <strong>{pagination.totalPages}</strong>
          </span>
          <button 
            onClick={() => handlePageChange(pagination.page + 1)} 
            disabled={pagination.page >= pagination.totalPages}
            className="paginationButton"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
};

export default AppointmentsPage;