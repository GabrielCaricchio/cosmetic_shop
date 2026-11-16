import apiClient from './apiClient';
import { CheckoutPayload, DirectCheckoutPayload, CheckoutResponse } from '../types/checkout';

export const checkoutApi = {
  async processCheckout(
    payload: CheckoutPayload,
    idempotencyKey?: string
  ): Promise<CheckoutResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await apiClient.post<CheckoutResponse>('/checkout', payload, {
      headers,
    });
    return response.data;
  },

  async directCheckout(
    payload: DirectCheckoutPayload,
    idempotencyKey?: string
  ): Promise<CheckoutResponse> {
    const headers: Record<string, string> = {};
    if (idempotencyKey) {
      headers['Idempotency-Key'] = idempotencyKey;
    }

    const response = await apiClient.post<CheckoutResponse>('/checkout/direct', payload, {
      headers,
    });
    return response.data;
  },
};

export default checkoutApi;
