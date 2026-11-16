import React from 'react';

export interface SalesDataPoint {
  date: string;
  total_sales: number;
  order_count: number;
}

export interface SalesChartProps {
  data: SalesDataPoint[];
}

export const SalesChart: React.FC<SalesChartProps> = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-neutral-200 bg-white p-6 text-xs text-neutral-400">
        Nenhum dado de vendas registrado para o período.
      </div>
    );
  }

  const maxSales = Math.max(...data.map((d) => d.total_sales), 1);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-bold text-neutral-900">Evolução Diária de Vendas</h3>
          <p className="text-xs text-neutral-500">Volume faturado e quantidade de pedidos</p>
        </div>
      </div>

      <div className="flex items-end gap-3 h-52 pt-6 pb-2">
        {data.map((point) => {
          const heightPercent = Math.max(10, Math.round((point.total_sales / maxSales) * 100));

          return (
            <div key={point.date} className="flex-1 flex flex-col items-center gap-2 group">
              <span className="text-[10px] font-bold text-neutral-600 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatCurrency(point.total_sales)}
              </span>

              <div className="w-full max-w-[48px] bg-neutral-100 rounded-t-xl h-full flex items-end overflow-hidden">
                <div
                  className="w-full bg-gradient-to-t from-rose-600 to-rose-400 rounded-t-xl group-hover:from-rose-700 group-hover:to-rose-500 transition-all duration-300"
                  style={{ height: `${heightPercent}%` }}
                />
              </div>

              <span className="text-[11px] font-semibold text-neutral-500 truncate max-w-full">
                {point.date.slice(5)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
