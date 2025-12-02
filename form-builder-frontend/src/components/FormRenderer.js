import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { maskPhone, maskCPF } from '../utils/masks';
import { isValidEmail } from '../utils/validations'; // 1. IMPORTAR A VALIDAÇÃO

const FormRenderer = () => {
  const { formId } = useParams();
  const [form, setForm] = useState(null);
  const [formData, setFormData] = useState({});
  // 2. NOVO ESTADO PARA ERROS
  const [errors, setErrors] = useState({}); 
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

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
        if (!response.ok) throw new Error(`Erro: ${response.statusText}`);
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

  const handleChange = (fieldId, value, type) => {
    let formattedValue = value;

    if (type === 'tel') formattedValue = maskPhone(value);
    if (type === 'cpf') formattedValue = maskCPF(value);

    setFormData(prev => ({ ...prev, [fieldId]: formattedValue }));

    // Limpa o erro assim que o usuário começa a corrigir
    if (errors[fieldId]) {
      setErrors(prev => ({ ...prev, [fieldId]: null }));
    }
  };

  // 3. NOVA FUNÇÃO: VALIDAÇÃO AO SAIR DO CAMPO (ONBLUR)
  const handleBlur = (fieldId, value, type) => {
    if (type === 'email' && value) {
      if (!isValidEmail(value)) {
        setErrors(prev => ({ ...prev, [fieldId]: 'Por favor, insira um e-mail válido.' }));
      }
    }
  };

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 4. VALIDAÇÃO FINAL ANTES DE ENVIAR
    // Verifica se ainda existe algum erro visível
    const hasErrors = Object.values(errors).some(error => error !== null);
    if (hasErrors) {
      alert("Por favor, corrija os erros antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    const payload = { data: formData };

    try {
      const url = `http://localhost:8080/api/responses/${form.id}`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro do servidor (${response.status}): ${errorText}`);
      }

      setSubmitted(true);
    } catch (err) {
      console.error("Erro detalhado:", err);
      alert("Erro ao enviar: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-gray-500 font-medium">Carregando...</div>;
  if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">Erro: {error}</div>;
  if (!form) return <div className="min-h-screen flex items-center justify-center text-gray-500">Formulário não encontrado.</div>;

  const primaryColor = form.theme?.primaryColor || '#4f46e5';
  const backgroundColor = form.theme?.backgroundColor || '#f3f4f6';

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 transition-colors" style={{ backgroundColor }}>
        <div className="bg-white p-10 rounded-lg shadow-xl max-w-md text-center border-t-8 animate-fade-in-up" style={{ borderColor: primaryColor }}>
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
             <span className="text-3xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Obrigado!</h2>
          <p className="text-gray-600">Sua resposta foi registrada com sucesso.</p>
          <button onClick={() => window.location.reload()} className="mt-6 text-sm font-medium underline hover:opacity-80 transition-opacity" style={{ color: primaryColor }}>
            Enviar outra resposta
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-10 px-4 transition-colors duration-500 font-sans" style={{ backgroundColor: backgroundColor }}>
      <form onSubmit={handleSubmit} className="max-w-xl mx-auto bg-white shadow-2xl rounded-xl overflow-hidden border border-gray-100">
        
        <div className="p-10 border-b border-gray-100 bg-white">
          <h1 className="text-4xl font-extrabold tracking-tight" style={{ color: primaryColor }}>{form.title}</h1>
          <p className="mt-3 text-lg text-gray-500 leading-relaxed">{form.description}</p>
        </div>

        <div className="p-10 space-y-8">
          {form.fields.map(field => (
            <div key={field.id} className="space-y-3 group">
              <label className="block text-lg font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">
                {field.label}
                {field.required && <span className="text-red-500 ml-1" title="Obrigatório">*</span>}
              </label>
              
              {/* INPUTS SIMPLES */}
              {['text', 'email', 'date', 'number', 'tel', 'cpf'].includes(field.type) && (
                <div className="relative">
                    <input
                      type={field.type === 'cpf' ? 'text' : field.type}
                      required={field.required}
                      placeholder={field.placeholder}
                      maxLength={field.type === 'cpf' ? 14 : field.type === 'tel' ? 15 : undefined}
                      value={formData[field.id] || ''}
                      onChange={(e) => handleChange(field.id, e.target.value, field.type)}
                      // 5. ADICIONADO O EVENTO ONBLUR
                      onBlur={(e) => handleBlur(field.id, e.target.value, field.type)}
                      className={`w-full p-4 bg-gray-50 border rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm
                        ${errors[field.id] ? 'border-red-500 focus:ring-red-200' : 'border-gray-200'}`} 
                      style={{ '--tw-ring-color': errors[field.id] ? '#ef4444' : primaryColor }}
                    />
                    
                    {/* 6. MENSAGEM DE ERRO VISUAL */}
                    {errors[field.id] && (
                      <p className="mt-1 text-sm text-red-500 flex items-center animate-pulse">
                        ⚠️ {errors[field.id]}
                      </p>
                    )}
                </div>
              )}

              {/* TEXTAREA */}
              {field.type === 'textarea' && (
                <textarea
                  required={field.required}
                  rows="4"
                  placeholder={field.placeholder}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleChange(field.id, e.target.value)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:border-transparent transition-all duration-200 shadow-sm resize-y"
                  style={{ '--tw-ring-color': primaryColor }}
                />
              )}

              {/* RADIO */}
              {field.type === 'radio' && field.options && (
                <div className="space-y-3 mt-3">
                  {field.options.map(opt => (
                    <label key={opt.id} className="flex items-center cursor-pointer p-3 rounded-lg border border-transparent hover:bg-gray-50 hover:border-gray-200 transition-all">
                      <input
                        type="radio"
                        name={`field-${field.id}`}
                        value={opt.value}
                        checked={formData[field.id] === opt.value}
                        onChange={(e) => handleChange(field.id, e.target.value)}
                        required={field.required}
                        className="w-5 h-5 bg-white border-gray-300 focus:ring-2 focus:ring-offset-2"
                        style={{ color: primaryColor, accentColor: primaryColor }}
                      />
                      <span className="ml-3 text-gray-700 font-medium">{opt.value}</span>
                    </label>
                  ))}
                </div>
              )}

              {/* CHECKBOX */}
              {field.type === 'checkbox' && field.options && (
                <div className="space-y-3 mt-3">
                  {field.options.map(opt => {
                    const isChecked = (formData[field.id] || []).includes(opt.value);
                    return (
                        <label key={opt.id} className="flex items-center cursor-pointer p-3 rounded-lg border border-transparent hover:bg-gray-50 hover:border-gray-200 transition-all">
                        <input
                            type="checkbox"
                            value={opt.value}
                            checked={isChecked}
                            onChange={(e) => handleCheckboxChange(field.id, opt.value, e.target.checked)}
                            className="w-5 h-5 bg-white border-gray-300 rounded focus:ring-2 focus:ring-offset-2"
                            style={{ color: primaryColor, accentColor: primaryColor }}
                        />
                        <span className="ml-3 text-gray-700 font-medium">{opt.value}</span>
                        </label>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-8 bg-gray-50 border-t border-gray-100 flex justify-between items-center">
          <span className="text-sm text-gray-400 font-medium">
             {isSubmitting ? 'Enviando dados...' : '🔒 Conexão segura'}
          </span>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-4 text-white font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
            style={{ backgroundColor: primaryColor }}
          >
            {isSubmitting ? 'Enviando...' : 'Enviar Resposta'}
          </button>
        </div>

      </form>
      
      <div className="text-center mt-8 text-gray-400 text-sm">
        Criado com FormBuilder System
      </div>
    </div>
  );
};

export default FormRenderer;