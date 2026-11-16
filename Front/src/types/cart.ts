import { Product } from './product';

export interface CartItem {
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface CartSession {
  items: CartItem[];
  subtotal: number;
  item_count: number;
}
