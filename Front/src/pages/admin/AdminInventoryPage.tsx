import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import Badge from '../../components/common/Badge';
import { adminApi } from '../../services/adminApi';
import { StockReservationItem } from '../../types/admin';
import { Lock, Unlock, RefreshCw, Clock } from 'lucide-react';

export const AdminInventoryPage: React.FC = () => {
  const [reservations, setReservations] = useState<StockReservationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isReleasing, setIsReleasing] = useState<string | null>(null);

  const loadReservations = async () => {
    setIsLoading(true);
    try {
      const data = await adminApi.getReservations();
      setReservations(data);
    } catch {
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
    // Auto-refresh a cada 10 segundos
    const interval = setInterval(loadReservations, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleRelease = async (resItem: StockReservationItem) => {
    const key = resItem.key || `stock:reserved:${resItem.order_id}:${resItem.product_id}`;
    if (
      confirm(
        `Confirma a liberação manual da trava no Redis para o produto #${resItem.product_id} do pedido #${resItem.order_id.slice(
          0,
          8
        )}?\n\nAs ${resItem.quantity} unidades voltarão imediatamente para o estoque do catálogo.`
      )
    ) {
      setIsReleasing(key);
      try {
        await adminApi.releaseReservation(key);
        await loadReservations();
      } finally {
        setIsReleasing(null);
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-neutral-900">
              Monitor de Concorrência & Reservas Redis
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Auditoria em tempo real de travas atômicas anti-overselling (TTL de 30 minutos)
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={loadReservations}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Atualizar Travas
          </Button>
        </div>

        {/* Card Informativo sobre Concorrência Extrema */}
        <div className="mb-6 p-4 bg-brand-50 border border-brand-200 rounded-xl flex items-start gap-3">
          <Lock className="w-5 h-5 text-brand-700 shrink-0 mt-0.5" />
          <div className="text-xs text-brand-900 leading-relaxed">
            <strong className="block text-sm font-serif font-bold mb-0.5">
              Como funciona o mecanismo Anti-Overselling:
            </strong>
            Quando 2 ou mais compradoras disputam a última unidade de um cosmético, o{' '}
            <strong>Script Lua Atômico no Redis</strong> concede a reserva exclusivamente para uma delas.
            O estoque físico é baixado no banco somente após o webhook de confirmação do Pix. Caso o prazo de 30 min
            expire, a trava é liberada automaticamente.
          </div>
        </div>

        {/* Tabela de Travas Ativas */}
        <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
          {isLoading && reservations.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Spinner size="lg" className="text-brand-700 mb-3" />
              <span className="text-xs text-neutral-500">Escaneando chaves ativas no Redis...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                    <th className="px-6 py-3.5">Pedido (Lock Holder)</th>
                    <th className="px-6 py-3.5">Cosmético Bloqueado</th>
                    <th className="px-6 py-3.5">Qtd. Retida</th>
                    <th className="px-6 py-3.5">TTL Restante</th>
                    <th className="px-6 py-3.5">Situação</th>
                    <th className="px-6 py-3.5 text-right">Ação de Risco</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                  {reservations.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                        Nenhuma trava atômica ativa no Redis neste momento. Todo o estoque está livre para compra.
                      </td>
                    </tr>
                  ) : (
                    reservations.map((resItem, idx) => {
                      const minutes = Math.floor(resItem.ttl_remaining / 60);
                      const seconds = resItem.ttl_remaining % 60;
                      const formattedTtl = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
                        2,
                        '0'
                      )}`;
                      const itemKey =
                        resItem.key || `stock:reserved:${resItem.order_id}:${resItem.product_id}`;

                      return (
                        <tr key={idx} className="hover:bg-neutral-50/70 transition-colors">
                          <td className="px-6 py-4 font-mono font-bold text-neutral-900">
                            #{resItem.order_id.slice(0, 13)}
                          </td>
                          <td className="px-6 py-4">
                            <span className="font-semibold text-neutral-900 block">
                              {resItem.product_name || `Cosmético #${resItem.product_id}`}
                            </span>
                            <span className="text-[10px] text-neutral-400 font-mono">
                              ID: {resItem.product_id}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-mono font-bold text-neutral-900">
                            {resItem.quantity} un.
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                              <Clock className="w-3.5 h-3.5 text-amber-600" />
                              {formattedTtl} ({resItem.ttl_remaining}s)
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Badge variant="warning" size="sm">
                              Checkout em Andamento
                            </Badge>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button
                              onClick={() => handleRelease(resItem)}
                              disabled={isReleasing === itemKey}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 text-xs font-semibold transition-colors disabled:opacity-50"
                            >
                              <Unlock className="w-3.5 h-3.5" />
                              <span>Liberar Trava</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminInventoryPage;
