import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, Home } from 'lucide-react';
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
    <div className="min-h-screen bg-neutral-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm border border-neutral-200 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-serif">
            Pedido Confirmado com Sucesso!
          </h1>
          <p className="mt-2 text-sm text-neutral-600">
            Agradecemos sua compra! Enviamos os detalhes e o comprovante para seu e-mail.
          </p>

          <div className="mt-6 rounded-2xl bg-neutral-50 p-4 border border-neutral-200 inline-block text-left w-full sm:w-auto">
            <span className="text-xs text-neutral-500 block">Número do Pedido:</span>
            <span className="text-base font-bold text-neutral-900 font-mono">
              #{order?.order_number || id}
            </span>
          </div>

          {/* Stepper */}
          <div className="mt-8 border-t border-neutral-100 pt-6">
            <h2 className="text-sm font-bold text-neutral-800 text-left mb-4">
              Acompanhamento em Tempo Real:
            </h2>
            <OrderStepper status={order?.status || 'approved'} />
          </div>

          {/* Resumo */}
          {order && (
            <div className="mt-6 border-t border-neutral-100 pt-6 text-left">
              <h3 className="text-sm font-bold text-neutral-800 mb-3">Itens do Pedido:</h3>
              <div className="divide-y divide-neutral-100">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-2 flex justify-between text-xs text-neutral-700">
                    <span>
                      {item.quantity}x {item.product?.name || 'Cosmético'}
                    </span>
                    <span className="font-bold">{formatPrice(item.total_price)}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 pt-3 border-t border-neutral-100 flex justify-between text-sm font-bold text-neutral-900">
                <span>Total Pago:</span>
                <span>{formatPrice(order.total_amount)}</span>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Button
              onClick={() => navigate('/')}
              className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 flex items-center justify-center gap-2"
            >
              <Home className="h-4 w-4" /> Voltar à Página Inicial
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
