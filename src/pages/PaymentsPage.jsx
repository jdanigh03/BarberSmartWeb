import React, { useState, useEffect, useMemo, useRef } from 'react';
import axios from 'axios';
import './PaymentsPage.css';
import InvoiceTemplate from '../components/layout/invoice/InvoiceTemplate.jsx';
import Modal from 'react-modal';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('todos');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [selectedPaymentForInvoice, setSelectedPaymentForInvoice] = useState(null);
  const [barberiaDetails, setBarberiaDetails] = useState(null);
  const invoiceRef = useRef();

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get('http://localhost:3001/api/admin/payments-history');
        if (response.data.success && Array.isArray(response.data.payments)) {
          setPayments(response.data.payments);
        } else {
          setPayments([]);
          setError(response.data.message || 'La respuesta de la API para pagos no es válida.');
        }
      } catch (err) {
        setError(`Error al cargar historial de pagos: ${err.response?.data?.message || err.message || 'Error desconocido.'}`);
        setPayments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const handleViewInvoice = async (payment) => {
    setSelectedPaymentForInvoice(payment);
    if (payment.barberia_id_para_factura) {
      try {
        const res = await axios.get(`http://localhost:3001/api/barberias/${payment.barberia_id_para_factura}`);
        if (res.data.success && res.data.barberia) {
          setBarberiaDetails(res.data.barberia);
        } else {
          setBarberiaDetails(null);
        }
      } catch (e) {
        setBarberiaDetails(null);
      }
    } else {
      setBarberiaDetails({ nombre: "BarberSmart General" });
    }
    setShowInvoiceModal(true);
  };

  const closeModal = () => {
    setShowInvoiceModal(false);
    setSelectedPaymentForInvoice(null);
    setBarberiaDetails(null);
  };

  const downloadInvoiceAsImage = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current);
    const link = document.createElement('a');
    link.download = 'factura.png';
    link.href = canvas.toDataURL();
    link.click();
  };

  const downloadInvoiceAsPDF = async () => {
    if (!invoiceRef.current) return;
    const canvas = await html2canvas(invoiceRef.current);
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('factura.pdf');
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pagado': return 'payment-status-paid';
      case 'pendiente': return 'payment-status-pending';
      case 'cancelado': return 'payment-status-cancelled';
      default: return 'payment-status-unknown';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const date = new Date(parts[0], parts[1] - 1, parts[2]);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric', month: 'long', day: 'numeric',
      });
    }
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return 'N/A';
    return new Date(dateTimeString).toLocaleString('es-ES', {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  const filteredPayments = useMemo(() => {
    if (!Array.isArray(payments)) return [];
    return payments
      .filter(payment => {
        const searchTermLower = searchTerm.toLowerCase();
        return (
          (payment?.cliente_nombre?.toLowerCase() || '').includes(searchTermLower) ||
          (payment?.barbero_nombre?.toLowerCase() || '').includes(searchTermLower) ||
          (payment?.cita_id?.toString() || '').includes(searchTermLower)
        );
      })
      .filter(payment => {
        if (filterStatus === 'todos') return true;
        return payment?.estado_pago === filterStatus;
      });
  }, [payments, searchTerm, filterStatus]);

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
          <option value="Cancelado">Cancelado</option>
        </select>
      </div>

      <div className="payments-list">
        <h2>Historial de Transacciones</h2>
        {filteredPayments.length === 0 ? (
          <p className="no-payments-message">
            No se encontraron transacciones que coincidan con los filtros o no hay pagos registrados.
          </p>
        ) : (
          <div className="payments-table-wrapper">
            <table className="payments-table">
              <thead>
                <tr>
                  <th>ID Cita</th>
                  <th>Cliente</th>
                  <th>Barbero</th>
                  <th>Fecha Cita</th>
                  <th>Servicios</th>
                  <th>Monto (Bs.)</th>
                  <th>Método</th>
                  <th>Estado</th>
                  <th>Confirmado</th>
                  <th>Factura</th>
                </tr>
              </thead>
              <tbody>
                {filteredPayments.map(payment => (
                  <tr key={payment.cita_id}>
                    <td data-label="ID Cita">#{payment.cita_id}</td>
                    <td data-label="Cliente">{payment.cliente_nombre || 'N/A'}</td>
                    <td data-label="Barbero">{payment.barbero_nombre || 'N/A'}</td>
                    <td data-label="Fecha Cita">{formatDate(payment.fecha_cita)} {payment.hora_cita?.substring(0,5) || ''}</td>
                    <td data-label="Servicios" className="services-cell">{Array.isArray(payment.servicio_nombres) ? payment.servicio_nombres.join(', ') : (payment.servicio_nombres || 'N/A')}</td>
                    <td data-label="Monto Bs.">{payment.monto_total ? parseFloat(payment.monto_total).toFixed(2) : '0.00'}</td>
                    <td data-label="Método">{payment.metodo_pago || 'N/A'}</td>
                    <td data-label="Estado">
                      <span className={`payment-status-badge ${getStatusColor(payment.estado_pago)}`}>
                        {payment.estado_pago || 'N/A'}
                      </span>
                    </td>
                    <td data-label="Confirmado">{payment.fecha_pago_confirmado ? formatDateTime(payment.fecha_pago_confirmado) : '-'}</td>
                    <td data-label="Factura">
                      {payment.estado_pago === 'Pagado' ? (
                        <button 
                          onClick={() => handleViewInvoice(payment)}
                          className="action-button-invoice" 
                        >
                          Descargar Factura
                        </button>
                      ) : (
                        <span>-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={showInvoiceModal}
        onRequestClose={closeModal}
        contentLabel="Factura de Pago"
        className="invoice-modal-content"
        overlayClassName="invoice-modal-overlay"
        ariaHideApp={false}
      >
        <div ref={invoiceRef}>
          {selectedPaymentForInvoice && (
            <InvoiceTemplate 
              paymentData={selectedPaymentForInvoice} 
              barberiaData={barberiaDetails} 
            />
          )}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1rem' }}>
          <button onClick={downloadInvoiceAsImage} className="action-button-invoice">Descargar Imagen</button>
          <button onClick={downloadInvoiceAsPDF} className="action-button-invoice">Descargar PDF</button>
        </div>

        <div style={{ textAlign: 'center', marginTop: '1rem' }}>
          <button onClick={closeModal} className="close-invoice-modal-btn">Cerrar Vista de Factura</button>
        </div>
      </Modal>
    </div>
  );
};

export default PaymentsPage;
