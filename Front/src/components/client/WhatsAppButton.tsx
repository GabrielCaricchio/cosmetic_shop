import React from 'react';
import { MessageCircle } from 'lucide-react';
import { supportApi } from '../../services/supportApi';

export interface WhatsAppButtonProps {
  productName?: string;
  orderId?: string;
  className?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  productName,
  orderId,
  className = '',
}) => {
  const url = supportApi.getWhatsAppUrl({
    product_name: productName,
    order_id: orderId,
  });

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar com a revendedora no WhatsApp"
      className={`
        fixed bottom-5 right-5 z-40 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white
        p-3.5 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 group
        ${className}
      `}
    >
      <MessageCircle className="w-6 h-6" />
      <span className="max-w-0 overflow-hidden whitespace-nowrap group-hover:max-w-xs transition-all duration-300 ease-in-out text-xs font-semibold px-0 group-hover:px-2">
        Fale no WhatsApp
      </span>
    </a>
  );
};

export default WhatsAppButton;
