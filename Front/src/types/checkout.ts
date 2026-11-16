export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export interface CheckoutShippingAddress {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zip_code: string;
}

export interface CheckoutRequestPayload {
  payment_method: PaymentMethod;
  shipping_address: CheckoutShippingAddress;
  whatsapp_notification?: boolean;
}

export interface PixDetails {
  qr_code: string;
  qr_code_url?: string;
  expires_at: string;
}

export interface CheckoutResponse {
  order_id: string;
  order_number: string;
  status: string;
  total_amount: number;
  payment_method: PaymentMethod;
  pix_details?: PixDetails;
}
