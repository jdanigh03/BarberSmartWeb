import React from 'react';
// Importa tu imagen de perfil si la tienes, por ejemplo:
// import userProfilePic from '../assets/user-profile.jpg'; // Asegúrate de tener esta imagen

function Sidebar({ activeItem = 'citas' }) { // 'citas' como default, puedes cambiarlo
  const menuItems = [
    { id: 'citas', label: 'Citas', icon: 'fas fa-calendar-alt', href: '#citas' },
    { id: 'trabajadores', label: 'Lista de Trabajadores', icon: 'fas fa-hard-hat', href: '#trabajadores' }, // Icono para trabajadores
    { id: 'usuarios', label: 'Lista de Usuarios', icon: 'fas fa-users', href: '#usuarios' }, // Icono para usuarios
    // Se eliminaron 'Inicio', 'Historial Pacientes' y 'Reportes Generales'
  ];

  return (
    <aside className="sidebar-navegacion">
      <div className="sidebar-usuario-perfil">
        <div className="usuario-avatar">
          {/* Aquí va tu imagen de perfil. */}
          <img src="./public/admin.webp" alt="Foto de Perfil" className="foto-perfil" />
          {/* Si prefieres el icono de Font Awesome en lugar de una imagen:
          <i className="fas fa-user-circle icono-avatar-admin"></i>
          */}
        </div>
        <span className="usuario-nombre-admin">admin</span>
      </div>

      <nav className="sidebar-menu">
        <ul className="menu-lista">
          {menuItems.map((item) => (
            <li className="menu-item" key={item.id}>
              <a 
                href={item.href} 
                className={`menu-enlace menu-enlace-${item.id} ${item.id === activeItem ? 'active' : ''}`}
              >
                <i className={`${item.icon} menu-icono-${item.id}`}></i>
                <span className="menu-texto">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;