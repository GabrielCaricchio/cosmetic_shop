import React from 'react';
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import Button from '../common/Button';

export interface CartDrawerProps {
  onCheckout: () => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ onCheckout }) => {
  const {
    items,
    totalAmount,
    totalItems,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();

  if (!isDrawerOpen) return null;

  const handleCheckoutClick = () => {
    closeDrawer();
    onCheckout();
  };

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalAmount);

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 overflow-hidden bg-neutral-950/60 backdrop-blur-xs transition-opacity animate-fade-in"
      onClick={closeDrawer}
    >
      <div
        className="fixed inset-y-0 right-0 flex max-w-full pl-10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-left">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-200">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-brand-700" />
              <h2 className="text-lg font-serif font-bold text-neutral-900">
                Sua Sacola ({totalItems})
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              aria-label="Fechar sacola"
              className="p-2 text-neutral-400 hover:text-neutral-700 rounded-md transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto p-5 divide-y divide-neutral-100">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
                <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center text-brand-700 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-neutral-800 font-serif">
                  Sua sacola está vazia
                </h3>
                <p className="text-xs text-neutral-500 mt-1 max-w-xs">
                  Explore nossos cosméticos e adicione itens para ver o resumo aqui.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-5"
                  onClick={closeDrawer}
                >
                  Continuar Comprando
                </Button>
              </div>
            ) : (
              items.map((item) => {
                const unitPrice = item.promotional_price ?? item.price;
                const formattedUnitPrice = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(unitPrice);

                return (
                  <div key={item.product_id} className="py-4 flex gap-3.5 first:pt-0 last:pb-0">
                    <img
                      src={
                        item.image_url ||
                        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&q=80'
                      }
                      alt={item.name}
                      className="w-18 h-18 rounded-md object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                    />

                    <div className="flex-1 flex flex-col justify-between">
                      <div className="flex justify-between items-start gap-2">
                        <h4 className="text-xs font-medium text-neutral-900 line-clamp-2">
                          {item.name}
                        </h4>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          aria-label={`Remover ${item.name}`}
                          className="text-neutral-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs font-bold text-neutral-900">
                          {formattedUnitPrice}
                        </span>

                        {/* Controles de Quantidade */}
                        <div className="flex items-center border border-neutral-300 rounded-md bg-neutral-50">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-200 rounded-l transition-colors"
                            aria-label="Diminuir quantidade"
                          >
                            <Minus className="w-3 h-3 text-neutral-700" />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold text-neutral-800 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-200 rounded-r transition-colors"
                            aria-label="Aumentar quantidade"
                          >
                            <Plus className="w-3 h-3 text-neutral-700" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer com Subtotal e CTA */}
          {items.length > 0 && (
            <div className="p-5 border-t border-neutral-200 bg-neutral-50/80">
              <div className="flex items-center justify-between text-sm mb-1.5 text-neutral-600">
                <span>Subtotal</span>
                <span className="font-medium text-neutral-800">{formattedTotal}</span>
              </div>
              <div className="flex items-center justify-between text-xs mb-3 text-emerald-700 font-medium">
                <span>Frete</span>
                <span>Calculado no checkout</span>
              </div>
              <div className="flex items-center justify-between text-base font-bold text-neutral-900 border-t border-neutral-200 pt-3 mb-4">
                <span>Total Estimado</span>
                <span className="text-brand-800 font-serif text-lg">{formattedTotal}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={handleCheckoutClick}
              >
                Avançar para o Pagamento
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
