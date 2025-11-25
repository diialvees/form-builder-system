import React, { useState, useEffect } from 'react';

const FormRenderer = ({ formId }) => {
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({}); // Armazena as respostas: { campoId: 'valor' }
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false); // Estado para o botão de enviar
  const [submitted, setSubmitted] = useState(false); // Feedback de sucesso

  // 1. Busca o formulário (Dados + Tema) do Backend
  useEffect(() => {
    if (!formId) {
      setIsLoading(false);
      setError("Nenhum ID de formulário fornecido.");
      return;
    }

    const fetchForm = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`http://localhost:8080/api/forms/${formId}`);
        
        if (!response.ok) {
          throw new Error(`Erro: ${response.statusText}`);
        }
        
        const data = await response.json();
        setForm(data);
        setFormData({});
      } catch (e) {
        console.error("Erro ao buscar formulário:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [formId]);

  // 2. Gerencia mudanças nos inputs
  const handleChange = (fieldId, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  // Lógica específica para Checkbox (Múltipla escolha)
  const handleCheckboxChange = (fieldId, optionValue, isChecked) => {
    setFormData(prev => {
      const currentValues = prev[fieldId] || [];
      if (isChecked) {
        return { ...prev, [fieldId]: [...currentValues, optionValue] };
      } else {
        return { ...prev, [fieldId]: currentValues.filter(v => v !== optionValue) };
      }
    });
  };

  // 3. Envia as respostas para o Backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Estrutura do payload para o backend
    const payload = {
      formId: form.id, 
      answers: formData 
    };

    try {
      const response = await fetch(`http://localhost:8080/api/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error("Erro ao enviar respostas.");

      setSubmitted(true);
      console.log("Enviado com sucesso:", payload);
    } catch (err) {
      alert("Erro ao enviar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Renderização de Estados de Carregamento/Erro ---

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Erro: {error}</div>;
  if (!form) return <div className="min-h-screen flex items-center justify-center text-gray-500">Formulário não encontrado.</div>;

  // Define cores padrão caso o formulário antigo não tenha tema salvo ou venha nulo
  // Isso garante que form.theme.primaryColor não quebre a aplicação
  const primaryColor = form.theme?.primaryColor || '#4f46e5';
  const backgroundColor = form.theme?.backgroundColor || '#f3f4f6';

  // Tela de Sucesso após envio
  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor }}>
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md text-center border-t-8" style={{ borderColor: primaryColor }}>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Obrigado!</h2>
          <p className="text-gray-600">Sua resposta foi registrada com sucesso.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-6 text-sm underline hover:opacity-80"
            style={{ color: primaryColor }}
          >
            Enviar outra resposta
          </button>
        </div>
      </div>
    );
  }

  // --- Renderização do Formulário ---

  return (
    <div 
      className="min-h-screen py-10 px-4 transition-colors duration-500"
      style={{ backgroundColor: backgroundColor }} // APLICAÇÃO DO TEMA (Fundo da Página)
    >
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white shadow-xl rounded-lg overflow-hidden">
        
        {/* Cabeçalho */}
        <div className="p-8 border-b border-gray-100">
          {/* APLICAÇÃO DA COR PRINCIPAL NO TÍTULO */}
          <h1 
            className="text-3xl font-extrabold" 
            style={{ color: primaryColor }}
          >
            {form.title}
          </h1>
          <p className="mt-2 text-gray-600">{form.description}</p>
        </div>

        <div className="p-8 space-y-6">
          {form.fields.map(field => (
            <div key={field.id} className="space-y-2">
              <label className="block text-lg font-medium text-gray-700">
                {field.label}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {/* Renderização Text / Textarea */}
              {field.type === 'text' && (
                <input
                  type="text"
                  required={field.required}
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ '--tw-ring-color': primaryColor }} // Truque para usar a cor no focus ring do Tailwind
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  required={field.required}
                  rows="3"
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:border-transparent transition"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              )}

              {/* Renderização Radio */}
              {field.type === 'radio' && field.options && (
                <div className="space-y-2 mt-2">
                  {field.options.map(opt => (
                    <label key={opt.id} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50">
                      <input
                        type="radio"
                        name={`field-${field.id}`}
                        value={opt.value}
                        checked={formData[field.id] === opt.value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-5 h-5 bg-gray-100 border-gray-300 focus:ring-2"
                        style={{ color: primaryColor, accentColor: primaryColor }} // accentColor pinta o input nativo
                      />
                      <span className="ml-3 text-gray-700">{opt.value}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* Renderização Checkbox */}
              {field.type === 'checkbox' && field.options && (
                <div className="space-y-2 mt-2">
                  {field.options.map(opt => {
                    const isChecked = (formData[field.id] || []).includes(opt.value);
                    return (
                        <label key={opt.id} className="flex items-center cursor-pointer p-2 rounded hover:bg-gray-50">
                        <input
                            type="checkbox"
                            value={opt.value}
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(field.id, opt.value, e.target.checked)}
                            className="w-5 h-5 bg-gray-100 border-gray-300 rounded focus:ring-2"
                            style={{ color: primaryColor, accentColor: primaryColor }}
                        />
                        <span className="ml-3 text-gray-700">{opt.value}</span>
                        </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Rodapé com Botão de Envio */}
        <div className="p-6 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">
             {isSubmitting ? 'Enviando...' : `${Object.keys(formData).length} campo(s) preenchido(s)`}
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 text-white font-bold rounded shadow hover:opacity-90 transition-all disabled:opacity-50"
            style={{ backgroundColor: primaryColor }} // APLICAÇÃO DO TEMA (Fundo do Botão)
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
          </button>
        </div>

      </form>
    </div>
  );
};

export default FormRenderer;