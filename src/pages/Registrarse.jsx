import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import logo from '../assets/barbersmart video.mp4';
import './Registrarse.css'; // reutilizamos el mismo CSS base

const Registrarse = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  // MODIFICACIÓN CLAVE: Rol asignado directamente a 'Administrador'
  const [rol, setRol] = useState('Administrador'); 
  const [password, setPassword] = useState('');
  const [confirmarPassword, setConfirmarPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmarPassword) {
      alert('Las contraseñas no coinciden');
      return;
    }

    try {
      const response = await axios.post('http://localhost:3001/api/register', {
        name,
        email,
        telefono,
        rol, // El rol siempre será 'Administrador'
        password,
      });

      if (response.data.success) {
        alert('¡Registro exitoso como Administrador!'); // Mensaje más específico
        navigate('/admin/dashboard'); // Redirigir al dashboard de admin
      } else {
        alert(response.data.message || 'Error al registrar');
      }
    } catch (error) {
      console.error(error);
      alert('Error al registrar. Intente más tarde.');
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
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
        <h1>Registro de Administrador</h1> {/* Título modificado */}
        <p>BarberSmart</p>
        <form onSubmit={handleSubmit} className="login-form">
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
            {/* ELIMINADO: El selector de rol ya no es necesario */}
            {/* <div className="form-group half-width">
              <label htmlFor="rol">Rol</label>
              <select
                id="rol"
                value={rol}
                onChange={(e) => setRol(e.target.value)}
                required
              >
                <option value="Cliente">Cliente</option>
                <option value="Barbero">Barbero</option>
                <option value="Administrador">Administrador</option>
              </select>
            </div> */}
            {/* Opcional: Si quieres mostrar el rol actual, puedes usar un input de solo lectura o un párrafo */}
            <div className="form-group half-width">
              <label htmlFor="rol">Rol Asignado</label>
              <input
                type="text"
                id="rol"
                value={rol} // Mostrar el valor del estado 'rol'
                readOnly // Hacerlo de solo lectura
                className="read-only-input" // Puedes añadir una clase CSS para estilizarlo
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
      </div>
    </div>
  );
};

export default Registrarse;