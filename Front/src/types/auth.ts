export interface ClientUser {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'client' | 'admin' | 'superadmin' | string;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: 'Admin' | 'SuperAdmin' | 'Operator' | string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  role: string;
  user_id: number;
  name: string;
  user?: {
    id: number;
    name: string;
    role: string;
  };
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
  lgpd_consent: boolean;
}

export interface AdminLoginCredentials {
  email: string;
  password: string;
}
