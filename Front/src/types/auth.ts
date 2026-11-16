export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  cpf?: string | null;
  lgpd_consent: boolean;
  created_at: string;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: 'superadmin' | 'manager' | 'support';
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  user: ClientUser | AdminUser;
}

export interface ClientRegisterPayload {
  name: string;
  email: string;
  password: string;
  phone?: string;
  cpf?: string;
  lgpd_consent: boolean;
}

export interface LoginPayload {
  email: string;
  password: string;
}
