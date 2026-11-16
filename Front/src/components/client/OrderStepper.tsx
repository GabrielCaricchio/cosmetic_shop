import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Check } from 'lucide-react';
import { OrderStatus } from '../../types/order';

export interface OrderStepperProps {
  status: OrderStatus | string;
}

export const OrderStepper: React.FC<OrderStepperProps> = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Aguardando Pagamento', icon: Clock },
    { key: 'approved', label: 'Pagamento Aprovado', icon: CheckCircle2 },
    { key: 'processing', label: 'Em Preparação', icon: Package },
    { key: 'shipped', label: 'Enviado', icon: Truck },
    { key: 'delivered', label: 'Entregue', icon: Check },
  ];

  const getStepIndex = (st: OrderStatus | string) => {
    switch (st) {
      case 'pending':
        return 0;
      case 'approved':
        return 1;
      case 'processing':
      case 'under_review':
        return 2;
      case 'shipped':
        return 3;
      case 'delivered':
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-warm-200 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-gradient-to-r from-botanic-800 to-champagne-500 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'border-botanic-800 bg-botanic-800 text-champagne-300 shadow-sm'
                    : isCurrent
                    ? 'border-champagne-500 bg-botanic-950 text-champagne-400 ring-4 ring-champagne-100 shadow-md'
                    : 'border-warm-300 bg-white text-warm-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`mt-2 text-[10px] sm:text-[11px] font-semibold text-center hidden sm:block ${
                  isCurrent ? 'text-botanic-950 font-bold' : isCompleted ? 'text-warm-800' : 'text-warm-400'
                }`}
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
