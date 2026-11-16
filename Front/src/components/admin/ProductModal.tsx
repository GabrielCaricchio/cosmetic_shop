import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Input } from '../common/Input';
import { Button } from '../common/Button';
import { Product, Category } from '../../types/product';

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: Partial<Product>) => Promise<void> | void;
  initialProduct?: Product | null;
  categories?: Category[];
}

const EMPTY_CATEGORIES: Category[] = [];

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  initialProduct,
  categories = EMPTY_CATEGORIES,
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [price, setPrice] = useState('');
  const [promotionalPrice, setPromotionalPrice] = useState('');
  const [stockQuantity, setStockQuantity] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [howToUse, setHowToUse] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialProduct) {
      setName(initialProduct.name || '');
      setBrand(initialProduct.brand || '');
      setPrice(String(initialProduct.price || ''));
      setPromotionalPrice(
        initialProduct.promotional_price !== null && initialProduct.promotional_price !== undefined
          ? String(initialProduct.promotional_price)
          : ''
      );
      setStockQuantity(String(initialProduct.stock_quantity ?? ''));
      setSku(initialProduct.sku || '');
      setCategoryId(initialProduct.category_id || '');
      setDescription(initialProduct.description || '');
      setIngredients(initialProduct.ingredients || '');
      setHowToUse(initialProduct.how_to_use || '');
      setImageUrl(initialProduct.images?.[0]?.image_url || '');
    } else {
      setName('');
      setBrand('');
      setPrice('');
      setPromotionalPrice('');
      setStockQuantity('');
      setSku('');
      setCategoryId(categories[0]?.id || '');
      setDescription('');
      setIngredients('');
      setHowToUse('');
      setImageUrl('');
    }
    setErrors({});
  }, [initialProduct, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        brand: brand.trim() || 'Aura Cosméticos',
        price: parseFloat(price) || 0,
        promotional_price: promotionalPrice ? parseFloat(promotionalPrice) : null,
        stock_quantity: parseInt(stockQuantity, 10) || 0,
        sku: sku.trim() || undefined,
        category_id: categoryId || undefined,
        description: description.trim() || undefined,
        ingredients: ingredients.trim() || undefined,
        how_to_use: howToUse.trim() || undefined,
        images: imageUrl
          ? [
              {
                image_url: imageUrl.trim(),
                is_primary: true,
                display_order: 1,
              },
            ]
          : [],
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialProduct ? 'Editar Cosmético' : 'Novo Cosmético'}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto px-1">
        <Input
          label="Nome do Produto *"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
          }}
          error={errors.name}
          placeholder="Ex: Batom Matte Longa Duração"
        />

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Marca"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ex: Natura, O Boticário, Aura"
          />
          <Input
            label="SKU / Código"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            placeholder="Ex: AUR-BTM-01"
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Input
            label="Preço Regular (R$)"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="49.90"
          />
          <Input
            label="Preço Promo (R$)"
            type="number"
            step="0.01"
            value={promotionalPrice}
            onChange={(e) => setPromotionalPrice(e.target.value)}
            placeholder="39.90"
          />
          <Input
            label="Quantidade em Estoque"
            type="number"
            value={stockQuantity}
            onChange={(e) => setStockQuantity(e.target.value)}
            placeholder="15"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Categoria
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white px-3.5 py-2.5 text-sm text-neutral-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
          >
            <option value="">Selecione uma categoria...</option>
            {categories.map((c) => (
              <option key={c.id || c.slug} value={c.id || c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="URL da Imagem Principal"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://images.unsplash.com/..."
        />

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-1">
            Descrição do Produto
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-xl border border-neutral-300 bg-white p-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
            placeholder="Detalhes, benefícios e diferenciais da fórmula..."
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Ingredientes
            </label>
            <textarea
              rows={2}
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200 font-mono"
              placeholder="Cera vegetal, pigmentos..."
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-1">
              Modo de Uso
            </label>
            <textarea
              rows={2}
              value={howToUse}
              onChange={(e) => setHowToUse(e.target.value)}
              className="w-full rounded-xl border border-neutral-300 bg-white p-2.5 text-xs text-neutral-900 focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-200"
              placeholder="Aplique sobre a pele limpa..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="submit"
            isLoading={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-bold px-6"
          >
            Salvar Cosmético
          </Button>
        </div>
      </form>
    </Modal>
  );
};
