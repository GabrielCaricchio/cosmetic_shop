import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CartProvider, useCart } from '../CartContext';

describe('CartContext', () => {
  it('updates quantities and recalculates total amount', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => <CartProvider>{children}</CartProvider>;
    const { result } = renderHook(() => useCart(), { wrapper });

    act(() => {
      result.current.addToCart({ product_id: 1, name: 'Sérum', price: 50.00, quantity: 2 });
    });

    expect(result.current.totalAmount).toBe(100.00);
    expect(result.current.totalItems).toBe(2);
  });
});
