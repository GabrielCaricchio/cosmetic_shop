export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'under_review'
  | 'approved'
  | 'paid'
  | 'preparing'
  | 'shipped'
  | 'delivered'
  | 'rejected'
  | 'cancelled'
  | 'refunded';

export interface OrderItemDetail {
  product_id: number;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Order {
  order_id: string;
  client_id?: number;
  total_amount: number;
  status: OrderStatus;
  shipping_address: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zip_code: string;
  };
  items: OrderItemDetail[];
  payment_method?: string;
  pix_qr_code_base64?: string;
  pix_copy_paste?: string;
  created_at: string;
  updated_at: string;
}
