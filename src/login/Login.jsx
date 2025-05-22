import { useState } from 'react';
import axios from 'axios';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [usuario, setUsuario] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();


    try {
      const res = await axios.post('http://localhost:3001/api/login', {
        email,
        password,
      });

      if (res.data.success) {
        setUsuario(res.data.user);
        setMensaje('Login exitoso');
        alert(`¡Bienvenido, ${res.data.user.name}!`);
      } else {
        setMensaje('Credenciales incorrectas');
      }
    } catch (error) {
      setMensaje('Error al conectar con el servidor');
      console.error(error);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Login</h2>
      {mensaje && <p>{mensaje}</p>}

      {!usuario ? (
        <form onSubmit={handleSubmit}>
          <div>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label>Contraseña:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit">Iniciar sesión</button>
        </form>
      ) : (
        <div>
          <h3>Bienvenido, {usuario.name}</h3>
          <p>Email: {usuario.email}</p>
          <img
            src={usuario.profile_image || usuario.avatar || ''}
            alt="Perfil"
            style={{ width: 100, height: 100, objectFit: 'cover' }}
          />
        </div>
      )}
    </div>
  );
}

export default Login;
