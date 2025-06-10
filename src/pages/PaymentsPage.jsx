// src/pages/PaymentsPage.jsx
import React, { useState, useEffect, useMemo, useCallback } from 'react'; // Añadido useCallback
import axios from 'axios';
import './PaymentsPage.css';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos'); // 'todos', 'Facturada', 'Pendiente'

  // useCallback para memoizar fetchPayments y evitar re-creaciones innecesarias
  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('http://localhost:3001/api/admin/payments-history');
      if (response.data.success && Array.isArray(response.data.payments)) {
        setPayments(response.data.payments);
      } else {
        console.warn("API response for payments is not an array or missing:", response.data);
        setError(response.data.message || 'Error: La respuesta de la API no es válida.');
        setPayments([]);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError(`Error cargando historial de pagos: ${err.response?.data?.message || err.message || 'Error desconocido.'}`);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, []); // Sin dependencias, se define una vez

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]); // Llamar al cargar y si fetchPayments cambia (que no lo hará con useCallback y [])

  const handleRefresh = () => {
    fetchPayments(); // Llama a la función para recargar los datos
  };

  const handleViewLibelulaInvoice = (invoiceUrl) => {
    if (invoiceUrl && typeof invoiceUrl === 'string') {
      window.open(invoiceUrl, '_blank', 'noopener,noreferrer');
    } else {
      alert('URL de factura no disponible o inválida para esta transacción.');
    }
  };

  const getInvoiceStatusInfo = (payment) => {
    if (payment && payment.libelula_invoice_url && payment.libelula_invoice_url.trim() !== '') {
      return { text: 'Facturada', className: 'payment-status-paid' }; // Verde para Facturada
    }
    // Considerar el estado_pago interno si quieres diferentes tipos de "No Facturada"
    if (payment && payment.estado_pago === 'Cancelado') { // Ejemplo
        return { text: 'Cancelado', className: 'payment-status-cancelled'};
    }
    return { text: 'Pendiente', className: 'payment-status-pending' }; // Amarillo para Pendiente (de factura)
  };

  const formatDate = (dateString) => {
    if (!dateString || typeof dateString !== 'string') return 'N/A';
    const dateOnlyString = dateString.split('T')[0];
    const parts = dateOnlyString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      if (!isNaN(year) && !isNaN(month) && !isNaN(day)) {
        const date = new Date(Date.UTC(year, month, day));
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
          });
        }
      }
    }
    return 'Fecha Inv.';
  };
  
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    const date = new Date(dateTimeString);
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
        hour: '2-digit', minute: '2-digit',
      });
    }
    return 'Fecha/Hora Inv.';
  };

  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return payments
      .filter(p => p && typeof p === 'object')
      .filter(payment => {
        const invoiceStatusInfo = getInvoiceStatusInfo(payment);
        if (filterStatus === 'todos') return true;
        return invoiceStatusInfo.text === filterStatus;
      })
      .filter(payment => {
        const term = searchTerm.toLowerCase();
        if (!term) return true;
        return (
          payment.cliente_nombre?.toLowerCase().includes(term) ||
          payment.barbero_nombre?.toLowerCase().includes(term) ||
          payment.cita_id?.toString().includes(term)
        );
      });
  }, [payments, searchTerm, filterStatus]);

  if (loading) return <div className="payments-page-container"><div className="loading-message">Cargando...</div></div>;
  if (error) return <div className="payments-page-container"><div className="error-message">Error: {error}</div></div>;

  return (
    <div className="payments-page-container">
      <header className="payments-header">
        <h1>Gestión de Pagos y Facturas</h1>
        <p>Visualiza el estado de las transacciones y accede a las facturas de Libélula.</p>
      </header>

      <div className="filters-container">
        <input
          type="text"
          placeholder="Buscar por cliente, barbero o ID Cita..."
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
          <option value="Facturada">Facturada</option> {/* Alineado con getInvoiceStatusInfo */}
          <option value="Pendiente">Pendiente (Sin Factura)</option>
          {/* <option value="Cancelado">Cancelado</option> Si lo manejas */}
        </select>
        <button onClick={handleRefresh} className="refresh-button" title="Recargar datos">
          Refrescar
        </button>
      </div>

      <div className="payments-list">
        <h2>Historial de Transacciones</h2>
        {filteredPayments.length === 0 ? (
          <p className="no-payments-message">No hay transacciones que coincidan.</p>
        ) : (
          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Barbero</th>
                  <th>Fecha Cita</th>
                  <th>Servicios</th>
                  <th>Monto (Bs.)</th>
                  <th>Método Pago</th>
                  <th>Estado Factura</th>
                  <th>Fecha Confirmación Pago</th>
                  <th>Factura (Libélula)</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => {
                    const invoiceStatusInfo = getInvoiceStatusInfo(payment);
                    return (
                        <tr key={payment.cita_id}>
                            <td data-label="Cliente">{payment.cliente_nombre || 'N/A'}</td>
                            <td data-label="Barbero">{payment.barbero_nombre || 'N/A'}</td>
                            <td data-label="Fecha Cita">{formatDate(payment.fecha_cita)} {payment.hora_cita?.substring(0,5) || ''}</td>
                            <td data-label="Servicios" className="services-cell">
                            {Array.isArray(payment.servicio_nombres) ? payment.servicio_nombres.join(', ') : (payment.servicio_nombres || 'N/A')}
                            </td>
                            <td data-label="Monto Bs.">{payment.monto_total ? parseFloat(payment.monto_total).toFixed(2) : '0.00'}</td>
                            <td data-label="Método Pago">{payment.metodo_pago || (invoiceStatusInfo.text === 'Facturada' ? 'Libélula' : 'N/A')}</td>
                            <td data-label="Estado Factura">
                            <span className={`payment-status-badge ${invoiceStatusInfo.className}`}>
                                {invoiceStatusInfo.text}
                            </span>
                            </td>
                            <td data-label="Fecha Confirmación Pago">
                                {payment.fecha_pago_confirmado ? formatDateTime(payment.fecha_pago_confirmado) : (invoiceStatusInfo.text === 'Facturada' ? '(Confirmado)' : '-')}
                            </td>
                            <td data-label="Factura Libélula">
                            {payment.libelula_invoice_url ? (
                                <button 
                                onClick={() => handleViewLibelulaInvoice(payment.libelula_invoice_url)}
                                className="action-button-invoice" 
                                title={`Ver factura de Libélula`}
                                >
                                Ver Factura
                                </button>
                            ) : (
                                <span>-</span>
                            )}
                            </td>
                        </tr>
                    );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentsPage;