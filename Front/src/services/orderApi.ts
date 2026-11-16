import apiClient from './apiClient';
import { Order } from '../types/order';

export const orderApi = {
  async getOrder(orderId: string): Promise<Order> {
    const response = await apiClient.get<Order>(`/orders/${orderId}`);
    return response.data;
  },

  async listOrders(): Promise<Order[]> {
    const response = await apiClient.get<Order[]>('/orders');
    return response.data;
  },
};

export default orderApi;
