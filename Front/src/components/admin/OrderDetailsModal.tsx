import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import Badge from '../common/Badge';
import { Order } from '../../types/order';
import { Package, Truck, CheckCircle2, XCircle, MapPin } from 'lucide-react';

export interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (orderId: string, status: string) => Promise<void> | void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onUpdateStatus,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!order) return null;

  const handleStatusChange = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      await onUpdateStatus(order.order_id, newStatus);
      onClose();
    } finally {
      setIsUpdating(false);
    }
  };

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(order.total_amount);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Detalhes do Pedido #${order.order_id.slice(0, 8)}`}
      maxWidth="lg"
    >
      <div className="space-y-5">
        {/* Status e Total */}
        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg border border-neutral-200">
          <div>
            <span className="text-xs text-neutral-500 font-medium block">Status do Pedido</span>
            <div className="mt-1">
              <Badge
                variant={
                  ['paid', 'approved', 'delivered'].includes(order.status)
                    ? 'success'
                    : ['cancelled', 'rejected'].includes(order.status)
                    ? 'danger'
                    : 'warning'
                }
              >
                {order.status}
              </Badge>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-neutral-500 font-medium block">Valor Total</span>
            <span className="text-lg font-bold text-neutral-900 font-mono">{formattedTotal}</span>
          </div>
        </div>

        {/* Endereço de Entrega */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            <MapPin className="w-4 h-4 text-brand-700" />
            <span>Endereço de Entrega</span>
          </div>
          <div className="p-3 bg-white rounded-md border border-neutral-200 text-xs text-neutral-700 leading-relaxed">
            <p className="font-semibold text-neutral-900">
              {order.shipping_address.street}, {order.shipping_address.number}
              {order.shipping_address.complement ? ` - ${order.shipping_address.complement}` : ''}
            </p>
            <p>
              {order.shipping_address.neighborhood} — {order.shipping_address.city} /{' '}
              {order.shipping_address.state}
            </p>
            <p className="font-mono text-neutral-500 mt-0.5">CEP: {order.shipping_address.zip_code}</p>
          </div>
        </div>

        {/* Itens do Pedido */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-2">
            <Package className="w-4 h-4 text-brand-700" />
            <span>Itens Adquiridos</span>
          </div>
          <div className="divide-y divide-neutral-100 border border-neutral-200 rounded-md overflow-hidden bg-white">
            {order.items.map((item, index) => {
              const formattedSubtotal = new Intl.NumberFormat('pt-BR', {
                style: 'currency',
                currency: 'BRL',
              }).format(item.subtotal);

              return (
                <div key={index} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-semibold text-neutral-900 block">{item.product_name}</span>
                    <span className="text-neutral-500">
                      Quantidade: <strong>{item.quantity} un.</strong>
                    </span>
                  </div>
                  <span className="font-bold text-neutral-800 font-mono">{formattedSubtotal}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ações Operacionais de Avanço Logístico */}
        <div className="pt-3 border-t border-neutral-200">
          <span className="block text-xs font-semibold text-neutral-700 uppercase tracking-wider mb-3">
            Avançar Ciclo Operacional
          </span>
          <div className="flex flex-wrap gap-2">
            {order.status === 'pending' && (
              <Button
                size="sm"
                variant="primary"
                isLoading={isUpdating}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => handleStatusChange('paid')}
              >
                Aprovar Pagamento
              </Button>
            )}

            {(order.status === 'paid' || order.status === 'approved') && (
              <Button
                size="sm"
                variant="primary"
                isLoading={isUpdating}
                leftIcon={<Package className="w-3.5 h-3.5" />}
                onClick={() => handleStatusChange('preparing')}
              >
                Em Separação
              </Button>
            )}

            {order.status === 'preparing' && (
              <Button
                size="sm"
                variant="primary"
                isLoading={isUpdating}
                leftIcon={<Truck className="w-3.5 h-3.5" />}
                onClick={() => handleStatusChange('shipped')}
              >
                Despachar / Enviar
              </Button>
            )}

            {order.status === 'shipped' && (
              <Button
                size="sm"
                variant="primary"
                isLoading={isUpdating}
                leftIcon={<CheckCircle2 className="w-3.5 h-3.5" />}
                onClick={() => handleStatusChange('delivered')}
              >
                Marcar como Entregue
              </Button>
            )}

            {!['cancelled', 'delivered'].includes(order.status) && (
              <Button
                size="sm"
                variant="danger"
                isLoading={isUpdating}
                leftIcon={<XCircle className="w-3.5 h-3.5" />}
                onClick={() => handleStatusChange('cancelled')}
              >
                Cancelar & Estornar Estoque
              </Button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default OrderDetailsModal;
