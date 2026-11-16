import React, { useState } from 'react';
import { ChevronDown, Sparkles, ShieldCheck, HeartHandshake } from 'lucide-react';

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
    <div className="divide-y divide-neutral-200 border-y border-neutral-200 mt-6">
      {/* Descrição */}
      {description && (
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggle('desc')}
            className="flex w-full items-center justify-between text-left font-medium text-neutral-900"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-rose-500" /> Descrição do Produto
            </span>
            <ChevronDown
              className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                openSection === 'desc' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSection === 'desc' && (
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          )}
        </div>
      )}

      {/* Modo de Uso */}
      {howToUse && (
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggle('usage')}
            className="flex w-full items-center justify-between text-left font-medium text-neutral-900"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <HeartHandshake className="h-4 w-4 text-rose-500" /> Modo de Uso
            </span>
            <ChevronDown
              className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                openSection === 'usage' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSection === 'usage' && (
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
              {howToUse}
            </p>
          )}
        </div>
      )}

      {/* Ingredientes / Composição */}
      {ingredients && (
        <div className="py-4">
          <button
            type="button"
            onClick={() => toggle('ingredients')}
            className="flex w-full items-center justify-between text-left font-medium text-neutral-900"
          >
            <span className="flex items-center gap-2 text-sm font-semibold">
              <Sparkles className="h-4 w-4 text-rose-500" /> Ingredientes & Composição
            </span>
            <ChevronDown
              className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
                openSection === 'ingredients' ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openSection === 'ingredients' && (
            <p className="mt-3 text-xs text-neutral-600 font-mono leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              {ingredients}
            </p>
          )}
        </div>
      )}

      {/* Envio e Garantia */}
      <div className="py-4">
        <button
          type="button"
          onClick={() => toggle('shipping')}
          className="flex w-full items-center justify-between text-left font-medium text-neutral-900"
        >
          <span className="flex items-center gap-2 text-sm font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" /> Envio Seguro & Garantia
          </span>
          <ChevronDown
            className={`h-4 w-4 text-neutral-500 transition-transform duration-200 ${
              openSection === 'shipping' ? 'rotate-180' : ''
            }`}
          />
        </button>
        {openSection === 'shipping' && (
          <div className="mt-3 text-xs text-neutral-600 space-y-1.5 leading-relaxed">
            <p>✓ Envio com código de rastreamento pelos Correios e transportadoras parceiras.</p>
            <p>✓ Garantia de satisfação de 7 dias após o recebimento (CDC).</p>
            <p>✓ Produtos 100% originais com nota fiscal e selo de autenticidade.</p>
          </div>
        )}
      </div>
    </div>
  );
};
