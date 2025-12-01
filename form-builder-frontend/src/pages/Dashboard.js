import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  // TODO: Estado para armazenar a lista de formulários
  const [forms, setForms] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  // TODO: useEffect para buscar a lista de formulários do Backend
  useEffect(() => {
    const fetchForms = async () => {
      setIsLoading(true);
      try {
        // Rota que criaremos no Passo 3
        const response = await fetch('http://localhost:8080/api/forms');
        if (!response.ok) throw new Error("Falha ao carregar formulários.");
        
        const data = await response.json();
        setForms(data);
      } catch (e) {
        console.error("Erro ao buscar a lista:", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchForms();
  }, []);

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Carregando Dashboard...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Meus Formulários</h1>
        
        {/* Botão para Criar Novo Formulário */}
        <Link 
          to="/builder/new" 
          className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-md hover:bg-indigo-700 transition"
        >
          + Novo Formulário
        </Link>
      </div>
      
      {/* Lista de Formulários */}
      <div className="space-y-4">
        {forms.length === 0 ? (
          <p className="text-gray-500 italic">Nenhum formulário encontrado. Crie o primeiro!</p>
        ) : (
          forms.map(form => (
            <div key={form.id} className="bg-white p-5 rounded-lg shadow flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">{form.title}</h2>
                <p className="text-sm text-gray-500">ID: {form.id}</p>
              </div>
              
              <div className="space-x-2">
                {/* Link para Visualizar/Responder */}
                <Link to={`/form/view/${form.id}`} target="_blank" className="text-green-600 hover:text-green-800 font-medium">
                  Responder
                </Link>
                {/* Link para Editar no FormBuilder */}
                <Link to={`/builder/${form.id}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
                  Editar
                </Link>
                {/* TODO: Botão para Exportar (Chamada de função) */}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;