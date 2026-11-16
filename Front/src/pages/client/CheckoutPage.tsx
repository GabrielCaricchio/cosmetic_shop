import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, QrCode, CreditCard, Lock, Sparkles, CheckCircle2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { PixPaymentBox } from '../../components/client/PixPaymentBox';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { apiClient } from '../../services/apiClient';
import { useOrderPolling } from '../../hooks/useOrderPolling';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  // Item de compra direta da PDP (Comprar Agora)
  const [directItem] = useState<{ product: any; quantity: number } | null>(() => {
    try {
      const stored = sessionStorage.getItem('direct_checkout_item');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [idempotencyKey] = useState<string>(() => generateUUID());

  // Form State
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [cpf, setCpf] = useState(user?.cpf || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [lgpdConsent, setLgpdConsent] = useState(user?.lgpd_consent || false);

  // Endereço
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Pedido gerado
  const [createdOrder, setCreatedOrder] = useState<any | null>(null);

  const itemsToBuy = directItem
    ? [
        {
          id: directItem.product.id || directItem.product.product_id,
          name: directItem.product.name,
          price: directItem.product.promotional_price ?? directItem.product.price,
          quantity: directItem.quantity,
          image_url: directItem.product.images?.[0]?.image_url,
        },
      ]
    : cartItems;

  const checkoutTotal = directItem
    ? (directItem.product.promotional_price ?? directItem.product.price) * directItem.quantity
    : totalAmount;

  const pixCheckoutTotal = checkoutTotal * 0.95;

  // Polling automático da aprovação do Pix a cada 3s
  useOrderPolling(
    createdOrder?.order_id,
    () => {
      clearCart();
      sessionStorage.removeItem('direct_checkout_item');
      navigate(`/pedido-confirmado/${createdOrder.order_id}`);
    },
    3000
  );

  const formatPrice = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(val);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!user && !lgpdConsent) {
      setErrorMsg('É necessário aceitar os termos de consentimento LGPD para continuar.');
      return;
    }

    if (itemsToBuy.length === 0) {
      setErrorMsg('Sua sacola está vazia.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload: any = {
        customer_name: name,
        customer_email: email,
        customer_cpf: cpf,
        customer_phone: phone,
        shipping_address: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zip_code: zipCode,
        },
        payment_method: paymentMethod,
      };

      if (directItem) {
        payload.items = [
          {
            product_id: directItem.product.id || directItem.product.product_id,
            quantity: directItem.quantity,
          },
        ];
      } else {
        payload.items = cartItems.map((item) => ({
          product_id: item.product_id !== undefined ? item.product_id : item.id,
          quantity: item.quantity,
        }));
      }

      const res = await apiClient.post('/checkout', payload, {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      });

      setCreatedOrder(res.data);
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.message || err.response?.data?.detail || 'Erro ao processar o checkout. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-warm-50 py-6 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navegação Voltar */}
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-warm-700 hover:text-botanic-950 transition-colors mb-6 active:scale-95"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </button>

        {/* Título & Selos de Confiança */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6 pb-4 border-b border-warm-200/90">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-warm-900 font-serif flex items-center gap-2.5">
              <Lock className="h-6 w-6 text-emerald-700" /> Checkout Seguro
            </h1>
            <p className="text-xs text-warm-500 mt-1">Finalização rápida em 1 página com trava atômica de estoque.</p>
          </div>

          <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200/80 font-semibold w-fit">
            <ShieldCheck className="h-4 w-4 text-emerald-700" />
            Blindagem Criptográfica SSL 256-bit
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-terracotta-50 p-4 text-xs sm:text-sm text-terracotta-700 font-medium border border-terracotta-200">
            {errorMsg}
          </div>
        )}

        {/* Exibição do Pix gerado */}
        {createdOrder && createdOrder.pix_details ? (
          <div className="max-w-md mx-auto space-y-6">
            <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-5 text-center shadow-soft">
              <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
              <h2 className="text-base font-bold text-emerald-900 font-serif">
                Pedido #{createdOrder.order_number || createdOrder.order_id} Criado!
              </h2>
              <p className="text-xs text-emerald-700 mt-1 font-medium">
                Pague com o Pix abaixo. Confirmaremos seu pagamento instantaneamente nesta tela.
              </p>
            </div>

            <PixPaymentBox
              qrCodeBase64={createdOrder.pix_details.qr_code_url || createdOrder.pix_details.qr_code}
              copyPasteCode={createdOrder.pix_details.qr_code || '000201...'}
              expiresAt={createdOrder.pix_details.expires_at}
            />

            <Button
              variant="outline"
              onClick={() => navigate(`/pedido-confirmado/${createdOrder.order_id}`)}
              className="w-full text-xs font-semibold text-warm-700 border-warm-300"
            >
              Já realizei o pagamento / Ver detalhes
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* 1. Dados Pessoais */}
              <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-warm-200/90 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-botanic-900 pb-2 border-b border-warm-100 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-botanic-900 text-champagne-300 text-xs">1</span>
                  Dados de Contato & Identificação
                </h2>
                <div className="space-y-3.5">
                  <Input
                    label="Nome Completo"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome como consta no documento"
                  />
                  <Input
                    label="E-mail para confirmação"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <Input
                      label="CPF"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                    <Input
                      label="WhatsApp / Telefone"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  {!user && (
                    <div className="rounded-2xl bg-warm-50 p-3.5 border border-warm-200 mt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lgpdConsent}
                          onChange={(e) => setLgpdConsent(e.target.checked)}
                          className="mt-0.5 h-4 w-4 rounded border-warm-300 text-botanic-900 focus:ring-botanic-700"
                        />
                        <span className="text-xs text-warm-700 leading-snug">
                          Concordo com o tratamento dos meus dados pessoais para emissão de nota fiscal e entrega do pedido conforme as diretrizes da <strong>LGPD</strong>.
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* 2. Endereço de Entrega */}
              <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-warm-200/90 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-botanic-900 pb-2 border-b border-warm-100 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-botanic-900 text-champagne-300 text-xs">2</span>
                  Endereço de Entrega
                </h2>
                <div className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div className="sm:col-span-1">
                      <Input
                        label="CEP"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Rua / Avenida"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Avenida Paulista, Rua..."
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <Input
                        label="Número"
                        required
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="123"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <Input
                        label="Complemento"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto 42, Bloco B (Opcional)"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    <div>
                      <Input
                        label="Bairro"
                        required
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Bairro"
                      />
                    </div>
                    <div>
                      <Input
                        label="Cidade"
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Cidade"
                      />
                    </div>
                    <div>
                      <Input
                        label="Estado"
                        required
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="SP"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Forma de Pagamento */}
              <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-soft border border-warm-200/90 space-y-4">
                <h2 className="text-sm font-bold uppercase tracking-wider text-botanic-900 pb-2 border-b border-warm-100 flex items-center gap-2">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-botanic-900 text-champagne-300 text-xs">3</span>
                  Método de Pagamento
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-200 active:scale-98 text-left ${
                      paymentMethod === 'pix'
                        ? 'border-botanic-800 bg-botanic-50/60 shadow-soft'
                        : 'border-warm-200 hover:border-warm-300 bg-warm-50/40 text-warm-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-2">
                      <QrCode className="h-6 w-6 text-botanic-800" />
                      <span className="rounded-full bg-champagne-500 text-botanic-950 font-black text-[10px] px-2 py-0.5 uppercase tracking-wide">
                        5% OFF
                      </span>
                    </div>
                    <span className="text-sm font-bold text-warm-900 font-serif">Pix Instantâneo</span>
                    <span className="text-[11px] text-emerald-800 font-semibold mt-0.5">
                      Aprovação em segundos e reserva garantida
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex flex-col items-start p-4 rounded-2xl border-2 transition-all duration-200 active:scale-98 text-left ${
                      paymentMethod === 'credit_card'
                        ? 'border-botanic-800 bg-botanic-50/60 shadow-soft'
                        : 'border-warm-200 hover:border-warm-300 bg-warm-50/40 text-warm-700'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mb-2 text-warm-600" />
                    <span className="text-sm font-bold text-warm-900 font-serif">Cartão de Crédito</span>
                    <span className="text-[11px] text-warm-500 font-medium mt-0.5">
                      Parcele em até 3x sem juros
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resumo dos Produtos & Finalização */}
            <div className="rounded-3xl bg-white p-5 sm:p-7 shadow-luxury border border-warm-200/90 h-fit space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-botanic-900 pb-2 border-b border-warm-100 font-serif">
                Resumo do Pedido
              </h2>

              <div className="divide-y divide-warm-100 max-h-60 overflow-y-auto pr-1">
                {itemsToBuy.map((it: any) => (
                  <div key={it.id || it.product_id} className="py-2.5 flex justify-between text-xs">
                    <span className="text-warm-700 font-medium truncate max-w-[170px]">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="text-warm-900 font-bold shrink-0 font-serif">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-warm-100 space-y-2 text-xs text-warm-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-warm-900">{formatPrice(checkoutTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-800 font-bold">
                  <span>Frete Expresso:</span>
                  <span>GRÁTIS</span>
                </div>

                {paymentMethod === 'pix' && (
                  <div className="flex justify-between text-emerald-800 font-bold bg-emerald-50 p-2 rounded-xl">
                    <span className="flex items-center gap-1">
                      <Sparkles className="h-3 w-3 text-emerald-600" /> Desconto Pix (5%):
                    </span>
                    <span>- {formatPrice(checkoutTotal * 0.05)}</span>
                  </div>
                )}

                <div className="flex justify-between text-base font-bold text-warm-900 pt-3 border-t border-warm-100 font-serif">
                  <span>Total a Pagar:</span>
                  <span className="text-lg text-botanic-900">
                    {formatPrice(paymentMethod === 'pix' ? pixCheckoutTotal : checkoutTotal)}
                  </span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="w-full bg-gradient-to-r from-botanic-900 to-botanic-950 text-champagne-300 font-bold py-4 mt-4 shadow-luxury hover:from-botanic-950 hover:to-black active:scale-[0.98] rounded-2xl"
              >
                Gerar Pix e Concluir Pedido
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-warm-500 pt-2 text-center">
                <ShieldCheck className="h-4 w-4 text-emerald-700 shrink-0" />
                <span>Compra garantida com antifraude e proteção LGPD</span>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
