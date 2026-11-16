import React from 'react';
import { ShoppingBag, Sparkles } from 'lucide-react';
import { Product } from '../../types/product';
import { Badge } from '../common/Badge';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onClick?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onClick,
}) => {
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&auto=format&fit=crop&q=60';

  const isOutOfStock = product.stock_quantity <= 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;

  const effectivePrice = product.promotional_price ?? product.price;
  const installments = Math.min(3, Math.max(1, Math.floor(effectivePrice / 20)));
  const installmentValue = effectivePrice / installments;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-3xl border border-warm-200/80 bg-white p-3 sm:p-4 shadow-soft hover:shadow-luxury transition-all duration-300 hover:border-botanic-200 cursor-pointer select-none"
    >
      {/* Imagem do cosmético com aspect-square */}
      <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-warm-100/70">
        <img
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Badges Flutuantes */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {isOutOfStock && <Badge variant="danger">Esgotado</Badge>}
          {isLowStock && <Badge variant="warning">Últimas unidades</Badge>}
          {product.promotional_price && (
            <Badge variant="terracotta">Oferta</Badge>
          )}
        </div>

        {/* Selo Vegano / Efeito sutil no canto inferior */}
        <div className="absolute bottom-2 left-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <span className="inline-flex items-center gap-1 rounded-full bg-botanic-950/80 backdrop-blur-md px-2 py-0.5 text-[10px] font-medium text-champagne-300">
            <Sparkles className="h-2.5 w-2.5 text-champagne-400" /> Fórmula Pura
          </span>
        </div>
      </div>

      {/* Informações do Cosmético */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between">
        <div>
          <p className="text-[11px] font-bold tracking-widest text-botanic-700 uppercase">
            {product.brand}
          </p>
          <h3 className="mt-1 text-sm font-semibold text-warm-900 line-clamp-2 leading-snug group-hover:text-botanic-900 transition-colors">
            {product.name}
          </h3>
        </div>

        {/* Bloco de Preço & Ação de Compra */}
        <div className="mt-4 pt-2.5 border-t border-warm-100 flex items-end justify-between gap-2">
          <div className="flex flex-col">
            {product.promotional_price ? (
              <div className="flex flex-col">
                <span className="text-[11px] text-warm-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-base sm:text-lg font-bold text-warm-900 font-serif leading-none">
                  {formatPrice(product.promotional_price)}
                </span>
              </div>
            ) : (
              <span className="text-base sm:text-lg font-bold text-warm-900 font-serif leading-none">
                {formatPrice(product.price)}
              </span>
            )}

            {/* Parcelamento estilo O Boticário */}
            <span className="text-[10px] text-warm-500 mt-1 font-medium">
              ou {installments}x de {formatPrice(installmentValue)} sem juros
            </span>
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart && onAddToCart(product);
            }}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-botanic-50 text-botanic-900 hover:bg-botanic-900 hover:text-champagne-300 active:scale-90 transition-all duration-200 border border-botanic-200/80 disabled:opacity-30 disabled:cursor-not-allowed shadow-2xs"
            aria-label={`Adicionar ${product.name} à sacola`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
