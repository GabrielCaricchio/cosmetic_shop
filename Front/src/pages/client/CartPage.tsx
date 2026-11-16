import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, ArrowLeft, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { CartItemRow } from '../../components/client/CartItemRow';
import { Button } from '../../components/common/Button';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, totalItems, updateQuantity, removeFromCart } = useCart();

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Continuar Comprando
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-serif mb-6">
          Sacola de Compras ({totalItems} itens)
        </h1>

        {cartItems.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 rounded-2xl bg-white p-6 shadow-sm border border-neutral-200">
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
            </div>

            {/* Summary */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200 h-fit space-y-4">
              <h2 className="text-base font-bold text-neutral-900 pb-3 border-b border-neutral-100">
                Resumo do Pedido
              </h2>

              <div className="flex justify-between text-sm text-neutral-600">
                <span>Subtotal</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>
              <div className="flex justify-between text-sm text-neutral-600">
                <span>Frete</span>
                <span className="text-emerald-600 font-medium">Calculado no checkout</span>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex justify-between text-base font-bold text-neutral-900">
                <span>Total Estimado</span>
                <span>{formatPrice(totalAmount)}</span>
              </div>

              <Button
                size="lg"
                onClick={() => navigate('/checkout')}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 mt-4 flex items-center justify-center gap-2"
              >
                Prosseguir para o Checkout <ArrowRight className="h-4 w-4" />
              </Button>

              <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Compra 100% segura e protegida
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-12 text-center shadow-sm border border-neutral-200">
            <ShoppingBag className="h-16 w-16 text-neutral-300 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-neutral-800">Sua sacola está vazia</h2>
            <p className="text-sm text-neutral-500 mt-1 mb-6">
              Nenhum produto selecionado até o momento.
            </p>
            <Button onClick={() => navigate('/')}>Ir para a Vitrine</Button>
          </div>
        )}
      </div>
    </div>
  );
};
