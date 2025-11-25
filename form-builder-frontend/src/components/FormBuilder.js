import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory';
import ThemePanel from './ThemePanel'; 

// --- FieldComponent ---
const FieldComponent = ({ field, onUpdate, onRemove, theme }) => {
  const handleUpdateOption = (optionId, newValue) => {
    const updatedOptions = field.options.map(opt => opt.id === optionId ? { ...opt, value: newValue } : opt);
    onUpdate(field.id, 'options', updatedOptions);
  };
  const handleRemoveOption = (optionId) => {
    const updatedOptions = field.options.filter(opt => opt.id !== optionId);
    onUpdate(field.id, 'options', updatedOptions);
  };
  const handleAddOption = () => {
    const newOption = { id: Date.now(), value: `Opção ${field.options.length + 1}` };
    onUpdate(field.id, 'options', [...field.options, newOption]);
  };

  return (
    <div className="p-5 border rounded-lg bg-white shadow-sm transition-all hover:shadow-md relative group">
      <div className="flex justify-between items-start mb-4">
        <input
          type="text"
          value={field.label}
          onChange={(e) => onUpdate(field.id, 'label', e.target.value)}
          className="text-lg font-semibold text-gray-800 border-b-2 border-transparent focus:border-indigo-500 focus:outline-none w-full"
          placeholder="Digite sua pergunta"
        />
        <button onClick={() => onRemove(field.id)} className="ml-4 text-red-400 hover:text-red-600 transition-colors" title="Excluir">
           <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
             <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
           </svg>
        </button>
      </div>

      <div className="space-y-3">
        {(field.type === 'text' || field.type === 'textarea') && (
          <>
            <div className="mb-2 opacity-60">
              {field.type === 'text' ? (
                <input type="text" className="w-full p-2 border rounded bg-gray-50" disabled placeholder="Resposta curta..." />
              ) : (
                <textarea className="w-full p-2 border rounded bg-gray-50" rows="3" disabled placeholder="Resposta longa..." />
              )}
            </div>
            <input
              type="text"
              value={field.placeholder || ''}
              onChange={(e) => onUpdate(field.id, 'placeholder', e.target.value)}
              className="w-full text-sm text-gray-500 border-b focus:outline-none"
              placeholder="Texto de ajuda (placeholder)"
            />
          </>
        )}

        {(field.type === 'checkbox' || field.type === 'radio') && (
          <div className="space-y-2">
            {field.options.map((option) => (
              <div key={option.id} className="flex items-center">
                <div className={`w-4 h-4 border-2 ${field.type === 'radio' ? 'rounded-full' : 'rounded'} border-gray-300 mr-3`}></div>
                <input
                  type="text"
                  value={option.value}
                  onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                  className="w-full border-b border-transparent focus:border-gray-300 focus:outline-none text-gray-700"
                />
                <button onClick={() => handleRemoveOption(option.id)} className="ml-2 text-gray-400 hover:text-red-500">×</button>
              </div>
            ))}
            <button
              onClick={handleAddOption}
              className="mt-2 text-sm font-medium hover:opacity-80 transition-opacity flex items-center"
              style={{ color: theme.primaryColor }}
            >
              + Adicionar Opção
            </button>
          </div>
        )}
      </div>
      
      <div className="mt-4 pt-2 border-t border-gray-100 flex justify-end">
         <label className="text-xs text-gray-500 flex items-center gap-1 cursor-pointer">
            <input 
                type="checkbox" 
                checked={field.required} 
                onChange={(e) => onUpdate(field.id, 'required', e.target.checked)}
            /> 
            Obrigatório
         </label>
      </div>
    </div>
  );
};

