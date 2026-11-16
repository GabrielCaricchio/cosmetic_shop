import React from 'react';
import { Modal } from '../common/Modal';
import { Badge } from '../common/Badge';
import { OrderDetail } from '../../types/order';

export interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: OrderDetail | null;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  isOpen,
  onClose,
  order,
}) => {
  if (!order) return null;

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes do Pedido #${order.order_number || order.id}`}
      maxWidth="lg"
    >
      <div className="space-y-6 max-h-[70vh] overflow-y-auto px-1 text-xs">
        {/* Header Summary */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-neutral-50 border border-neutral-200">
          <div>
            <span className="text-neutral-500">Status Atual:</span>
            <div className="mt-1">
              <Badge variant="info">{order.status.toUpperCase()}</Badge>
            </div>
          </div>
          <div>
            <span className="text-neutral-500">Forma de Pagamento:</span>
            <p className="font-bold text-neutral-900 mt-0.5 uppercase">
              {order.payment_method}
            </p>
          </div>
          <div>
            <span className="text-neutral-500">Valor Total:</span>
            <p className="font-black text-rose-600 text-sm mt-0.5">
              {formatPrice(order.total_amount)}
            </p>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h4 className="font-bold text-neutral-900 mb-2">Endereço de Entrega:</h4>
          <div className="p-3 rounded-xl bg-white border border-neutral-200 text-neutral-700 leading-relaxed">
            <p>
              {order.shipping_address?.street}, {order.shipping_address?.number}
              {order.shipping_address?.complement ? ` (${order.shipping_address.complement})` : ''}
            </p>
            <p>
              {order.shipping_address?.neighborhood} • {order.shipping_address?.city} - {order.shipping_address?.state}
            </p>
            <p className="font-mono text-neutral-500">CEP: {order.shipping_address?.zip_code}</p>
          </div>
        </div>

        {/* Items List */}
        <div>
          <h4 className="font-bold text-neutral-900 mb-2">Itens Solicitados:</h4>
          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-xl overflow-hidden">
            {order.items?.map((item) => (
              <div key={item.id} className="p-3 flex items-center justify-between bg-white">
                <div>
                  <p className="font-bold text-neutral-900">
                    {item.product?.name || `Produto #${item.product_id}`}
                  </p>
                  <p className="text-neutral-500">
                    {item.quantity} un. x {formatPrice(item.unit_price)}
                  </p>
                </div>
                <span className="font-bold text-neutral-900">
                  {formatPrice(item.total_price)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};
