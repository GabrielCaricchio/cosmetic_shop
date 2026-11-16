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
    <div className="flex items-center gap-3 py-3 border-b border-neutral-100 last:border-b-0">
      {/* Thumbnail */}
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-neutral-100 border border-neutral-200">
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
        <h4 className="text-sm font-semibold text-neutral-900 truncate">{item.name}</h4>
        <p className="text-xs text-neutral-500 mt-0.5">{formatPrice(effectivePrice)} un.</p>

        {/* Quantidade */}
        <div className="flex items-center gap-2 mt-2">
          <div className="flex items-center rounded-lg border border-neutral-200 bg-white">
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity - 1)}
              className="p-1 text-neutral-500 hover:text-neutral-800"
              aria-label="Diminuir"
            >
              <Minus className="h-3 w-3" />
            </button>
            <span className="w-7 text-center text-xs font-semibold text-neutral-900">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onUpdateQuantity(itemId, item.quantity + 1)}
              disabled={item.stock_quantity !== undefined && item.quantity >= item.stock_quantity}
              className="p-1 text-neutral-500 hover:text-neutral-800 disabled:opacity-30"
              aria-label="Aumentar"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>

          <span className="text-xs font-bold text-neutral-900 ml-auto">
            {formatPrice(itemTotal)}
          </span>
        </div>
      </div>

      {/* Remover */}
      <button
        type="button"
        onClick={() => onRemove(itemId)}
        className="p-1.5 text-neutral-400 hover:text-rose-600 transition-colors"
        aria-label="Remover item"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
};
