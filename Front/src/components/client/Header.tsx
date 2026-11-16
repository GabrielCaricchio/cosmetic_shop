import React from 'react';
import { ShoppingBag, User, Sparkles } from 'lucide-react';
import { SearchBar } from './SearchBar';

export interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  cartItemCount?: number;
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
  user?: { name: string } | null;
  onNavigateHome?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchTerm,
  onSearchChange,
  cartItemCount = 0,
  onOpenCart,
  onOpenAuth,
  user,
  onNavigateHome,
}) => {
  const quickSearchTags = ['Vitamina C', 'Batom Velvet', 'Perfume Floral', 'Óleo de Argan'];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-warm-200/80 bg-warm-50/95 backdrop-blur-lg transition-all duration-300 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between gap-3 sm:gap-6">
          {/* Logo & Emblema Botânico */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigateHome && onNavigateHome()}
          >
            <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-botanic-800 via-botanic-900 to-botanic-950 text-champagne-400 shadow-soft group-hover:shadow-luxury group-hover:scale-105 transition-all duration-300 border border-botanic-700/40">
              <Sparkles className="h-5 w-5 animate-pulse" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-botanic-950 font-serif leading-none">
                AURA
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-champagne-600 mt-0.5">
                Botica & Beleza
              </span>
            </div>
          </div>

          {/* Search bar desktop com tags rápidas */}
          <div className="hidden md:flex flex-col flex-1 max-w-lg mx-2">
            <SearchBar value={searchTerm} onChange={onSearchChange} />
            <div className="flex items-center gap-2 mt-1.5 px-1">
              <span className="text-[11px] text-warm-500 font-medium">Populares:</span>
              <div className="flex items-center gap-1.5">
                {quickSearchTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => onSearchChange(tag)}
                    className="text-[11px] text-warm-600 hover:text-botanic-800 hover:underline transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Ações (Conta + Sacola) */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-medium text-warm-800 hover:text-botanic-900 hover:bg-warm-100/80 active:scale-95 transition-all duration-200"
              aria-label="Minha conta"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-warm-200/60 text-warm-700">
                <User className="h-4.5 w-4.5" />
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-[10px] uppercase font-semibold text-warm-500">
                  {user ? 'Olá,' : 'Bem-vinda,'}
                </span>
                <span className="text-xs font-bold text-warm-900 truncate max-w-[100px]">
                  {user ? user.name.split(' ')[0] : 'Entrar / Criar'}
                </span>
              </div>
            </button>

            {/* Sacola Lateral */}
            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex items-center gap-2 h-11 px-3 sm:px-4 rounded-2xl bg-gradient-to-r from-botanic-900 to-botanic-950 text-white hover:from-botanic-950 hover:to-black active:scale-95 shadow-soft hover:shadow-luxury transition-all duration-200 border border-botanic-800/40"
              aria-label="Abrir sacola de compras"
            >
              <div className="relative">
                <ShoppingBag className="h-5 w-5 text-champagne-300" />
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-champagne-500 text-[10px] font-black text-botanic-950 ring-2 ring-botanic-950 shadow-sm animate-bounce">
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </div>
              <span className="hidden sm:inline text-xs font-semibold tracking-wide text-champagne-200">
                Sacola
              </span>
            </button>
          </div>
        </div>

        {/* Search bar mobile */}
        <div className="pb-3 md:hidden">
          <SearchBar value={searchTerm} onChange={onSearchChange} />
        </div>
      </div>
    </header>
  );
};
