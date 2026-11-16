import React, { useState } from 'react';
import { ShoppingBag, Check } from 'lucide-react';
import { Product } from '../../types/product';
import Badge from '../common/Badge';

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product, quantity?: number) => void;
  onSelect?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onSelect,
}) => {
  const [isAdded, setIsAdded] = useState(false);

  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=600&q=80';

  const isOutOfStock = product.stock_quantity === 0;
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isOutOfStock) return;

    onAddToCart?.(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <div
      onClick={() => onSelect?.(product)}
      className="group relative bg-white rounded-lg border border-neutral-200/80 hover:border-brand-300 hover:shadow-soft transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
    >
      {/* Imagem com proporção 1:1 e badges */}
      <div className="relative aspect-square w-full bg-neutral-100 overflow-hidden">
        <img
          src={primaryImage}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges de Estoque e Status */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {isOutOfStock && (
            <Badge variant="danger" size="sm">
              Esgotado
            </Badge>
          )}
          {isLowStock && (
            <Badge variant="warning" size="sm">
              Últimas unidades
            </Badge>
          )}
        </div>
      </div>

      {/* Detalhes do Cosmético */}
      <div className="p-3.5 flex flex-col flex-1 justify-between">
        <div>
          <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider block truncate">
            {product.brand}
          </span>
          <h3 className="text-sm font-medium text-neutral-900 line-clamp-2 mt-0.5 group-hover:text-brand-700 transition-colors">
            {product.name}
          </h3>
        </div>

        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between gap-2">
          <div>
            <span className="text-xs text-neutral-400 block font-normal leading-none mb-0.5">
              Por apenas
            </span>
            <span className="text-base font-bold text-neutral-900 tracking-tight">
              {formattedPrice}
            </span>
          </div>

          <button
            onClick={handleAdd}
            disabled={isOutOfStock}
            aria-label={`Adicionar ${product.name} à sacola`}
            className={`
              h-9 px-3 rounded-md flex items-center justify-center gap-1.5 text-xs font-semibold transition-all
              ${
                isOutOfStock
                  ? 'bg-neutral-100 text-neutral-400 cursor-not-allowed'
                  : isAdded
                  ? 'bg-emerald-600 text-white'
                  : 'bg-brand-700 text-white hover:bg-brand-800 active:scale-95'
              }
            `}
          >
            {isAdded ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Adicionado</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Adicionar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
