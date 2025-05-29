import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/barbersmart video.mp4';
import './LoginPage.css';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });

      if (response.data.success) {
        // Guardar sesión temporalmente
        localStorage.setItem('user', JSON.stringify(response.data.user));

        alert('Inicio de sesión exitoso');
        navigate('/admin/dashboard');
      } else {
        alert('Credenciales incorrectas');
      }
    } catch (error) {
      console.error('Error en login:', error);
      alert('Correo o contraseña incorrectos');
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
    </div>
  );
};

export default LoginPage;
