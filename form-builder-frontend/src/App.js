import React, { useState } from 'react';
import FormBuilder from './components/FormBuilder';
import FormRenderer from './components/FormRenderer';
import './index.css';

function App() {
  // Estado para simular qual componente estamos vendo
  const [mode, setMode] = useState('builder'); // 'builder' ou 'renderer'
  const TEST_FORM_ID = 20; // SUBSTITUA PELO ID REAL DO SEU FORMULÁRIO SALVO!

  return (
    <div>
      {/* Menu de Navegação Simples (para alternar) */}
      <div className="p-4 bg-gray-800 text-white flex justify-center space-x-4">
        <button
          onClick={() => setMode('builder')}
          className={`px-4 py-2 rounded font-medium ${mode === 'builder' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          ⚙️ Construtor de Formulários
        </button>
        <button
          onClick={() => setMode('renderer')}
          className={`px-4 py-2 rounded font-medium ${mode === 'renderer' ? 'bg-indigo-600' : 'bg-gray-700 hover:bg-gray-600'}`}
        >
          📄 Visualizar Formulário
        </button>
      </div>

      {/* Renderiza o componente selecionado */}
      {mode === 'builder' ? (
        <FormBuilder />
      ) : (
        // Agora passa o ID de teste real para o FormRenderer
        <FormRenderer formId={TEST_FORM_ID} />
      )}
    </div>
  );
}

export default App;