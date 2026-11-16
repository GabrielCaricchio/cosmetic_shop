import { useState, useEffect, useRef, useCallback } from 'react';
import { orderApi } from '../services/orderApi';
import { Order } from '../types/order';

interface UseOrderPollingOptions {
  intervalMs?: number;
  enabled?: boolean;
  onStatusChange?: (order: Order) => void;
  onPaymentApproved?: (order: Order) => void;
}

export function useOrderPolling(
  orderId: string | undefined,
  options: UseOrderPollingOptions = {}
) {
  const {
    intervalMs = 3000,
    enabled = true,
    onStatusChange,
    onPaymentApproved,
  } = options;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isPollingRef = useRef<boolean>(enabled);

  const stopPolling = useCallback(() => {
    isPollingRef.current = false;
  }, []);

  useEffect(() => {
    if (!orderId || !enabled) {
      setIsLoading(false);
      return;
    }

    isPollingRef.current = true;
    let timerId: NodeJS.Timeout;

    const checkStatus = async () => {
      try {
        const fetched = await orderApi.getOrder(orderId);
        setOrder(fetched);
        setError(null);

        onStatusChange?.(fetched);

        // Se o status for aprovado / pago
        if (['paid', 'approved', 'preparing', 'shipped', 'delivered'].includes(fetched.status)) {
          onPaymentApproved?.(fetched);
        }

        // Se atingiu estado final, pode cessar polling
        if (['paid', 'approved', 'delivered', 'cancelled', 'rejected', 'refunded'].includes(fetched.status)) {
          isPollingRef.current = false;
        }
      } catch (err: any) {
        setError(err.message || 'Erro ao sincronizar status do pedido.');
      } finally {
        setIsLoading(false);
      }

      if (isPollingRef.current) {
        timerId = setTimeout(checkStatus, intervalMs);
      }
    };

    checkStatus();

    return () => {
      isPollingRef.current = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [orderId, enabled, intervalMs]);

  return {
    order,
    isLoading,
    error,
    stopPolling,
  };
}

export default useOrderPolling;
