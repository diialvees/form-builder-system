import React, { useState } from 'react';

const FieldComponent = ({ field, onUpdate, onRemove, dragHandleProps, isDragging }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? checked : value;
    onUpdate(field.id, name, newValue);
  };

  const handleOptionChange = (optionId, newValue) => {
    const newOptions = field.options.map(opt =>
      opt.id === optionId ? { ...opt, value: newValue } : opt
    );
    onUpdate(field.id, 'options', newOptions);
  };

  const handleAddOption = () => {
    const newOption = { id: Date.now(), value: `Opção ${field.options.length + 1}` };
    onUpdate(field.id, 'options', [...field.options, newOption]);
  };

  const handleRemoveOption = (optionId) => {
    const newOptions = field.options.filter(opt => opt.id !== optionId);
    onUpdate(field.id, 'options', newOptions);
  };

  return (
    <div
      className={`p-4 border rounded-lg bg-white shadow-sm transition flex items-start
                  ${isEditing ? 'border-indigo-500 shadow-lg ring-1 ring-indigo-500' : 'hover:shadow-md'}
                  ${isDragging ? 'opacity-70 ring-2 ring-indigo-300' : ''}`}
    >

      {/* === 1. ALÇA DE ARRASTAR (DRAG HANDLE) === 
          Isolada do evento de clique de edição para evitar conflitos */}
      <div
        {...(dragHandleProps || {})}
        className="mt-1 mr-3 p-2 rounded hover:bg-gray-100 text-gray-400 cursor-grab active:cursor-grabbing flex items-center justify-center transition-colors select-none"
        title="Arraste para mover"
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

        {/* Visualização do Rótulo */}
        <div className="flex justify-between items-start mb-3">
          {isEditing ? (
            <input
              type="text"
              name="label"
              value={field.label}
              onChange={handleChange}
              placeholder="Rótulo da Pergunta"
              autoFocus
              className="w-full text-lg font-medium border-b-2 border-indigo-300 
                         focus:outline-none focus:border-indigo-500 transition bg-transparent"
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-lg font-medium text-gray-800 select-none">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </p>
          )}
        </div>

        {/* Pré-visualização do Input (Disabled) */}
        <div className="mb-4 text-gray-600 pointer-events-none">
          {field.type === 'text' && (
            <input
              type="text"
              placeholder={field.placeholder}
              disabled
              className="w-full p-2 border border-gray-300 rounded bg-gray-50"
            />
          )}

          {field.type === 'textarea' && (
            <textarea
              placeholder="Resposta longa..."
              disabled
              rows="3"
              className="w-full p-2 border border-gray-300 rounded resize-none bg-gray-50"
            />
          )}

          {(field.type === 'checkbox' || field.type === 'radio') && (
            <div className="space-y-2">
              {field.options?.map((opt) => (
                <div key={opt.id} className="flex items-center">
                  <div className={`w-4 h-4 border-2 mr-2 border-gray-300 ${field.type === 'radio' ? 'rounded-full' : 'rounded'}`}></div>
                  <span className="text-gray-700">{opt.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3. Painel de Edição Detalhada */}
        {isEditing && (
          <div 
            className="pt-4 border-t border-indigo-100 mt-4 cursor-default"
            onClick={(e) => e.stopPropagation()} // Impede que cliques aqui fechem ou re-abram
          >
            <div className="flex justify-between items-center text-sm mb-4 bg-indigo-50 p-2 rounded">
              <div className="flex items-center">
                <input
                  id={`required-${field.id}`}
                  type="checkbox"
                  name="required"
                  checked={field.required}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <label htmlFor={`required-${field.id}`} className="ml-2 text-gray-700 font-medium cursor-pointer">
                  Obrigatório
                </label>
              </div>
              <span className="text-xs text-indigo-500 font-bold uppercase tracking-wider">{field.type}</span>
            </div>

            {field.type === 'text' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto de Ajuda (Placeholder)
                </label>
                <input
                  type="text"
                  name="placeholder"
                  value={field.placeholder || ''}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 outline-none"
                  placeholder="Ex: Digite seu nome completo"
                />
              </div>
            )}

            {(field.type === 'checkbox' || field.type === 'radio') && (
              <div className="mb-4 p-3 border border-gray-200 rounded bg-gray-50">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Gerenciar Opções:
                </label>

                <div className="space-y-2">
                  {field.options?.map((opt) => (
                    <div key={opt.id} className="flex items-center gap-2">
                      <div className="text-gray-400">Opção:</div>
                      <input
                        type="text"
                        value={opt.value}
                        onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                        className="flex-grow p-1.5 border border-gray-300 rounded text-sm focus:border-indigo-500 outline-none"
                      />
                      <button
                        onClick={() => handleRemoveOption(opt.id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                        title="Remover opção"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={handleAddOption}
                  className="mt-3 text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center gap-1"
                >
                  <span>+</span> Adicionar nova opção
                </button>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => onRemove(field.id)}
                className="px-3 py-1.5 text-sm text-red-600 border border-red-200 rounded hover:bg-red-50 transition"
              >
                Excluir
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation(); // Garante que o clique no botão não propague
                  setIsEditing(false);
                }}
                className="px-4 py-1.5 text-sm bg-indigo-600 text-white rounded hover:bg-indigo-700 shadow-sm transition"
              >
                Concluído
              </button>
            </div>

          </div>
        )}
      </div>
    </div>
  );
};

export default FieldComponent;