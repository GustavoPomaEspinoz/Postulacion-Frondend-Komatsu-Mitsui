import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './PanelDeTrabajo.css';

const PanelDeTrabajo = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [orden, setOrden] = useState(null);

  const [unplannedMotivo, setUnplannedMotivo] = useState('');
  const [unplannedParada, setUnplannedParada] = useState(null);

  const [plannedMotivo, setPlannedMotivo] = useState('');
  const [plannedParada, setPlannedParada] = useState(null);

  const [mostrarFormularioReprogramar, setMostrarFormularioReprogramar] = useState(false);
  const [motivoReprogramacion, setMotivoReprogramacion] = useState('');
  const [fechaReprogramacion, setFechaReprogramacion] = useState('');

  const fetchOrden = async () => {
    try {
      const response = await fetch(`http://localhost:8082/ordenes`);
      if (response.ok) {
        const data = await response.json();
        const found = data.find(o => o.idOrdenServicio === parseInt(id));
        setOrden(found);
      } else {
        alert('Error al cargar la orden');
      }
    } catch (error) {
      alert('Error de conexión al servidor');
    }
  };

  const fetchParadas = async () => {
    try {
      const response = await fetch(`http://localhost:8082/paradas`);
      if (response.ok) {
        const data = await response.json();

        const paradaUnplanned = data.find(
          p => p.ordenServicio.idOrdenServicio === parseInt(id) && p.motivoTipo === 'UNPLANNED' && p.fechaFin == null
        );
        const paradaPlanned = data.find(
          p => p.ordenServicio.idOrdenServicio === parseInt(id) && p.motivoTipo === 'PLANNED' && p.fechaFin == null
        );

        setUnplannedParada(paradaUnplanned || null);
        setPlannedParada(paradaPlanned || null);
      } else {
        alert('Error al cargar paradas');
      }
    } catch (error) {
      alert('Error de conexión al servidor');
    }
  };

  useEffect(() => {
    fetchOrden();
    fetchParadas();
  }, [id]);

  const crearParada = async (tipo) => {
    const motivo = tipo === 'UNPLANNED' ? unplannedMotivo : plannedMotivo;
    if (!motivo.trim()) {
      alert('Debe ingresar un motivo para la parada.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8082/paradas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordenServicio: { idOrdenServicio: parseInt(id) },
          fechaFin: null,
          motivo,
          motivoTipo: tipo
        }),
      });

      if (response.ok) {
        alert('Parada creada exitosamente.');
        fetchParadas();
        if (tipo === 'UNPLANNED') setUnplannedMotivo('');
        else setPlannedMotivo('');
      } else {
        alert('Error al crear parada.');
      }
    } catch (error) {
      alert('Error de conexión al crear parada.');
    }
  };

  const reanudarParada = async (parada) => {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    try {
      const response = await fetch(`http://localhost:8082/paradas/${parada.idParada}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordenServicio: { idOrdenServicio: parseInt(id) },
          fechaInicio: parada.fechaInicio,
          fechaFin: formattedDate,
          motivo: parada.motivo,
          motivoTipo: parada.motivoTipo
        }),
      });

      if (response.ok) {
        alert('Parada finalizada exitosamente.');
        fetchParadas();
      } else {
        alert('Error al finalizar la parada.');
      }
    } catch (error) {
      alert('Error de conexión al finalizar parada.');
    }
  };

  const finalizarOrden = async () => {
    if (!orden) return;

    const today = new Date();
    const formattedDate = today.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });

    const body = {
      usuario: { idUsuario: orden.usuario?.idUsuario },
      estadoAst: orden.estadoAst,
      tipo: orden.tipo,
      codigoEquipo: orden.codigoEquipo,
      fechaCreacion: orden.fechaCreacion,
      fechaSalida: formattedDate
    };

    try {
      const response = await fetch(`http://localhost:8082/ordenes/${orden.idOrdenServicio}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (response.ok) {
        alert('Orden finalizada exitosamente.');
        navigate('/');
      } else {
        alert('Error al finalizar la orden.');
      }
    } catch (error) {
      alert('Error de conexión al finalizar la orden.');
    }
  };

  const enviarReprogramacion = async () => {
    if (!motivoReprogramacion.trim() || !fechaReprogramacion.trim()) {
      alert('Debe ingresar motivo y fecha de reprogramación.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:8082/reprogramaciones`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ordenServicio: { idOrdenServicio: parseInt(id) },
          motivo: motivoReprogramacion,
          fechaReprogramacion: fechaReprogramacion
        })
      });

      if (response.ok) {
        alert('Reprogramación registrada exitosamente.');
        navigate('/');
      } else {
        alert('Error al registrar la reprogramación.');
      }
    } catch (error) {
      alert('Error de conexión al registrar reprogramación.');
    }
  };

  if (!orden) {
    return <div className="panel-container">Cargando orden...</div>;
  }

  return (
    <div className="panel-container">
      <h1>Panel de Trabajo - OS #{orden.idOrdenServicio}</h1>
      <div className="orden-details">
        <p><strong>ID:</strong> {orden.idOrdenServicio}</p>
        <p><strong>DNI Usuario:</strong> {orden.usuario?.idUsuario}</p>
        <p><strong>Estado AST:</strong> {orden.estadoAst}</p>
        <p><strong>Tipo:</strong> {orden.tipo}</p>
        <p><strong>Código Equipo:</strong> {orden.codigoEquipo}</p>
        <p><strong>Fecha Creación:</strong> {orden.fechaCreacion || 'Sin iniciar'}</p>
        <p><strong>Fecha Salida:</strong> {orden.fechaSalida || 'En proceso'}</p>
      </div>

      {/* Unplanned Downtime */}
      <section className="downtime-section">
        <h2>🛑 Unplanned Downtime</h2>
        <p>Posibles motivos: Falla técnica, corte de energía, accidente inesperado...</p>
        {unplannedParada && (
          <div className="parada-activa">
            <p><strong>Motivo actual:</strong> {unplannedParada.motivo}</p>
            <p><strong>Fecha inicio:</strong> {unplannedParada.fechaInicio}</p>
          </div>
        )}
        <input
          type="text"
          placeholder="Motivo de la parada no planificada"
          value={unplannedMotivo}
          disabled={!!unplannedParada}
          onChange={(e) => setUnplannedMotivo(e.target.value)}
        />
        <div className="downtime-buttons">
          <button onClick={() => crearParada('UNPLANNED')} disabled={!!unplannedParada} className="dashboard-button">Crear Parada</button>
          <button onClick={() => reanudarParada(unplannedParada)} disabled={!unplannedParada} className="dashboard-button">Reanudar</button>
        </div>
      </section>

      {/* Planned Downtime */}
      <section className="downtime-section">
        <h2>🛠️ Planned Downtime</h2>
        <p>Posibles motivos: Mantenimiento programado, inspección periódica, actualización de sistema...</p>
        {plannedParada && (
          <div className="parada-activa">
            <p><strong>Motivo actual:</strong> {plannedParada.motivo}</p>
            <p><strong>Fecha inicio:</strong> {plannedParada.fechaInicio}</p>
          </div>
        )}
        <input
          type="text"
          placeholder="Motivo de la parada planificada"
          value={plannedMotivo}
          disabled={!!plannedParada}
          onChange={(e) => setPlannedMotivo(e.target.value)}
        />
        <div className="downtime-buttons">
          <button onClick={() => crearParada('PLANNED')} disabled={!!plannedParada} className="dashboard-button">Crear Parada</button>
          <button onClick={() => reanudarParada(plannedParada)} disabled={!plannedParada} className="dashboard-button">Reanudar</button>
        </div>
      </section>

      <div className="acciones-finales">
        <button onClick={finalizarOrden} className="dashboard-button finalizar-button">Finalizar Orden</button>
        <button onClick={() => setMostrarFormularioReprogramar(true)} className="dashboard-button reprogramar-button">Reprogramar</button>
      </div>

      {mostrarFormularioReprogramar && (
        <div className="reprogramar-form">
          <h3>📅 Reprogramación de Orden</h3>
          <input
            type="text"
            placeholder="Motivo de la reprogramación"
            value={motivoReprogramacion}
            onChange={(e) => setMotivoReprogramacion(e.target.value)}
          />
          <input
            type="text"
            placeholder="Fecha de reprogramación (DD/MM/YYYY)"
            value={fechaReprogramacion}
            onChange={(e) => setFechaReprogramacion(e.target.value)}
          />
          <div className="downtime-buttons">
            <button onClick={enviarReprogramacion} className="dashboard-button">Confirmar Reprogramación</button>
            <button onClick={() => setMostrarFormularioReprogramar(false)} className="dashboard-button volver-button">Cancelar</button>
          </div>
        </div>
      )}

      <button onClick={() => navigate(-1)} className="dashboard-button volver-button">Volver</button>
    </div>
  );
};

export default PanelDeTrabajo;
