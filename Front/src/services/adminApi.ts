import apiClient from './apiClient';
import {
  SalesMetrics,
  DailySalesChartPoint,
  StockReservationItem,
  UpdateOrderStatusPayload,
} from '../types/admin';
import { Order } from '../types/order';
import { Product } from '../types/product';

export interface CreateProductPayload {
  name: string;
  slug?: string;
  brand?: string;
  category_id?: number | null;
  description?: string;
  ingredients?: string;
  price: number;
  stock_quantity: number;
  is_active?: boolean;
  image_urls?: string[];
}

export interface UpdateProductPayload {
  name?: string;
  slug?: string;
  brand?: string;
  category_id?: number | null;
  description?: string;
  ingredients?: string;
  price?: number;
  stock_quantity?: number;
  is_active?: boolean;
}

export const adminApi = {
  // Relatórios e KPIs
  async getSalesMetrics(): Promise<SalesMetrics> {
    const response = await apiClient.get<SalesMetrics>('/admin/reports/sales');
    return response.data;
  },

  async getSalesChart(days = 7): Promise<DailySalesChartPoint[]> {
    const response = await apiClient.get<DailySalesChartPoint[]>('/admin/reports/sales/chart', {
      params: { days },
    });
    return response.data;
  },

  // Pedidos
  async getOrders(status?: string, limit = 50, offset = 0): Promise<Order[]> {
    const params: Record<string, string | number> = { limit, offset };
    if (status) params.status = status;
    const response = await apiClient.get<Order[]>('/admin/orders', { params });
    return response.data;
  },

  async updateOrderStatus(
    orderId: string,
    payload: UpdateOrderStatusPayload
  ): Promise<Order> {
    const response = await apiClient.put<Order>(`/admin/orders/${orderId}/status`, payload);
    return response.data;
  },

  // Gestão de Cosméticos
  async createProduct(payload: CreateProductPayload): Promise<Product> {
    const response = await apiClient.post<Product>('/admin/products', payload);
    return response.data;
  },

  async updateProduct(productId: number, payload: UpdateProductPayload): Promise<Product> {
    const response = await apiClient.put<Product>(`/admin/products/${productId}`, payload);
    return response.data;
  },

  async deleteProduct(productId: number): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/admin/products/${productId}`);
    return response.data;
  },

  // Auditoria de Reservas Redis
  async getReservations(): Promise<StockReservationItem[]> {
    const response = await apiClient.get<StockReservationItem[]>('/admin/inventory/reservations');
    return response.data;
  },

  async releaseReservation(key: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(
      `/admin/inventory/reservations/${encodeURIComponent(key)}`
    );
    return response.data;
  },
};

export default adminApi;
