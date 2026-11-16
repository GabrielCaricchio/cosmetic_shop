import apiClient from './apiClient';
import { Cart } from '../types/cart';

export const cartApi = {
  async getCart(): Promise<Cart> {
    const response = await apiClient.get<Cart>('/cart');
    return response.data;
  },

  async addItem(productId: number, quantity = 1): Promise<Cart> {
    const response = await apiClient.post<Cart>('/cart/items', {
      product_id: productId,
      quantity,
    });
    return response.data;
  },

  async updateItemQuantity(productId: number, quantity: number): Promise<Cart> {
    const response = await apiClient.put<Cart>(`/cart/items/${productId}`, {
      quantity,
    });
    return response.data;
  },

  async removeItem(productId: number): Promise<Cart> {
    const response = await apiClient.delete<Cart>(`/cart/items/${productId}`);
    return response.data;
  },
};

export default cartApi;
