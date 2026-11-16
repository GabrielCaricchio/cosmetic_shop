import apiClient, { AUTH_TOKEN_KEY, ADMIN_TOKEN_KEY } from './apiClient';
import {
  LoginCredentials,
  RegisterData,
  AdminLoginCredentials,
  TokenResponse,
  ClientUser,
} from '../types/auth';

export const authApi = {
  async register(data: RegisterData): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/register', data);
    if (response.data.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.access_token);
    }
    return response.data;
  },

  async login(credentials: LoginCredentials): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem(AUTH_TOKEN_KEY, response.data.access_token);
    }
    return response.data;
  },

  async getMe(): Promise<ClientUser> {
    const response = await apiClient.get<ClientUser>('/me');
    return response.data;
  },

  async adminLogin(credentials: AdminLoginCredentials): Promise<TokenResponse> {
    const response = await apiClient.post<TokenResponse>('/admin/login', credentials);
    if (response.data.access_token) {
      localStorage.setItem(ADMIN_TOKEN_KEY, response.data.access_token);
    }
    return response.data;
  },

  logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  },

  adminLogout() {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
};

export default authApi;
