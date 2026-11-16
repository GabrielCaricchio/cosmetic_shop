import React, { useState, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { OrderTable } from '../../components/admin/OrderTable';
import { OrderDetailsModal } from '../../components/admin/OrderDetailsModal';
import { apiClient } from '../../services/apiClient';
import { OrderDetail, OrderStatus } from '../../types/order';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<OrderDetail[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<OrderDetail | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/orders');
      setOrders(res.data.items || res.data || []);
    } catch (err) {
      console.warn('Falha ao carregar pedidos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await apiClient.patch(`/admin/orders/${orderId}/status`, { status: newStatus });
      fetchOrders();
    } catch (err) {
      console.warn('Erro ao atualizar status:', err);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Gestão de Pedidos" />

        <main className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 font-serif">
                Fluxo de Pedidos & Faturamento
              </h2>
              <p className="text-xs text-neutral-500">
                Acompanhe confirmações Pix, despachos e status logísticos em tempo real.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchOrders}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Pedidos
            </button>
          </div>

          <OrderTable
            orders={orders}
            onViewDetails={(ord) => {
              setSelectedOrder(ord);
              setIsModalOpen(true);
            }}
            onUpdateStatus={handleUpdateStatus}
          />

          <OrderDetailsModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            order={selectedOrder}
          />
        </main>
      </div>
    </div>
  );
};
