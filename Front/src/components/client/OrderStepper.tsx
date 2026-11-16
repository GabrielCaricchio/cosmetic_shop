import React from 'react';
import { CheckCircle2, Clock, Package, Truck, Check } from 'lucide-react';
import { OrderStatus } from '../../types/order';

export interface OrderStepperProps {
  status: OrderStatus;
}

export const OrderStepper: React.FC<OrderStepperProps> = ({ status }) => {
  const steps = [
    { key: 'pending', label: 'Aguardando Pagamento', icon: Clock },
    { key: 'approved', label: 'Pagamento Aprovado', icon: CheckCircle2 },
    { key: 'processing', label: 'Em Preparação', icon: Package },
    { key: 'shipped', label: 'Enviado', icon: Truck },
    { key: 'delivered', label: 'Entregue', icon: Check },
  ];

  const getStepIndex = (st: OrderStatus) => {
    switch (st) {
      case 'pending':
        return 0;
      case 'approved':
        return 1;
      case 'processing':
      case 'under_review':
        return 2;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-neutral-200 w-full z-0" />
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-rose-600 transition-all duration-500 z-0"
          style={{ width: `${(currentIndex / (steps.length - 1)) * 100}%` }}
        />

        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="relative z-10 flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                  isCompleted
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : isCurrent
                    ? 'border-rose-600 bg-white text-rose-600 ring-4 ring-rose-100 shadow-sm'
                    : 'border-neutral-300 bg-white text-neutral-400'
                }`}
              >
                <Icon className="h-4 w-4" />
              </div>
              <span
                className={`mt-2 text-[11px] font-semibold text-center hidden sm:block ${
                  isCurrent ? 'text-rose-600 font-bold' : isCompleted ? 'text-neutral-800' : 'text-neutral-400'
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
