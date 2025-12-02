import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const location = useLocation(); // Para saber em qual página estamos
  
  // Estado local para exibir os dados do usuário
  const [user, setUser] = useState({
    name: 'Admin',
    email: 'admin@empresa.com'
  });

  // Carrega dados do localStorage ao montar o componente
  useEffect(() => {
    const loadUserData = () => {
      const storedName = localStorage.getItem('app_userName');
      const storedEmail = localStorage.getItem('app_userEmail');
      
      if (storedName || storedEmail) {
        setUser({
          name: storedName || 'Admin',
          email: storedEmail || 'admin@empresa.com'
        });
      }
    };

    loadUserData();
    
    // Opcional: Escuta mudanças caso você use múltiplas abas
    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, []);

  // Verifica se o link está ativo para aplicar estilo visual
  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          
          {/* LADO ESQUERDO: Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="bg-indigo-600 p-2 rounded-lg group-hover:bg-indigo-700 transition-colors shadow-md">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="font-bold text-xl text-gray-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                FormBuilder
              </span>
            </Link>
          </div>

          {/* LADO DIREITO: Navegação e Perfil */}
          <div className="flex items-center gap-6">
            <nav className="hidden md:flex gap-4">
              <Link 
                to="/" 
                className={`text-sm font-medium transition-colors ${isActive('/') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
              >
                Dashboard
              </Link>
              <span className="text-gray-300">|</span>
              
              {/* LINK ATIVADO AGORA */}
              <Link 
                to="/settings" 
                className={`text-sm font-medium transition-colors ${isActive('/settings') ? 'text-indigo-600' : 'text-gray-500 hover:text-indigo-600'}`}
              >
                Configurações
              </Link>
            </nav>

            {/* Avatar / Usuário Dinâmico */}
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
              <div className="text-right hidden sm:block">
                {/* Nome Dinâmico */}
                <p className="text-sm font-semibold text-gray-700">{user.name}</p>
                {/* Email Dinâmico */}
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
              
              <Link to="/settings" className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm ring-2 ring-gray-50 hover:ring-indigo-200 transition-all cursor-pointer">
                {/* Iniciais do Nome */}
                {user.name.charAt(0).toUpperCase()}
              </Link>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
};

export default Header;