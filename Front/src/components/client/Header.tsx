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
  return (
    <header className="sticky top-0 z-40 w-full border-b border-neutral-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Logo */}
          <div
            onClick={onNavigateHome}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-rose-500 to-rose-400 text-white shadow-sm">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-neutral-900 font-serif">
                Aura
              </span>
              <span className="text-xs font-medium uppercase tracking-widest text-rose-500 block -mt-1">
                Cosméticos
              </span>
            </div>
          </div>

          {/* Search bar desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <SearchBar value={searchTerm} onChange={onSearchChange} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-100 transition-colors"
              aria-label="Minha conta"
            >
              <User className="h-5 w-5 text-neutral-600" />
              <span className="hidden sm:inline">
                {user ? user.name.split(' ')[0] : 'Entrar'}
              </span>
            </button>

            <button
              type="button"
              onClick={onOpenCart}
              className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-neutral-100 text-neutral-800 hover:bg-neutral-200 transition-colors"
              aria-label="Carrinho de compras"
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-600 text-[11px] font-bold text-white shadow-sm">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
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
