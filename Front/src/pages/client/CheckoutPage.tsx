import React, { useState, useEffect, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, ArrowLeft, QrCode, CreditCard, Lock, CheckCircle2 } from 'lucide-react';
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

  // Check for direct buy from PDP
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

  // Address State
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('SP');
  const [zipCode, setZipCode] = useState('');

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Result state
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

  // Poll order approval once order is created with Pix
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

    if (!lgpdConsent && !user) {
      setErrorMsg('É obrigatório concordar com o tratamento de dados (LGPD) para prosseguir.');
      return;
    }

    if (itemsToBuy.length === 0) {
      setErrorMsg('Nenhum item selecionado para o checkout.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        payment_method: paymentMethod,
        customer: {
          name,
          email,
          cpf,
          phone,
          lgpd_consent: lgpdConsent,
        },
        shipping_address: {
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          zip_code: zipCode,
        },
        items: itemsToBuy.map((i) => ({
          product_id: i.id || i.product_id,
          quantity: i.quantity,
        })),
      };

      const res = await apiClient.post('/checkout', payload, {
        headers: {
          'Idempotency-Key': idempotencyKey,
        },
      });

      setCreatedOrder(res.data);
      if (res.data.payment_method !== 'pix') {
        clearCart();
        sessionStorage.removeItem('direct_checkout_item');
        navigate(`/pedido-confirmado/${res.data.order_id}`);
      }
    } catch (err: any) {
      setErrorMsg(
        err.response?.data?.detail || 'Erro ao processar o checkout. Tente novamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="inline-flex items-center gap-2 text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" /> Voltar à loja
        </button>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 font-serif mb-6 flex items-center gap-2">
          <Lock className="h-6 w-6 text-emerald-600" /> Checkout Seguro One-Page
        </h1>

        {errorMsg && (
          <div className="mb-6 rounded-2xl bg-red-50 p-4 text-sm text-red-700 font-medium border border-red-200">
            {errorMsg}
          </div>
        )}

        {/* Se o Pix já foi gerado, exibe a tela de pagamento do Pix com polling */}
        {createdOrder && createdOrder.pix_details ? (
          <div className="max-w-md mx-auto space-y-6">
            <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <h2 className="text-base font-bold text-emerald-800">
                Pedido #{createdOrder.order_number || createdOrder.order_id} Criado!
              </h2>
              <p className="text-xs text-emerald-700 mt-1">
                Aguardando confirmação do pagamento via Pix pelo banco...
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
              className="w-full text-xs text-neutral-600 border-neutral-300"
            >
              Já paguei / Ver detalhes do pedido
            </Button>
          </div>
        ) : (
          <form onSubmit={handleCheckout} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {/* Dados do Cliente */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200">
                <h2 className="text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                  1. Dados Pessoais
                </h2>
                <div className="space-y-3.5">
                  <Input
                    label="Nome Completo"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Nome como no documento"
                  />
                  <Input
                    label="E-mail para confirmação"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <Input
                      label="CPF"
                      required
                      value={cpf}
                      onChange={(e) => setCpf(e.target.value)}
                      placeholder="000.000.000-00"
                    />
                    <Input
                      label="WhatsApp"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="(11) 99999-9999"
                    />
                  </div>

                  {!user && (
                    <div className="rounded-xl bg-neutral-50 p-3 border border-neutral-200 mt-2">
                      <label className="flex items-start gap-2.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={lgpdConsent}
                          onChange={(e) => setLgpdConsent(e.target.checked)}
                          className="mt-1 h-4 w-4 rounded border-neutral-300 text-rose-600 focus:ring-rose-500"
                        />
                        <span className="text-xs text-neutral-600 leading-snug">
                          Concordo com o tratamento dos dados pessoais para processar este pedido (LGPD).
                        </span>
                      </label>
                    </div>
                  )}
                </div>
              </div>

              {/* Endereço de Entrega */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200">
                <h2 className="text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                  2. Endereço de Entrega
                </h2>
                <div className="space-y-3.5">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-1">
                      <Input
                        label="CEP"
                        required
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="00000-000"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label="Rua / Avenida"
                        required
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Logradouro"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Input
                        label="Número"
                        required
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="123"
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        label="Complemento"
                        value={complement}
                        onChange={(e) => setComplement(e.target.value)}
                        placeholder="Apto 42, Bloco B"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
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
                        placeholder="UF"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Forma de Pagamento */}
              <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200">
                <h2 className="text-base font-bold text-neutral-900 mb-4 pb-2 border-b border-neutral-100">
                  3. Pagamento
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('pix')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-rose-600 bg-rose-50/40 text-rose-700'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <QrCode className="h-6 w-6 mb-1 text-emerald-600" />
                    <span className="text-sm font-bold">Pix Instantâneo</span>
                    <span className="text-[11px] text-emerald-600 font-semibold">
                      Aprovação em segundos
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      paymentMethod === 'credit_card'
                        ? 'border-rose-600 bg-rose-50/40 text-rose-700'
                        : 'border-neutral-200 hover:border-neutral-300 text-neutral-600'
                    }`}
                  >
                    <CreditCard className="h-6 w-6 mb-1 text-neutral-700" />
                    <span className="text-sm font-bold">Cartão de Crédito</span>
                    <span className="text-[11px] text-neutral-400">Até 3x sem juros</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Resumo Lateral */}
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-neutral-200 h-fit space-y-4">
              <h2 className="text-base font-bold text-neutral-900 pb-2 border-b border-neutral-100">
                Resumo dos Produtos
              </h2>

              <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto pr-1">
                {itemsToBuy.map((it) => (
                  <div key={it.id || it.product_id} className="py-2.5 flex justify-between text-xs">
                    <span className="text-neutral-700 font-medium truncate max-w-[180px]">
                      {it.quantity}x {it.name}
                    </span>
                    <span className="text-neutral-900 font-bold shrink-0">
                      {formatPrice(it.price * it.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-neutral-100 space-y-2 text-sm text-neutral-600">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatPrice(checkoutTotal)}</span>
                </div>
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Frete Grátis:</span>
                  <span>R$ 0,00</span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 pt-2 border-t border-neutral-100">
                  <span>Total a Pagar:</span>
                  <span>{formatPrice(checkoutTotal)}</span>
                </div>
              </div>

              <Button
                type="submit"
                size="lg"
                isLoading={isSubmitting}
                className="w-full bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 mt-4"
              >
                Gerar Pix e Concluir Pedido
              </Button>

              <div className="flex items-center justify-center gap-1.5 text-xs text-neutral-500 pt-2">
                <ShieldCheck className="h-4 w-4 text-emerald-600" /> Transação Criptografada SSL
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
