import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Zap, Minus, Plus, Sparkles, ShieldCheck, Truck } from 'lucide-react';
import { ProductGallery } from '../../components/client/ProductGallery';
import { ProductAccordions } from '../../components/client/ProductAccordions';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/apiClient';
import { Product } from '../../types/product';

export interface ProductDetailPageProps {
  initialProduct?: Product;
  onAddToCart?: (product: Product, quantity: number) => void;
  onDirectBuy?: (product: Product, quantity: number) => void;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  initialProduct,
  onAddToCart,
  onDirectBuy,
}) => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(
    initialProduct || {
      id: 'default-pdp',
      name: 'Batom Matte Longa Duração Velvet Red',
      slug: slug || 'batom-matte',
      brand: 'Aura Glow',
      price: 49.9,
      stock_quantity: 5,
      description: 'Alta pigmentação com acabamento aveludado e hidratação profunda por até 12 horas.',
      ingredients: 'Cera vegetal, manteiga de karité, pigmentos minerais e vitamina E.',
      how_to_use: 'Aplique uniformemente sobre os lábios limpos e secos.',
      images: [
        {
          image_url:
            'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&auto=format&fit=crop&q=80',
          is_primary: true,
        },
      ],
    }
  );
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (slug) {
      apiClient
        .get(`/products/${slug}`)
        .then((res) => {
          if (res.data) setProduct(res.data);
        })
        .catch((err) => {
          console.warn('Usando dados em cache/fallback para o produto:', err.message);
        });
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-50 p-4">
        <p className="text-warm-500 text-sm font-medium">Carregando detalhes do cosmético...</p>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;
  const effectivePrice = product.promotional_price ?? product.price;
  const pixPrice = effectivePrice * 0.95;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleDecrease = () => {
    if (quantity > 1) setQuantity(quantity - 1);
  };

  const handleIncrease = () => {
    if (quantity < product.stock_quantity) setQuantity(quantity + 1);
  };

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product, quantity);
    }
  };

  const handleDirectBuy = () => {
    sessionStorage.setItem(
      'direct_checkout_item',
      JSON.stringify({
        product,
        quantity,
      })
    );
    if (onDirectBuy) {
      onDirectBuy(product, quantity);
    } else {
      navigate('/checkout');
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 pb-28 lg:pb-12 pt-4 sm:pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Botão Voltar */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-botanic-950 transition-colors mb-5 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-14">
          {/* Galeria de Fotos */}
          <div>
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Informações e Compra */}
          <div className="flex flex-col justify-between">
            <div>
              {/* Marca & Tags */}
              <div className="flex items-center justify-between gap-2 mb-2.5">
                <span className="text-xs font-bold uppercase tracking-widest text-botanic-700">
                  {product.brand}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-champagne-100 px-2.5 py-0.5 text-[11px] font-semibold text-champagne-800">
                  <Sparkles className="h-3 w-3 text-champagne-600" /> Fórmula Pura
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-warm-900 font-serif leading-tight">
                {product.name}
              </h1>

              {/* Status do Estoque */}
              <div className="mt-3 flex items-center gap-2">
                {isOutOfStock ? (
                  <Badge variant="danger">Esgotado no momento</Badge>
                ) : isLowStock ? (
                  <Badge variant="warning">
                    Apenas {product.stock_quantity} unidades restantes!
                  </Badge>
                ) : (
                  <Badge variant="botanic">Em estoque imediato</Badge>
                )}
              </div>

              {/* Bloco de Preço & Pix */}
              <div className="mt-6 p-4 rounded-3xl bg-white border border-warm-200/90 shadow-2xs space-y-2">
                <div className="flex items-baseline gap-3">
                  {product.promotional_price ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-bold font-serif text-warm-900">
                        {formatPrice(product.promotional_price)}
                      </span>
                      <span className="text-sm sm:text-base text-warm-400 line-through">
                        {formatPrice(product.price)}
                      </span>
                    </>
                  ) : (
                    <span className="text-2xl sm:text-3xl font-bold font-serif text-warm-900">
                      {formatPrice(product.price)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl">
                  <span>No Pix com 5% de desconto:</span>
                  <span className="text-sm font-bold">{formatPrice(pixPrice)}</span>
                </div>

                <p className="text-[11px] text-warm-500 pt-1">
                  ou em até <strong>3x de {formatPrice(effectivePrice / 3)}</strong> sem juros no cartão
                </p>
              </div>

              {/* Seletor de Quantidade */}
              {!isOutOfStock && (
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-xs font-bold uppercase tracking-wider text-warm-700">Quantidade:</span>
                  <div className="flex items-center rounded-2xl border border-warm-200 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="p-2.5 text-warm-600 hover:text-botanic-900 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-bold text-warm-900">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2.5 text-warm-600 hover:text-botanic-900 active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Botões de Ação Desktop */}
              <div className="hidden lg:flex gap-3 mt-8">
                <Button
                  type="button"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleDirectBuy}
                  className="flex-1 bg-gradient-to-r from-botanic-900 to-botanic-950 text-white font-bold py-3.5 shadow-luxury flex items-center justify-center gap-2 hover:from-botanic-950 hover:to-black"
                >
                  <Zap className="h-4 w-4 fill-champagne-400 text-champagne-400" /> Comprar Agora
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 border-warm-300 text-warm-900 hover:bg-warm-100 font-bold py-3.5 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-4 w-4 text-botanic-800" /> Adicionar à Sacola
                </Button>
              </div>

              {/* Selos de Benefício Rápido */}
              <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-warm-700">
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/70 border border-warm-200/70">
                  <Truck className="h-4 w-4 text-champagne-600 shrink-0" />
                  <span>Frete Grátis acima de R$ 149</span>
                </div>
                <div className="flex items-center gap-2 p-2.5 rounded-2xl bg-white/70 border border-warm-200/70">
                  <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Garantia de 30 dias</span>
                </div>
              </div>
            </div>

            {/* Acordeões Dermatológicos e de Uso */}
            <ProductAccordions
              description={product.description}
              ingredients={product.ingredients}
              howToUse={product.how_to_use}
            />
          </div>
        </div>
      </div>

      {/* Barra Fixa de Compra no Rodapé Mobile (Mobile-First 1-Handed Thumb Design) */}
      <div className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-lg border-t border-warm-200/90 px-4 py-3 shadow-float">
        <div className="flex items-center gap-3">
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] uppercase font-bold text-warm-500 truncate">Total à vista</span>
            <span className="text-base font-bold font-serif text-warm-900 leading-tight">
              {formatPrice(effectivePrice * quantity)}
            </span>
          </div>

          <div className="flex flex-1 gap-2">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleAddToCart}
              className="flex-1 h-12 rounded-2xl border border-warm-300 bg-warm-50 text-warm-900 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-40"
              aria-label="Adicionar à sacola"
            >
              <ShoppingBag className="h-4 w-4" /> Sacola
            </button>

            <button
              type="button"
              disabled={isOutOfStock}
              onClick={handleDirectBuy}
              className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-botanic-900 to-botanic-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 disabled:opacity-40"
              aria-label="Finalizar Compra Imediata"
            >
              <Zap className="h-4 w-4 text-champagne-400 fill-champagne-400" /> Finalizar Compra
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
