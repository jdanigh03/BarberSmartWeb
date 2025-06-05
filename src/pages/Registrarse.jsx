import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/barbersmart video.mp4';
import './Registrarse.css';

// Componente para el Modal de Mensaje
const RegisterMessageModal = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Disappear after 3 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="register-modal-backdrop">
      <div className={`register-message-modal register-modal-${type}`}>
        <p>{message}</p>
      </div>
    </div>
  );
};

const Registrarse = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [rol, setRol] = useState('Administrador');
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
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
    if (password !== confirmarPassword) {
      handleShowModal('Las contraseñas no coinciden', 'error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/register', {
        name,
        email,
        telefono,
        rol,
        password,
      });

      if (response.data.success) {
        handleShowModal('¡Registro exitoso como Administrador!', 'success');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 3500);
      } else {
        handleShowModal(response.data.message || 'Error al registrar', 'error');
      }
    } catch (error) {
      console.error(error);
      handleShowModal('Error al registrar. Intente más tarde.', 'error');
    }
  };

  // New handler for navigating back to login
  const handleLoginClick = () => {
    navigate('/'); // Assuming '/' is your login page route
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-logo-container">
          <video
            src={logo}
            className="register-logo"
            autoPlay
            loop
            muted
            playsInline
          />
        </div>
        <h1>Registro de Administrador</h1>
        <p>BarberSmart</p>
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="name">Nombre Completo</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="telefono">Teléfono</label>
              <input
                type="text"
                id="telefono"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                required
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor="rol">Rol Asignado</label>
              <input
                type="text"
                id="rol"
                value={rol}
                readOnly
                className="read-only-input"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group half-width">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="form-group half-width">
              <label htmlFor="confirmarPassword">Confirmar Contraseña</label>
              <input
                type="password"
                id="confirmarPassword"
                value={confirmarPassword}
                onChange={(e) => setConfirmarPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="register-button">
            Registrarse
          </button>
        </form>

        {/* Nuevo botón para volver al login */}
        <button onClick={handleLoginClick} className="register-login-link">
          ¿Ya tienes cuenta? Iniciar Sesión
        </button>

      </div>

      {showModal && (
        <RegisterMessageModal
          message={modalMessage}
          type={modalType}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Registrarse;