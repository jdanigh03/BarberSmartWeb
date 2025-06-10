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
    }, 3000);
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

  // **CAMBIO:** Nuevo estado para la cuenta regresiva
  const [countdown, setCountdown] = useState(10);

  const navigate = useNavigate();

  // Genera un número aleatorio de 6 dígitos para el captcha
  const generateRandomNumber = () => {
    const number = Math.floor(Math.random() * 900000) + 100000;
    setRandomNumber(number);
  };

  // **CAMBIO:** useEffect ahora maneja el contador y la regeneración.
  useEffect(() => {
    // Genera el primer número al cargar el componente
    generateRandomNumber();

    const intervalId = setInterval(() => {
      setCountdown(prevCountdown => {
        if (prevCountdown <= 1) {
          generateRandomNumber(); // Regenera el código
          return 10; // Reinicia el contador
        }
        return prevCountdown - 1; // Decrementa el contador
      });
    }, 1000); // Se ejecuta cada segundo

    return () => clearInterval(intervalId); // Limpia el intervalo al desmontar
  }, []); // El array vacío asegura que se ejecute solo una vez al montar

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

  const handleLoginSubmit = async (e) => {
    e.preventDefault();

    if (attempts >= maxAttempts) {
      handleShowModal('Has superado el número de intentos. Inténtalo de nuevo más tarde.', 'error');
      generateRandomNumber();
      setCountdown(10); // Reinicia el contador
      setCaptchaInput('');
      return;
    }

    if (captchaInput !== String(randomNumber)) {
      const newAttempts = attempts + 1;
      setAttempts(newAttempts);
      handleShowModal(`Código incorrecto. Te quedan ${maxAttempts - newAttempts} intentos.`, 'error');
      generateRandomNumber();
      setCountdown(10); // Reinicia el contador
      setCaptchaInput('');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });

      if (response.data.success) {
        setAttempts(0);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        handleShowModal('INICIO DE SESIÓN EXITOSO', 'success');
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 3500);
      } else {
        handleShowModal('CREDENCIALES INCORRECTAS', 'error');
        generateRandomNumber();
        setCountdown(10); // Reinicia el contador
        setCaptchaInput('');
      }
    } catch (error) {
      console.error('Error en login:', error);
      handleShowModal('CORREO O CONTRASEÑA INCORRECTOS', 'error');
      generateRandomNumber();
      setCountdown(10); // Reinicia el contador
      setCaptchaInput('');
    }
  };

  const handleRegisterClick = () => {
    navigate('/registrarse');
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo-container">
          <video src={logo} className="login-logo" autoPlay loop muted playsInline />
        </div>
        <h1>Acceso Administrador</h1>
        <p>BarberSmart</p>

        <form onSubmit={handleLoginSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo Electrónico</label>
            <input type="email" id="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>

          <div className="captcha-group">
            <div className="captcha-display">
              <span>{randomNumber}</span>
              {/* **CAMBIO:** El botón ahora muestra la cuenta regresiva y la reinicia al hacer clic. */}
              <button
                type="button"
                className="refresh-captcha-button"
                title="Generar Nuevo"
                onClick={() => {
                  generateRandomNumber();
                  setCaptchaInput('');
                  setCountdown(10); // Reinicia el contador al hacer clic manual
                }}
              >
                {countdown}
              </button>
            </div>
            <input
              type="text"
              placeholder="Escribe el número"
              className="form-group input"
              value={captchaInput}
              onChange={(e) => setCaptchaInput(e.target.value)}
              required
              onInvalid={e => e.target.setCustomValidity('Llena el código de verificación, por favor.')}
              onInput={e => e.target.setCustomValidity('')}
            />
          </div>

          <button type="submit" className="login-button">Ingresar</button>
        </form>

        <button onClick={handleRegisterClick} className="register-link">
          ¿No tienes cuenta? Registrarse
        </button>
      </div>

      {showModal && (
        <MessageModal message={modalMessage} type={modalType} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default LoginPage;