import { useState, useCallback } from 'react';

export const useHistory = (initialState) => {
  // Array de estados passados (para desfazer)
  const [history, setHistory] = useState([initialState]);
  // Índice atual do histórico
  const [historyIndex, setHistoryIndex] = useState(0);
  // Estado atual (o estado em que estamos trabalhando)
  const state = history[historyIndex];

  // Função para adicionar um novo estado ao histórico
  const setState = useCallback((newState) => {
    // 1. O novo estado deve ser diferente do atual
    const currentState = history[historyIndex];
    if (JSON.stringify(newState) === JSON.stringify(currentState)) {
      return;
    }
    
    // 2. Apaga qualquer histórico futuro (o que foi 'redone')
    const newHistory = history.slice(0, historyIndex + 1);
    
    // 3. Adiciona o novo estado
    newHistory.push(newState);
    
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  // Função Desfazer (Undo)
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  }, [historyIndex]);

  // Função Refazer (Redo)
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]); // Fim do custom hook

  // Retorna o estado atual, a função para atualizar (que salva no histórico) e as funções de navegação
  return { 
    state, 
    setState, 
    undo, 
    redo, 
    canUndo: historyIndex > 0,
    canRedo: historyIndex < history.length - 1,
  };
};