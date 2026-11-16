import React, { useState, useEffect } from 'react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { StockReservationMonitor, ReservationData } from '../../components/admin/StockReservationMonitor';
import { apiClient } from '../../services/apiClient';

export const AdminInventoryPage: React.FC = () => {
  const [reservations, setReservations] = useState<ReservationData[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/inventory/reservations');
      setReservations(res.data.reservations || res.data || []);
    } catch (err) {
      console.warn('Falha ao consultar reservas Redis:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  const handleReleaseLock = async (key: string) => {
    try {
      await apiClient.delete(`/admin/inventory/reservations/${encodeURIComponent(key)}`);
      fetchReservations();
    } catch (err) {
      console.warn('Erro ao liberar trava:', err);
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Estoque e Travas Redis" />

        <main className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          <StockReservationMonitor
            reservations={reservations}
            onReleaseLock={handleReleaseLock}
            onRefresh={fetchReservations}
            isLoading={loading}
          />
        </main>
      </div>
    </div>
  );
};
