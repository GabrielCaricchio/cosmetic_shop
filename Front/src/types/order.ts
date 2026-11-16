import { Product } from './product';
import { PaymentMethod } from './checkout';

export type OrderStatus =
  | 'pending'
  | 'processing'
  | 'under_review'
  | 'approved'
  | 'rejected'
  | 'cancelled'
  | 'refunded';

export interface OrderItemDetail {
  id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product?: Product;
}

export interface OrderDetail {
  id: string;
  client_id: string;
  order_number: string;
  status: OrderStatus;
  subtotal: number;
  shipping_fee: number;
  discount: number;
  total_amount: number;
  payment_method: PaymentMethod;
  shipping_address: Record<string, any>;
  items: OrderItemDetail[];
  created_at: string;
  updated_at: string;
}
