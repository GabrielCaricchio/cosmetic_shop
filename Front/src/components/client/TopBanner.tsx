import React from 'react';
import { Sparkles, Truck, ShieldCheck } from 'lucide-react';

export const TopBanner: React.FC = () => {
  return (
    <div className="bg-botanic-950 text-champagne-300 border-b border-botanic-800/60 py-2 px-3 text-[11px] sm:text-xs font-medium tracking-wide">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 overflow-hidden">
        {/* Mobile: Animated single line with highlights */}
        <div className="flex sm:hidden items-center justify-center w-full gap-2 text-center truncate">
          <Sparkles className="h-3 w-3 text-champagne-400 shrink-0 animate-pulse" />
          <span className="truncate">
            <strong className="text-white">Frete Grátis</strong> acima de R$ 149 • <strong className="text-white">5% OFF</strong> no Pix
          </span>
        </div>

        {/* Desktop: 3 informative columns */}
        <div className="hidden sm:flex items-center gap-6 justify-between w-full">
          <div className="flex items-center gap-1.5 text-champagne-200">
            <Truck className="h-3.5 w-3.5 text-champagne-400" />
            <span>Frete Grátis para todo o Brasil em compras a partir de R$ 149</span>
          </div>

          <div className="flex items-center gap-1.5 text-champagne-100">
            <Sparkles className="h-3.5 w-3.5 text-champagne-400" />
            <span>Pague via <strong>Pix</strong> e receba <strong>5% de Desconto Imediato</strong></span>
          </div>

          <div className="flex items-center gap-1.5 text-champagne-200">
            <ShieldCheck className="h-3.5 w-3.5 text-champagne-400" />
            <span>Fórmulas Veganas & 100% Cruelty-Free</span>
          </div>
        </div>
      </div>
    </div>
  );
};
