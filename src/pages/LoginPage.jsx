import React, { useState, useEffect } from 'react'; 
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ReCAPTCHA from 'react-google-recaptcha'; // Importar ReCAPTCHA
import logo from '../assets/barbersmart video.mp4';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalType, setModalType] = useState('');
  const [captchaToken, setCaptchaToken] = useState(null); // Nuevo estado para almacenar el token del captcha
  const MAX_ATTEMPTS = 3;
  const [attempts, setAttempts] = useState(0); 
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

    if (attempts >= MAX_ATTEMPTS) {
      handleShowModal('Has superado el número máximo de intentos. Intenta más tarde.', 'error');
      return;
    }

    if (!captchaToken) {
      handleShowModal('Por favor, verifica el CAPTCHA.', 'error');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
        recaptchaToken: captchaToken // Enviar el token del CAPTCHA al backend
      });

      if (response.data.success) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        handleShowModal('INICIO DE SESIÓN EXITOSO', 'success');
        setAttempts(0); 
        setTimeout(() => {
          navigate('/admin/dashboard');
        }, 3500); 
      } else {
        setAttempts(attempts + 1); 
        handleShowModal('CREDENCIALES INCORRECTAS', 'error');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setAttempts(attempts + 1); 
      handleShowModal('CORREO O CONTRASEÑA INCORRECTOS', 'error');
    }
  };

  const handleRegisterClick = () => {
    navigate('/registrarse');
  };

  const onCaptchaChange = (token) => {
    setCaptchaToken(token); // Capturar el token generado por reCAPTCHA
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-logo-container">
          <video src={logo} className="login-logo" autoPlay loop muted playsInline />
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

          {/* Aquí añadimos el widget de reCAPTCHA */}
          <ReCAPTCHA
            sitekey="6LesVVsrAAAAABv7R963HbNmh-0DihtbeSObHX8t" // Aquí va tu clave pública de Google reCAPTCHA
            onChange={onCaptchaChange}
          />

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
