import React, { useState, useEffect } from 'react';
import Header from '../../components/client/Header';
import ProductCard from '../../components/client/ProductCard';
import WhatsAppButton from '../../components/client/WhatsAppButton';
import Spinner from '../../components/common/Spinner';
import Button from '../../components/common/Button';
import { productApi } from '../../services/productApi';
import { Product, Category } from '../../types/product';
import { ClientUser } from '../../types/auth';
import { SlidersHorizontal, Sparkles, ShieldCheck, HeartHandshake, Zap } from 'lucide-react';

export interface HomePageProps {
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, quantity?: number) => void;
  cartItemCount: number;
  onOpenCart: () => void;
  onOpenAuth: () => void;
  user: ClientUser | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  onSelectProduct,
  onAddToCart,
  cartItemCount,
  onOpenCart,
  onOpenAuth,
  user,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [isLoading, setIsLoading] = useState(true);

  // Carrega categorias e produtos
  useEffect(() => {
    productApi.getCategories().then((data) => setCategories(data)).catch(() => {});
  }, []);

  useEffect(() => {
    setIsLoading(true);
    productApi
      .getProducts({
        category_slug: selectedCategorySlug || undefined,
        search: searchTerm || undefined,
        limit: 40,
      })
      .then((data) => {
        let items = data.items || [];
        // Ordenação local conforme seleção
        if (sortBy === 'price_asc') {
          items = [...items].sort((a, b) => a.price - b.price);
        } else if (sortBy === 'price_desc') {
          items = [...items].sort((a, b) => b.price - a.price);
        }
        setProducts(items);
      })
      .catch(() => {
        // Mock fallback seguro para catálogo inicial
        setProducts([
          {
            product_id: 1,
            name: 'Batom Matte Velvet Red',
            slug: 'batom-matte-velvet-red',
            brand: 'Aura Glow',
            description: 'Batom líquido de alta pigmentação com acabamento aveludado sem craquelar.',
            price: 49.9,
            stock_quantity: 45,
            is_active: true,
            images: [
              {
                image_id: 1,
                image_url:
                  'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=600&q=80',
                is_primary: true,
              },
            ],
          },
          {
            product_id: 2,
            name: 'Sérum Facial Antioxidante Vitamina C 15%',
            slug: 'serum-facial-antioxidante-vitamina-c',
            brand: 'Aura Derm',
            description: 'Vitamina C pura com ácido hialurônico para viço e firmeza.',
            price: 89.9,
            stock_quantity: 2, // Últimas unidades
            is_active: true,
            images: [
              {
                image_id: 2,
                image_url:
                  'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=600&q=80',
                is_primary: true,
              },
            ],
          },
          {
            product_id: 3,
            name: 'Máscara Capilar Nutrição Profunda 300g',
            slug: 'mascara-capilar-nutricao-profunda',
            brand: 'Aura Hair',
            description: 'Reconstrução capilar com óleos preciosos e manteiga de karité.',
            price: 64.5,
            stock_quantity: 12,
            is_active: true,
            images: [
              {
                image_id: 3,
                image_url:
                  'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=600&q=80',
                is_primary: true,
              },
            ],
          },
          {
            product_id: 4,
            name: 'Eau de Parfum Floral Sublime 75ml',
            slug: 'eau-de-parfum-floral-sublime',
            brand: 'Aura Fragrances',
            description: 'Notas florais e especiadas com fixação marcante.',
            price: 139.9,
            stock_quantity: 8,
            is_active: true,
            images: [
              {
                image_id: 4,
                image_url:
                  'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=600&q=80',
                is_primary: true,
              },
            ],
          },
        ]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [selectedCategorySlug, searchTerm, sortBy]);

  const categoryChips = [
    { id: 'all', name: 'Todos os Cosméticos', slug: '' },
    ...categories.map((c) => ({ id: c.category_id, name: c.name, slug: c.slug })),
  ];

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col">
      {/* Header Fixo */}
      <Header
        cartItemCount={cartItemCount}
        onOpenCart={onOpenCart}
        onOpenAuth={onOpenAuth}
        user={user}
        onSelectProduct={onSelectProduct}
        onSearch={(term) => setSearchTerm(term)}
        categories={categoryChips}
        activeCategorySlug={selectedCategorySlug}
        onSelectCategory={(slug) => setSelectedCategorySlug(slug)}
      />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 w-full">
        {/* Banner Promocional Editorial de Beleza */}
        {!searchTerm && !selectedCategorySlug && (
          <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800 text-white p-6 sm:p-10 mb-8 shadow-md">
            <div className="relative z-10 max-w-xl">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-pill bg-accent-500/20 text-accent-300 text-xs font-semibold mb-3 border border-accent-400/30">
                <Sparkles className="w-3.5 h-3.5" /> Curadoria Multimarca de Alta Performance
              </span>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white leading-tight">
                Beleza que cuida, transforma e empodera.
              </h1>
              <p className="mt-3 text-xs sm:text-sm text-neutral-300 leading-relaxed max-w-md">
                Cosméticos selecionados a dedo das melhores marcas nacionais e importadas. Compre em 1 clique
                com aprovação Pix instantânea.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setSelectedCategorySlug('skincare')}
                  className="bg-white text-brand-950 hover:bg-neutral-100 font-bold"
                >
                  Conhecer Cuidados com a Pele
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Barra de Filtros e Ordenação */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-neutral-200">
          <div>
            <h2 className="text-xl font-bold font-serif text-neutral-900">
              {searchTerm
                ? `Resultados para "${searchTerm}"`
                : selectedCategorySlug
                ? `Categoria: ${selectedCategorySlug}`
                : 'Destaques do Catálogo'}
            </h2>
            <span className="text-xs text-neutral-500">
              {products.length} {products.length === 1 ? 'cosmético disponível' : 'cosméticos disponíveis'}
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-neutral-600 shrink-0">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-700" />
              <span>Ordenar:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="text-xs font-medium rounded-md border border-neutral-300 bg-white px-3 py-2 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
            >
              <option value="newest">Lançamentos</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
            </select>
          </div>
        </div>

        {/* Vitrine de Produtos: Grid Responsivo (2 colunas mobile, 4 colunas desktop) */}
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-neutral-400">
            <Spinner size="lg" className="text-brand-700 mb-3" />
            <span className="text-xs font-medium">Buscando cosméticos na vitrine...</span>
          </div>
        ) : products.length === 0 ? (
          <div className="py-16 text-center max-w-md mx-auto">
            <h3 className="text-base font-serif font-bold text-neutral-800">
              Nenhum cosmético encontrado
            </h3>
            <p className="text-xs text-neutral-500 mt-1">
              Não encontramos produtos com os filtros aplicados. Tente outro termo ou limpe a busca.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => {
                setSearchTerm('');
                setSelectedCategorySlug('');
              }}
            >
              Limpar Filtros e Ver Todos
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.product_id}
                product={product}
                onAddToCart={onAddToCart}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        )}

        {/* Faixa de Diferenciais e Confiança */}
        <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10 border-t border-neutral-200">
          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200/80 shadow-xs">
            <div className="p-2.5 rounded-full bg-brand-50 text-brand-700 shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Pix Instantâneo</h4>
              <p className="text-[11px] text-neutral-500">Aprovação imediata e reserva garantida</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200/80 shadow-xs">
            <div className="p-2.5 rounded-full bg-emerald-50 text-emerald-700 shrink-0">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Suporte Humanizado</h4>
              <p className="text-[11px] text-neutral-500">Tire dúvidas de pele e maquiagem no WhatsApp</p>
            </div>
          </div>

          <div className="flex items-center gap-3 p-4 bg-white rounded-lg border border-neutral-200/80 shadow-xs">
            <div className="p-2.5 rounded-full bg-amber-50 text-amber-700 shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-neutral-900">Anti-Overselling</h4>
              <p className="text-[11px] text-neutral-500">Estoque 100% confiável com trava atômica</p>
            </div>
          </div>
        </div>
      </main>

      {/* Botão Flutuante do WhatsApp */}
      <WhatsAppButton />

      {/* Rodapé Institucional */}
      <footer className="bg-neutral-950 text-neutral-300 text-xs py-10 mt-16 border-t border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <span className="font-serif text-lg font-bold text-white block mb-2">
              Aura Cosméticos
            </span>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Plataforma de alta escala para revendedoras de cosméticos multimarca. Garantia de procedência e
              cuidado em cada entrega.
            </p>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Categorias
            </h5>
            <ul className="space-y-1.5 text-neutral-400 text-[11px]">
              <li>Skincare & Cuidados Diários</li>
              <li>Maquiagem & Batons</li>
              <li>Tratamento Capilar</li>
              <li>Perfumaria Nobre</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Atendimento
            </h5>
            <ul className="space-y-1.5 text-neutral-400 text-[11px]">
              <li>Segunda a Sexta: 08h às 19h</li>
              <li>Sábado: 09h às 14h</li>
              <li>Suporte Direto via WhatsApp</li>
            </ul>
          </div>

          <div>
            <h5 className="font-semibold text-white uppercase tracking-wider text-[11px] mb-3">
              Segurança & LGPD
            </h5>
            <p className="text-neutral-400 text-[11px] leading-relaxed">
              Em estrita conformidade com a LGPD. Dados pessoais tratados com minimização e senhas criptografadas
              com algoritmo Argon2id.
            </p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-neutral-800 text-center text-neutral-500 text-[10px]">
          © 2026 Aura Cosméticos. Todos os direitos reservados.
        </div>
      </footer>
    </div>
  );
};

export default HomePage;
