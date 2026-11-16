import React, { useEffect, useState } from 'react';
import { X, ShoppingBag, ArrowRight, MessageCircle, Truck, Sparkles, Gift } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItemRow } from './CartItemRow';
import { Button } from '../common/Button';

export interface CartDrawerProps {
  onCheckout?: () => void;
}

const FREE_SHIPPING_THRESHOLD = 149.00;

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

  const [hasGiftWrap, setHasGiftWrap] = useState(false);

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

  const freeShippingProgress = Math.min(100, (totalAmount / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);
  const hasFreeShipping = totalAmount >= FREE_SHIPPING_THRESHOLD;

  const pixTotal = totalAmount * 0.95;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleWhatsAppHelp = () => {
    const itemsList = cartItems.map((i) => `${i.quantity}x ${i.name}`).join(', ');
    const msg = `Olá! Gostaria de ajuda para finalizar meu pedido com os cosméticos: ${itemsList}`;
    window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop com blur */}
      <div
        className="fixed inset-0 bg-botanic-950/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-6 sm:pl-10">
        <div className="w-screen max-w-md bg-warm-50 shadow-float flex flex-col justify-between border-l border-warm-200/80">
          {/* Header da Sacola */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-warm-200/80 bg-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-botanic-50 text-botanic-800">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-base font-bold font-serif text-warm-900 leading-tight">
                  Sua Sacola de Beleza
                </h2>
                <span className="text-[11px] text-warm-500 font-medium">
                  {totalItems} {totalItems === 1 ? 'item adicionado' : 'itens adicionados'}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={closeDrawer}
              className="p-2 rounded-xl text-warm-400 hover:text-warm-700 hover:bg-warm-100 transition-colors"
              aria-label="Fechar sacola"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Barra de Progresso de Frete Grátis (Gamificação O Boticário) */}
          {cartItems.length > 0 && (
            <div className="bg-botanic-50/70 border-b border-botanic-100 px-5 sm:px-6 py-3">
              <div className="flex items-center justify-between text-xs font-semibold text-botanic-900 mb-1.5">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-botanic-700 shrink-0" />
                  {hasFreeShipping ? (
                    <span className="text-emerald-800 font-bold">
                      🎉 Parabéns! Você ganhou <strong>FRETE GRÁTIS</strong>!
                    </span>
                  ) : (
                    <span>
                      Faltam <strong>{formatPrice(remainingForFreeShipping)}</strong> para <strong>Frete Grátis</strong>
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-bold text-botanic-700">
                  {Math.round(freeShippingProgress)}%
                </span>
              </div>

              {/* Barra de progresso com animação */}
              <div className="w-full h-2 rounded-full bg-botanic-200/60 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-champagne-500 via-botanic-600 to-botanic-800 transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Lista de Itens */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 divide-y divide-warm-100">
            {cartItems.length > 0 ? (
              cartItems.map((item) => (
                <CartItemRow
                  key={item.product_id !== undefined ? item.product_id : item.id}
                  item={item}
                  onUpdateQuantity={updateQuantity}
                  onRemove={removeFromCart}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-warm-100 text-warm-400 mb-4">
                  <ShoppingBag className="h-10 w-10" />
                </div>
                <h3 className="text-base font-bold font-serif text-warm-900">
                  Sua sacola está vazia
                </h3>
                <p className="text-xs text-warm-500 max-w-xs mt-1.5 leading-relaxed">
                  Conheça nossa seleção de alta perfumaria, skincare dermatológico e maquiagens aveludadas.
                </p>
                <button
                  type="button"
                  onClick={closeDrawer}
                  className="mt-5 rounded-2xl bg-botanic-900 px-5 py-2.5 text-xs font-bold text-champagne-300 hover:bg-botanic-950 transition-colors shadow-soft"
                >
                  Começar a Comprar
                </button>
              </div>
            )}
          </div>

          {/* Footer com Subtotais e Checkout */}
          {cartItems.length > 0 && (
            <div className="border-t border-warm-200/90 px-5 sm:px-6 py-4 bg-white space-y-3.5 shadow-luxury">
              {/* Opção de Embalagem para Presente */}
              <div
                onClick={() => setHasGiftWrap(!hasGiftWrap)}
                className="flex items-center justify-between p-2.5 rounded-2xl bg-warm-50 border border-warm-200/80 cursor-pointer hover:bg-warm-100/60 transition-colors select-none"
              >
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-champagne-600 shrink-0" />
                  <span className="text-xs font-semibold text-warm-800">
                    Embalagem especial para presente
                  </span>
                </div>
                <span className="text-xs font-bold text-botanic-800">
                  {hasGiftWrap ? 'Adicionado (+ R$ 4,90)' : '+ R$ 4,90'}
                </span>
              </div>

              {/* Subtotal & Desconto Pix */}
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between text-xs text-warm-600">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-warm-900">{formatPrice(totalAmount + (hasGiftWrap ? 4.9 : 0))}</span>
                </div>

                <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold bg-emerald-50/80 px-2.5 py-1 rounded-xl">
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-emerald-600" /> No Pix com 5% OFF:
                  </span>
                  <span className="font-bold">{formatPrice(pixTotal + (hasGiftWrap ? 4.9 : 0))}</span>
                </div>
              </div>

              {/* Botão de Fechar Pedido */}
              <div className="flex flex-col gap-2 pt-1">
                <Button
                  size="lg"
                  onClick={() => {
                    closeDrawer();
                    if (onCheckout) onCheckout();
                  }}
                  className="w-full bg-gradient-to-r from-botanic-900 to-botanic-950 text-white font-bold py-3.5 flex items-center justify-center gap-2 rounded-2xl shadow-luxury hover:from-botanic-950 hover:to-black active:scale-[0.98]"
                >
                  Fechar Pedido <ArrowRight className="h-4 w-4 text-champagne-400" />
                </Button>

                <button
                  type="button"
                  onClick={handleWhatsAppHelp}
                  className="w-full py-2 text-xs font-semibold text-emerald-800 hover:text-emerald-900 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" /> Dúvidas? Fale com uma consultora
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
