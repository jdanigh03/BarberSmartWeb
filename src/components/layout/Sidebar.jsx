import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logo.png';
import './Sidebar.css';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Limpia datos del usuario (ajústalo según lo que guardes)
    localStorage.removeItem('user');  // o 'token', si usas autenticación
    sessionStorage.clear();           // opcional: limpia todo
    navigate('/');                    // Redirige al login
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <img src={logo} alt="BarberSmart Logo" className="sidebar-logo" />
        <h2>Admin Panel</h2>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/admin/dashboard" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Dashboard
        </NavLink>
        <NavLink to="/admin/barbers" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Barberos
        </NavLink>
        <NavLink to="/admin/users" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Usuarios
        </NavLink>
        <NavLink to="/admin/appointments" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Citas
        </NavLink>
        <NavLink to="/admin/payments" className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>
          Pagos
        </NavLink>
      </nav>
      <div className="sidebar-footer">
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
