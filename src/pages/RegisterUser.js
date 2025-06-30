import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; 
import Modal from '../components/Modal';
import './RegisterUser.css';

const RegisterUser = () => {
  const navigate = useNavigate();
  const [dni, setDni] = useState('');
  const [nombre, setNombre] = useState('');
  const [tipoUsuario, setTipoUsuario] = useState('Admin');
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (dni.length !== 8 || !/^\d+$/.test(dni)) {
      setError('El DNI debe tener exactamente 8 dígitos numéricos');
      return;
    }
    const usuario = { idUsuario: dni, nombre, tipoUsuario };
    try {
      const response = await fetch('http://localhost:8082/usuarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(usuario),
      });
      if (response.ok) {
        setShowModal(true);
        setDni('');
        setNombre('');
        setTipoUsuario('Admin');
        setError('');
      } else {
        const data = await response.json();
        setError(`Error al registrar: ${data.message || 'Intente nuevamente'}`);
      }
    } catch (err) {
      setError('Error de conexión con el servidor');
    }
  };

  return (
    <div className="register-container">
      <h2 className="register-title">Registrar Usuario</h2>
      <form className="register-form" onSubmit={handleSubmit}>
        <label>DNI:</label>
        <input type="text" value={dni} onChange={(e) => setDni(e.target.value)} className="register-input" />

        <label>Nombre:</label>
        <input type="text" value={nombre} onChange={(e) => setNombre(e.target.value)} className="register-input" />

        <label>Cargo:</label>
        <select value={tipoUsuario} onChange={(e) => setTipoUsuario(e.target.value)} className="register-select">
          <option value="Admin">Administrador</option>
          <option value="Tecnico">Técnico</option>
        </select>

        <button type="submit" className="register-button">Registrar</button>
        {error && <p className="register-error">{error}</p>}
      </form>

      <button onClick={() => navigate('/dashboard')} className="register-button" style={{ marginTop: '20px', backgroundColor: '#000' }}>
        Ir al Panel Principal
      </button>

      <Modal show={showModal} onClose={() => setShowModal(false)}>
        <p>Datos guardados correctamente ✅</p>
      </Modal>
    </div>
  );
};

export default RegisterUser;
