import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FormBuilder from './components/FormBuilder';
import FormRenderer from './components/FormRenderer';
import Settings from './pages/Settings';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        {/* Rota 1: Dashboard (Página Inicial) */}
        <Route path="/" element={<Dashboard />} />

        <Route path="/settings" element={<Settings />} />
        
        {/* Rota 2: FormBuilder (Construtor/Edição) */}
        {/* 'id' pode ser 'new' para novo ou o ID numérico para editar */}
        <Route path="/builder/:id" element={<FormBuilder />} /> 
        
        {/* Rota 3: FormRenderer (Visualização Pública) */}
        <Route path="/form/view/:formId" element={<FormRenderer />} />
        
        {/* Rota de Redirecionamento (Opcional) */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </Router>
  );
}

export default App;