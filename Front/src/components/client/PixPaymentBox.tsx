import React, { useState } from 'react';
import { Copy, Check, Clock, AlertCircle, ShieldCheck } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';
import { Button } from '../common/Button';

export interface PixPaymentBoxProps {
  qrCodeBase64?: string;
  copyPasteCode: string;
  expiresAt?: string;
  onExpired?: () => void;
}

export const PixPaymentBox: React.FC<PixPaymentBoxProps> = ({
  qrCodeBase64,
  copyPasteCode,
  expiresAt,
  onExpired,
}) => {
  const [copied, setCopied] = useState(false);

  // Padrão de 1800s (30 minutos) de reserva no Redis
  const calculateInitialSeconds = () => {
    if (!expiresAt) return 1800;
    const diffMs = new Date(expiresAt).getTime() - Date.now();
    return Math.max(0, Math.floor(diffMs / 1000));
  };

  const { formatted, isExpired } = useCountdown(calculateInitialSeconds());

  React.useEffect(() => {
    if (isExpired && onExpired) {
      onExpired();
    }
  }, [isExpired, onExpired]);

  const handleCopy = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(copyPasteCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.warn('Erro ao copiar para clipboard:', err);
    }
  };

  return (
    <div className="rounded-3xl border border-warm-200/90 bg-white p-5 sm:p-7 shadow-luxury text-center space-y-5">
      {/* Timer de Reserva Atômica Redis */}
      <div className="inline-flex items-center gap-2 rounded-full bg-champagne-100/90 px-4 py-1.5 text-xs font-bold text-champagne-800 border border-champagne-300">
        <Clock className="h-4 w-4 text-champagne-600 animate-spin" />
        {isExpired ? (
          <span className="text-terracotta-600 font-extrabold">Tempo limite expirado!</span>
        ) : (
          <span>Reserva de estoque garantida: {formatted}</span>
        )}
      </div>

      {/* QR Code Container */}
      <div className="mx-auto w-52 h-52 sm:w-60 sm:h-60 rounded-3xl bg-warm-50 border border-warm-200 flex items-center justify-center p-3 shadow-inner">
        {qrCodeBase64 ? (
          <img
            src={qrCodeBase64}
            alt="Pix QR Code"
            className="w-full h-full object-contain rounded-2xl"
          />
        ) : (
          <div className="text-xs text-warm-400 font-mono break-all p-3">
            [QR Code Pix Gerado com Segurança]
          </div>
        )}
      </div>

      {/* Instruções de Pagamento */}
      <div className="text-left space-y-2.5 bg-warm-50 p-4 rounded-2xl border border-warm-200/80">
        <div className="flex items-center gap-1.5 text-xs font-bold text-warm-900">
          <ShieldCheck className="h-4 w-4 text-emerald-700" />
          Como pagar com Pix:
        </div>
        <ol className="text-xs text-warm-700 space-y-1 list-decimal list-inside leading-relaxed font-normal">
          <li>Abra o aplicativo do seu banco preferido</li>
          <li>Acesse a área <strong>Pix &gt; Ler QR Code</strong> ou <strong>Copia e Cola</strong></li>
          <li>Confirme os dados para <strong>aprovação instantânea</strong></li>
        </ol>
      </div>

      {/* Pix Copia e Cola */}
      <div className="space-y-2 text-left">
        <label className="block text-xs font-bold uppercase tracking-wider text-warm-700">
          Código Pix Copia e Cola:
        </label>
        <div className="relative">
          <input
            type="text"
            readOnly
            value={copyPasteCode}
            className="w-full rounded-2xl border border-warm-200 bg-warm-100/70 px-4 py-3 text-xs font-mono text-warm-800 focus:outline-none select-all"
          />
        </div>

        <Button
          type="button"
          onClick={handleCopy}
          disabled={isExpired}
          className={`w-full py-3.5 font-bold flex items-center justify-center gap-2 rounded-2xl transition-all shadow-md active:scale-[0.98] ${
            copied
              ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
              : 'bg-gradient-to-r from-botanic-900 to-botanic-950 hover:from-botanic-950 hover:to-black text-champagne-300'
          }`}
        >
          {copied ? (
            <>
              <Check className="h-4 w-4" /> Código Pix Copiado!
            </>
          ) : (
            <>
              <Copy className="h-4 w-4" /> Copiar Chave Pix
            </>
          )}
        </Button>
      </div>

      {isExpired && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-terracotta-600 font-medium">
          <AlertCircle className="h-4 w-4" /> A reserva de estoque expirou. Por favor, reinicie a compra.
        </div>
      )}
    </div>
  );
};
