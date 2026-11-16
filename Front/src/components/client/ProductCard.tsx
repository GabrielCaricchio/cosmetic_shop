import React from 'react';
import { ShoppingBag } from 'lucide-react';
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

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div
      onClick={() => onClick && onClick(product)}
      className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-rose-200 cursor-pointer"
    >
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100">
        <img
          src={primaryImage}
          alt={product.name}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {isOutOfStock && <Badge variant="danger">Esgotado</Badge>}
          {isLowStock && <Badge variant="warning">Últimas unidades</Badge>}
          {product.promotional_price && (
            <Badge variant="success">Oferta</Badge>
          )}
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col justify-between">
        <div>
          <p className="text-xs font-semibold tracking-wider text-rose-600 uppercase">
            {product.brand}
          </p>
          <h3 className="mt-1 text-sm font-medium text-neutral-800 line-clamp-2 leading-snug">
            {product.name}
          </h3>
        </div>

        <div className="mt-4 flex items-center justify-between pt-2 border-t border-neutral-100">
          <div>
            {product.promotional_price ? (
              <div className="flex flex-col">
                <span className="text-xs text-neutral-400 line-through">
                  {formatPrice(product.price)}
                </span>
                <span className="text-base font-bold text-neutral-900">
                  {formatPrice(product.promotional_price)}
                </span>
              </div>
            ) : (
              <span className="text-base font-bold text-neutral-900">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <button
            type="button"
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCart && onAddToCart(product);
            }}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <ShoppingBag className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
