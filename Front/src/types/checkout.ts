export interface CustomerInfo {
  name: string;
  email: string;
  phone?: string;
  cpf?: string;
  lgpd_consent: boolean;
}

export interface ShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface CheckoutItem {
  product_id: number;
  quantity: number;
}

export interface CheckoutPayload {
  items: CheckoutItem[];
  shipping_address: ShippingAddress;
  payment_method: 'pix' | 'credit_card';
  customer?: CustomerInfo;
}

export interface DirectCheckoutPayload {
  product_id: number;
  quantity: number;
  shipping_address: ShippingAddress;
  payment_method: 'pix' | 'credit_card';
}

export interface CheckoutResponse {
  order_id: string;
  total_amount: number;
  status: string;
  payment_method: string;
  pix_qr_code_base64?: string;
  pix_copy_paste?: string;
  expires_at: string;
}
