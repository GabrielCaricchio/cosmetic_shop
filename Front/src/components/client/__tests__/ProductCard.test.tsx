import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ProductCard } from '../ProductCard';
import { Product } from '../../../types/product';

const mockProduct: Product = {
  product_id: 1,
  name: 'Batom Hidratante FPS 15',
  slug: 'batom-hidratante-fps-15',
  brand: 'Natura Aquarela',
  price: 29.90,
  stock_quantity: 2,
  is_active: true,
  images: [{ image_id: 1, image_url: 'https://example.com/batom.jpg', is_primary: true }]
};

describe('ProductCard', () => {
  it('displays "Últimas unidades" badge when stock <= 3', () => {
    render(<ProductCard product={mockProduct} onAddToCart={() => {}} />);
    expect(screen.getByText(/últimas unidades/i)).toBeInTheDocument();
  });
});
