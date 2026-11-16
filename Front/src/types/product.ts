export interface ProductImage {
  image_id: number;
  image_url: string;
  is_primary: boolean;
  display_order?: number;
}

export interface Category {
  category_id: number;
  name: string;
  slug: string;
  created_at?: string;
}

export interface Product {
  product_id: number;
  id?: string | number;
  category_id?: number | null;
  name: string;
  slug: string;
  brand: string;
  description?: string | null;
  ingredients?: string | null;
  price: number;
  promotional_price?: number | null;
  stock_quantity: number;
  is_active: boolean;
  images: ProductImage[];
  created_at?: string;
  updated_at?: string;
}

export interface PaginatedProducts {
  items: Product[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface ProductFilter {
  page?: number;
  limit?: number;
  search?: string;
  category_id?: number;
  category_slug?: string;
  min_price?: number;
  max_price?: number;
  sort_by?: 'price_asc' | 'price_desc' | 'newest' | 'bestsellers';
}
