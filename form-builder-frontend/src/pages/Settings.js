import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

const Settings = () => {
  // Estados iniciais (tentam ler do localStorage ou usam padrão)
  const [user, setUser] = useState({
    name: localStorage.getItem('app_userName') || 'Admin',
    email: localStorage.getItem('app_userEmail') || 'admin@empresa.com',
    company: localStorage.getItem('app_userCompany') || 'Minha Empresa',
  });

  const [feedback, setFeedback] = useState('');

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    
    // Salva no localStorage do navegador
    localStorage.setItem('app_userName', user.name);
    localStorage.setItem('app_userEmail', user.email);
    localStorage.setItem('app_userCompany', user.company);

    setFeedback('Configurações salvas com sucesso!');
    
    // Limpa a mensagem após 3 segundos
    setTimeout(() => setFeedback(''), 3000);
    
    // Força um evento de atualização para que o Header saiba que mudou (opcional, mas bom pra UX)
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="max-w-4xl mx-auto py-10 px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Configurações da Conta</h1>

        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-100 bg-gray-50">
            <h2 className="text-lg font-medium text-gray-900">Perfil do Usuário</h2>
            <p className="text-sm text-gray-500">Atualize suas informações pessoais e da empresa.</p>
          </div>

          <form onSubmit={handleSave} className="p-8 space-y-6">
            
            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome Completo</label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Endereço de E-mail</label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Empresa */}
            <div>
              <label className="block text-sm font-medium text-gray-700">Nome da Empresa / Organização</label>
              <input
                type="text"
                name="company"
                value={user.company}
                onChange={handleChange}
                className="mt-1 block w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>

            {/* Botão Salvar e Feedback */}
            <div className="pt-4 flex items-center justify-between">
              <button
                type="submit"
                className="px-6 py-3 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 transition"
              >
                Salvar Alterações
              </button>

              {feedback && (
                <span className="text-green-600 font-medium animate-pulse">
                  ✅ {feedback}
                </span>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Settings;