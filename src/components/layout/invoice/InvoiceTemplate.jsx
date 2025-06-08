import React from 'react';
import logoBarberSmart from '../../../assets/logo.png'; // Tu logo
import './InvoiceTemplate.css'; // Estilos para la factura

// Función auxiliar para formatear la fecha
const formatDateForInvoice = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('es-ES', {
    day: '2-digit', 
    month: 'long', // "noviembre"
    year: 'numeric'
  });
};

const InvoiceTemplate = ({ paymentData, barberiaData }) => {
  if (!paymentData) return <p>No hay datos de pago para mostrar la factura.</p>;

  // Datos del Emisor (BarberSmart o la Barbería específica)
  // Estos podrían venir de 'barberiaData' o ser fijos si BarberSmart es siempre el emisor
  const emisor = {
    nombre: barberiaData?.nombre || "BarberSmart Central",
    direccion: barberiaData?.direccion || "Dirección de BarberSmart Central",
    telefono: barberiaData?.telefono_contacto || "N/A",
    email: barberiaData?.email_contacto || "contacto@barbersmart.com",
    logo: logoBarberSmart, 
    // nit: barberiaData?.nit || "NIT de BarberSmart", // Necesitarías el NIT
  };

  // Datos del Cliente (Receptor)
  const receptor = {
    nombre: paymentData.cliente_nombre || "Cliente No Especificado",
    email: "N/A", // El backend no devuelve el email del cliente en `payments-history`, necesitaríamos añadirlo
    // nit_ci: paymentData.cliente_nit_ci || "N/A" // Necesitaríamos el NIT/CI del cliente
  };

  // Detalles de la factura
  const numeroFactura = `BSM-${String(paymentData.cita_id).padStart(5, '0')}`; // Ejemplo de numeración
  const fechaEmision = formatDateForInvoice(new Date().toISOString().split('T')[0]); // Hoy
  const fechaOrden = formatDateForInvoice(paymentData.fecha_cita);

  // Items facturados (servicios)
  const items = paymentData.items_facturados // <-- USAR 'items_facturados' SI TU BACKEND LO ENVÍA ASÍ
    ? paymentData.items_facturados.map((item, index) => ({ // Recibe el objeto item completo y el index
        key: `invoice-item-${paymentData.cita_id}-${index}`, // <-- USA 'index' para la key (o un ID del item si lo tienes)
        descripcion: item.descripcion,
        precioUnitario: parseFloat(item.precio_unitario || item.subtotal / (item.cantidad || 1) || 0).toFixed(2), // Intenta obtener precio_unitario, o calcúlalo
        cantidad: item.cantidad || 1,
        subtotal: parseFloat(item.subtotal || (item.precio_unitario * (item.cantidad || 1)) || 0).toFixed(2)
      }))
    // Fallback si `items_facturados` no viene o está vacío, y tienes `servicio_nombres` y `monto_total`
    : paymentData.servicio_nombres && paymentData.monto_total
      ? paymentData.servicio_nombres.map((nombreServicio, index) => ({
          key: `invoice-item-${paymentData.cita_id}-fallback-${index}`, // <-- USA 'index' para la key
          descripcion: nombreServicio,
          precioUnitario: (parseFloat(paymentData.monto_total) / (paymentData.servicio_nombres.length || 1)).toFixed(2),
          cantidad: 1,
          subtotal: (parseFloat(paymentData.monto_total) / (paymentData.servicio_nombres.length || 1)).toFixed(2)
        }))
      // Si no hay ni `items_facturados` ni `servicio_nombres`, un item genérico
      : [{ 
          key: `invoice-item-${paymentData.cita_id}-generic`,
          descripcion: 'Servicio General', 
          precioUnitario: parseFloat(paymentData.monto_total || 0).toFixed(2), 
          cantidad: 1, 
          subtotal: parseFloat(paymentData.monto_total || 0).toFixed(2) 
        }];

  const montoTotalBs = parseFloat(paymentData.monto_total || 0).toFixed(2);

  return (
    <div className="invoice-wrapper">
      <div className="invoice-document">
        <header className="invoice-header-section">
          <div className="invoice-logo-emisor">
            <img src={emisor.logo} alt="Logo Emisor" className="emisor-logo-img" />
          </div>
          <div className="invoice-title-section">
            <h1>Factura de Barbería</h1>
            <div className="invoice-meta">
              <div><span>Orden de compra número:</span> {numeroFactura}</div>
              <div><span>Fecha de orden:</span> {fechaOrden}</div>
              <div><span>Fecha de emisión:</span> {fechaEmision}</div>
            </div>
          </div>
        </header>

        <section className="invoice-parties">
          <div className="party-details emisor-details">
            <h3>De</h3>
            <strong>{emisor.nombre}</strong>
            <p>{emisor.email}</p>
            <p>{/* {emisor.nit} -  */}{emisor.telefono}</p>
            <p>{emisor.direccion}</p>
          </div>
          <div className="party-details receptor-details">
            <h3>Cobrar a</h3>
            <strong>{receptor.nombre}</strong>
            <p>{/* {receptor.email} */}</p> {/* Necesitaríamos el email */}
            <p>{/* {receptor.nit_ci} */}</p> {/* Necesitaríamos NIT/CI */}
            {/* <p>Dirección Cliente (si la tienes)</p> */}
          </div>
        </section>
        
        {/* Sección Enviar a - Opcional si es igual que Cobrar a */}
        {/* <section className="invoice-shipping">
          <h3>Envíe a</h3>
          <p>...</p>
        </section> */}

        <section className="invoice-items-table">
          <table>
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Precio Unitario (Bs.)</th>
                <th>Cantidad</th>
                <th>Subtotal (Bs.)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.key}>
                  <td>{item.descripcion}</td>
                  <td>{parseFloat(item.precioUnitario).toFixed(2)}</td>
                  <td>{item.cantidad}</td>
                  <td>{parseFloat(item.subtotal).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="invoice-summary-payment">
          <div className="invoice-payment-instructions">
            <h3>Instrucciones de pago</h3>
            <p>Pago realizado vía Libélula</p>
            <p><strong>ID Transacción Libélula:</strong> {paymentData.libelula_transaction_id || 'N/A'}</p>
            {paymentData.metodo_pago && <p><strong>Método Registrado:</strong> {paymentData.metodo_pago}</p>}
            {paymentData.fecha_pago_confirmado && 
                <p><strong>Confirmado el:</strong> 
                {new Date(paymentData.fecha_pago_confirmado).toLocaleString('es-ES')}
                </p>
            }
          </div>
          <div className="invoice-totals">
            <div><span>Total Parcial:</span> <span>Bs. {montoTotalBs}</span></div>
            {/* <div><span>Descuento (si aplica):</span> <span>Bs. 0.00</span></div> */}
            {/* <div><span>Impuesto (IVA):</span> <span>Bs. 0.00</span></div> */}
            <div className="total-final"><span>Total Pagado:</span> <span>Bs. {montoTotalBs}</span></div>
          </div>
        </section>

        <footer className="invoice-footer-notes">
          <h3>Notas</h3>
          <p>Gracias por preferir BarberSmart. Esta factura confirma el pago de los servicios detallados.</p>
          {/* Aquí podrías añadir leyendas fiscales si son requeridas */}
        </footer>
         {/* Puedes agregar una sección para firma si es necesario */}
         {/* <div className="invoice-signature-section">
            <img src="url_a_una_firma_digitalizada.png" alt="Firma" />
         </div> */}
      </div>
      <button onClick={() => window.print()} className="print-invoice-btn">Imprimir Factura</button>
    </div>
  );
};

export default InvoiceTemplate;