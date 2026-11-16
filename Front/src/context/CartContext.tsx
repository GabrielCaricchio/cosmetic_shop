import React, { createContext, useContext, useState, useEffect } from 'react';

export interface CartItemData {
  product_id?: number | string;
  id?: string;
  name: string;
  price: number;
  promotional_price?: number | null;
  quantity: number;
  image_url?: string;
  stock_quantity?: number;
}

export interface CartContextType {
  cartItems: CartItemData[];
  totalAmount: number;
  totalItems: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  addToCart: (item: Partial<CartItemData> & { name: string; price: number }, quantity?: number) => void;
  updateQuantity: (productId: number | string, quantity: number) => void;
  removeFromCart: (productId: number | string) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItemData[]>(() => {
    try {
      const stored = localStorage.getItem('cosmetic_cart');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('cosmetic_cart', JSON.stringify(cartItems));
    } catch (err) {
      console.warn('Erro ao persistir carrinho:', err);
    }
  }, [cartItems]);

  const getItemId = (item: { product_id?: number | string; id?: string }) => {
    return item.product_id !== undefined ? String(item.product_id) : String(item.id || '');
  };

  const addToCart = (
    item: Partial<CartItemData> & { name: string; price: number },
    quantity = 1
  ) => {
    const targetId = getItemId(item);
    setCartItems((prev) => {
      const existingIndex = prev.findIndex((i) => getItemId(i) === targetId);
      const addQty = item.quantity || quantity;

      if (existingIndex > -1) {
        const updated = [...prev];
        const existing = updated[existingIndex];
        const newQty = existing.quantity + addQty;
        const maxStock = item.stock_quantity ?? existing.stock_quantity ?? 999;
        updated[existingIndex] = {
          ...existing,
          quantity: Math.min(newQty, maxStock),
        };
        return updated;
      } else {
        return [
          ...prev,
          {
            product_id: item.product_id,
            id: item.id || (item.product_id ? String(item.product_id) : undefined),
            name: item.name,
            price: item.promotional_price ?? item.price,
            promotional_price: item.promotional_price,
            quantity: addQty,
            image_url: item.image_url,
            stock_quantity: item.stock_quantity,
          },
        ];
      }
    });
  };

  const updateQuantity = (productId: number | string, quantity: number) => {
    const strId = String(productId);
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((i) => {
        if (getItemId(i) === strId) {
          const maxStock = i.stock_quantity ?? 999;
          return { ...i, quantity: Math.min(quantity, maxStock) };
        }
        return i;
      })
    );
  };

  const removeFromCart = (productId: number | string) => {
    const strId = String(productId);
    setCartItems((prev) => prev.filter((i) => getItemId(i) !== strId));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const totalItems = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const totalAmount = cartItems.reduce((acc, item) => {
    const effectivePrice = item.promotional_price ?? item.price;
    return acc + effectivePrice * item.quantity;
  }, 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalAmount,
        totalItems,
        isDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
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

export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
};
