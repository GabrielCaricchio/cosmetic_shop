import React, { useState } from 'react';
import { ChevronDown, Sparkles, ShieldCheck, HeartHandshake, Leaf } from 'lucide-react';

export interface ProductAccordionsProps {
  description?: string | null;
  ingredients?: string | null;
  howToUse?: string | null;
}

export const ProductAccordions: React.FC<ProductAccordionsProps> = ({
  description,
  ingredients,
  howToUse,
}) => {
  const [openSection, setOpenSection] = useState<'desc' | 'usage' | 'ingredients' | 'shipping' | null>('desc');

  const toggle = (section: 'desc' | 'usage' | 'ingredients' | 'shipping') => {
    setOpenSection(openSection === section ? null : section);
  };

  return (
    <div className="divide-y divide-warm-200/80 border-y border-warm-200/80 mt-8">
      {/* Descrição */}
      {description && (
        <div className="py-4.5">
          <button
            type="button"
            onClick={() => toggle('desc')}
            className="flex w-full items-center justify-between text-left font-medium text-warm-900 group"
          >
            <span className="flex items-center gap-2.5 text-sm font-bold font-serif text-warm-900 group-hover:text-botanic-800 transition-colors">
              <Sparkles className="h-4 w-4 text-champagne-600" /> Descrição & Sensorial
            </span>
            <ChevronDown
              className={`h-4 w-4 text-warm-500 transition-transform duration-300 ${
                openSection === 'desc' ? 'rotate-180 text-botanic-800' : ''
              }`}
            />
          </button>
          {openSection === 'desc' && (
            <p className="mt-3 text-xs sm:text-sm text-warm-700 leading-relaxed whitespace-pre-line font-normal">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Modo de Uso */}
      {howToUse && (
        <div className="py-4.5">
          <button
            type="button"
            onClick={() => toggle('usage')}
            className="flex w-full items-center justify-between text-left font-medium text-warm-900 group"
          >
            <span className="flex items-center gap-2.5 text-sm font-bold font-serif text-warm-900 group-hover:text-botanic-800 transition-colors">
              <HeartHandshake className="h-4 w-4 text-champagne-600" /> Ritual & Modo de Usar
            </span>
            <ChevronDown
              className={`h-4 w-4 text-warm-500 transition-transform duration-300 ${
                openSection === 'usage' ? 'rotate-180 text-botanic-800' : ''
              }`}
            />
          </button>
          {openSection === 'usage' && (
            <p className="mt-3 text-xs sm:text-sm text-warm-700 leading-relaxed whitespace-pre-line font-normal">
              {howToUse}
            </p>
          )}
        </div>
      )}

      {/* Ingredientes / Composição */}
      {ingredients && (
        <div className="py-4.5">
          <button
            type="button"
            onClick={() => toggle('ingredients')}
            className="flex w-full items-center justify-between text-left font-medium text-warm-900 group"
          >
            <span className="flex items-center gap-2.5 text-sm font-bold font-serif text-warm-900 group-hover:text-botanic-800 transition-colors">
              <Leaf className="h-4 w-4 text-botanic-700" /> Ativos & Ingredientes Puros
            </span>
            <ChevronDown
              className={`h-4 w-4 text-warm-500 transition-transform duration-300 ${
                openSection === 'ingredients' ? 'rotate-180 text-botanic-800' : ''
              }`}
            />
          </button>
          {openSection === 'ingredients' && (
            <div className="mt-3 text-xs text-warm-700 font-mono leading-relaxed bg-warm-100/70 p-3.5 rounded-2xl border border-warm-200">
              {ingredients}
            </div>
          )}
        </div>
      )}

      {/* Envio e Garantia */}
      <div className="py-4.5">
        <button
          type="button"
          onClick={() => toggle('shipping')}
          className="flex w-full items-center justify-between text-left font-medium text-warm-900 group"
        >
          <span className="flex items-center gap-2.5 text-sm font-bold font-serif text-warm-900 group-hover:text-botanic-800 transition-colors">
            <ShieldCheck className="h-4 w-4 text-emerald-700" /> Envio Seguro & Garantia Aura
          </span>
          <ChevronDown
            className={`h-4 w-4 text-warm-500 transition-transform duration-300 ${
              openSection === 'shipping' ? 'rotate-180 text-botanic-800' : ''
            }`}
          />
        </button>
        {openSection === 'shipping' && (
          <div className="mt-3 text-xs text-warm-700 space-y-2 leading-relaxed">
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-botanic-700" />
              Envio expresso e rastreado para todo o Brasil.
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-botanic-700" />
              Troca fácil e garantida em até 30 dias após a entrega.
            </p>
            <p className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-botanic-700" />
              Embalagem biodegradável com proteção contra quebras.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
