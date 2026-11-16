import React from 'react';
import { Eye, CheckCircle2, Truck, XCircle } from 'lucide-react';
import { OrderDetail, OrderStatus } from '../../types/order';
import { Badge } from '../common/Badge';

export interface OrderTableProps {
  orders: OrderDetail[];
  onViewDetails: (order: OrderDetail) => void;
  onUpdateStatus: (orderId: string, newStatus: OrderStatus) => void;
}

export const OrderTable: React.FC<OrderTableProps> = ({
  orders,
  onViewDetails,
  onUpdateStatus,
}) => {
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'approved':
        return <Badge variant="success">Aprovado</Badge>;
      case 'processing':
        return <Badge variant="info">Preparando</Badge>;
      case 'pending':
        return <Badge variant="warning">Pendente Pix</Badge>;
      case 'cancelled':
        return <Badge variant="danger">Cancelado</Badge>;
      case 'refunded':
        return <Badge variant="default">Reembolsado</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-600">
          <thead className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Pedido #</th>
              <th className="py-3.5 px-4">Total</th>
              <th className="py-3.5 px-4">Pagamento</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Data</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  Nenhum pedido registrado no sistema.
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-neutral-900">
                    #{order.order_number || order.id.slice(0, 8)}
                  </td>
                  <td className="py-3 px-4 font-black text-neutral-900">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="py-3 px-4 uppercase font-semibold text-neutral-700">
                    {order.payment_method}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(order.status)}</td>
                  <td className="py-3 px-4 text-neutral-400">
                    {new Date(order.created_at || Date.now()).toLocaleDateString('pt-BR')}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => onViewDetails(order)}
                        className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>

                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'approved')}
                          className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                          title="Aprovar manualmente"
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      )}

                      {order.status === 'approved' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'processing')}
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50"
                          title="Iniciar despacho"
                        >
                          <Truck className="h-4 w-4" />
                        </button>
                      )}

                      {order.status !== 'cancelled' && order.status !== 'refunded' && (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'cancelled')}
                          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50"
                          title="Cancelar pedido e liberar estoque"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
