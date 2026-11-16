import React, { useState, useEffect } from 'react';
import { Header } from '../../components/client/Header';
import { CategoryPills } from '../../components/client/CategoryPills';
import { ProductCard } from '../../components/client/ProductCard';
import { WhatsAppButton } from '../../components/client/WhatsAppButton';
import { useDebounce } from '../../hooks/useDebounce';
import { apiClient } from '../../services/apiClient';
import { Product, Category } from '../../types/product';
import { Sparkles, PackageOpen } from 'lucide-react';

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

  // Load categories
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

  // Load products based on debounced search & category
  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    const params: Record<string, any> = {};
    if (debouncedSearch.trim()) {
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
    <div className="min-h-screen bg-neutral-50 flex flex-col">
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

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Banner Hero */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-rose-900 via-rose-800 to-neutral-900 text-white p-6 sm:p-10 mb-8 shadow-lg">
          <div className="relative z-10 max-w-xl">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-300 backdrop-blur-md mb-3 border border-rose-400/20">
              <Sparkles className="h-3.5 w-3.5" /> Beleza Consciente & Cuidados
            </span>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight font-serif leading-tight">
              Realce sua essência com cosméticos selecionados.
            </h1>
            <p className="mt-2 text-sm sm:text-base text-rose-100/90">
              Fórmulas veganas, maquiagens de alta performance e skincare dermatológico com entrega rápida.
            </p>
          </div>
        </div>

        {/* Category Pills */}
        <div className="mb-6">
          <CategoryPills
            categories={categories}
            selectedCategorySlug={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3 lg:grid-cols-4">
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="animate-pulse rounded-2xl border border-neutral-200 bg-white p-4"
              >
                <div className="aspect-square w-full rounded-xl bg-neutral-200 mb-4" />
                <div className="h-3 w-1/3 bg-neutral-200 rounded mb-2" />
                <div className="h-4 w-3/4 bg-neutral-200 rounded mb-4" />
                <div className="h-5 w-1/2 bg-neutral-200 rounded" />
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
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <PackageOpen className="h-14 w-14 text-neutral-300 mb-3" />
            <h3 className="text-base font-semibold text-neutral-800">
              Nenhum cosmético encontrado
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mt-1">
              Tente buscar por termos diferentes ou selecione outra categoria.
            </p>
          </div>
        )}
      </main>

      <WhatsAppButton />
    </div>
  );
};
