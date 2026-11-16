import React from 'react';
import { Clock, Unlock, RefreshCw } from 'lucide-react';
import { Badge } from '../common/Badge';

export interface ReservationData {
  key: string;
  product_id: string;
  product_name?: string;
  reserved_quantity: number;
  ttl_remaining_seconds: number;
  created_at?: string;
}

export interface StockReservationMonitorProps {
  reservations: ReservationData[];
  onReleaseLock?: (key: string) => void;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const StockReservationMonitor: React.FC<StockReservationMonitorProps> = ({
  reservations,
  onReleaseLock,
  onRefresh,
  isLoading,
}) => {
  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-rose-600" />
          <div>
            <h3 className="text-sm font-bold text-neutral-900">
              Monitor de Trava Atômica de Estoque (Redis Lua)
            </h3>
            <p className="text-xs text-neutral-500">
              Chaves temporárias no Redis garantindo proteção contra overselling (TTL Pix: 1800s).
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="flex items-center gap-1.5 rounded-xl border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          Sincronizar Redis
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-600">
          <thead className="bg-neutral-50 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="py-2.5 px-3">Chave Redis</th>
              <th className="py-2.5 px-3">Produto</th>
              <th className="py-2.5 px-3">Qtd Reservada</th>
              <th className="py-2.5 px-3">TTL Restante</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {reservations.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-6 text-center text-neutral-400">
                  Nenhuma trava ativa no Redis neste momento. Todas as transações foram liquidadas.
                </td>
              </tr>
            ) : (
              reservations.map((res) => (
                <tr key={res.key} className="hover:bg-neutral-50/50">
                  <td className="py-2.5 px-3 font-mono text-[11px] text-neutral-800">
                    {res.key}
                  </td>
                  <td className="py-2.5 px-3 font-medium text-neutral-900">
                    {res.product_name || `Produto #${res.product_id}`}
                  </td>
                  <td className="py-2.5 px-3 font-bold text-rose-600">
                    {res.reserved_quantity} un.
                  </td>
                  <td className="py-2.5 px-3 font-mono font-semibold text-neutral-700">
                    {res.ttl_remaining_seconds}s
                  </td>
                  <td className="py-2.5 px-3">
                    <Badge variant="warning">Bloqueado</Badge>
                  </td>
                  <td className="py-2.5 px-3 text-right">
                    {onReleaseLock && (
                      <button
                        type="button"
                        onClick={() => onReleaseLock(res.key)}
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-[11px] font-bold text-red-600 hover:bg-red-50"
                        title="Liberar trava manualmente"
                      >
                        <Unlock className="h-3 w-3" /> Liberar
                      </button>
                    )}
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
