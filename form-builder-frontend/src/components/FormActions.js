import React from 'react';
import { Link } from 'react-router-dom';

const FormActions = ({ formId, onDeleted }) => {
  
  // 1. Função de Download CSV
  const handleDownloadResponses = () => {
    window.open(`http://localhost:8080/api/responses/${formId}`, '_blank');
  };

  // 2. Função de Exclusão (Requer rota DELETE no Back-end)
  const handleDelete = async () => {
    if (!window.confirm("Tem certeza que deseja EXCLUIR este formulário e TODAS as suas respostas?")) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:8080/api/forms/${formId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error("Falha ao excluir o formulário.");
      
      // Notifica o Dashboard para remover o formulário da lista
      onDeleted(formId); 
      alert("Formulário excluído com sucesso!");

    } catch (e) {
      console.error("Erro ao excluir:", e);
      alert("Erro ao excluir o formulário: " + e.message);
    }
  };


  return (
    <div className="space-x-3 flex items-center">
      
      {/* Botão de Exportação CSV */}
      <button 
        onClick={handleDownloadResponses}
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        ⬇️ Baixar Respostas
      </button>
      
      {/* Link para Edição */}
      <Link to={`/builder/${formId}`} className="text-indigo-600 hover:text-indigo-800 font-medium">
        ✏️ Editar
      </Link>

      {/* Botão de Exclusão */}
      <button 
        onClick={handleDelete}
        className="text-red-600 hover:text-red-800 font-medium"
      >
        🗑️ Excluir
      </button>
    </div>
  );
};

export default FormActions;