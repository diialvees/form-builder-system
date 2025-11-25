import React from 'react';

const COLORS = [
  '#4f46e5', // Indigo
  '#ef4444', // Red
  '#f97316', // Orange
  '#22c55e', // Green
  '#06b6d4', // Cyan
  '#f43f5e', // Rose
  '#3b82f6', // Blue
  '#a855f7', // Purple
];

const ThemePanel = ({ theme, setTheme }) => {
  const handleColorChange = (color) => {
    setTheme(prev => ({ ...prev, primaryColor: color }));
  };

  const handleBgChange = (color) => {
    setTheme(prev => ({ ...prev, backgroundColor: color }));
  };

  return (
    <div className="p-4 space-y-4">
      <h4 className="text-lg font-semibold text-gray-700">Cor Principal</h4>
      <div className="flex flex-wrap gap-2">
        {COLORS.map((color) => (
          <button
            key={color}
            onClick={() => handleColorChange(color)}
            style={{ backgroundColor: color }}
            className={`w-8 h-8 rounded-full border-2 transition-all duration-150 ${
              theme.primaryColor === color ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300 hover:scale-105'
            }`}
            aria-label={`Cor ${color}`}
          >
            {theme.primaryColor === color && <span className="text-white text-xs">✓</span>}
          </button>
        ))}
        {/* TODO: Adicionar input para cor personalizada (+) */}
      </div>

      <h4 className="text-lg font-semibold text-gray-700 mt-4">Cor de Fundo</h4>
      <div className="flex gap-4">
        {['#ffffff', '#fef2f2', '#eff6ff'].map((color) => ( // Branco, Vermelho pálido, Azul pálido
          <button
            key={color}
            onClick={() => handleBgChange(color)}
            style={{ backgroundColor: color }}
            className={`w-12 h-12 rounded-lg border-2 transition ${
              theme.backgroundColor === color ? 'border-indigo-600 ring-2 ring-indigo-300' : 'border-gray-300 hover:scale-105'
            }`}
            aria-label={`Fundo ${color}`}
          >
            {theme.backgroundColor === color && <span className="text-gray-900 text-xs">✓</span>}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemePanel;