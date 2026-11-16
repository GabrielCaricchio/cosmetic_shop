import { useEffect, useRef } from 'react';
import { apiClient } from '../services/apiClient';

export function useOrderPolling(
  orderId: string | null | undefined,
  onApproved: () => void,
  intervalMs = 3000
) {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!orderId) return;

    let isPolling = true;

    const checkOrderStatus = async () => {
      try {
        const res = await apiClient.get(`/orders/${orderId}`);
        const status = res.data?.status;

        if (status === 'approved') {
          isPolling = false;
          onApproved();
          return;
        }

        if (status === 'cancelled' || status === 'rejected') {
          isPolling = false;
          return;
        }
      } catch (err) {
        console.warn('Erro ao consultar status do pedido:', err);
      }

      if (isPolling) {
        timerRef.current = setTimeout(checkOrderStatus, intervalMs);
      }
    };

    timerRef.current = setTimeout(checkOrderStatus, intervalMs);

    return () => {
      isPolling = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [orderId, onApproved, intervalMs]);
}
