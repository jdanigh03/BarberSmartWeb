import React, { useState } from 'react'; // Importamos useState
import Sidebar from './components/dashboard'; // Asegúrate de que la ruta sea correcta si moviste Sidebar a 'dashboard'
import Header from './components/Header'; // Asumo que este componente siempre se muestra
import CitasPage from './components/CitasPage'; // Importa CitasPage
import TrabajadoresPage from './components/Trabajadores'; // Importa TrabajadoresPage
import UsuariosPage from './components/UsuariosPage'; // Importa UsuariosPage

import './components/styles.css'; // Estilos globales (incluye el CSS del Sidebar)
// Asegúrate de importar los estilos específicos de cada página aquí si no están ya en los componentes
import './components/CitasPage.css';
import './components/Trabajadores.css';
import './components/Usuarios.css';


function App() {
  // Define el estado para la página actual. 'citas' es el valor por defecto.
  const [currentPage, setCurrentPage] = useState('citas'); 

  // Función para manejar la navegación desde el Sidebar
  const handleNavigate = (pageId) => {
    setCurrentPage(pageId);
  };

  // Función para renderizar el componente de la página actual
  const renderPage = () => {
    switch (currentPage) {
      case 'citas':
        return <CitasPage />;
      case 'trabajadores':
        return <TrabajadoresPage />;
      case 'usuarios':
        return <UsuariosPage />;
      // Si hubiera una página de inicio, podrías agregarla aquí
      // case 'inicio':
      //   return <HomePage />; 
      default:
        // Por si acaso, si la página actual no coincide con ninguna conocida
        return <CitasPage />; 
    }
  };

  return (
    <div className="aplicacion-contenedor">
      {/* Pasamos 'currentPage' como 'activeItem' para que Sidebar resalte el correcto */}
      {/* Pasamos 'handleNavigate' como 'onNavigate' para que Sidebar pueda cambiar la página */}
      <Sidebar activeItem={currentPage} onNavigate={handleNavigate} /> 
      
      <main className="contenido-principal">
        <Header /> {/* El Header se mantiene fijo arriba del contenido de la página */}
        {renderPage()} {/* Aquí se renderiza la página seleccionada */}
      </main>
    </div>
  );
}

export default App;