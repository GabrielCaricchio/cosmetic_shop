import React from 'react';
import { ShoppingBag, User, Sparkles, MessageCircle } from 'lucide-react';
import SearchBar from './SearchBar';
import { Product } from '../../types/product';
import { ClientUser } from '../../types/auth';

export interface HeaderProps {
  cartItemCount?: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  user?: ClientUser | null;
  onSelectProduct?: (product: Product) => void;
  onSearch?: (term: string) => void;
  categories?: { id: number | string; name: string; slug: string }[];
  activeCategorySlug?: string;
  onSelectCategory?: (slug: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  cartItemCount = 0,
  onOpenCart,
  onOpenAuth,
  user,
  onSelectProduct,
  onSearch,
  categories = [
    { id: 'all', name: 'Todos', slug: '' },
    { id: 1, name: 'Skincare', slug: 'skincare' },
    { id: 2, name: 'Maquiagem', slug: 'maquiagem' },
    { id: 3, name: 'Cabelos', slug: 'cabelos' },
    { id: 4, name: 'Perfumes', slug: 'perfumaria' },
    { id: 5, name: 'Corpo e Banho', slug: 'corpo-e-banho' },
  ],
  activeCategorySlug = '',
  onSelectCategory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 shadow-xs">
      {/* Faixa Superior Promocional / Benefícios */}
      <div className="bg-brand-950 text-brand-100 text-[11px] py-1.5 px-4 text-center font-medium tracking-wide flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-accent-400" />
        <span>Pagamento Instantâneo via Pix com Aprovação em Segundos & Atendimento Humanizado</span>
      </div>

      {/* Barra Principal de Navegação */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logomarca */}
          <a href="/" className="flex items-center gap-2 group shrink-0">
            <span className="w-8 h-8 rounded-full bg-brand-700 text-white flex items-center justify-center font-serif text-lg font-bold group-hover:bg-brand-800 transition-colors shadow-sm">
              A
            </span>
            <div className="flex flex-col">
              <span className="font-serif text-xl font-bold tracking-tight text-neutral-900 group-hover:text-brand-700 transition-colors leading-none">
                Aura
              </span>
              <span className="text-[9px] uppercase tracking-widest text-brand-600 font-semibold leading-tight">
                Cosméticos
              </span>
            </div>
          </a>

          {/* Barra de Busca Inteligente Desktop */}
          <div className="hidden md:flex flex-1 max-w-lg mx-4">
            <SearchBar onSelectProduct={onSelectProduct} onSearch={onSearch} />
          </div>

          {/* Ações: Perfil, Atendimento e Sacola */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Atalho WhatsApp */}
            <a
              href="/api/whatsapp-redirect"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Atendimento via WhatsApp"
              className="p-2 text-neutral-600 hover:text-emerald-600 hover:bg-neutral-100 rounded-full transition-colors hidden sm:flex items-center justify-center"
            >
              <MessageCircle className="w-5 h-5" />
            </a>

            {/* Conta / Login */}
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 text-neutral-700 hover:text-brand-700 hover:bg-brand-50/60 rounded-md transition-colors text-xs font-semibold"
            >
              <User className="w-4 h-4 text-brand-700" />
              <span className="hidden sm:inline">
                {user ? `Olá, ${user.name.split(' ')[0]}` : 'Entrar'}
              </span>
            </button>

            {/* Carrinho / Sacola */}
            <button
              onClick={onOpenCart}
              aria-label="Abrir sacola de compras"
              className="relative p-2.5 bg-brand-50 hover:bg-brand-100 text-brand-900 rounded-md transition-colors flex items-center gap-2"
            >
              <ShoppingBag className="w-5 h-5 text-brand-700" />
              <span className="hidden sm:inline text-xs font-bold text-brand-900">
                Sacola
              </span>
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-brand-700 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center shadow-sm animate-scale-up">
                  {cartItemCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Busca em Mobile (segunda linha) */}
        <div className="md:hidden pb-3">
          <SearchBar onSelectProduct={onSelectProduct} onSearch={onSearch} />
        </div>
      </div>

      {/* Linha de Categorias / Chips de Rolagem Horizontal Suave */}
      {categories.length > 0 && (
        <div className="border-t border-neutral-100 bg-neutral-50/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center gap-2 py-2 overflow-x-auto no-scrollbar scroll-smooth">
              {categories.map((cat) => {
                const isActive = activeCategorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory?.(cat.slug)}
                    className={`
                      px-3.5 py-1 rounded-pill text-xs font-medium whitespace-nowrap transition-all
                      ${
                        isActive
                          ? 'bg-brand-700 text-white shadow-xs'
                          : 'bg-white text-neutral-700 border border-neutral-200 hover:border-brand-300 hover:text-brand-800'
                      }
                    `}
                  >
                    {cat.name}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
