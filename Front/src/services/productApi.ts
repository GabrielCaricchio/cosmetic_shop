import apiClient from './apiClient';
import { Category, PaginatedProducts, Product, ProductFilter } from '../types/product';

export const productApi = {
  async getCategories(): Promise<Category[]> {
    const response = await apiClient.get<Category[]>('/categories');
    return response.data;
  },

  async getProducts(filter: ProductFilter = {}): Promise<PaginatedProducts> {
    const params: Record<string, string | number> = {};
    if (filter.page) params.page = filter.page;
    if (filter.limit) params.limit = filter.limit;
    if (filter.search) params.search = filter.search;
    if (filter.category_id) params.category_id = filter.category_id;
    if (filter.category_slug) params.category_slug = filter.category_slug;
    if (filter.min_price !== undefined) params.min_price = filter.min_price;
    if (filter.max_price !== undefined) params.max_price = filter.max_price;

    const response = await apiClient.get<PaginatedProducts>('/products', { params });
    return response.data;
  },

  async getProduct(idOrSlug: string | number): Promise<Product> {
    const response = await apiClient.get<Product>(`/products/${idOrSlug}`);
    return response.data;
  },
};

export default productApi;
