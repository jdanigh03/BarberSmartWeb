import React, { StrictMode } from 'react'; // React importado por si acaso (aunque con JSX a veces es implícito)
import { createRoot } from 'react-dom/client';
import Modal from 'react-modal'; // <-- IMPORTA MODAL AQUÍ
import App from './App.jsx';
import './index.css';

Modal.setAppElement('#root'); // <-- LLAMA A setAppElement ANTES DEL RENDER

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);