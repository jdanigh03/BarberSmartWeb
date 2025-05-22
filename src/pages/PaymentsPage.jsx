import React from 'react';

const PaymentsPage = () => {
   const dummyPayments = [
    { id: 1, client: 'Juan Rodríguez', amount: 25.00, date: '2024-07-28', status: 'Pagado', method: 'Tarjeta' },
    { id: 2, client: 'Ana Gómez', amount: 30.00, date: '2024-07-29', status: 'Pendiente', method: '-' },
  ];
  return (
    <div>
      <h1>Gestión de Pagos</h1>
      <p>Revisa el cumplimiento de los pagos de los servicios.</p>
      <div style={{ marginTop: '20px', border: '1px solid var(--color-border)', padding: '15px', borderRadius: '8px', backgroundColor: 'var(--color-surface)' }}>
        <h2>Listado de Pagos (Ejemplo)</h2>
        {dummyPayments.map(payment => (
          <div key={payment.id} style={{ marginBottom: '10px', paddingBottom: '10px', borderBottom: '1px solid #eee' }}>
            Cliente: <strong>{payment.client}</strong> - Monto: ${payment.amount.toFixed(2)}
            <br />
            Fecha: {payment.date} | Estado: {payment.status} | Método: {payment.method}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsPage;