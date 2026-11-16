import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import { useDebounce } from '../../hooks/useDebounce';
import { productApi } from '../../services/productApi';
import { Product } from '../../types/product';

export interface SearchBarProps {
  onSearch?: (term: string) => void;
  onSelectProduct?: (product: Product) => void;
  placeholder?: string;
  className?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  onSelectProduct,
  placeholder = 'Buscar por cosméticos, marcas, ativos...',
  className = '',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // Busca sugestões com pg_trgm quando o usuário digita
  useEffect(() => {
    if (!debouncedSearch || debouncedSearch.trim().length < 2) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    let isSubscribed = true;
    setIsLoading(true);

    productApi
      .getProducts({ search: debouncedSearch.trim(), limit: 5 })
      .then((data) => {
        if (isSubscribed) {
          setSuggestions(data.items || []);
          setIsOpen(true);
        }
      })
      .catch(() => {
        if (isSubscribed) setSuggestions([]);
      })
      .finally(() => {
        if (isSubscribed) setIsLoading(false);
      });

    return () => {
      isSubscribed = false;
    };
  }, [debouncedSearch]);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setIsOpen(false);
      onSearch?.(searchTerm.trim());
    }
  };

  const handleClear = () => {
    setSearchTerm('');
    setSuggestions([]);
    setIsOpen(false);
    onSearch?.('');
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <div className="absolute left-3.5 text-neutral-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => suggestions.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 bg-neutral-100 hover:bg-neutral-50/80 focus:bg-white text-sm text-neutral-900 rounded-pill border border-neutral-200/90 focus:border-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-700/20 transition-all placeholder:text-neutral-400"
        />

        <div className="absolute right-3 flex items-center gap-1">
          {isLoading && <Loader2 className="w-4 h-4 text-brand-700 animate-spin" />}
          {searchTerm && !isLoading && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-neutral-400 hover:text-neutral-700 rounded-full"
              aria-label="Limpar busca"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </form>

      {/* Dropdown de Sugestões de Busca Tolerante pg_trgm */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-lg shadow-lg border border-neutral-200 overflow-hidden z-40 divide-y divide-neutral-100 animate-fade-in">
          <div className="px-3 py-2 bg-neutral-50 text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
            Produtos encontrados para "{searchTerm}"
          </div>
          {suggestions.map((item) => {
            const img =
              item.images?.find((i) => i.is_primary)?.image_url ||
              item.images?.[0]?.image_url ||
              'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=100&q=80';

            const formattedPrice = new Intl.NumberFormat('pt-BR', {
              style: 'currency',
              currency: 'BRL',
            }).format(item.price);

            return (
              <div
                key={item.product_id}
                onClick={() => {
                  setIsOpen(false);
                  onSelectProduct?.(item);
                }}
                className="px-3.5 py-2.5 flex items-center gap-3 hover:bg-brand-50/60 cursor-pointer transition-colors"
              >
                <img
                  src={img}
                  alt={item.name}
                  className="w-10 h-10 rounded-md object-cover bg-neutral-100 shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block truncate">
                    {item.brand}
                  </span>
                  <h4 className="text-xs font-medium text-neutral-900 truncate">{item.name}</h4>
                </div>
                <div className="text-xs font-bold text-neutral-900 whitespace-nowrap">
                  {formattedPrice}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
