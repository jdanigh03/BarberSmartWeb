import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/barbersmart video.mp4'; // Asegúrate de que esta ruta es correcta
import './LoginPage.css';

// Componente de modal para mostrar mensajes
const MessageModal = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Se cierra automáticamente después de 3 segundos
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="login-modal-backdrop">
      <div className={`login-message-modal login-modal-${type}`}>
        <p>{message}</p>
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

  // Estados para el Captcha
  const [randomNumber, setRandomNumber] = useState(null);
  const [captchaInput, setCaptchaInput] = useState('');
  const [attempts, setAttempts] = useState(0);
  const maxAttempts = 5;

  const navigate = useNavigate();

  useEffect(() => {
    generateRandomNumber();
  }, []);

  // Genera un número aleatorio de 6 dígitos para el captcha
  const generateRandomNumber = () => {
    const number = Math.floor(Math.random() * 900000) + 100000; // Número de 6 dígitos
    setRandomNumber(number);
  };

  // Muestra el modal con mensaje de éxito o error
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

  // Maneja el envío del formulario de login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    // Verificar si el campo de captcha está vacío
    if (!captchaInput) {
      alert('Por favor, llena el código de seguridad'); // Alerta si el captcha está vacío
      return; // Detiene la ejecución
    }

    // Verificar si se superaron los intentos
    if (attempts >= maxAttempts) {
      handleShowModal('Has superado el número de intentos. Inténtalo de nuevo más tarde.', 'error');
      generateRandomNumber(); // Genera un nuevo número
      setCaptchaInput(''); // Limpia el input
      return;
    }

    // Verificar si el captcha es correcto
    if (captchaInput !== String(randomNumber)) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      handleShowModal(`Código incorrecto. Te quedan ${maxAttempts - newAttempts} intentos.`, 'error');
      generateRandomNumber(); // Genera un nuevo captcha
      setCaptchaInput(''); // Limpia el input
      return;
    }

    // Si el captcha es correcto, intenta hacer login
    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });

      if (response.data.success) {
        setAttempts(0); // Reinicia los intentos en un login exitoso
        localStorage.setItem('user', JSON.stringify(response.data.user));
        handleShowModal('INICIO DE SESIÓN EXITOSO', 'success');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 3500); // Redirige al dashboard después de 3.5 segundos
      } else {
        handleShowModal('CREDENCIALES INCORRECTAS', 'error');
        generateRandomNumber(); // Genera un nuevo captcha
        setCaptchaInput('');
      }
    } catch (error) {
      console.error('Error en login:', error);
      handleShowModal('CORREO O CONTRASEÑA INCORRECTOS', 'error');
      generateRandomNumber(); // Genera un nuevo captcha
      setCaptchaInput('');
    }
  };

  // Redirige al formulario de registro
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

        {/* Formulario unificado de Login y Captcha */}
        <form onSubmit={handleLoginSubmit} className="login-form">
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

          {/* Captcha Simulation Section */}
          <div className="captcha-group">
            <div className="captcha-display">
              <span>{randomNumber}</span>
              <button
                type="button"
                className="refresh-captcha-button"
                onClick={() => {
                  generateRandomNumber();
                  setCaptchaInput('');
                }}
              >
                Generar Nuevo
              </button>
            </div>
            <input
              type="text"
              placeholder="Escribe el número"
              className="form-group input"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
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
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default LoginPage;
