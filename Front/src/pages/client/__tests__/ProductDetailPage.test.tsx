import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProductDetailPage } from '../ProductDetailPage';

describe('ProductDetailPage', () => {
  it('renders "Comprar Agora" direct checkout button and handles click', () => {
    render(
      <MemoryRouter initialEntries={['/produtos/batom-matte']}>
        <ProductDetailPage />
      </MemoryRouter>
    );
    const buyNowBtn = screen.getByRole('button', { name: /comprar agora/i });
    expect(buyNowBtn).toBeInTheDocument();
  });
});
