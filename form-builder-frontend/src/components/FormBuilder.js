import React, { useState } from 'react';
import { useHistory } from '../hooks/useHistory'; // Verifique o caminho
import ThemePanel from './ThemePanel'; // Verifique o caminho

// === IMPORTS DO DRAG & DROP ===
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

// === Função utilitária para reordenar ===
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// ============================
// COMPONENTE FieldComponent
// (Versão Otimizada: Alça e Conteúdo separados)
// ============================
const FieldComponent = ({ field, onUpdate, onRemove, theme, isDragging, dragHandleProps }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    onUpdate(field.id, name, newValue);
  };

  const handleUpdateOption = (optionId, newValue) => {
    const updatedOptions = field.options.map(opt =>
      opt.id === optionId ? { ...opt, value: newValue } : opt
    );
    onUpdate(field.id, 'options', updatedOptions);
  };

  const handleRemoveOption = (optionId) => {
    const updatedOptions = field.options.filter(opt => opt.id !== optionId);
    onUpdate(field.id, 'options', updatedOptions);
  };

  const handleAddOption = () => {
    const newOption = {
      id: Date.now(),
      value: `Opção ${field.options.length + 1}`
    };
    onUpdate(field.id, 'options', [...field.options, newOption]);
  };

  return (
    <div
      className={`p-4 border rounded-lg bg-white shadow-sm transition flex items-start relative
      ${isEditing ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500' : 'hover:shadow-md'}
      ${isDragging ? 'bg-indigo-50 border-indigo-500 shadow-xl ring-2 ring-indigo-200 z-50' : ''}`}
    >
      
      {/* === 1. ALÇA DE ARRASTAR (DRAG HANDLE) === 
          Isolada do clique de edição. Recebe as props de drag handle aqui. */}
      <div 
        {...dragHandleProps} 
        className="mt-1 mr-3 p-2 rounded hover:bg-gray-100 text-gray-400 cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors select-none"
        title="Clique e arraste para mover"
      >
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* === 2. CONTEÚDO PRINCIPAL (CLICK TO EDIT) === 
          O evento de clique fica APENAS aqui */}
      <div 
        className="flex-grow cursor-pointer"
        onClick={() => !isEditing && setIsEditing(true)}
      >
        {/* Visualização do Cabeçalho (Rótulo) */}
        <div className="flex justify-between items-start mb-3">
          {isEditing ? (
            <input
              type="text"
              name="label"
              value={field.label}
              onChange={handleChange}
              className="text-lg font-semibold text-gray-800 border-b-2 border-indigo-300 
                        focus:border-indigo-500 focus:outline-none w-full mr-4 bg-transparent"
              placeholder="Digite sua pergunta"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800 select-none">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </p>
          )}

          {/* Botão de remoção rápida (visível sempre) */}
          {!isEditing && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
              className="text-red-300 hover:text-red-500 transition-colors"
            >
               <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </button>
          )}
        </div>

        {/* Pré-visualização do Input (Disabled) */}
        <div className="space-y-3 pointer-events-none">
          {(field.type === "text" || field.type === "textarea") && (
            <>
              <div className="mb-2 opacity-80">
                {field.type === "text" ? (
                  <input type="text" disabled className="w-full p-2 border rounded bg-gray-50" placeholder="Resposta curta..." />
                ) : (
                  <textarea rows="3" disabled className="w-full p-2 border rounded bg-gray-50" placeholder="Resposta longa..."></textarea>
                )}
              </div>
              {/* O Placeholder só aparece na edição para não poluir a view */}
            </>
          )}

          {(field.type === "checkbox" || field.type === "radio") && (
            <div className="space-y-2">
              {field.options?.map((option) => (
                <div key={option.id} className="flex items-center">
                  <div className={`w-4 h-4 border-2 mr-3 ${field.type === "radio" ? "rounded-full" : "rounded"} border-gray-300`}></div>
                  <span className="text-gray-600 w-full border-b border-transparent">{option.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Painel de Edição Detalhada (Só aparece se isEditing === true) */}
        {isEditing && (
          <div 
             className="mt-6 pt-4 border-t border-indigo-100 cursor-default"
             onClick={(e) => e.stopPropagation()} // Impede fechar ao clicar no painel
          >
            {/* Opções de Texto */}
            {(field.type === "text" || field.type === "textarea") && (
               <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Texto de Ajuda</label>
                  <input
                    type="text"
                    value={field.placeholder || ""}
                    onChange={(e) => onUpdate(field.id, "placeholder", e.target.value)}
                    className="w-full text-sm text-gray-700 border p-2 rounded focus:ring-2 focus:ring-indigo-200 outline-none"
                    placeholder="Ex: Digite seu nome completo"
                  />
               </div>
            )}

            {/* Opções de Multipla Escolha */}
            {(field.type === "checkbox" || field.type === "radio") && (
              <div className="mb-4 bg-gray-50 p-3 rounded border border-gray-200">
                <label className="block text-sm font-medium text-gray-700 mb-2">Editar Opções:</label>
                {field.options.map((option) => (
                  <div key={option.id} className="flex items-center mb-2">
                     <div className={`w-3 h-3 border mr-2 ${field.type === "radio" ? "rounded-full" : "rounded"} border-gray-400`}></div>
                     <input
                      type="text"
                      value={option.value}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                      className="flex-grow text-sm border p-1 rounded focus:border-indigo-500 outline-none"
                    />
                    <button onClick={() => handleRemoveOption(option.id)} className="ml-2 text-gray-400 hover:text-red-500 p-1">×</button>
                  </div>
                ))}
                <button
                  onClick={handleAddOption}
                  className="mt-2 text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center"
                >
                  + Adicionar Opção
                </button>
              </div>
            )}

            {/* Rodapé da Edição */}
            <div className="flex justify-between items-center mt-4">
               <label className="text-sm text-gray-600 flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate(field.id, 'required', e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
                Obrigatório
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => onRemove(field.id)}
                  className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-transparent hover:border-red-200 transition"
                >
                  Excluir
                </button>
                <button 
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow transition"
                >
                  Concluído
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

// ============================
// COMPONENTE FormBuilder
// ============================
const FormBuilder = () => {
  const { state: fields, setState: setFields, undo, redo, canUndo, canRedo } = useHistory([]);

  const [title, setTitle] = useState("Novo Formulário");
  const [description, setDescription] = useState("Preencha os dados abaixo.");
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState({ type: '', message: '' });
  const [lastSavedId, setLastSavedId] = useState(null);

  const [theme, setTheme] = useState({
    primaryColor: '#4f46e5',
    backgroundColor: '#f3f4f6',
  });

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
    label: "Nova Pergunta",
    required: false,
    placeholder: "Sua resposta...",
    options:
      type === "checkbox" || type === "radio"
        ? [{ id: Date.now(), value: "Opção 1" }]
        : undefined,
  });

  const handleAddField = (type) => setFields([...fields, createNewField(type)]);
  const handleRemoveField = (id) => setFields(fields.filter(f => f.id !== id));

  const handleUpdateField = (id, prop, val) => {
    setFields(fields.map(f => (f.id === id ? { ...f, [prop]: val } : f)));
  };

  // ============================
  // FUNÇÃO DE DRAG & DROP
  // ============================
  const onDragEnd = (result) => {
    if (!result.destination) return;
    if (result.source.index === result.destination.index) return;

    const newFields = reorder(fields, result.source.index, result.destination.index);
    setFields(newFields);
  };

  // ============================
  // SALVAR FORMULÁRIO
  // ============================
  const handleSaveForm = async () => {
    setFeedback({ type: '', message: '' });
    setIsSaving(true);

    try {
      const payload = { title, description, theme, fields };
      const response = await fetch("http://localhost:8080/api/forms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Erro no servidor");

      const data = await response.json();
      setFeedback({ type: "success", message: `Salvo com ID: ${data.formId}` });
      setLastSavedId(data.formId);

    } catch (error) {
      setFeedback({ type: "error", message: `Erro ao salvar: ${error.message}` });
    }
    setIsSaving(false);
  };

  const handleGenerateLink = () => {
    if (!lastSavedId) return alert("Salve o formulário antes!");
    const shareUrl = `${window.location.origin}/view/${lastSavedId}`;
    navigator.clipboard.writeText(shareUrl)
      .then(() => setFeedback({ type: 'success', message: 'Link copiado!' }))
      .catch(() => alert(`Link: ${shareUrl}`));
  };

  return (
    <div
      className="min-h-screen p-8 flex justify-center transition-colors duration-500 relative"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* AÇÕES TOPO DIREITO */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded shadow-sm transition ${!canUndo ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
        >
          ↩️
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded shadow-sm transition ${!canRedo ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"}`}
        >
          ↪️
        </button>
        <button
          onClick={() => setIsThemePanelOpen(true)}
          className="px-4 py-2 rounded bg-white shadow hover:bg-gray-50 transition font-medium flex items-center gap-2"
        >
          🎨 Tema
        </button>
      </div>

      {/* CAIXA CENTRAL */}
      <div className="flex-grow max-w-3xl bg-white shadow-xl rounded-lg overflow-hidden flex flex-col border h-fit">
        
        {/* CABEÇALHO */}
        <div
          className="p-8 border-b"
          style={{ borderTop: `8px solid ${theme.primaryColor}` }}
        >
          <input
            type="text"
            className="w-full text-4xl font-bold text-gray-800 border-none focus:ring-0 placeholder-gray-300"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título do Formulário"
          />
          <input
            className="w-full mt-2 text-lg text-gray-500 border-none focus:ring-0 placeholder-gray-300"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descrição do formulário"
          />
        </div>

        {/* ============================ */}
        {/* ÁREA DE CAMPOS (COM DRAG&DROP CORRIGIDO) */}
        {/* ============================ */}
        <div className="p-8 space-y-6 flex-grow bg-white min-h-[400px]">
          
          {/* A CORREÇÃO PRINCIPAL: DragDropContext engloba TUDO */}
          <DragDropContext onDragEnd={onDragEnd}>
            
            {fields.length === 0 ? (
              // Estado Vazio
              <div className="text-center text-gray-400 mt-10 border-2 border-dashed border-gray-200 rounded-lg p-10">
                <p className="text-xl">O formulário está vazio.</p>
                <p className="text-sm">Adicione campos usando o menu lateral.</p>
              </div>
            ) : (
              // Lista Arrastável
              <Droppable droppableId="form-fields-list">
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="space-y-4"
                  >
                    {fields.map((field, index) => (
                      <Draggable
                        key={field.id}
                        draggableId={String(field.id)}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps} 
                            style={{ ...provided.draggableProps.style }} 
                            className="mb-4"
                          >
                            <FieldComponent
                              field={field}
                              theme={theme}
                              onUpdate={handleUpdateField}
                              onRemove={handleRemoveField}
                              isDragging={snapshot.isDragging}
                              dragHandleProps={provided.dragHandleProps} 
                            />
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            )}

          </DragDropContext>

        </div>

        {/* RODAPÉ */}
        <div className="p-6 bg-gray-50 border-t flex justify-between items-center sticky bottom-0 z-10">
          <span className={`text-sm font-medium ${feedback.type === "success" ? "text-green-600" : "text-red-600"}`}>
            {feedback.message}
          </span>

          <button
            onClick={handleSaveForm}
            disabled={isSaving}
            className="px-8 py-3 text-white font-bold rounded shadow hover:opacity-90 disabled:opacity-50 transition-opacity"
            style={{ backgroundColor: theme.primaryColor }}
          >
            {isSaving ? "Salvando..." : "Salvar Formulário"}
          </button>
        </div>
      </div>

      {/* PAINEL LATERAL (CAMPOS) */}
      <div className="ml-8 w-80 flex-shrink-0 space-y-6 hidden lg:block">
        <div className="bg-white p-5 rounded-lg shadow-lg border sticky top-8 space-y-6">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">
            Adicionar Campos
          </h3>
          <div className="space-y-2">
            {FIELD_TYPES.map((t) => (
              <button
                key={t.type}
                onClick={() => handleAddField(t.type)}
                className="w-full text-left px-4 py-3 bg-white 
                           border rounded hover:bg-gray-50 hover:border-indigo-300
                           flex items-center gap-3 shadow-sm transition-all"
              >
                <span className="text-xl">{t.icon}</span>
                <span className="font-medium text-gray-700">{t.label}</span>
              </button>
            ))}
          </div>

          {lastSavedId && (
            <div className="pt-6 border-t space-y-3">
              <button
                onClick={handleGenerateLink}
                className="w-full py-3 bg-pink-600 text-white rounded shadow hover:bg-pink-700 font-medium transition-colors"
              >
                🔗 Copiar Link
              </button>
              <button
                onClick={() => window.open(`http://localhost:8080/api/responses/${lastSavedId}`, "_blank")}
                className="w-full py-3 border-2 border-blue-100 text-blue-600 rounded hover:bg-blue-50 font-medium transition-colors"
              >
                📥 Baixar CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAINEL DE TEMA DESLIZANTE */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50
                    p-6 transition-transform duration-300 ease-in-out
        ${isThemePanelOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">🎨 Personalizar</h2>
          <button
            onClick={() => setIsThemePanelOpen(false)}
            className="text-gray-400 hover:text-gray-900 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ThemePanel theme={theme} setTheme={setTheme} />
      </div>
    </div>
  );
};

export default FormBuilder;