import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import BarbersPage from './pages/BarbersPage';
import UsersPage from './pages/UsersPage';
import AppointmentsPage from './pages/AppointmentsPage';
import PaymentsPage from './pages/PaymentsPage';
import Registrarse from './pages/Registrarse';
// Importa el nuevo componente para citas de usuario
import UserAppointmentsPage from './pages/UserAppointmentsPage'; // <-- ¡Asegúrate de que esta ruta sea correcta!

// Un componente simple para rutas protegidas (simulado por ahora)
const ProtectedRoute = ({ children }) => {
  // Aquí deberías verificar si el usuario está autenticado
  const isAuthenticated = true; // Cambia esto por tu lógica de autenticación real
  if (!isAuthenticated) {
    // Si no está autenticado, redirige al login
    return <Navigate to="/login" replace />;
  }
  return children;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          {/* Estas rutas son relativas a /admin y se renderizan dentro de AdminLayout */}
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="barbers" element={<BarbersPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="appointments" element={<AppointmentsPage />} />
          <Route path="payments" element={<PaymentsPage />} />
          {/* NUEVA RUTA: Para citas de un usuario específico dentro del AdminLayout */}
          <Route path="appointments/:userId" element={<UserAppointmentsPage />} /> {/* <-- Añadida aquí */}
          {/* Redirección por defecto para /admin a /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" replace />} />
        </Route>
        {/* Redirección por defecto para la raíz / a /login */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        {/* Puedes agregar una página 404 aquí si lo deseas */}
        <Route path="*" element={<div><h1>404 - Página No Encontrada</h1><p><a href="/login">Ir a Login</a></p></div>} />
        <Route path="/registrarse" element={<Registrarse />} />
      </Routes>
    </Router>
  );
}

export default App;