// --- FormBuilder ---
const FormBuilder = () => {
  const { state: fields, setState: setFields, undo, redo, canUndo, canRedo } = useHistory([]);
  
  const [title, setTitle] = useState("Novo Formulário");
  const [description, setDescription] = useState("Preencha os dados abaixo.");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [lastSavedId, setLastSavedId] = useState(null);

  // Estados de Tema
  const [theme, setTheme] = useState({
    primaryColor: '#4f46e5', 
    backgroundColor: '#ffffff',
  });

  // Estado para controlar a visibilidade do painel de tema (Sidebar)
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);

  const FIELD_TYPES = [
    { type: 'text', label: 'Texto Curto', icon: '📝' },
    { type: 'textarea', label: 'Texto Longo', icon: '📃' },
    { type: 'checkbox', label: 'Múltipla Escolha', icon: '☑️' },
    { type: 'radio', label: 'Opção Única', icon: '🔘' },
  ];

  const createNewField = (type) => ({
      id: Date.now(),
      type,
      label: 'Nova Pergunta',
      required: false,
      placeholder: 'Sua resposta...',
      options: (type === 'checkbox' || type === 'radio') ? [{ id: Date.now(), value: 'Opção 1' }] : undefined,
  });

  const handleAddField = (type) => setFields([...fields, createNewField(type)]);
  const handleRemoveField = (id) => setFields(fields.filter(f => f.id !== id));
  const handleUpdateField = (id, prop, val) => {
      setFields(fields.map(f => f.id === id ? { ...f, [prop]: val } : f));
  };

  const handleSaveForm = async () => {
    setFeedback({ type: '', message: '' });
    setIsSaving(true);
    try {
      const payload = { title, description, theme, fields };
      const response = await fetch('http://localhost:8080/api/forms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Erro no servidor");
      const data = await response.json();
      setFeedback({ type: 'success', message: `Salvo com ID: ${data.formId}` });
      setLastSavedId(data.formId);
    } catch (error) {
      setFeedback({ type: 'error', message: `Erro ao salvar: ${error.message}` });
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateLink = () => {
    if (!lastSavedId) {
      alert("Por favor, salve o formulário primeiro para gerar o link.");
      return;
    }
    const shareUrl = `${window.location.origin}/view/${lastSavedId}`; 
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setFeedback({ type: 'success', message: 'Link copiado!' });
      })
      .catch(err => {
        console.error('Erro ao copiar:', err);
        alert(`Link: ${shareUrl}`);
      });
  };

  return (
    <div 
      className="min-h-screen p-8 flex justify-center transition-colors duration-500 relative" // Adicionado relative
      style={{ backgroundColor: theme.backgroundColor }}
    >
      
      {/* --- Botões de Ação (Topo Direito) --- */}
      <div className="absolute top-4 right-4 flex space-x-2 z-10">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded transition shadow-sm ${!canUndo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          title="Desfazer"
        >
          ↩️ 
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded transition shadow-sm ${!canRedo ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
          title="Refazer"
        >
          ↪️ 
        </button>
        
        {/* Botão para Abrir Painel de Tema */}
        <button
          onClick={() => setIsThemePanelOpen(true)}
          className="px-4 py-2 rounded bg-white text-gray-700 hover:bg-gray-50 shadow-sm transition font-medium flex items-center gap-2"
        >
          🎨 Tema
        </button>
      </div>

      {/* --- Área Central do Formulário --- */}
      <div className="flex-grow max-w-3xl bg-white shadow-xl rounded-lg overflow-hidden flex flex-col border border-gray-200 z-0">
        
        <div 
            className="p-8 border-b border-gray-100"
            style={{ borderTop: `8px solid ${theme.primaryColor}` }}
        >
          <input
            type="text"
            className="w-full text-4xl font-bold text-gray-800 placeholder-gray-300 border-none focus:ring-0 p-0"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do Formulário"
          />
          <input
            className="w-full mt-2 text-lg text-gray-500 placeholder-gray-300 border-none focus:ring-0 p-0"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição"
          />
        </div>

        <div className="p-8 space-y-6 flex-grow bg-white min-h-[400px]">
          {fields.length === 0 && (
            <div className="text-center text-gray-400 mt-10 dashed border-2 border-gray-200 rounded-lg p-10">
              O formulário está vazio. Adicione campos ao lado.
            </div>
          )}
          {fields.map(field => (
            <FieldComponent
              key={field.id}
              field={field}
              theme={theme} 
              onUpdate={handleUpdateField}
              onRemove={handleRemoveField}
            />
          ))}
        </div>

        {/* Rodapé */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
           <span className={`text-sm font-medium ${feedback.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
             {feedback.message}
           </span>
           
           <button
             onClick={handleSaveForm}
             disabled={isSaving}
             className="px-8 py-3 text-white font-bold rounded shadow hover:opacity-90 transition-all disabled:opacity-50"
             style={{ backgroundColor: theme.primaryColor }} // Cor dinâmica
           >
             {isSaving ? 'Salvando...' : 'Salvar Formulário'}
           </button>
        </div>
      </div>

      {/* --- Sidebar Estática (Paleta e Ações) --- */}
      <div className="ml-8 w-80 flex-shrink-0 space-y-6 z-0">
        <div className="bg-white p-5 rounded-lg shadow-lg border border-gray-200 sticky top-8">
            
            {/* (Botões de histórico removidos daqui, agora estão no topo) */}

            <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-3">Campos</h3>
            <div className="space-y-2">
                {FIELD_TYPES.map(t => (
                    <button 
                        key={t.type} 
                        onClick={() => handleAddField(t.type)}
                        className="w-full text-left px-4 py-3 bg-white border border-gray-200 rounded hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center gap-3 shadow-sm"
                    >
                        <span className="text-xl">{t.icon}</span>
                        <span className="font-medium text-gray-700">{t.label}</span>
                    </button>
                ))}
            </div>

            {/* Área de Ações Pós-Salvar */}
            {lastSavedId && (
                <div className="mt-6 space-y-3 pt-6 border-t border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Ações</h3>
                    
                    <button 
                        onClick={handleGenerateLink}
                        className="w-full py-3 bg-pink-600 text-white font-bold rounded shadow hover:bg-pink-700 transition-colors flex justify-center items-center gap-2"
                    >
                        🔗 Copiar Link
                    </button>

                    <button 
                       onClick={() => window.open(`http://localhost:8080/api/responses/${lastSavedId}`, '_blank')}
                       className="w-full py-3 border-2 border-blue-100 text-blue-600 font-bold rounded hover:bg-blue-50 transition-colors flex justify-center items-center gap-2"
                    >
                       📥 Baixar CSV
                    </button>
                </div>
            )}
        </div>
      </div>

      {/* --- Sidebar de Tema Deslizante (NOVO) --- */}
      <div 
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl transition-transform duration-300 transform p-6 z-50 overflow-y-auto 
             ${isThemePanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">🎨 Personalizar</h2>
          <button onClick={() => setIsThemePanelOpen(false)} className="text-gray-500 hover:text-gray-900 p-2">
            ✕
          </button>
        </div>

        {/* Componente do Painel de Tema */}
        <ThemePanel theme={theme} setTheme={setTheme} />

      </div>

    </div>
  );
};

export default FormBuilder;