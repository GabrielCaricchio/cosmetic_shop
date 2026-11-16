import React from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { CartItemData } from '../../context/CartContext';

export interface CartItemRowProps {
  item: CartItemData;
  onUpdateQuantity: (id: number | string, qty: number) => void;
  onRemove: (id: number | string) => void;
}

export const CartItemRow: React.FC<CartItemRowProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  const itemId = item.product_id !== undefined ? item.product_id : item.id || '';
  const effectivePrice = item.promotional_price ?? item.price;
  const itemTotal = effectivePrice * item.quantity;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="flex items-center gap-3.5 py-3.5 border-b border-warm-100 last:border-b-0">
      {/* Thumbnail com acabamento arredondado */}
      <div className="h-16 w-16 sm:h-18 sm:w-18 shrink-0 overflow-hidden rounded-2xl bg-warm-100/80 border border-warm-200/90 shadow-2xs">
        <img
          src={
            item.image_url ||
            'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&auto=format&fit=crop&q=60'
          }
          alt={item.name}
          className="h-full w-full object-cover object-center"
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs sm:text-sm font-semibold text-warm-900 truncate">{item.name}</h4>
        <p className="text-[11px] text-warm-500 mt-0.5 font-medium">{formatPrice(effectivePrice)} un.</p>

        {/* Quantidade & Subtotal */}
        <div className="flex items-center justify-between gap-2 mt-2">
          <div className="flex items-center rounded-xl border border-warm-200 bg-warm-50/80 shadow-2xs">
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
              className="p-1.5 text-warm-500 hover:text-botanic-900 active:scale-90 transition-colors"
              aria-label="Diminuir"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-6 text-center text-xs font-bold text-warm-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
              disabled={item.stock_quantity !== undefined && item.quantity >= item.stock_quantity}
              className="p-1.5 text-warm-500 hover:text-botanic-900 active:scale-90 transition-colors disabled:opacity-30"
              aria-label="Aumentar"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-xs sm:text-sm font-bold text-warm-900 font-serif">
            {formatPrice(itemTotal)}
          </span>
        </div>
      </div>

      {/* Remover */}
      <button
        type="button"
        onClick={() => onRemove(itemId)}
        className="p-2 text-warm-400 hover:text-terracotta-600 active:scale-90 transition-colors"
        aria-label="Remover item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
