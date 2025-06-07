// src/pages/PaymentsPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Asegúrate de tener axios instalado: npm install axios
import './PaymentsPage.css'; // Crearemos este archivo para los estilos

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos', 'Pagado', 'Pendiente'

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        // Endpoint para obtener el historial de pagos del admin
        const response = await axios.get('http://localhost:3001/api/admin/payments-history'); // Ajusta si tu URL es diferente

        if (response.data.success && response.data.payments) {
          setPayments(response.data.payments);
        } else if (response.data.success && response.data.payments.length === 0) {
          setPayments([]); // No hay pagos pero la llamada fue exitosa
        } else {
          setError(response.data.message || 'No se pudieron cargar los datos de pagos.');
        }
      } catch (err) {
        console.error("Error fetching payments:", err);
        setError(`Error al cargar historial de pagos: ${err.response?.data?.message || err.message || 'Error desconocido.'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []); // El array vacío asegura que se ejecute solo al montar el componente

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pagado':
        return 'payment-status-paid';
      case 'pendiente':
        return 'payment-status-pending';
      case 'cancelado': // Si tienes este estado
        return 'payment-status-cancelled';
      default:
        return 'payment-status-unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredPayments = payments
    .filter(payment => {
      const searchTermLower = searchTerm.toLowerCase();
      return (
        (payment.cliente_nombre?.toLowerCase() || '').includes(searchTermLower) ||
        (payment.barbero_nombre?.toLowerCase() || '').includes(searchTermLower) ||
        (payment.cita_id?.toString() || '').includes(searchTermLower)
      );
    })
    .filter(payment => {
      if (filterStatus === 'todos') return true;
      return payment.estado_pago === filterStatus;
    });

  if (loading) {
    return <div className="payments-page-container"><div className="loading-message">Cargando historial de pagos...</div></div>;
  }

  if (error) {
    return <div className="payments-page-container"><div className="error-message">Error: {error}</div></div>;
  }

  return (
    <div className="payments-page-container">
      <header className="payments-header">
        <h1>Gestión de Pagos</h1>
        <p>Revisa el cumplimiento de los pagos de los servicios y el historial de transacciones.</p>
      </header>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Buscar por cliente, barbero o ID cita..."
          className="search-input"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select 
          className="status-filter" 
          value={filterStatus} 
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="todos">Todos los Estados</option>
          <option value="Pagado">Pagado</option>
          <option value="Pendiente">Pendiente</option>
        </select>
      </div>

      <div className="payments-list">
        <h2>Historial de Transacciones</h2>
        {filteredPayments.length === 0 ? (
          <p className="no-payments-message">
            No se encontraron transacciones que coincidan con los filtros o no hay pagos registrados.
          </p>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th>ID Cita</th>
                <th>Cliente</th>
                <th>Barbero</th>
                <th>Fecha Cita</th>
                <th>Servicios</th>
                <th>Monto</th>
                <th>Método</th>
                <th>Estado</th>
                <th>Confirmado</th>
              </tr>
            </thead>
            <tbody>
              {filteredPayments.map(payment => (
                <tr key={payment.cita_id}>
                  <td>#{payment.cita_id}</td>
                  <td>{payment.cliente_nombre || 'N/A'}</td>
                  <td>{payment.barbero_nombre || 'N/A'}</td>
                  <td>{formatDate(payment.fecha_cita)} {payment.hora_cita || ''}</td>
                  <td className="services-cell">{payment.servicio_nombres ? payment.servicio_nombres.join(', ') : 'N/A'}</td>
                  <td>{payment.monto_total ? parseFloat(payment.monto_total).toFixed(2) : '0.00'} Bs.</td>
                  <td>{payment.metodo_pago || 'N/A'}</td>
                  <td>
                    <span className={`payment-status-badge ${getStatusColor(payment.estado_pago)}`}>
                      {payment.estado_pago || 'N/A'}
                    </span>
                  </td>
                  <td>{payment.fecha_pago_confirmado ? formatDateTime(payment.fecha_pago_confirmado) : '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;