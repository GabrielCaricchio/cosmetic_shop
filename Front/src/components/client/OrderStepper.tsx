import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Home, AlertCircle } from 'lucide-react';
import { OrderStatus } from '../../types/order';

export interface OrderStepperProps {
  status: OrderStatus;
}

export const OrderStepper: React.FC<OrderStepperProps> = ({ status }) => {
  const isFailed = ['rejected', 'cancelled', 'refunded'].includes(status);

  const steps = [
    { key: 'pending', label: 'Pedido Criado', icon: Clock },
    { key: 'paid', label: 'Pagamento Aprovado', icon: CheckCircle2 },
    { key: 'preparing', label: 'Em Separação', icon: Package },
    { key: 'shipped', label: 'Enviado', icon: Truck },
    { key: 'delivered', label: 'Entregue', icon: Home },
  ];

  // Mapeia status do backend para índice
  const getActiveIndex = () => {
    switch (status) {
      case 'pending':
        return 0;
      case 'processing':
      case 'under_review':
        return 0;
      case 'approved':
      case 'paid':
        return 1;
      case 'preparing':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const activeIndex = getActiveIndex();

  if (isFailed) {
    const statusLabels: Record<string, string> = {
      rejected: 'Pagamento Recusado',
      cancelled: 'Pedido Cancelado por Timeout / Ação Manual',
      refunded: 'Valor Reembolsado ao Cliente',
    };

    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800">
        <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
        <div>
          <h4 className="text-sm font-bold">{statusLabels[status] || 'Pedido Cancelado'}</h4>
          <p className="text-xs text-red-700 mt-0.5">
            A trava de estoque foi estornada e as unidades foram liberadas no catálogo.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-4">
      <div className="relative flex items-center justify-between">
        {/* Linha de Progresso conectora */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-emerald-600 transition-all duration-500 z-0"
          style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
        />

        {/* Nós do Stepper */}
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const isCompleted = idx < activeIndex;
          const isCurrent = idx === activeIndex;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`
                  w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300
                  ${
                    isCompleted
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : isCurrent
                      ? 'bg-brand-700 text-white ring-4 ring-brand-100 shadow-sm'
                      : 'bg-white text-neutral-400 border-2 border-neutral-300'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`
                  mt-2 text-[11px] font-semibold whitespace-nowrap text-center
                  ${
                    isCurrent
                      ? 'text-brand-900 font-bold'
                      : isCompleted
                      ? 'text-emerald-800'
                      : 'text-neutral-400'
                  }
                `}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderStepper;
