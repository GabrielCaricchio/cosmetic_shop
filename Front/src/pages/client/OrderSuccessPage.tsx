import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home, MessageCircle, Sparkles } from 'lucide-react';
import { OrderStepper } from '../../components/client/OrderStepper';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/apiClient';
import { OrderDetail } from '../../types/order';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    if (id) {
      apiClient
        .get(`/orders/${id}`)
        .then((res) => {
          setOrder(res.data);
        })
        .catch((err) => {
          console.warn('Erro ao carregar detalhes do pedido:', err);
        });
    }
  }, [id]);

  const formatPrice = (val?: number) => {
    if (val === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="min-h-screen bg-warm-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="rounded-3xl bg-white p-6 sm:p-10 shadow-luxury border border-warm-200/90 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-botanic-50 text-botanic-800 border border-botanic-200/80 mb-5 shadow-soft">
            <CheckCircle2 className="h-10 w-10 text-emerald-700" />
          </div>

          <span className="inline-flex items-center gap-1.5 rounded-full bg-champagne-100 px-3.5 py-1 text-xs font-semibold text-champagne-800 mb-3">
            <Sparkles className="h-3.5 w-3.5 text-champagne-600" /> Pedido Registrado com Sucesso
          </span>

          <h1 className="text-2xl sm:text-3xl font-bold text-warm-900 font-serif leading-tight">
            Obrigada pela sua preferência!
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-warm-600 max-w-md mx-auto leading-relaxed">
            Seu pedido foi registrado e estamos preparando seus cosméticos com todo o cuidado e carinho.
          </p>

          <div className="mt-6 rounded-2xl bg-warm-50 p-4 border border-warm-200/80 inline-block text-left w-full sm:w-auto">
            <span className="text-[11px] text-warm-500 font-bold uppercase tracking-wider block">Identificador do Pedido:</span>
            <span className="text-base font-bold text-botanic-950 font-mono">
              #{order?.order_number || id}
            </span>
          </div>

          {/* Stepper Logístico */}
          <div className="mt-8 border-t border-warm-100 pt-6">
            <h2 className="text-xs font-bold uppercase tracking-wider text-warm-700 text-left mb-4">
              Status de Acompanhamento:
            </h2>
            <OrderStepper status={order?.status || 'approved'} />
          </div>

          {/* Resumo dos Itens */}
          {order && (
            <div className="mt-6 border-t border-warm-100 pt-6 text-left">
              <h3 className="text-xs font-bold uppercase tracking-wider text-warm-700 mb-3">Itens Adquiridos:</h3>
              <div className="divide-y divide-warm-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between text-xs text-warm-700">
                    <span>
                      {item.quantity}x {item.product?.name || 'Cosmético'}
                    </span>
                    <span className="font-bold text-warm-900 font-serif">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-warm-100 flex justify-between text-sm font-bold text-warm-900 font-serif">
                <span>Total:</span>
                <span className="text-base text-botanic-900">{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 pt-4 border-t border-warm-100">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex-1 flex items-center justify-center gap-2 border-warm-300 text-warm-800"
            >
              <Home className="h-4 w-4" /> Voltar à Página Inicial
            </Button>
            <Button
              onClick={() => {
                const msg = `Olá! Gostaria de acompanhar o envio do meu pedido #${order?.order_number || id}`;
                window.open(`https://wa.me/5511999999999?text=${encodeURIComponent(msg)}`, '_blank');
              }}
              className="flex-1 bg-gradient-to-r from-botanic-900 to-botanic-950 text-champagne-300 flex items-center justify-center gap-2 font-bold shadow-soft"
            >
              <MessageCircle className="h-4 w-4" /> Suporte via WhatsApp
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
