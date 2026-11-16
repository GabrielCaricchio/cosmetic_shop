import React from 'react';
import { Edit2, Trash2, AlertCircle } from 'lucide-react';
import { Product } from '../../types/product';
import { Badge } from '../common/Badge';

export interface ProductTableProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (product: Product) => void;
}

export const ProductTable: React.FC<ProductTableProps> = ({
  products,
  onEdit,
  onDelete,
}) => {
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs text-neutral-600">
          <thead className="border-b border-neutral-200 bg-neutral-50/75 text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
            <tr>
              <th className="py-3.5 px-4">Produto</th>
              <th className="py-3.5 px-4">Marca</th>
              <th className="py-3.5 px-4">Preço</th>
              <th className="py-3.5 px-4">Estoque</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-neutral-400">
                  Nenhum cosmético cadastrado.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const primaryImg =
                  product.images?.[0]?.image_url ||
                  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=100&auto=format&fit=crop&q=60';
                const isCriticalStock = product.stock_quantity <= 3;

                return (
                  <tr
                    key={product.id || product.product_id}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={primaryImg}
                          alt={product.name}
                          className="h-10 w-10 shrink-0 rounded-lg object-cover border border-neutral-200"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-neutral-900 truncate max-w-xs">
                            {product.name}
                          </p>
                          {product.sku && (
                            <p className="text-[11px] text-neutral-400 font-mono">
                              {product.sku}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-neutral-800">
                      {product.brand}
                    </td>
                    <td className="py-3 px-4 font-bold text-neutral-900">
                      {product.promotional_price ? (
                        <div className="flex flex-col">
                          <span className="text-[10px] text-neutral-400 line-through">
                            {formatPrice(product.price)}
                          </span>
                          <span className="text-rose-600">
                            {formatPrice(product.promotional_price)}
                          </span>
                        </div>
                      ) : (
                        formatPrice(product.price)
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-extrabold ${
                            product.stock_quantity === 0
                              ? 'text-red-600'
                              : isCriticalStock
                              ? 'text-amber-600'
                              : 'text-neutral-800'
                          }`}
                        >
                          {product.stock_quantity} un.
                        </span>
                        {isCriticalStock && (
                          <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      {product.stock_quantity > 0 ? (
                        <Badge variant="success">Disponível</Badge>
                      ) : (
                        <Badge variant="danger">Esgotado</Badge>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => onEdit(product)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100 transition-colors"
                          aria-label="Editar"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDelete(product)}
                          className="p-1.5 rounded-lg text-neutral-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                          aria-label="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
