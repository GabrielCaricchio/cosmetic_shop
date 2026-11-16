import React from 'react';
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider, useCart } from './context/CartContext';
import { HomePage } from './pages/client/HomePage';
import { ProductDetailPage } from './pages/client/ProductDetailPage';
import { CartPage } from './pages/client/CartPage';
import { CheckoutPage } from './pages/client/CheckoutPage';
import { OrderSuccessPage } from './pages/client/OrderSuccessPage';
import { AuthPage } from './pages/client/AuthPage';
import { CartDrawer } from './components/client/CartDrawer';
import { AuthModal } from './components/client/AuthModal';

import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminRouteGuard } from './components/admin/AdminRouteGuard';
import { Product } from './types/product';

const ClientApp: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthModalOpen, closeAuthModal, openAuthModal } = useAuth();
  const { totalItems, openDrawer, addToCart } = useCart();

  const handleSelectProduct = (product: Product) => {
    navigate(`/produtos/${product.slug}`);
  };

  const handleAddToCart = (product: Product, quantity = 1) => {
    addToCart(
      {
        id: product.id || String(product.product_id),
        name: product.name,
        price: product.price,
        promotional_price: product.promotional_price,
        image_url: product.images?.[0]?.image_url,
        stock_quantity: product.stock_quantity,
      },
      quantity
    );
    openDrawer();
  };

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            <HomePage
              onSelectProduct={handleSelectProduct}
              onAddToCart={handleAddToCart}
              cartItemCount={totalItems}
              onOpenCart={openDrawer}
              onOpenAuth={openAuthModal}
              user={user}
            />
          }
        />
        <Route
          path="/produtos/:slug"
          element={
            <ProductDetailPage
              onAddToCart={(p, q) => handleAddToCart(p, q)}
              onDirectBuy={(p, q) => {
                sessionStorage.setItem(
                  'direct_checkout_item',
                  JSON.stringify({ product: p, quantity: q })
                );
                navigate('/checkout');
              }}
            />
          }
        />
        <Route path="/carrinho" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/pedido-confirmado/:id" element={<OrderSuccessPage />} />
        <Route path="/login" element={<AuthPage />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route
          path="/admin"
          element={
            <AdminRouteGuard>
              <AdminDashboardPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRouteGuard>
              <AdminDashboardPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/produtos"
          element={
            <AdminRouteGuard>
              <AdminProductsPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/pedidos"
          element={
            <AdminRouteGuard>
              <AdminOrdersPage />
            </AdminRouteGuard>
          }
        />
        <Route
          path="/admin/reservas"
          element={
            <AdminRouteGuard>
              <AdminInventoryPage />
            </AdminRouteGuard>
          }
        />
      </Routes>

      <CartDrawer onCheckout={() => navigate('/checkout')} />
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />
    </>
  );
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ClientApp />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
