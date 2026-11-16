import React, { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useOrderPolling } from '../../hooks/useOrderPolling';
import { orderApi } from '../../services/orderApi';
import { supportApi } from '../../services/supportApi';
import { Order } from '../../types/order';
import PixPaymentBox from '../../components/client/PixPaymentBox';
import OrderStepper from '../../components/client/OrderStepper';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { CheckCircle2, MessageCircle, ArrowLeft } from 'lucide-react';

export const OrderSuccessPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutResponse = (location.state as any)?.checkoutResponse;

  const [order, setOrder] = useState<Order | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);

  // Polling em tempo real para verificar se o Pix foi pago sem recarregar a página
  const { order: polledOrder } = useOrderPolling(id, {
    intervalMs: 3000,
    enabled: true,
  });

  const activeOrder = polledOrder || order;

  useEffect(() => {
    if (!id) return;

    orderApi
      .getOrder(id)
      .then((data) => {
        setOrder(data);
      })
      .catch(() => {
        // Fallback baseado no state do checkout
        if (checkoutResponse) {
          setOrder({
            order_id: checkoutResponse.order_id,
            total_amount: checkoutResponse.total_amount,
            status: checkoutResponse.status,
            shipping_address: {
              street: 'Endereço informado no checkout',
              number: '',
              neighborhood: '',
              city: 'São Paulo',
              state: 'SP',
              zip_code: '',
            },
            items: [],
            payment_method: checkoutResponse.payment_method,
            pix_qr_code_base64: checkoutResponse.pix_qr_code_base64,
            pix_copy_paste: checkoutResponse.pix_copy_paste,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      })
      .finally(() => {
        setInitialLoading(false);
      });
  }, [id, checkoutResponse]);

  if (initialLoading && !activeOrder) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Spinner size="lg" className="text-brand-700 mb-3" />
        <span className="text-xs text-neutral-500">Localizando seu pedido...</span>
      </div>
    );
  }

  const isPixPending =
    activeOrder?.status === 'pending' &&
    (activeOrder?.pix_copy_paste || checkoutResponse?.pix_copy_paste);

  const isApproved = ['paid', 'approved', 'preparing', 'shipped', 'delivered'].includes(
    activeOrder?.status || ''
  );

  return (
    <div className="min-h-screen bg-neutral-50 py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Banner de Celebração de Pagamento Aprovado */}
        {isApproved && (
          <div className="mb-8 p-6 bg-gradient-to-r from-emerald-700 to-teal-800 text-white rounded-2xl shadow-md text-center animate-fade-in">
            <div className="inline-flex p-3 rounded-full bg-white/20 text-white mb-3">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold">
              Pagamento Confirmado com Sucesso!
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 mt-2 max-w-md mx-auto">
              Sua reserva no Redis foi consolidada definitivamente no estoque físico. Seu pedido já está
              sendo separado pela nossa equipe!
            </p>
          </div>
        )}

        {/* Card Principal do Pedido */}
        <div className="bg-white rounded-2xl border border-neutral-200/90 shadow-xs p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-neutral-200 gap-4">
            <div>
              <span className="text-xs font-semibold text-neutral-400 uppercase tracking-widest block">
                Pedido Gerado
              </span>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-neutral-900 mt-0.5">
                #{activeOrder?.order_id.slice(0, 13)}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <a
                href={supportApi.getWhatsAppUrl({
                  order_id: activeOrder?.order_id,
                })}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold hover:bg-emerald-100 transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span>Acompanhar no WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Stepper Visual de Acompanhamento */}
          <div className="py-6">
            <OrderStepper status={activeOrder?.status || 'pending'} />
          </div>

          {/* Bloco de Pagamento Pix (enquanto status estiver pending) */}
          {isPixPending && (
            <div className="mt-4 pt-6 border-t border-neutral-200">
              <PixPaymentBox
                qrCodeBase64={
                  activeOrder?.pix_qr_code_base64 || checkoutResponse?.pix_qr_code_base64
                }
                copyPasteCode={
                  activeOrder?.pix_copy_paste || checkoutResponse?.pix_copy_paste
                }
                expiresAt={
                  checkoutResponse?.expires_at || new Date(Date.now() + 1800000).toISOString()
                }
                totalAmount={activeOrder?.total_amount}
              />
            </div>
          )}

          {/* Detalhes de Entrega */}
          {activeOrder?.shipping_address && (
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <h3 className="text-xs font-bold text-neutral-700 uppercase tracking-wider mb-2">
                Endereço de Destino
              </h3>
              <p className="text-xs text-neutral-600 leading-relaxed">
                {activeOrder.shipping_address.street}, {activeOrder.shipping_address.number}
                {activeOrder.shipping_address.complement
                  ? ` - ${activeOrder.shipping_address.complement}`
                  : ''}
                <br />
                {activeOrder.shipping_address.neighborhood} — {activeOrder.shipping_address.city} /{' '}
                {activeOrder.shipping_address.state}
              </p>
            </div>
          )}
        </div>

        {/* Botão Retornar à Loja */}
        <div className="text-center">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate('/')}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar para o Início da Loja
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
