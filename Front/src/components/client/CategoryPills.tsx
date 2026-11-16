import React from 'react';
import { Category } from '../../types/product';
import { Sparkles } from 'lucide-react';

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
    <div className="w-full overflow-x-auto py-2 no-scrollbar flex items-center gap-2.5 scroll-smooth">
      <button
        type="button"
        onClick={() => onSelectCategory(undefined)}
        className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
          !selectedCategorySlug
            ? 'bg-botanic-900 text-champagne-300 shadow-soft border border-botanic-800 ring-1 ring-botanic-700/50'
            : 'bg-white/80 border border-warm-200 text-warm-700 hover:bg-warm-100 hover:border-warm-300 hover:text-botanic-950'
        }`}
      >
        <Sparkles className="h-3 w-3" />
        Todos os Cosméticos
      </button>

      {categories.map((cat) => {
        const isSelected = selectedCategorySlug === cat.slug;
        return (
          <button
            key={cat.id || cat.slug}
            type="button"
            onClick={() => onSelectCategory(cat.slug)}
            className={`shrink-0 rounded-full px-4 py-2 text-xs font-semibold tracking-wide transition-all duration-200 active:scale-95 ${
              isSelected
                ? 'bg-botanic-900 text-champagne-300 shadow-soft border border-botanic-800 ring-1 ring-botanic-700/50'
                : 'bg-white/80 border border-warm-200 text-warm-700 hover:bg-warm-100 hover:border-warm-300 hover:text-botanic-950'
            }`}
          >
            {cat.name}
          </button>
        );
      })}
    </div>
  );
};
