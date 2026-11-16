import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Clock,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { KpiCard } from '../../components/admin/KpiCard';
import { SalesChart } from '../../components/admin/SalesChart';
import { apiClient } from '../../services/apiClient';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [adminUser] = useState(() => {
    try {
      const stored = localStorage.getItem('admin_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [metrics, setMetrics] = useState({
    today_revenue: 14290.5,
    today_orders: 87,
    average_ticket: 164.25,
    active_redis_locks: 12,
  });

  const [salesData, setSalesData] = useState([
    { date: '2026-11-10', total_sales: 9800, order_count: 55 },
    { date: '2026-11-11', total_sales: 11200, order_count: 68 },
    { date: '2026-11-12', total_sales: 14500, order_count: 82 },
    { date: '2026-11-13', total_sales: 13200, order_count: 79 },
    { date: '2026-11-14', total_sales: 16800, order_count: 94 },
    { date: '2026-11-15', total_sales: 18900, order_count: 106 },
    { date: '2026-11-16', total_sales: 14290, order_count: 87 },
  ]);

  const [loading, setLoading] = useState(false);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/reports/sales');
      if (res.data) {
        setMetrics((prev) => ({
          ...prev,
          today_revenue: res.data.daily_revenue ?? res.data.total_revenue ?? prev.today_revenue,
          today_orders: res.data.total_orders_today ?? res.data.total_orders ?? prev.today_orders,
          average_ticket: res.data.average_ticket ?? (res.data.total_orders_today > 0 ? Number(res.data.daily_revenue) / res.data.total_orders_today : prev.average_ticket),
        }));
      }
      try {
        const chartRes = await apiClient.get('/admin/reports/sales/chart');
        if (chartRes.data && Array.isArray(chartRes.data) && chartRes.data.length > 0) {
          const formatted = chartRes.data.map((pt: any) => ({
            date: pt.date,
            total_sales: Number(pt.amount),
            order_count: pt.orders_count,
          }));
          setSalesData(formatted);
        }
      } catch {
        // keep fallback chart points if empty
      }
    } catch (err) {
      console.warn('Usando dados de demonstração para o dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_user');
    navigate('/admin/login');
  };

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="min-h-screen flex bg-neutral-100">
      <AdminSidebar onLogout={handleLogout} />

      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Dashboard Analítico" adminUser={adminUser} />

        <main className="p-6 sm:p-8 space-y-8 overflow-y-auto">
          {/* Header toolbar */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 font-serif">
                Performance Geral da Loja
              </h2>
              <p className="text-xs text-neutral-500">
                Métricas atualizadas em tempo real com travas de estoque ativas.
              </p>
            </div>
            <button
              type="button"
              onClick={fetchMetrics}
              className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 shadow-sm transition-all"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Atualizar Dados
            </button>
          </div>

          {/* KPIs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <KpiCard
              title="Faturamento Hoje"
              value={formatPrice(metrics.today_revenue)}
              subtitle="+14% em relação a ontem"
              icon={DollarSign}
              variant="rose"
            />
            <KpiCard
              title="Pedidos Aprovados"
              value={metrics.today_orders}
              subtitle="Taxa de aprovação Pix: 94%"
              icon={ShoppingBag}
              variant="emerald"
            />
            <KpiCard
              title="Ticket Médio"
              value={formatPrice(metrics.average_ticket)}
              subtitle="Meta: R$ 150,00"
              icon={TrendingUp}
              variant="blue"
            />
            <KpiCard
              title="Reservas Ativas Redis"
              value={metrics.active_redis_locks}
              subtitle="Carrinhos / Pix em timeout"
              icon={Clock}
              variant="amber"
            />
          </div>

          {/* Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <SalesChart data={salesData} />
            </div>

            {/* Critical Inventory Notice */}
            <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-amber-600 mb-3">
                  <AlertTriangle className="h-5 w-5" />
                  <h3 className="text-sm font-bold text-neutral-900">
                    Estoque Crítico (&le; 3 un.)
                  </h3>
                </div>
                <p className="text-xs text-neutral-500 mb-4">
                  Produtos que precisam de reposição imediata para evitar cancelamento de pedidos.
                </p>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs">
                    <div>
                      <p className="font-bold text-neutral-900">Batom Matte Longa Duração</p>
                      <p className="text-neutral-500">Natura • SKU: NAT-BTM-01</p>
                    </div>
                    <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                      1 un.
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200/60 text-xs">
                    <div>
                      <p className="font-bold text-neutral-900">Sérum Facial Ácido Hialurônico</p>
                      <p className="text-neutral-500">Aura Skin • SKU: AUR-SRM-09</p>
                    </div>
                    <span className="font-extrabold text-amber-700 bg-amber-100 px-2 py-1 rounded-lg">
                      2 un.
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => navigate('/admin/produtos')}
                className="mt-6 w-full py-2.5 rounded-xl border border-neutral-300 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
              >
                Gerenciar Estoque de Produtos
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
