import React from 'react';
import { Category } from '../../types/product';

export interface CategoryPillsProps {
  categories: Category[];
  selectedCategorySlug?: string;
  onSelectCategory: (slug?: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategorySlug,
  onSelectCategory,
}) => {
  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none flex items-center gap-2">
      <button
        type="button"
        onClick={() => onSelectCategory(undefined)}
        className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
          !selectedCategorySlug
            ? 'bg-neutral-900 text-white shadow-sm'
            : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
        }`}
      >
        Todos
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategorySlug === cat.slug;
        return (
          <button
            key={cat.id || cat.slug}
            type="button"
            onClick={() => onSelectCategory(cat.slug)}
            className={`shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
              isSelected
                ? 'bg-rose-600 text-white shadow-sm'
                : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
