import React, { useState, useEffect } from 'react'; // Import useEffect
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/barbersmart video.mp4';
import './LoginPage.css';

// Componente para el Modal de Mensaje
const MessageModal = ({ message, type, onClose }) => {
  // Use useEffect to automatically close the modal after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(); // Call the onClose function passed from parent
    }, 3000); // Disappear after 3 seconds (3000 milliseconds)

    // Clean up the timer if the component unmounts before the timer finishes
    return () => clearTimeout(timer);
  }, [onClose]); // Re-run effect if onClose changes (though it's stable here)

  return (
    <div className="login-modal-backdrop"> {/* Removed onClick={onClose} to prevent early closing */}
      <div className={`login-message-modal login-modal-${type}`}>
        <p>{message}</p>
        {/* Removed the close button */}
      </div>
    </div>
  );
};

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');

  const navigate = useNavigate();

  const handleShowModal = (message, type) => {
    setModalMessage(message);
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setModalMessage('');
    setModalType('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        handleShowModal('INICIO DE SESIÓN EXITOSO', 'success');
        // Delay navigation until *after* the modal has time to show and then disappear
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 3500); // 3 seconds for modal + 0.5s buffer
      } else {
        handleShowModal('CREDENCIALES INCORRECTAS', 'error');
      }
    } catch (error) {
      console.error('Error en login:', error);
      handleShowModal('CORREO O CONTRASEÑA INCORRECTOS', 'error');
    }
  };

  const handleRegisterClick = () => {
    navigate('/registrarse');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo-container">
          <video
            src={logo}
            className="login-logo"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
        <h1>Acceso Administrador</h1>
        <p>BarberSmart</p>
        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="login-button">Ingresar</button>
        </form>

        <button onClick={handleRegisterClick} className="register-link">
          ¿No tienes cuenta? Registrarse
        </button>
      </div>

      {showModal && (
        <MessageModal
          message={modalMessage}
          type={modalType}
          onClose={handleCloseModal} // Pass the close handler
        />
      )}
    </div>
  );
};

export default LoginPage;