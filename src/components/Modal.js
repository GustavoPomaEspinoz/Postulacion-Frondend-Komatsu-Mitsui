import React from 'react';

const Modal = ({ show, onClose, children }) => {
  if (!show) return null;

  return (
    <div style={modalBackdrop}>
      <div style={modalContent}>
        {children}
        <button onClick={onClose} style={closeButton}>Cerrar</button>
      </div>
    </div>
  );
};

const modalBackdrop = {
  position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
  alignItems: 'center', justifyContent: 'center',
};

const modalContent = {
  backgroundColor: '#fff', padding: '20px', borderRadius: '10px', minWidth: '300px',
};

const closeButton = {
  marginTop: '10px', padding: '5px 10px',
};

export default Modal;
