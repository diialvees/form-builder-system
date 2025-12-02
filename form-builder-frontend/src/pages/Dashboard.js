import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import FormActions from '../components/FormActions';
import Header from '../components/Header'; // <--- 1. IMPORTAR HEADER

const Dashboard = () => {
  const [forms, setForms] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchForms = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/forms');
      if (!response.ok) throw new Error("Falha ao carregar formulários.");
      const data = await response.json();
      setForms(data);
    } catch (e) {
      console.error(e);
      setError(e.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchForms(); }, []);

  const handleFormDeleted = (deletedId) => {
    setForms(prev => prev.filter(f => f.id !== deletedId));
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center text-indigo-600 animate-pulse">Carregando seus projetos...</div>;
  if (error) return <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg">Erro: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      
      {/* 2. ADICIONAR O HEADER AQUI */}
      <Header />

      <div className="p-6 md:p-12">
        {/* Cabeçalho da Seção */}
        <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Meus Formulários</h1>
            <p className="text-gray-500 mt-1">Gerencie, edite e acompanhe os resultados.</p>
          </div>
          
          <Link 
            to="/builder/new" 
            className="group relative inline-flex items-center justify-center px-6 py-3 text-base font-medium text-white bg-indigo-600 rounded-full shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all duration-200"
          >
            <span className="mr-2 text-xl">+</span> Criar Novo
          </Link>
        </div>

        {/* Grid de Formulários */}
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* Card Criar Novo */}
          <Link 
            to="/builder/new"
            className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-300 rounded-2xl hover:border-indigo-500 hover:bg-indigo-50 transition-all cursor-pointer group h-64 bg-white/50"
          >
            <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <span className="text-3xl font-bold">+</span>
            </div>
            <span className="text-gray-500 font-medium group-hover:text-indigo-700">Criar novo formulário</span>
          </Link>

          {/* Lista */}
          {forms.map(form => (
            <div key={form.id} className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 border border-gray-100 overflow-hidden flex flex-col h-64 group">
              <div className="h-2 w-full bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              
              <div className="p-6 flex-grow flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start">
                    <h2 className="text-lg font-bold text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors" title={form.title}>
                      {form.title}
                    </h2>
                    <span className="bg-gray-100 text-gray-500 text-xs px-2 py-1 rounded-full font-mono">
                      #{form.id}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400 mt-2 flex items-center gap-1">
                    <span>📅</span> {new Date(form.submission_date || Date.now()).toLocaleDateString('pt-BR')}
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <FormActions formId={form.id} onDeleted={handleFormDeleted} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;