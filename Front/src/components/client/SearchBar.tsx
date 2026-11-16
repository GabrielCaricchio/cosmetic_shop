import React from 'react';
import { Search, X } from 'lucide-react';

export interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = 'Buscar perfumes, batons, vitamina C, séruns...',
  className = '',
}) => {
  return (
    <div className={`relative flex items-center w-full ${className}`}>
      <Search className="absolute left-3.5 h-4 w-4 text-warm-500 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-2xl border border-warm-200/90 bg-warm-100/60 pl-10 pr-10 py-2.5 text-sm text-warm-900 placeholder:text-warm-400 focus:bg-white focus:border-botanic-600 focus:outline-none focus:ring-3 focus:ring-botanic-100 transition-all duration-200 shadow-2xs"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 p-1 rounded-full text-warm-400 hover:text-warm-700 hover:bg-warm-200/60 transition-colors"
          aria-label="Limpar busca"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
};
