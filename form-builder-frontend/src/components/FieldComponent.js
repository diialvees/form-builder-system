import React, { useState } from 'react';

const FieldComponent = ({ field, onUpdate, onRemove }) => {
  // Estado local para alternar entre visualizar e editar
  const [isEditing, setIsEditing] = useState(false);

  // Manipulador genérico para atualizar as propriedades do campo
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Lida com checkboxes para 'required'
    const newValue = type === 'checkbox' ? checked : value;

    onUpdate(field.id, name, newValue);
  };

  
  
  // -----------------------------------------------------------------
  // Lógica para Opções (para campos Checkbox e Radio)
  // -----------------------------------------------------------------
  
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

  // -----------------------------------------------------------------
  // Renderização
  // -----------------------------------------------------------------

  return (
    <div 
      className={`p-4 border rounded-lg bg-white shadow-sm transition cursor-pointer 
                 ${isEditing ? 'border-indigo-500 shadow-lg' : 'hover:shadow-md'}`}
      onClick={() => setIsEditing(true)}
    >
      
      {/* 1. Modo de Visualização Rápida (Sempre visível) */}
      <div className="flex justify-between items-start mb-3">
        {isEditing ? (
          <input
            type="text"
            name="label"
            value={field.label}
            onChange={handleChange}
            placeholder="Rótulo da Pergunta"
            className="w-full text-lg font-medium border-b-2 border-indigo-300 focus:outline-none focus:border-indigo-500 transition"
            onClick={(e) => e.stopPropagation()} 
          />
        ) : (
          <p className="text-lg font-medium text-gray-800">
            {field.label} {field.required && <span className="text-red-500">*</span>}
          </p>
        )}
      </div>

      {/* 2. Pré-visualização do Campo (Simples) */}
      <div className="mb-4 text-gray-600">
        {field.type === 'text' && (
          <input type="text" placeholder={field.placeholder} disabled className="w-full p-2 border border-gray-300 rounded" />
        )}
        {field.type === 'textarea' && (
          <textarea placeholder="Resposta longa..." disabled className="w-full p-2 border border-gray-300 rounded resize-none" rows="3" />
        )}
        {(field.type === 'checkbox' || field.type === 'radio') && field.options && (
          <div className="space-y-2">
            {field.options.map((opt, index) => (
              <div key={opt.id} className="flex items-center">
                <input 
                  type={field.type === 'checkbox' ? 'checkbox' : 'radio'} 
                  disabled 
                  className="mr-2"
                />
                <span className="text-gray-700">{opt.value}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Painel de Edição (Mostrado apenas se isEditing for true) */}
      {isEditing && (
        <div className="pt-4 border-t border-indigo-200">
          
          <div className="flex justify-between items-center text-sm mb-3">
            <div className="flex items-center">
              <input
                id={`required-${field.id}`}
                type="checkbox"
                name="required"
                checked={field.required}
                onChange={handleChange}
                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                onClick={(e) => e.stopPropagation()}
              />
              <label htmlFor={`required-${field.id}`} className="ml-2 text-gray-700">
                Obrigatório
              </label>
            </div>
            
            <span className="text-xs text-gray-500 italic">Tipo: {field.type}</span>
          </div>

          {/* Opções de Placeholder para Texto */}
          {field.type === 'text' && (
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700">Texto de Ajuda (Placeholder)</label>
              <input
                type="text"
                name="placeholder"
                value={field.placeholder || ''}
                onChange={handleChange}
                className="mt-1 w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Ex: Digite seu nome completo"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* Opções para Checkbox/Radio */}
          {(field.type === 'checkbox' || field.type === 'radio') && (
            <div className="mb-3 p-2 border border-dashed border-gray-300 rounded">
              <label className="block text-sm font-medium text-gray-700 mb-2">Opções:</label>
              {field.options.map((opt) => (
                <div key={opt.id} className="flex items-center mb-1">
                  <input
                    type="text"
                    value={opt.value}
                    onChange={(e) => handleOptionChange(opt.id, e.target.value)}
                    className="flex-grow p-1 border-b border-gray-200 text-sm focus:border-indigo-500 transition"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemoveOption(opt.id); }}
                    className="ml-2 text-red-400 hover:text-red-600"
                  >
                    -
                  </button>
                </div>
              ))}
              <button
                onClick={(e) => { e.stopPropagation(); handleAddOption(); }}
                className="mt-2 text-indigo-500 hover:text-indigo-700 text-sm font-medium"
              >
                + Adicionar Opção
              </button>
            </div>
          )}

          {/* Botões de Ação */}
          <div className="flex justify-end space-x-2 border-t pt-2">
            <button
              onClick={(e) => { e.stopPropagation(); onRemove(field.id); }}
              className="p-2 text-sm bg-red-100 text-red-600 rounded hover:bg-red-200"
            >
              Excluir Campo
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setIsEditing(false); }}
              className="p-2 text-sm bg-indigo-500 text-white rounded hover:bg-indigo-600"
            >
              Concluído
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FieldComponent;