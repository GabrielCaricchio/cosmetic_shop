import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, Zap, Minus, Plus, MessageCircle } from 'lucide-react';
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
      name: 'Batom Matte Longa Duração',
      slug: slug || 'batom-matte',
      brand: 'Aura Premium',
      price: 49.9,
      stock_quantity: 5,
      description: 'Alta pigmentação com acabamento aveludado e hidratação profunda por até 12 horas.',
      ingredients: 'Cera vegetal, manteiga de karité, pigmentos minerais e vitamina E.',
      howToUse: 'Aplique uniformemente sobre os lábios limpos e secos.',
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (slug) {
      setLoading(true);
      apiClient
        .get(`/products/${slug}`)
        .then((res) => {
          if (res.data) setProduct(res.data);
        })
        .catch((err) => {
          console.warn('Usando dados em cache/fallback para o produto:', err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [slug]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 p-4">
        <p className="text-neutral-500 text-sm">Carregando produto...</p>
      </div>
    );
  }

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;

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
    <div className="min-h-screen bg-neutral-50 py-6 sm:py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Voltar */}
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar ao catálogo
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Galeria */}
          <div>
            <ProductGallery images={product.images || []} productName={product.name} />
          </div>

          {/* Informações e Compra */}
          <div className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-rose-600">
                  {product.brand}
                </span>
                {product.sku && (
                  <span className="text-xs text-neutral-400 font-mono">
                    SKU: {product.sku}
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-serif leading-tight">
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
                  <Badge variant="success">Em estoque disponível</Badge>
                )}
              </div>

              {/* Preço */}
              <div className="mt-6 flex items-baseline gap-3">
                {product.promotional_price ? (
                  <>
                    <span className="text-3xl font-black text-rose-600">
                      {formatPrice(product.promotional_price)}
                    </span>
                    <span className="text-lg text-neutral-400 line-through">
                      {formatPrice(product.price)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-black text-neutral-900">
                    {formatPrice(product.price)}
                  </span>
                )}
              </div>

              <p className="mt-2 text-xs text-neutral-500">
                Pague via <strong>Pix com desconto</strong> ou em até 3x sem juros no cartão.
              </p>

              {/* Seletor de Quantidade */}
              {!isOutOfStock && (
                <div className="mt-6 flex items-center gap-4">
                  <span className="text-sm font-medium text-neutral-700">Quantidade:</span>
                  <div className="flex items-center rounded-xl border border-neutral-300 bg-white shadow-sm">
                    <button
                      type="button"
                      onClick={handleDecrease}
                      disabled={quantity <= 1}
                      className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Diminuir quantidade"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-neutral-800">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrease}
                      disabled={quantity >= product.stock_quantity}
                      className="p-2 text-neutral-600 hover:text-neutral-900 disabled:opacity-30 disabled:cursor-not-allowed"
                      aria-label="Aumentar quantidade"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Botões de Ação */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button
                  type="button"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleDirectBuy}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 shadow-md flex items-center justify-center gap-2"
                >
                  <Zap className="h-5 w-5 fill-current" /> Comprar Agora
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  className="flex-1 border-neutral-300 text-neutral-800 hover:bg-neutral-100 font-semibold py-3.5 flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="h-5 w-5" /> Adicionar à Sacola
                </Button>
              </div>
            </div>

            {/* Acordeões de Detalhes */}
            <ProductAccordions
              description={product.description}
              ingredients={product.ingredients}
              howToUse={product.how_to_use}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
