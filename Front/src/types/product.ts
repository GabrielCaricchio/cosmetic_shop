export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  display_order: number;
}

export interface ProductImage {
  id?: string;
  image_id?: number | string;
  image_url: string;
  alt_text?: string | null;
  display_order?: number;
  is_primary?: boolean;
}

export interface Product {
  id?: string;
  product_id?: number | string;
  category_id?: string;
  name: string;
  slug: string;
  brand: string;
  price: number;
  promotional_price?: number | null;
  sku?: string;
  barcode?: string | null;
  stock_quantity: number;
  description?: string | null;
  ingredients?: string | null;
  how_to_use?: string | null;
  active?: boolean;
  is_active?: boolean;
  images: ProductImage[];
  category?: Category;
  created_at?: string;
  updated_at?: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
  page: number;
  page_size: number;
  pages: number;
}
