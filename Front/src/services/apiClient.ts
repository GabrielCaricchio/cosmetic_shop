import axios from 'axios';

export const apiClient = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token') || localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  const guestCartId = localStorage.getItem('guest_cart_id');
  if (guestCartId) {
    config.headers['X-Cart-ID'] = guestCartId;
    config.headers['X-Guest-Cart-Id'] = guestCartId;
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const returnedCartId = response.headers['x-cart-id'];
    if (returnedCartId && !localStorage.getItem('guest_cart_id')) {
      localStorage.setItem('guest_cart_id', returnedCartId);
    }
    return response;
  },
  (error) => {
    if (error.response?.data) {
      if (error.response.data.message && !error.response.data.detail) {
        error.response.data.detail = error.response.data.message;
      }
    }
    return Promise.reject(error);
  }
);
