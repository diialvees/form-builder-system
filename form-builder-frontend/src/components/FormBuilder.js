import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { useHistory } from "../hooks/useHistory";
import ThemePanel from "./ThemePanel";

// Lista de campos disponíveis
const FIELD_TYPES = [
  { type: "text", label: "Campo de Texto", icon: "🔤" },
  { type: "textarea", label: "Texto Longo", icon: "📝" },
  { type: "checkbox", label: "Múltipla Escolha", icon: "☑️" },
  { type: "radio", label: "Escolha Única", icon: "🔘" },
];

const INITIAL_FIELDS = [];

// Utilidade para reorder no drag
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

// COMPONENTE DOS CAMPOS
const FieldComponent = ({
  field,
  onUpdate,
  onRemove,
  theme,
  isDragging,
  dragHandleProps,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    onUpdate(field.id, name, type === "checkbox" ? checked : value);
  };

  const handleUpdateOption = (optionId, val) => {
    const updated = field.options.map((opt) =>
      opt.id === optionId ? { ...opt, value: val } : opt
    );
    onUpdate(field.id, "options", updated);
  };

  const handleRemoveOption = (optionId) => {
    const updated = field.options.filter((opt) => opt.id !== optionId);
    onUpdate(field.id, "options", updated);
  };

  const handleAddOption = () => {
    onUpdate(field.id, "options", [
      ...field.options,
      { id: Date.now(), value: `Opção ${field.options.length + 1}` },
    ]);
  };

  return (
    <div
      className={`p-4 border rounded-lg bg-white shadow-sm transition flex items-start relative
      ${isEditing ? "border-indigo-500 shadow-lg ring-1 ring-indigo-500" : "hover:shadow-md"}
      ${isDragging ? "bg-indigo-50 border-indigo-500 shadow-xl ring-2 ring-indigo-200 z-50" : ""}`}
    >
      {/* HANDLE */}
      <div
        {...dragHandleProps}
        className="mt-1 mr-3 p-2 rounded hover:bg-gray-100 text-gray-400 cursor-grab active:cursor-grabbing select-none"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
        </svg>
      </div>

      {/* CONTEÚDO */}
      <div className="flex-grow cursor-pointer" onClick={() => !isEditing && setIsEditing(true)}>
        
        {/* Cabeçalho */}
        <div className="flex justify-between items-start mb-3">
          {isEditing ? (
            <input
              type="text"
              name="label"
              value={field.label}
              onChange={handleChange}
              className="text-lg font-semibold text-gray-800 border-b-2 border-indigo-300 w-full mr-4 bg-transparent focus:outline-none"
              placeholder="Digite sua pergunta"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <p className="text-lg font-semibold text-gray-800 select-none">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </p>
          )}

          {!isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove(field.id);
              }}
              className="text-red-300 hover:text-red-500"
            >
              <svg className="h-5 w-5" fill="currentColor">
                <path fillRule="evenodd" d="M9 2a1 1 0..." />
              </svg>
            </button>
          )}
        </div>

        {/* Preview */}
        <div className="space-y-3 pointer-events-none">
          {(field.type === "text" || field.type === "textarea") &&
            (field.type === "text" ? (
              <input disabled className="w-full p-2 border rounded bg-gray-50" placeholder="Resposta curta..." />
            ) : (
              <textarea disabled rows="3" className="w-full p-2 border rounded bg-gray-50" placeholder="Resposta longa..." />
            ))}

          {(field.type === "checkbox" || field.type === "radio") && (
            <div className="space-y-2">
              {field.options?.map((opt) => (
                <div key={opt.id} className="flex items-center">
                  <div
                    className={`w-4 h-4 border-2 mr-3 ${
                      field.type === "radio" ? "rounded-full" : "rounded"
                    } border-gray-300`}
                  />
                  <span className="text-gray-600">{opt.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Painel de edição */}
        {isEditing && (
          <div
            className="mt-6 pt-4 border-t border-indigo-100 cursor-default"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Texto */}
            {(field.type === "text" || field.type === "textarea") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Texto de Ajuda
                </label>
                <input
                  type="text"
                  value={field.placeholder || ""}
                  onChange={(e) => onUpdate(field.id, "placeholder", e.target.value)}
                  className="w-full text-sm border p-2 rounded"
                />
              </div>
            )}

            {/* Opções */}
            {(field.type === "checkbox" || field.type === "radio") && (
              <div className="mb-4 bg-gray-50 p-3 rounded border">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Editar Opções:
                </label>

                {field.options.map((option) => (
                  <div key={option.id} className="flex items-center mb-2">
                    <div
                      className={`w-3 h-3 mr-2 border ${
                        field.type === "radio" ? "rounded-full" : "rounded"
                      } border-gray-400`}
                    />
                    <input
                      type="text"
                      value={option.value}
                      onChange={(e) => handleUpdateOption(option.id, e.target.value)}
                      className="flex-grow text-sm border p-1 rounded"
                    />
                    <button className="ml-2" onClick={() => handleRemoveOption(option.id)}>
                      ×
                    </button>
                  </div>
                ))}

                <button className="text-indigo-600 text-sm" onClick={handleAddOption}>
                  + Adicionar Opção
                </button>
              </div>
            )}

            {/* Rodapé */}
            <div className="flex justify-between items-center mt-4">
              <label className="text-sm text-gray-600 flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.required}
                  onChange={(e) => onUpdate(field.id, "required", e.target.checked)}
                />
                Obrigatório
              </label>

              <div className="flex gap-2">
                <button
                  onClick={() => onRemove(field.id)}
                  className="px-3 py-1 text-sm text-red-600 rounded"
                >
                  Excluir
                </button>
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-1 text-sm bg-indigo-600 text-white rounded"
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

// COMPONENTE PRINCIPAL
const FormBuilder = () => {
  const { id } = useParams();

  const {
    state: fields,
    setState: setFields,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useHistory(INITIAL_FIELDS);

  const [title, setTitle] = useState("Novo Formulário Dinâmico");
  const [description, setDescription] = useState("Adicione campos e personalize-os.");
  const [theme, setTheme] = useState({
    primaryColor: "#4f46e5",
    backgroundColor: "#ffffff",
  });

  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false);

  // Estados de carregamento
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // ID salvo
  const [savedFormId, setSavedFormId] = useState(id !== "new" ? id : null);

  // Carregar dados do formulário
  useEffect(() => {
    if (id === "new") {
      setTitle("Novo Formulário");
      setDescription("");
      setFields(INITIAL_FIELDS);
      setTheme({ primaryColor: "#4f46e5", backgroundColor: "#ffffff" });
      setSavedFormId(null);
      return;
    }

    const load = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch(`http://localhost:8080/api/forms/${id}`);
        if (!res.ok) throw new Error("Formulário não encontrado.");

        const data = await res.json();

        setTitle(data.title);
        setDescription(data.description);
        setTheme(data.theme);
        setFields(data.fields);

        setSavedFormId(data.id);
        setLastSavedId(data.id);

      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [id]);

  // Atualizar campo
  const handleUpdateField = (fieldId, key, value) => {
    const updated = fields.map((f) =>
      f.id === fieldId ? { ...f, [key]: value } : f
    );
    setFields(updated);
  };

  // Remover campo
  const handleRemoveField = (fieldId) => {
    setFields(fields.filter((f) => f.id !== fieldId));
  };

  // Adicionar campo
  const handleAddField = (type) => {
    const base = {
      id: Date.now(),
      type,
      label: "Pergunta sem título",
      required: false,
      placeholder: "",
      options: [],
    };

    if (type === "checkbox" || type === "radio") {
      base.options = [
        { id: Date.now() + 1, value: "Opção 1" },
        { id: Date.now() + 2, value: "Opção 2" },
      ];
    }

    setFields([...fields, base]);
  };

  // Drag & Drop
  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = reorder(fields, result.source.index, result.destination.index);
    setFields(items);
  };

  // Salvar / Atualizar
  const handleSaveForm = async () => {
    const isEditing = savedFormId !== null;
    const method = isEditing ? "PUT" : "POST";

    const url = isEditing
      ? `http://localhost:8080/api/forms/${savedFormId}`
      : "http://localhost:8080/api/forms";

    const formData = {
      title,
      description,
      fields,
      theme,
    };

    try {
      setIsSaving(true);

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) throw new Error("Erro ao salvar");

      const result = await res.json();
      const finalId = result.formId || savedFormId;

      setSavedFormId(finalId);
      setLastSavedId(finalId);

      setFeedback({
        type: "success",
        message: `Formulário ${isEditing ? "atualizado" : "salvo"} com sucesso!`,
      });

    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback({ type: "", message: "" }), 3000);
    }
  };

  // Copiar link
  const handleGenerateLink = () => {
  if (!savedFormId) {
    alert("Salve o formulário primeiro para gerar o link.");
    return;
  }
  
  // CORREÇÃO: Adicione o '/view' para bater com a rota do App.js
  // Antes estava provavelmente assim: `${window.location.origin}/form/${savedFormId}`
  const shareUrl = `${window.location.origin}/form/view/${savedFormId}`; 
  
  navigator.clipboard.writeText(shareUrl)
    .then(() => alert(`Link copiado: ${shareUrl}`))
    .catch(err => alert(`Link: ${shareUrl}`));
};
  // LOADING
  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-indigo-600">
        Carregando formulário...
      </div>
    );

  // ERRO
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Erro ao carregar: {error}
      </div>
    );

  // =======================
  // RENDER COMPLETO DO JSX
  // =======================
  return (
    <div
      className="min-h-screen p-8 flex justify-center transition-colors duration-500 relative"
      style={{ backgroundColor: theme.backgroundColor }}
    >
      {/* TOPO */}
      <div className="absolute top-4 right-4 flex gap-2 z-10">
        <button
          onClick={undo}
          disabled={!canUndo}
          className={`p-2 rounded shadow-sm transition ${
            !canUndo ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"
          }`}
        >
          ↩️
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className={`p-2 rounded shadow-sm transition ${
            !canRedo ? "bg-gray-100 text-gray-400" : "bg-white hover:bg-gray-50"
          }`}
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

      {/* CONTAINER */}
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

        {/* CAMPOS (DND) */}
        <div className="p-8 space-y-6 flex-grow bg-white min-h-[400px]">
          <DragDropContext onDragEnd={onDragEnd}>
            {fields.length === 0 ? (
              <div className="text-center text-gray-400 mt-10 border-2 border-dashed border-gray-200 rounded-lg p-10">
                <p className="text-xl">O formulário está vazio.</p>
                <p className="text-sm">Adicione campos usando o menu lateral.</p>
              </div>
            ) : (
              <Droppable droppableId="form-fields">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {fields.map((field, index) => (
                      <Draggable key={field.id} draggableId={String(field.id)} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            style={provided.draggableProps.style}
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
          <span
            className={`text-sm font-medium ${
              feedback.type === "success"
                ? "text-green-600"
                : feedback.type === "error"
                ? "text-red-600"
                : ""
            }`}
          >
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

      {/* PAINEL ADICIONAR CAMPOS */}
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
                className="w-full py-3 bg-pink-600 text-white rounded shadow hover:bg-pink-700 font-medium"
              >
                🔗 Copiar Link
              </button>

              <button
                onClick={() =>
                  window.open(`http://localhost:8080/api/responses/${lastSavedId}`, "_blank")
                }
                className="w-full py-3 border-2 border-blue-100 text-blue-600 rounded hover:bg-blue-50 font-medium"
              >
                📥 Baixar CSV
              </button>
            </div>
          )}
        </div>
      </div>

      {/* PAINEL DE TEMA */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50
                    p-6 transition-transform duration-300 ease-in-out
        ${isThemePanelOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h2 className="text-xl font-bold text-gray-800">🎨 Personalizar</h2>
          <button
            onClick={() => setIsThemePanelOpen(false)}
            className="text-gray-400 hover:text-gray-900"
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
