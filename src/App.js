import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import RegisterUser from './pages/RegisterUser';
import PanelDeTrabajo from './pages/PanelDeTrabajo';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/register" element={<RegisterUser />} />
        <Route path="/panel/:id" element={<PanelDeTrabajo />} />
      </Routes>
    </Router>
  );
}

export default App;
