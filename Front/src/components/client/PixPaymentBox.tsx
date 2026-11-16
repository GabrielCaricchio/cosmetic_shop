import React, { useState } from 'react';
import { Copy, Check, Clock, AlertCircle } from 'lucide-react';
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

  // Default to 1800 seconds (30 minutes) if expiresAt not provided
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
    <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm text-center">
      {/* Timer */}
      <div className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-1.5 text-xs font-bold text-rose-700 border border-rose-200 mb-6">
        <Clock className="h-4 w-4" />
        {isExpired ? (
          <span className="text-red-600 font-extrabold">Tempo limite expirado!</span>
        ) : (
          <span>Pague em até: {formatted}</span>
        )}
      </div>

      {/* QR Code Container */}
      <div className="mx-auto w-56 h-56 rounded-2xl bg-neutral-50 border border-neutral-200 flex items-center justify-center p-3 mb-6 shadow-inner">
        {qrCodeBase64 ? (
          <img
            src={qrCodeBase64}
            alt="Pix QR Code"
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="text-xs text-neutral-400 font-mono break-all p-2">
            [QR Code Pix Gerado]
          </div>
        )}
      </div>

      <div className="text-left space-y-3 mb-6 bg-neutral-50 p-4 rounded-xl border border-neutral-200">
        <p className="text-xs font-semibold text-neutral-800">
          Como pagar com Pix:
        </p>
        <ol className="text-xs text-neutral-600 space-y-1 list-decimal list-inside leading-relaxed">
          <li>Abra o aplicativo do seu banco preferido</li>
          <li>Escolha a opção <strong>Pix &gt; Ler QR Code</strong> ou <strong>Pix Copia e Cola</strong></li>
          <li>Confirme os dados e o valor para aprovação instantânea</li>
        </ol>
      </div>

      {/* Pix Copia e Cola */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-neutral-600 text-left">
          Código Pix Copia e Cola:
        </label>
        <div className="relative">
          <input
            type="text"
            readOnly
            value={copyPasteCode}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-100/70 px-3.5 py-2.5 text-xs font-mono text-neutral-700 pr-10 focus:outline-none select-all"
          />
        </div>

        <Button
          type="button"
          onClick={handleCopy}
          disabled={isExpired}
          className={`w-full py-3 font-bold flex items-center justify-center gap-2 transition-all ${
            copied
              ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
              : 'bg-rose-600 hover:bg-rose-700 text-white'
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
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-red-600 font-medium">
          <AlertCircle className="h-4 w-4" /> A reserva de estoque expirou. Por favor, refaça o pedido.
        </div>
      )}
    </div>
  );
};
