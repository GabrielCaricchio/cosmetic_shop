import React from 'react';
import { Product } from '../../types/product';
import Badge from '../common/Badge';
import { Edit2, Trash2 } from 'lucide-react';

export interface ProductRowProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: number) => void;
}

export const ProductRow: React.FC<ProductRowProps> = ({
  product,
  onEdit,
  onDelete,
}) => {
  const primaryImage =
    product.images?.find((img) => img.is_primary)?.image_url ||
    product.images?.[0]?.image_url ||
    'https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&w=100&q=80';

  const isCriticalStock = product.stock_quantity <= 3;
  const isOutOfStock = product.stock_quantity === 0;

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(product.price);

  return (
    <tr className="hover:bg-neutral-50/70 transition-colors border-b border-neutral-100">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-3">
          <img
            src={primaryImage}
            alt={product.name}
            className="w-10 h-10 rounded-md object-cover bg-neutral-100 border border-neutral-200 shrink-0"
          />
          <div>
            <div className="text-xs font-bold text-neutral-900 line-clamp-1">{product.name}</div>
            <div className="text-[11px] text-neutral-500">{product.brand}</div>
          </div>
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <span className="text-xs font-semibold text-neutral-800 font-mono">{formattedPrice}</span>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold font-mono text-neutral-900">
            {product.stock_quantity} un.
          </span>
          {isOutOfStock ? (
            <Badge variant="danger" size="sm">
              Esgotado
            </Badge>
          ) : isCriticalStock ? (
            <Badge variant="warning" size="sm">
              Estoque Crítico
            </Badge>
          ) : (
            <Badge variant="success" size="sm">
              Normal
            </Badge>
          )}
        </div>
      </td>

      <td className="px-6 py-4 whitespace-nowrap">
        {product.is_active ? (
          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
            Ativo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs text-neutral-400 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-neutral-400" />
            Inativo
          </span>
        )}
      </td>

      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-medium">
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={() => onEdit(product)}
            className="p-1.5 text-neutral-500 hover:text-brand-700 hover:bg-neutral-100 rounded-md transition-colors"
            title="Editar produto"
            aria-label={`Editar ${product.name}`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.product_id)}
            className="p-1.5 text-neutral-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
            title="Desativar produto"
            aria-label={`Desativar ${product.name}`}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default ProductRow;
