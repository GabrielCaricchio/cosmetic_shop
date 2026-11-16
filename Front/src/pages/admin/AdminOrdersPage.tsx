import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';
import Badge from '../../components/common/Badge';
import Spinner from '../../components/common/Spinner';
import { adminApi } from '../../services/adminApi';
import { Order } from '../../types/order';
import { Eye, Search } from 'lucide-react';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getOrders(statusFilter || undefined, 100);
      setOrders(data);
    } catch {
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleUpdateStatus = async (orderId: string, status: string) => {
    await adminApi.updateOrderStatus(orderId, { status });
    await loadOrders();
  };

  const handleOpenDetails = (ord: Order) => {
    setSelectedOrder(ord);
    setIsDetailsOpen(true);
  };

  const filteredOrders = orders.filter((o) =>
    searchTerm ? o.order_id.toLowerCase().includes(searchTerm.toLowerCase()) : true
  );

  const statusTabs = [
    { label: 'Todos', value: '' },
    { label: 'Pendentes', value: 'pending' },
    { label: 'Pagos / Aprovados', value: 'paid' },
    { label: 'Em Separação', value: 'preparing' },
    { label: 'Enviados', value: 'shipped' },
    { label: 'Entregues', value: 'delivered' },
    { label: 'Cancelados', value: 'cancelled' },
  ];

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-serif font-bold text-neutral-900">
            Gestão Operacional de Pedidos
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Acompanhamento de transações, esteira logística e despacho de cosméticos
          </p>
        </div>

        {/* Abas de Status Logístico */}
        <div className="flex border-b border-neutral-300 gap-2 mb-6 overflow-x-auto no-scrollbar">
          {statusTabs.map((tab) => {
            const isActive = statusFilter === tab.value;
            return (
              <button
                key={tab.value}
                onClick={() => setStatusFilter(tab.value)}
                className={`
                  pb-3 px-3 text-xs font-semibold whitespace-nowrap border-b-2 transition-all
                  ${
                    isActive
                      ? 'border-brand-700 text-brand-800'
                      : 'border-transparent text-neutral-500 hover:text-neutral-800'
                  }
                `}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Barra de Busca de Pedido */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs mb-6 flex items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar pelo código UUID do pedido..."
              className="w-full h-10 pl-10 pr-4 text-xs rounded-md border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700 font-mono"
            />
          </div>
        </div>

        {/* Tabela de Pedidos */}
        <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Spinner size="lg" className="text-brand-700 mb-3" />
              <span className="text-xs text-neutral-500">Sincronizando pedidos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                    <th className="px-6 py-3.5">Código do Pedido</th>
                    <th className="px-6 py-3.5">Data / Hora</th>
                    <th className="px-6 py-3.5">Valor Total</th>
                    <th className="px-6 py-3.5">Forma</th>
                    <th className="px-6 py-3.5">Status</th>
                    <th className="px-6 py-3.5 text-right">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-neutral-400">
                        Nenhum pedido encontrado para o filtro selecionado.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((ord) => (
                      <tr key={ord.order_id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="px-6 py-4 font-mono font-bold text-neutral-900">
                          #{ord.order_id.slice(0, 13)}
                        </td>
                        <td className="px-6 py-4 text-neutral-500">
                          {new Date(ord.created_at).toLocaleString('pt-BR')}
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-neutral-900">
                          {new Intl.NumberFormat('pt-BR', {
                            style: 'currency',
                            currency: 'BRL',
                          }).format(ord.total_amount)}
                        </td>
                        <td className="px-6 py-4 uppercase font-semibold text-neutral-600">
                          {ord.payment_method || 'Pix'}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              ['paid', 'approved', 'delivered'].includes(ord.status)
                                ? 'success'
                                : ['cancelled', 'rejected'].includes(ord.status)
                                ? 'danger'
                                : 'warning'
                            }
                          >
                            {ord.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleOpenDetails(ord)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Detalhes</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Detalhes do Pedido */}
        <OrderDetailsModal
          order={selectedOrder}
          isOpen={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          onUpdateStatus={handleUpdateStatus}
        />
      </main>
    </div>
  );
};

export default AdminOrdersPage;
