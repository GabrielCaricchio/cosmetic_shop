import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { CartItem } from '../types/cart';
import { cartApi } from '../services/cartApi';

interface AddToCartInput {
  product_id?: number;
  id?: string | number;
  name?: string;
  price?: number;
  promotional_price?: number | null;
  image_url?: string;
  stock_quantity?: number;
  quantity?: number;
}

interface CartContextType {
  items: CartItem[];
  totalAmount: number;
  totalItems: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (item: AddToCartInput, quantity?: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  removeFromCart: (productId: number) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_CART_KEY = 'aura_local_cart_items';

export const CartProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);

  // Calcula totais
  const totalAmount = items.reduce((acc, item) => {
    const unitPrice = item.promotional_price ?? item.price ?? 0;
    return acc + Number(unitPrice) * item.quantity;
  }, 0);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);

  // Salva no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items));
    } catch {
      // Ignora erro em ambientes restritos
    }
  }, [items]);

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  const addToCart = (input: AddToCartInput, additionalQuantity?: number) => {
    const rawId = input.product_id ?? (input.id ? Number(input.id) : undefined);
    const productId = rawId && !isNaN(rawId) ? rawId : 1;
    const qty = additionalQuantity ?? input.quantity ?? 1;
    const name = input.name || 'Cosmético';
    const price = Number(input.price || 0);

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (it) => it.product_id === productId || (input.id && it.id === input.id)
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + qty;
        updated[existingIndex] = {
          ...existing,
          quantity: newQty,
          subtotal: (existing.promotional_price ?? existing.price) * newQty,
        };
        return updated;
      } else {
        const newItem: CartItem = {
          product_id: productId,
          id: input.id || productId,
          name,
          price,
          promotional_price: input.promotional_price,
          quantity: qty,
          subtotal: (input.promotional_price ?? price) * qty,
          image_url: input.image_url,
          stock_quantity: input.stock_quantity,
        };
        return [...prevItems, newItem];
      }
    });

    // Sincroniza em segundo plano com backend se disponível
    cartApi.addItem(productId, qty).catch(() => {
      // Falha silenciosa caso offline / sem rede
    });
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }

    setItems((prev) =>
      prev.map((it) => {
        if (it.product_id === productId || it.id === productId) {
          const unitPrice = it.promotional_price ?? it.price;
          return {
            ...it,
            quantity,
            subtotal: unitPrice * quantity,
          };
        }
        return it;
      })
    );

    cartApi.updateItemQuantity(productId, quantity).catch(() => {});
  };

  const removeFromCart = (productId: number) => {
    setItems((prev) => prev.filter((it) => it.product_id !== productId && it.id !== productId));
    cartApi.removeItem(productId).catch(() => {});
  };

  const clearCart = () => {
    setItems([]);
    try {
      localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
    } catch {}
  };

  return (
    <CartContext.Provider
      value={{
        items,
        totalAmount,
        totalItems,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser utilizado dentro de um CartProvider');
  }
  return context;
};

export default CartContext;
