import React, { useState, useEffect } from 'react';
import { Plus, RefreshCw } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/AdminSidebar';
import { AdminHeader } from '../../components/admin/AdminHeader';
import { ProductTable } from '../../components/admin/ProductTable';
import { ProductModal } from '../../components/admin/ProductModal';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/apiClient';
import { Product, Category } from '../../types/product';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        apiClient.get('/products'),
        apiClient.get('/categories'),
      ]);
      setProducts(prodRes.data.items || prodRes.data || []);
      setCategories(catRes.data.items || catRes.data || []);
    } catch (err) {
      console.warn('Falha ao carregar produtos do backoffice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSaveProduct = async (productData: Partial<Product>) => {
    if (editingProduct) {
      const prodId = editingProduct.id || editingProduct.product_id;
      await apiClient.put(`/admin/products/${prodId}`, productData);
    } else {
      await apiClient.post('/admin/products', productData);
    }
    fetchProducts();
  };

  const handleDeleteProduct = async (product: Product) => {
    const prodId = product.id || product.product_id;
    if (window.confirm(`Deseja realmente desativar ${product.name}?`)) {
      try {
        await apiClient.delete(`/admin/products/${prodId}`);
        fetchProducts();
      } catch (err) {
        console.warn('Erro ao deletar:', err);
      }
    }
  };

  return (
    <div className="min-h-screen flex bg-neutral-100">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader title="Catálogo de Cosméticos" />

        <main className="p-6 sm:p-8 space-y-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 font-serif">
                Gestão de Produtos e Inventário
              </h2>
              <p className="text-xs text-neutral-500">
                Cadastre, edite preços e controle estoque disponível e crítico.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fetchProducts}
                className="flex items-center gap-1.5 rounded-xl border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 hover:bg-neutral-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Atualizar
              </button>
              <Button
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
                className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center gap-2 py-2.5 px-4 shadow-sm"
              >
                <Plus className="h-4 w-4" /> Novo Cosmético
              </Button>
            </div>
          </div>

          <ProductTable
            products={products}
            onEdit={(p) => {
              setEditingProduct(p);
              setIsModalOpen(true);
            }}
            onDelete={handleDeleteProduct}
          />

          <ProductModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSave={handleSaveProduct}
            initialProduct={editingProduct}
            categories={categories}
          />
        </main>
      </div>
    </div>
  );
};
