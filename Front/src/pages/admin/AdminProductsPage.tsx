import React, { useState, useEffect } from 'react';
import AdminSidebar from '../../components/admin/AdminSidebar';
import ProductRow from '../../components/admin/ProductRow';
import ProductModal from '../../components/admin/ProductModal';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import { productApi } from '../../services/productApi';
import { adminApi } from '../../services/adminApi';
import { Product, Category } from '../../types/product';
import { Plus, Search, Filter } from 'lucide-react';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [prodsData, catsData] = await Promise.all([
        productApi.getProducts({
          search: searchTerm || undefined,
          category_id: selectedCategory ? Number(selectedCategory) : undefined,
          limit: 100,
        }),
        productApi.getCategories().catch(() => []),
      ]);
      setProducts(prodsData.items || []);
      setCategories(catsData);
    } catch {
      // Mock para fallback caso backend desconectado
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [searchTerm, selectedCategory]);

  const handleOpenCreate = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setEditingProduct(prod);
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (formData: any) => {
    if (editingProduct) {
      await adminApi.updateProduct(editingProduct.product_id, formData);
    } else {
      await adminApi.createProduct(formData);
    }
    await loadData();
  };

  const handleDeleteProduct = async (productId: number) => {
    if (confirm('Deseja realmente desativar este cosmético da vitrine da loja?')) {
      await adminApi.deleteProduct(productId);
      await loadData();
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 flex">
      <AdminSidebar />

      <main className="flex-1 p-6 sm:p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-neutral-900">
              Catálogo de Cosméticos
            </h1>
            <p className="text-xs text-neutral-500 mt-1">
              Cadastro, precificação, inventário e controle de fórmulas cosméticas
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={handleOpenCreate}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Cadastrar Cosmético
          </Button>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white p-4 rounded-xl border border-neutral-200/90 shadow-xs mb-6 flex flex-col sm:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nome, marca ou ingrediente..."
              className="w-full h-10 pl-10 pr-4 text-xs rounded-md border border-neutral-300 bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-700"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-neutral-500" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value ? Number(e.target.value) : '')}
              className="h-10 text-xs rounded-md border border-neutral-300 bg-white px-3 text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
            >
              <option value="">Todas as Categorias</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabela de Produtos */}
        <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center">
              <Spinner size="lg" className="text-brand-700 mb-3" />
              <span className="text-xs text-neutral-500">Carregando catálogo de produtos...</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-neutral-50 text-[11px] font-semibold uppercase tracking-wider text-neutral-500 border-b border-neutral-200">
                    <th className="px-6 py-3.5">Cosmético</th>
                    <th className="px-6 py-3.5">Preço Unitário</th>
                    <th className="px-6 py-3.5">Estoque Físico</th>
                    <th className="px-6 py-3.5">Status Vitrine</th>
                    <th className="px-6 py-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-xs text-neutral-700">
                  {products.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-neutral-400">
                        Nenhum cosmético encontrado para os critérios pesquisados.
                      </td>
                    </tr>
                  ) : (
                    products.map((prod) => (
                      <ProductRow
                        key={prod.product_id}
                        product={prod}
                        onEdit={handleOpenEdit}
                        onDelete={handleDeleteProduct}
                      />
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Cadastro / Edição */}
        <ProductModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveProduct}
          product={editingProduct}
          categories={categories}
        />
      </main>
    </div>
  );
};

export default AdminProductsPage;
