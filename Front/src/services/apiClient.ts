import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Chaves para persistência local
export const AUTH_TOKEN_KEY = 'aura_auth_token';
export const ADMIN_TOKEN_KEY = 'aura_admin_token';
export const CART_ID_KEY = 'aura_cart_id';

// Interceptor de requisição: injeta tokens e sessão de carrinho
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // Se for rota de admin, usa o token de admin preferencialmente
  const isAdminRoute = config.url?.startsWith('/admin');
  const token = isAdminRoute
    ? localStorage.getItem(ADMIN_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY)
    : localStorage.getItem(AUTH_TOKEN_KEY);

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Carrinho de visitante efêmero no Redis via header X-Cart-ID
  const cartId = localStorage.getItem(CART_ID_KEY);
  if (cartId) {
    config.headers['X-Cart-ID'] = cartId;
  }

  return config;
});

// Interceptor de resposta: captura X-Cart-ID e formata erros
apiClient.interceptors.response.use(
  (response) => {
    const receivedCartId = response.headers['x-cart-id'] || response.headers['X-Cart-ID'];
    if (receivedCartId) {
      localStorage.setItem(CART_ID_KEY, receivedCartId);
    }
    return response;
  },
  (error: AxiosError<{ message?: string; error?: string }>) => {
    // Tratamento de mensagens amigáveis em português
    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      'Ocorreu um erro na comunicação com o servidor.';
    return Promise.reject(new Error(message));
  }
);

export default apiClient;
