import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import './AppointmentsPage.css';

const ITEMS_PER_PAGE = 15;

const AppointmentsPage = () => {
  // Estados de datos
  const [allAppointments, setAllAppointments] = useState([]);
  const [barbers, setBarbers] = useState([]);
  
  // Estados de UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBarber, setSelectedBarber] = useState('');

  // Estado para paginación
  const [currentPage, setCurrentPage] = useState(1);

  // Carga de datos inicial
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        // Hacemos las dos llamadas en paralelo para mayor eficiencia
        const [appointmentsResponse, barbersResponse] = await Promise.all([
          axios.get('http://localhost:3001/api/appointments/all'),
          axios.get('http://localhost:3001/api/barberos')
        ]);

        if (appointmentsResponse.data.success) {
          setAllAppointments(appointmentsResponse.data.appointments || []);
        } else {
          setError(appointmentsResponse.data.message || 'Error al obtener las citas.');
        }

        if (barbersResponse.data.success) {
          setBarbers(barbersResponse.data.barberos || []);
        }

      } catch (err) {
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInitialData();
  }, []);

  // Lógica de filtrado y paginación en el cliente
  const filteredAppointments = useMemo(() => {
    return allAppointments
      .filter(apt => {
        // Filtro por barbero
        if (selectedBarber === '') return true; // Si no hay selección, mostrar todos
        // =================================================================================
        // === CORRECCIÓN CLAVE: Convertimos ambos valores a Número para una comparación segura ===
        // =================================================================================
        return Number(apt.barbero_id) === Number(selectedBarber);
      })
      .filter(apt => {
        // Filtro por término de búsqueda
        const term = searchTerm.toLowerCase();
        if (term === '') return true;
        return apt.client_name?.toLowerCase().includes(term);
      });
  }, [allAppointments, searchTerm, selectedBarber]);

  const totalPages = Math.ceil(filteredAppointments.length / ITEMS_PER_PAGE);

  const paginatedAppointments = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredAppointments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredAppointments, currentPage]);

  // Resetea a la página 1 cuando los filtros cambian
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedBarber]);

  // --- MANEJADORES DE EVENTOS ---
  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
            ) : paginatedAppointments.length > 0 ? (
              paginatedAppointments.map(apt => {
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
              <tr><td colSpan="6" className="messageCell">No se encontraron citas con los filtros seleccionados.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="paginationContainer">
        <span>
          Mostrando <strong>{paginatedAppointments.length}</strong> de <strong>{filteredAppointments.length}</strong> resultados
        </span>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage <= 1}
            className="paginationButton"
          >
            Anterior
          </button>
          <span>
            Página <strong>{currentPage}</strong> de <strong>{totalPages || 1}</strong>
          </span>
          <button 
            onClick={() => handlePageChange(currentPage + 1)} 
            disabled={currentPage >= totalPages}
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