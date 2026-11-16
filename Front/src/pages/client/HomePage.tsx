import React, { useState, useEffect } from 'react';
import { TopBanner } from '../../components/client/TopBanner';
import { Header } from '../../components/client/Header';
import { CategoryPills } from '../../components/client/CategoryPills';
import { ProductCard } from '../../components/client/ProductCard';
import { WhatsAppButton } from '../../components/client/WhatsAppButton';
import { useDebounce } from '../../hooks/useDebounce';
import { apiClient } from '../../services/apiClient';
import { Product, Category } from '../../types/product';
import { Sparkles, PackageOpen, Truck, ShieldCheck, Gift, ArrowRight } from 'lucide-react';

export interface HomePageProps {
  onSelectProduct?: (product: Product) => void;
  onAddToCart?: (product: Product) => void;
  cartItemCount?: number;
  onOpenCart?: () => void;
  onOpenAuth?: () => void;
  user?: { name: string } | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onAddToCart,
  cartItemCount = 0,
  onOpenCart,
  onOpenAuth,
  user,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const debouncedSearch = useDebounce(searchTerm, 350);

  // Carregar categorias
  useEffect(() => {
    let isMounted = true;
    apiClient
      .get('/categories')
      .then((res) => {
        if (isMounted) setCategories(res.data.items || res.data || []);
      })
      .catch((err) => {
        console.error('Falha ao carregar categorias', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  // Carregar catálogo
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const params: Record<string, any> = {};
    if (debouncedSearch.trim()) {
      params.search = debouncedSearch.trim();
      params.q = debouncedSearch.trim();
    }
    if (selectedCategory) {
      params.category = selectedCategory;
    }

    apiClient
      .get('/products', { params })
      .then((res) => {
        if (isMounted) {
          const items = res.data.items || res.data || [];
          setProducts(items);
        }
      })
      .catch((err) => {
        console.error('Falha ao carregar produtos', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [debouncedSearch, selectedCategory]);

  return (
    <div className="min-h-screen bg-warm-50 flex flex-col selection:bg-champagne-200 selection:text-botanic-950">
      {/* Barra de Comunicados / Benefícios Fixa */}
      <TopBanner />

      {/* Header Principal */}
      <Header
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        cartItemCount={cartItemCount}
        onOpenCart={onOpenCart}
        onOpenAuth={onOpenAuth}
        user={user}
        onNavigateHome={() => {
          setSearchTerm('');
          setSelectedCategory(undefined);
        }}
      />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8 space-y-6 sm:space-y-8">
        {/* Banner Hero Editorial (Estilo O Boticário / Botica Premium) */}
        {!selectedCategory && !searchTerm && (
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-botanic-950 via-botanic-900 to-botanic-800 text-white p-6 sm:p-12 shadow-luxury border border-botanic-800/60">
            {/* Decorações sutis de iluminação */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-champagne-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 -mb-20 w-64 h-64 rounded-full bg-botanic-600/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-botanic-800/80 px-3.5 py-1 text-xs font-semibold text-champagne-300 backdrop-blur-md mb-3 sm:mb-4 border border-botanic-700/50">
                <Sparkles className="h-3.5 w-3.5 text-champagne-400" />
                Edição Botânica • Alta Sensorialidade
              </span>

              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight font-serif leading-tight text-white">
                O ritual de beleza que transforma a sua essência.
              </h1>

              <p className="mt-3 text-xs sm:text-base text-champagne-100/90 max-w-lg leading-relaxed font-normal">
                Perfumaria marcante, skincare dermatológico com Vitamina C e maquiagens aveludadas de longa duração.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('vitrine-produtos');
                    el?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-champagne-500 px-5 py-3 text-xs sm:text-sm font-bold text-botanic-950 hover:bg-champagne-400 active:scale-95 transition-all shadow-md"
                >
                  Explorar Coleção <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Régua de Vantagens (Mobile-first horizontal scroll / desktop grid) */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 pt-1">
          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-warm-200/80 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-botanic-50 text-botanic-800">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-warm-900 leading-tight">Frete Grátis</h4>
              <p className="text-[11px] text-warm-500 mt-0.5">A partir de R$ 149</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-warm-200/80 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-champagne-50 text-champagne-700">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-warm-900 leading-tight">5% OFF no Pix</h4>
              <p className="text-[11px] text-warm-500 mt-0.5">Aprovação imediata</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-warm-200/80 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-warm-900 leading-tight">Vegano & Seguro</h4>
              <p className="text-[11px] text-warm-500 mt-0.5">100% Cruelty-Free</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-warm-200/80 shadow-2xs">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-800">
              <Gift className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-bold text-warm-900 leading-tight">Para Presentear</h4>
              <p className="text-[11px] text-warm-500 mt-0.5">Sacola oficial disponível</p>
            </div>
          </div>
        </section>

        {/* Pílulas de Categoria */}
        <section id="vitrine-produtos" className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold font-serif text-warm-900">
              Navegar por Categoria
            </h2>
            <span className="text-xs text-warm-500 font-medium">
              {products.length} {products.length === 1 ? 'produto' : 'produtos'}
            </span>
          </div>

          <CategoryPills
            categories={categories}
            selectedCategorySlug={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </section>

        {/* Grid de Produtos */}
        <section>
          {isLoading ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {[...Array(8)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-3xl border border-warm-200/80 bg-white p-4 space-y-3"
                >
                  <div className="aspect-square w-full rounded-2xl bg-warm-200/70" />
                  <div className="h-3 w-1/3 bg-warm-200/70 rounded-full" />
                  <div className="h-4 w-3/4 bg-warm-200/70 rounded-full" />
                  <div className="h-5 w-1/2 bg-warm-200/70 rounded-full pt-2" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id || product.product_id}
                  product={product}
                  onAddToCart={onAddToCart}
                  onClick={onSelectProduct}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center rounded-3xl bg-white border border-warm-200/70 my-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-warm-100 text-warm-500 mb-4">
                <PackageOpen className="h-8 w-8" />
              </div>
              <h3 className="text-base font-bold text-warm-900 font-serif">
                Nenhum cosmético encontrado
              </h3>
              <p className="text-xs text-warm-500 max-w-sm mt-1.5 leading-relaxed">
                Não encontramos produtos correspondentes ao termo ou filtro selecionado. Tente buscar por outros termos como <em>"batom"</em>, <em>"perfume"</em> ou <em>"sérum"</em>.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory(undefined);
                }}
                className="mt-4 rounded-xl bg-botanic-900 px-4 py-2 text-xs font-semibold text-champagne-300 hover:bg-botanic-950 transition-colors"
              >
                Limpar Filtros
              </button>
            </div>
          )}
        </section>
      </main>

      <WhatsAppButton />
    </div>
  );
};
