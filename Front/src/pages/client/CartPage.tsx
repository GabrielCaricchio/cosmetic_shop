import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import Button from '../../components/common/Button';
import { ShoppingBag, ArrowLeft, Trash2, Plus, Minus, ArrowRight, ShieldCheck } from 'lucide-react';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, totalItems, updateQuantity, removeFromCart, clearCart } = useCart();

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(totalAmount);

  if (items.length === 0) {
    return (
      <div className="min-h-[70vh] bg-neutral-50 flex flex-col items-center justify-center px-4 py-16 text-center">
        <div className="w-20 h-20 rounded-full bg-brand-50 text-brand-700 flex items-center justify-center mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-neutral-900">Sua sacola está vazia</h2>
        <p className="text-sm text-neutral-500 mt-2 max-w-sm">
          Adicione cosméticos encantadores para prosseguir com seu pedido.
        </p>
        <Button
          variant="primary"
          size="md"
          className="mt-6"
          onClick={() => navigate('/')}
          leftIcon={<ArrowLeft className="w-4 h-4" />}
        >
          Voltar às Compras
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navegação Voltar */}
        <button
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-brand-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Continuar Comprando</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 mb-8">
          Sacola de Cosméticos ({totalItems})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Tabela / Lista de Itens */}
          <div className="lg:col-span-8 bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 divide-y divide-neutral-100">
              {items.map((item) => {
                const unitPrice = item.promotional_price ?? item.price;
                const formattedUnitPrice = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(unitPrice);

                const itemSubtotal = unitPrice * item.quantity;
                const formattedSubtotal = new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(itemSubtotal);

                return (
                  <div
                    key={item.product_id}
                    className="py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={
                          item.image_url ||
                          'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=200&q=80'
                        }
                        alt={item.name}
                        className="w-18 h-18 rounded-lg object-cover bg-neutral-100 border border-neutral-200 shrink-0"
                      />
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-1">
                          {item.name}
                        </h3>
                        <span className="text-xs text-neutral-500 block mt-0.5">
                          Unitário: {formattedUnitPrice}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-6 sm:justify-end">
                      {/* Controles de Quantidade */}
                      <div className="flex items-center border border-neutral-300 rounded-md bg-white">
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                          className="p-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                          aria-label="Diminuir"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-neutral-900 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                          className="p-1.5 text-neutral-600 hover:bg-neutral-100 transition-colors"
                          aria-label="Aumentar"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-neutral-900 font-mono block">
                          {formattedSubtotal}
                        </span>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product_id)}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors"
                        title="Remover da sacola"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-4 bg-neutral-50 border-t border-neutral-200 flex justify-between items-center text-xs">
              <button
                onClick={clearCart}
                className="text-neutral-500 hover:text-red-600 font-medium transition-colors"
              >
                Esvaziar Sacola
              </button>
              <span className="text-neutral-500">Reserva temporária garantida no checkout</span>
            </div>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs p-6 sticky top-24">
              <h2 className="text-base font-bold font-serif text-neutral-900 mb-4">
                Resumo dos Valores
              </h2>

              <div className="space-y-3 text-xs text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal dos itens</span>
                  <span className="font-semibold text-neutral-800 font-mono">{formattedTotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Frete</span>
                  <span className="font-semibold">Calculado na próxima etapa</span>
                </div>
                <div className="border-t border-neutral-200 pt-3 flex justify-between text-base font-bold text-neutral-900">
                  <span>Total</span>
                  <span className="text-brand-800 font-serif text-xl">{formattedTotal}</span>
                </div>
              </div>

              <Button
                variant="primary"
                size="lg"
                fullWidth
                className="mt-6"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => navigate('/checkout')}
              >
                Fechar Pedido
              </Button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Compra segura com trava atômica anti-overselling</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
