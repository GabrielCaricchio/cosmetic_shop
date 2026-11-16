import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Input from '../common/Input';
import Button from '../common/Button';
import { Product } from '../../types/product';
import { Plus, Trash2 } from 'lucide-react';

export interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: any) => Promise<void> | void;
  product?: Product | null;
  categories?: { category_id: number; name: string }[];
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
  product,
  categories = [],
}) => {
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('Aura Cosméticos');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [price, setPrice] = useState<string>('');
  const [stockQuantity, setStockQuantity] = useState<string>('10');
  const [description, setDescription] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (product) {
      setName(product.name || '');
      setBrand(product.brand || 'Aura Cosméticos');
      setCategoryId(product.category_id || '');
      setPrice(String(product.price || ''));
      setStockQuantity(String(product.stock_quantity ?? 0));
      setDescription(product.description || '');
      setIngredients(product.ingredients || '');
      setImageUrls(product.images?.map((img) => img.image_url) || []);
    } else {
      setName('');
      setBrand('Aura Cosméticos');
      setCategoryId('');
      setPrice('');
      setStockQuantity('10');
      setDescription('');
      setIngredients('');
      setImageUrls([]);
    }
    setErrors({});
  }, [product, isOpen]);

  const handleAddImageUrl = () => {
    if (newImageUrl.trim()) {
      setImageUrls([...imageUrls, newImageUrl.trim()]);
      setNewImageUrl('');
    }
  };

  const handleRemoveImageUrl = (index: number) => {
    setImageUrls(imageUrls.filter((_, i) => i !== index));
  };

  const handleValidationAndSubmit = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault();
    }
    const newErrors: Record<string, string> = {};

    if (!name || !name.trim()) {
      newErrors.name = 'Nome do produto é obrigatório';
    }

    if (!price || isNaN(Number(price)) || Number(price) <= 0) {
      newErrors.price = 'Informe um preço válido maior que zero';
    }

    if (stockQuantity === '' || isNaN(Number(stockQuantity)) || Number(stockQuantity) < 0) {
      newErrors.stockQuantity = 'Informe uma quantidade de estoque válida';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSave({
        name: name.trim(),
        brand: brand.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        price: Number(price),
        stock_quantity: Number(stockQuantity),
        description: description.trim() || undefined,
        ingredients: ingredients.trim() || undefined,
        image_urls: imageUrls,
      });
      onClose();
    } catch (err: any) {
      setErrors({ form: err.message || 'Erro ao salvar produto' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Editar Cosmético' : 'Novo Cosmético'}
      maxWidth="xl"
    >
      <form noValidate onSubmit={handleValidationAndSubmit} className="space-y-4">
        {errors.form && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md">
            {errors.form}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Nome do Produto"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: '' }));
            }}
            placeholder="Ex: Sérum Vitamina C 15%"
            error={errors.name}
          />

          <Input
            label="Marca"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            placeholder="Ex: Aura Derm"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
              Categoria
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : '')}
              className="w-full h-11 px-3 text-sm rounded-md border border-neutral-300 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
            >
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <option key={c.category_id} value={c.category_id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Preço de Venda (R$)"
            type="number"
            step="0.01"
            value={price}
            onChange={(e) => {
              setPrice(e.target.value);
              if (errors.price) setErrors((prev) => ({ ...prev, price: '' }));
            }}
            placeholder="89.90"
            error={errors.price}
          />

          <Input
            label="Estoque Inicial"
            type="number"
            value={stockQuantity}
            onChange={(e) => {
              setStockQuantity(e.target.value);
              if (errors.stockQuantity) setErrors((prev) => ({ ...prev, stockQuantity: '' }));
            }}
            placeholder="50"
            error={errors.stockQuantity}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
            Descrição e Benefícios
          </label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva texturas, resultados clínicos e diferenciais do cosmético..."
            className="w-full p-3 text-sm rounded-md border border-neutral-300 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
            Composição Dermatológica (INCI) & Modo de Aplicação
          </label>
          <textarea
            rows={2}
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="Aqua, Dimethicone, Tocopherol (Vitamina E), Ácido Hialurônico..."
            className="w-full p-3 text-sm rounded-md border border-neutral-300 bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-brand-700"
          />
        </div>

        {/* Galeria de Fotos */}
        <div>
          <label className="block text-xs font-semibold text-neutral-800 uppercase tracking-wider mb-1.5">
            Fotos do Cosmético (URLs)
          </label>
          <div className="flex gap-2 mb-2">
            <Input
              value={newImageUrl}
              onChange={(e) => setNewImageUrl(e.target.value)}
              placeholder="https://exemplo.com/foto-produto.jpg"
              containerClassName="flex-1"
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddImageUrl}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Adicionar
            </Button>
          </div>

          {imageUrls.length > 0 && (
            <div className="grid grid-cols-4 gap-2.5 pt-2">
              {imageUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group aspect-square rounded-md border border-neutral-200 overflow-hidden bg-neutral-100"
                >
                  <img src={url} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => handleRemoveImageUrl(index)}
                    className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-90 hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-1 left-1 text-[9px] bg-brand-950/80 text-white px-1.5 py-0.5 rounded font-semibold">
                      Principal
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rodapé com Botão Salvar Cosmético */}
        <div className="pt-4 border-t border-neutral-200 flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="primary"
            isLoading={isSubmitting}
            onClick={() => handleValidationAndSubmit()}
          >
            Salvar Cosmético
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProductModal;
