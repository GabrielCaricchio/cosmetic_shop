import React, { useState } from 'react';
import { Copy, Check, Clock, QrCode } from 'lucide-react';
import { useCountdown } from '../../hooks/useCountdown';

export interface PixPaymentBoxProps {
  qrCodeBase64?: string;
  copyPasteCode?: string;
  expiresAt: string | Date | number;
  totalAmount?: number;
}

export const PixPaymentBox: React.FC<PixPaymentBoxProps> = ({
  qrCodeBase64,
  copyPasteCode = '',
  expiresAt,
  totalAmount,
}) => {
  const [copied, setCopied] = useState(false);
  const { formatted, isExpired } = useCountdown(expiresAt);

  const handleCopy = async () => {
    if (!copyPasteCode) return;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(copyPasteCode);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback de cópia manual
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const formattedAmount = totalAmount
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalAmount)
    : null;

  return (
    <div className="bg-white rounded-xl border border-neutral-200/90 shadow-sm p-6 max-w-lg mx-auto text-center">
      {/* Cabeçalho Pix */}
      <div className="flex items-center justify-center gap-2 mb-2">
        <span className="p-2 rounded-full bg-emerald-50 text-emerald-700">
          <QrCode className="w-6 h-6" />
        </span>
        <h2 className="text-xl font-bold text-neutral-900 font-serif">Pagamento instantâneo via Pix</h2>
      </div>

      {formattedAmount && (
        <p className="text-2xl font-extrabold text-brand-700 mb-4">{formattedAmount}</p>
      )}

      {/* Temporizador Regressivo de Reserva Anti-Overselling */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-pill bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold mb-6">
        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
        {isExpired ? (
          <span className="text-red-700 font-bold">Prazo expirado. Estoque liberado.</span>
        ) : (
          <span>Pague em até <strong className="font-mono text-sm">{formatted}</strong> para garantir seus cosméticos</span>
        )}
      </div>

      {/* Imagem do QR Code Pix */}
      <div className="flex flex-col items-center justify-center mb-6">
        <div className="p-3 bg-white border-2 border-neutral-200 rounded-lg shadow-sm">
          {qrCodeBase64 ? (
            <img
              src={qrCodeBase64}
              alt="QR Code Pix"
              className="w-48 h-48 md:w-56 md:h-56 object-contain"
            />
          ) : (
            <div className="w-48 h-48 flex items-center justify-center bg-neutral-100 text-neutral-400 text-xs">
              QR Code indisponível
            </div>
          )}
        </div>
        <span className="text-xs text-neutral-500 mt-2">
          Abra o aplicativo do seu banco e aponte a câmera para o QR Code
        </span>
      </div>

      {/* Pix Copia e Cola */}
      <div className="text-left bg-neutral-50 rounded-lg p-3.5 border border-neutral-200 mb-5">
        <label className="block text-xs font-semibold text-neutral-700 mb-1.5 uppercase tracking-wider">
          Código Pix Copia e Cola
        </label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            readOnly
            value={copyPasteCode}
            className="w-full bg-white border border-neutral-300 rounded-md px-3 py-2 text-xs font-mono text-neutral-600 truncate focus:outline-none"
          />
        </div>
      </div>

      {/* Botão de Cópia */}
      <button
        type="button"
        onClick={handleCopy}
        disabled={isExpired || !copyPasteCode}
        className={`
          w-full h-12 rounded-md font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-sm
          ${
            copied
              ? 'bg-emerald-600 text-white'
              : 'bg-brand-700 hover:bg-brand-800 text-white active:scale-[0.98]'
          }
          disabled:bg-neutral-300 disabled:text-neutral-500 disabled:cursor-not-allowed
        `}
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            <span>Chave copiada com sucesso!</span>
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            <span>Copiar Chave Pix</span>
          </>
        )}
      </button>

      {/* Instrução de Polling / Espera Passiva */}
      <div className="mt-5 pt-4 border-t border-neutral-100 flex items-center justify-center gap-2 text-xs text-neutral-500">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        <span>Aguardando confirmação do banco... A tela atualizará automaticamente.</span>
      </div>
    </div>
  );
};

export default PixPaymentBox;
