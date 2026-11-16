import React, { useEffect } from 'react';
import { X, ShoppingBag, ArrowRight, MessageCircle } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItemRow } from './CartItemRow';
import { Button } from '../common/Button';

export interface CartDrawerProps {
  onCheckout?: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    isDrawerOpen,
    closeDrawer,
    cartItems,
    totalAmount,
    totalItems,
    updateQuantity,
    removeFromCart,
  } = useCart();

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isDrawerOpen]);

  if (!isDrawerOpen) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleWhatsAppHelp = () => {
    const itemsList = cartItems.map((i) => `${i.quantity}x ${i.name}`).join(', ');
    const msg = `Olá! Gostaria de ajuda para finalizar meu pedido com os itens: ${itemsList}`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
            <div className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-rose-600" />
              <h2 className="text-base font-bold text-neutral-900">
                Sua Sacola ({totalItems})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Items list */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            {cartItems.length > 0 ? (
              <div className="divide-y divide-neutral-100">
                {cartItems.map((item) => (
                  <CartItemRow
                    key={item.product_id !== undefined ? item.product_id : item.id}
                    item={item}
                    onUpdateQuantity={updateQuantity}
                    onRemove={removeFromCart}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <ShoppingBag className="h-16 w-16 text-neutral-200 mb-3" />
                <p className="text-sm font-semibold text-neutral-700">
                  Sua sacola de compras está vazia
                </p>
                <p className="text-xs text-neutral-400 mt-1">
                  Explore nossos cosméticos e adicione seus favoritos.
                </p>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t border-neutral-100 px-6 py-4 bg-neutral-50/50 space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-neutral-500">Subtotal estimado:</span>
                <span className="text-base font-bold text-neutral-900">
                  {formatPrice(totalAmount)}
                </span>
              </div>

              <div className="flex flex-col gap-2">
                <Button
                  size="lg"
                  onClick={() => {
                    closeDrawer();
                    if (onCheckout) onCheckout();
                  }}
                  className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 flex items-center justify-center gap-2"
                >
                  Fechar Pedido <ArrowRight className="h-4 w-4" />
                </Button>

                <button
                  type="button"
                  onClick={handleWhatsAppHelp}
                  className="w-full py-2 text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Comprar ou tirar dúvidas via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
