import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Dashboard.css';

const Dashboard = () => {
  const [ordenes, setOrdenes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showTypeModal, setShowTypeModal] = useState(false);
  const [newOrder, setNewOrder] = useState({
    usuario: { idUsuario: '' },
    estadoAst: 'Aprobado',
    tipo: 'Armado',
    codigoEquipo: '',
  });
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [selectedInProcessOrders, setSelectedInProcessOrders] = useState([]);

  const navigate = useNavigate(); 

  const fetchOrdenes = async () => {
    try {
      const response = await fetch('http://localhost:8082/ordenes');
      if (response.ok) {
        const data = await response.json();
        setOrdenes(data);
      } else {
        console.error('Error al obtener órdenes');
      }
    } catch (error) {
      console.error('Error de conexión al servidor');
    }
  };

  useEffect(() => {
    fetchOrdenes();
  }, []);

  const handleCreateOrder = async () => {
    try {
      const response = await fetch('http://localhost:8082/ordenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usuario: { idUsuario: newOrder.usuario.idUsuario },
          estadoAst: newOrder.estadoAst,
          tipo: newOrder.tipo,
          codigoEquipo: newOrder.codigoEquipo,
          fechaCreacion: null,
          fechaSalida: null,
        }),
      });
      if (response.ok) {
        setShowModal(false);
        fetchOrdenes();
      } else {
        alert('Error al crear la orden');
      }
    } catch (error) {
      alert('Error de conexión al crear la orden');
    }
  };

  const handleStartOrdersWithType = async (tipoSeleccionado) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    for (const orderId of selectedOrders) {
      const order = ordenes.find(o => o.idOrdenServicio === orderId);
      if (!order) continue;

      const updatedOrder = {
        usuario: { idUsuario: order.usuario.idUsuario },
        estadoAst: order.estadoAst,
        tipo: tipoSeleccionado,
        codigoEquipo: order.codigoEquipo,
        fechaCreacion: formattedDate,
        fechaSalida: order.fechaSalida,
      };

      try {
        const response = await fetch(`http://localhost:8082/ordenes/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedOrder),
        });
        if (!response.ok) {
          alert(`Error actualizando orden ID ${orderId}`);
        }
      } catch (error) {
        alert(`Error de conexión actualizando orden ID ${orderId}`);
      }
    }

    setSelectedOrders([]);
    setShowTypeModal(false);
    fetchOrdenes();
  };

  const handleFinishOrders = async () => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    for (const orderId of selectedInProcessOrders) {
      const order = ordenes.find(o => o.idOrdenServicio === orderId);
      if (!order) continue;

      const updatedOrder = {
        usuario: { idUsuario: order.usuario.idUsuario },
        estadoAst: order.estadoAst,
        tipo: order.tipo,
        codigoEquipo: order.codigoEquipo,
        fechaCreacion: order.fechaCreacion,
        fechaSalida: formattedDate,
      };

      try {
        const response = await fetch(`http://localhost:8082/ordenes/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedOrder),
        });
        if (!response.ok) {
          alert(`Error actualizando orden ID ${orderId}`);
        }
      } catch (error) {
        alert(`Error de conexión actualizando orden ID ${orderId}`);
      }
    }

    setSelectedInProcessOrders([]);
    fetchOrdenes();
  };

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <h1 className="dashboard-title">Panel Principal</h1>
        <img
          src="/mitsui-logo.png"
          alt="Mitsui Logo"
          className="dashboard-logo"
        />
        <div className="dashboard-buttons">
          <button onClick={() => setShowModal(true)} className="dashboard-button">Crear Orden de Servicio</button>
          <button onClick={fetchOrdenes} className="dashboard-button">Refrescar</button>
        </div>
      </header>

      <div className="kanban-board">
        <div className="kanban-column">
          <h2>To do</h2>
          {ordenes.filter(o => o.estadoAst === 'Aprobado' && !o.fechaCreacion).map(o => (
            <div key={o.idOrdenServicio} className="kanban-card">
              <input
                type="checkbox"
                checked={selectedOrders.includes(o.idOrdenServicio)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedOrders([...selectedOrders, o.idOrdenServicio]);
                  } else {
                    setSelectedOrders(selectedOrders.filter(id => id !== o.idOrdenServicio));
                  }
                }}
              />
              <p><b>ID:</b> {o.idOrdenServicio}</p>
              <p><b>DNI:</b> {o.usuario?.idUsuario}</p>
              <p><b>Tipo:</b> {o.tipo}</p>
              <p><b>Equipo:</b> {o.codigoEquipo}</p>
            </div>
          ))}
          {selectedOrders.length > 0 && (
            <button onClick={() => setShowTypeModal(true)} className="dashboard-button iniciar-button">
              Iniciar
            </button>
          )}
        </div>

        <div className="kanban-column">
          <h2>In process</h2>
          {ordenes.filter(o => o.fechaCreacion && !o.fechaSalida).map(o => (
            <div key={o.idOrdenServicio} className="kanban-card">
              <input
                type="checkbox"
                checked={selectedInProcessOrders.includes(o.idOrdenServicio)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedInProcessOrders([...selectedInProcessOrders, o.idOrdenServicio]);
                  } else {
                    setSelectedInProcessOrders(selectedInProcessOrders.filter(id => id !== o.idOrdenServicio));
                  }
                }}
              />
              <p><b>ID:</b> {o.idOrdenServicio}</p>
              <p><b>DNI:</b> {o.usuario?.idUsuario}</p>
              <p><b>Tipo:</b> {o.tipo}</p>
              <p><b>Equipo:</b> {o.codigoEquipo}</p>
              <p><b>Fecha Inicio:</b> {o.fechaCreacion}</p>

              <button
                className="dashboard-button"
                onClick={() => navigate(`/panel/${o.idOrdenServicio}`)}
              >
                Ver
              </button>
            </div>
          ))}
          {selectedInProcessOrders.length > 0 && (
            <button onClick={handleFinishOrders} className="dashboard-button finalizar-button">
              Finalizar
            </button>
          )}
        </div>

        <div className="kanban-column">
          <h2>Done</h2>
          {ordenes.filter(o => o.fechaSalida).map(o => (
            <div key={o.idOrdenServicio} className="kanban-card">
              <p><b>ID:</b> {o.idOrdenServicio}</p>
              <p><b>DNI:</b> {o.usuario?.idUsuario}</p>
              <p><b>Tipo:</b> {o.tipo}</p>
              <p><b>Equipo:</b> {o.codigoEquipo}</p>
              <p><b>Fecha Inicio:</b> {o.fechaCreacion}</p>
              <p><b>Fecha Salida:</b> {o.fechaSalida}</p>
            </div>
          ))}
        </div>
      </div>


      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Nueva Orden de Servicio</h3>

            <label>DNI Usuario:</label>
            <input
              type="text"
              value={newOrder.usuario.idUsuario}
              onChange={(e) =>
                setNewOrder({ ...newOrder, usuario: { idUsuario: e.target.value } })
              }
            />

            <label>Estado AST:</label>
            <select
              value={newOrder.estadoAst}
              onChange={(e) => setNewOrder({ ...newOrder, estadoAst: e.target.value })}
            >
              <option value="Aprobado">Aprobado</option>
              <option value="Desaprobado">Desaprobado</option>
            </select>

            <label>Tipo:</label>
            <select
              value={newOrder.tipo}
              onChange={(e) => setNewOrder({ ...newOrder, tipo: e.target.value })}
            >
              <option value="Armado">Armado</option>
              <option value="Desarmado">Desarmado</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>

            <label>Código de Equipo:</label>
            <input
              type="text"
              value={newOrder.codigoEquipo}
              onChange={(e) => setNewOrder({ ...newOrder, codigoEquipo: e.target.value })}
            />

            <div className="modal-buttons">
              <button onClick={handleCreateOrder} className="dashboard-button">Guardar Orden</button>
              <button onClick={() => setShowModal(false)} className="dashboard-button cancel">Cancelar</button>
            </div>
          </div>
        </div>
      )}

      {showTypeModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Seleccione el Tipo de Orden para los seleccionados</h3>
            <button
              onClick={() => handleStartOrdersWithType('Armado')}
              className="dashboard-button"
            >
              Armado
            </button>
            <button
              onClick={() => handleStartOrdersWithType('Desarmado')}
              className="dashboard-button"
            >
              Desarmado
            </button>
            <button
              onClick={() => setShowTypeModal(false)}
              className="dashboard-button cancel"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
