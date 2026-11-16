import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Zap,
  ChevronDown,
  Sparkles,
  ArrowLeft,
  MessageCircle,
  Plus,
  Minus,
} from 'lucide-react';
import { productApi } from '../../services/productApi';
import { supportApi } from '../../services/supportApi';
import { Product } from '../../types/product';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';

export interface ProductDetailPageProps {
  onAddToCart?: (product: Product, quantity: number) => void;
  onDirectBuy?: (product: Product, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  onAddToCart,
  onDirectBuy,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  // Inicializa o produto com fallback sincronizado com base no slug para permitir renderização imediata
  const [product, setProduct] = useState<Product>(() => ({
    product_id: 1,
    name: slug ? slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Batom Matte Velvet Red',
    slug: slug || 'batom-matte-velvet-red',
    brand: 'Aura Cosméticos',
    description:
      'Formulação enriquecida com ativos dermatológicos de alta performance, proporcionando hidratação profunda, fixação prolongada e acabamento impecável.',
    ingredients:
      'Aqua, Dimethicone, Isododecane, Tocopherol (Vitamina E), Hyaluronic Acid, Phenoxyethanol.',
    price: 79.9,
    stock_quantity: 5,
    is_active: true,
    images: [
      {
        image_id: 1,
        image_url:
          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
        is_primary: true,
      },
    ],
  }));

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Acordeões sanfonados
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    description: true,
    application: false,
    ingredients: false,
    validity: false,
  });

  useEffect(() => {
    if (!slug) return;
    productApi
      .getProduct(slug)
      .then((data) => {
        if (data) setProduct(data);
      })
      .catch(() => {
        // Mantém dados iniciais
      });
  }, [slug]);

  const toggleSection = (key: string) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleQuantityChange = (delta: number) => {
    if (!product) return;
    const newQty = quantity + delta;
    if (newQty >= 1 && newQty <= Math.min(product.stock_quantity, 10)) {
      setQuantity(newQty);
    }
  };

  const handleBuyNow = () => {
    if (!product || product.stock_quantity === 0) return;
    if (onDirectBuy) {
      onDirectBuy(product, quantity);
    } else {
      sessionStorage.setItem(
        'direct_checkout_item',
        JSON.stringify({ product, quantity })
      );
      navigate('/checkout');
    }
  };

  const handleAddCart = () => {
    if (!product || product.stock_quantity === 0) return;
    onAddToCart?.(product, quantity);
  };

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;
  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          {
            image_id: 1,
            image_url:
              'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=800&q=80',
            is_primary: true,
          },
        ];
  const activeImage = images[selectedImageIndex]?.image_url || images[0].image_url;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <div className="min-h-screen bg-neutral-50 pb-20 pt-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-brand-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao catálogo</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Coluna da Galeria (Desktop: 7 colunas, Mobile: topo) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            {/* Imagem Principal */}
            <div className="relative aspect-square w-full bg-white rounded-xl border border-neutral-200 overflow-hidden shadow-sm flex items-center justify-center">
              <img
                src={activeImage}
                alt={product.name}
                className="w-full h-full object-cover object-center"
              />

              {/* Badges de Estoque */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                {isOutOfStock ? (
                  <Badge variant="danger" size="md">
                    Esgotado
                  </Badge>
                ) : isLowStock ? (
                  <Badge variant="warning" size="md">
                    Últimas {product.stock_quantity} unidades
                  </Badge>
                ) : (
                  <Badge variant="success" size="md">
                    Em Estoque ({product.stock_quantity} un.)
                  </Badge>
                )}
              </div>
            </div>

            {/* Miniaturas da Galeria */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto no-scrollbar">
                {images.map((img, idx) => (
                  <button
                    key={img.image_id || idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`
                      w-20 h-20 rounded-lg overflow-hidden border-2 transition-all shrink-0 bg-white
                      ${
                        selectedImageIndex === idx
                          ? 'border-brand-700 shadow-sm'
                          : 'border-neutral-200 opacity-70 hover:opacity-100'
                      }
                    `}
                  >
                    <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Coluna de Compra e Detalhes (Desktop: 5 colunas) */}
          <div className="lg:col-span-5 flex flex-col">
            <span className="text-xs font-bold text-neutral-400 uppercase tracking-widest">
              {product.brand}
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold font-serif text-neutral-900 mt-1">
              {product.name}
            </h1>

            {/* Preço e Destaque Pix */}
            <div className="mt-4 p-4 rounded-xl bg-brand-50/60 border border-brand-100">
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-neutral-900 font-serif">
                  {formattedPrice}
                </span>
                <span className="text-xs text-neutral-500 font-medium">no Pix à vista</span>
              </div>
              <p className="text-xs text-brand-800 font-semibold mt-1 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-accent-500" />
                <span>Aprovação instantânea em segundos sem filas</span>
              </p>
            </div>

            {/* Seletor de Quantidade */}
            {!isOutOfStock && (
              <div className="mt-6 flex items-center gap-4">
                <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                  Quantidade:
                </span>
                <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    disabled={quantity <= 1}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
                    aria-label="Diminuir quantidade"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-12 text-center text-sm font-bold text-neutral-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    disabled={quantity >= product.stock_quantity}
                    className="p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
                    aria-label="Aumentar quantidade"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Ações CTAs Principais */}
            <div className="mt-6 flex flex-col gap-3">
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={isOutOfStock}
                onClick={handleBuyNow}
                leftIcon={<Zap className="w-5 h-5 text-accent-300" />}
                className="shadow-md"
              >
                Comprar Agora
              </Button>

              <Button
                variant="outline"
                size="lg"
                fullWidth
                disabled={isOutOfStock}
                onClick={handleAddCart}
                leftIcon={<ShoppingBag className="w-5 h-5" />}
              >
                Adicionar à Sacola
              </Button>
            </div>

            {/* Atendimento WhatsApp Humanizado */}
            <div className="mt-5 p-3.5 bg-emerald-50/60 rounded-lg border border-emerald-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs text-neutral-700 font-medium">
                  Dúvidas sobre o produto ou aplicação?
                </span>
              </div>
              <a
                href={supportApi.getWhatsAppUrl({ product_name: product.name })}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-emerald-800 hover:underline shrink-0 ml-2"
              >
                Fale com a Revendedora
              </a>
            </div>

            {/* Abas Sanfonadas (Acordeões) de Informações Reais */}
            <div className="mt-8 border-t border-neutral-200 divide-y divide-neutral-200">
              {/* Descrição */}
              <div className="py-4">
                <button
                  onClick={() => toggleSection('description')}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-neutral-900 font-serif"
                >
                  <span>Descrição & Benefícios</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      openSections.description ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSections.description && (
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    {product.description ||
                      'Cosmético de alta performance desenvolvido para resultados dermatológicos visíveis e sensação confortável ao longo do dia.'}
                  </p>
                )}
              </div>

              {/* Modo de Aplicação */}
              <div className="py-4">
                <button
                  onClick={() => toggleSection('application')}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-neutral-900 font-serif"
                >
                  <span>Modo de Aplicação</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      openSections.application ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSections.application && (
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    Aplique uma pequena quantidade sobre a região limpa e seca, espalhando em movimentos
                    circulares até completa absorção. Uso diário.
                  </p>
                )}
              </div>

              {/* Composição / Ingredientes */}
              <div className="py-4">
                <button
                  onClick={() => toggleSection('ingredients')}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-neutral-900 font-serif"
                >
                  <span>Composição & Fórmula INCI</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      openSections.ingredients ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSections.ingredients && (
                  <p className="mt-2.5 text-xs font-mono text-neutral-600 bg-neutral-100 p-2.5 rounded-md leading-relaxed">
                    {product.ingredients ||
                      'Aqua, Dimethicone, Tocopherol (Vitamina E), Hyaluronic Acid, Parfum.'}
                  </p>
                )}
              </div>

              {/* Validade */}
              <div className="py-4">
                <button
                  onClick={() => toggleSection('validity')}
                  className="w-full flex items-center justify-between text-left text-sm font-bold text-neutral-900 font-serif"
                >
                  <span>Prazo de Validade & Lote</span>
                  <ChevronDown
                    className={`w-4 h-4 text-neutral-500 transition-transform ${
                      openSections.validity ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openSections.validity && (
                  <p className="mt-2.5 text-xs text-neutral-600 leading-relaxed">
                    Validade mínima de 24 meses a partir da data de fabricação. Produto lacrado de fábrica.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetailPage;
