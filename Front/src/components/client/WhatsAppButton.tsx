import React from 'react';
import { MessageCircle } from 'lucide-react';

export interface WhatsAppButtonProps {
  phoneNumber?: string;
  defaultMessage?: string;
}

export const WhatsAppButton: React.FC<WhatsAppButtonProps> = ({
  phoneNumber = '5511999999999',
  defaultMessage = 'Olá! Gostaria de tirar dúvidas sobre os cosméticos da Aura.',
}) => {
  const handleClick = () => {
    const encodedMessage = encodeURIComponent(defaultMessage);
    const url = `https://wa.me/${phoneNumber}?text=${encodedMessage}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xl hover:bg-emerald-600 hover:scale-110 active:scale-95 transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-emerald-200"
      aria-label="Atendimento via WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
};
