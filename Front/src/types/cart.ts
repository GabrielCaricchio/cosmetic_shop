export interface CartItem {
  product_id: number;
  id?: string | number;
  name: string;
  price: number;
  promotional_price?: number | null;
  quantity: number;
  subtotal?: number;
  image_url?: string;
  stock_quantity?: number;
}

export interface Cart {
  items: CartItem[];
  total_amount: number;
  total_items: number;
}

export interface AddCartItemPayload {
  product_id?: number;
  id?: string | number;
  name?: string;
  price?: number;
  promotional_price?: number | null;
  image_url?: string;
  stock_quantity?: number;
  quantity?: number;
}
