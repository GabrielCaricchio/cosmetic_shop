import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { checkoutApi } from '../../services/checkoutApi';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { ShippingAddress, CustomerInfo } from '../../types/checkout';
import {
  ShieldCheck,
  QrCode,
  CreditCard,
  User,
  ArrowLeft,
  AlertCircle,
} from 'lucide-react';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalAmount, clearCart } = useCart();
  const { user } = useAuth();

  // Verifica se é compra direta de 1 clique ("Comprar Agora")
  const [directItem, setDirectItem] = useState<{ product: any; quantity: number } | null>(null);

  useEffect(() => {
    const saved = sessionStorage.getItem('direct_checkout_item');
    if (saved) {
      try {
        setDirectItem(JSON.parse(saved));
      } catch {}
    }
  }, []);

  // Dados do Cliente
  const [customer, setCustomer] = useState<CustomerInfo>({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    lgpd_consent: true,
  });

  // Endereço de Entrega
  const [address, setAddress] = useState<ShippingAddress>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zip_code: '',
  });

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'credit_card'>('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isCepLoading, setIsCepLoading] = useState(false);

  // Auto-preenchimento por CEP (ViaCEP)
  const handleCepBlur = async () => {
    const cleanCep = address.zip_code.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      setIsCepLoading(true);
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setAddress((prev) => ({
            ...prev,
            street: data.logradouro || prev.street,
            neighborhood: data.bairro || prev.neighborhood,
            city: data.localidade || prev.city,
            state: data.uf || prev.state,
          }));
        }
      } catch {
        // Fallback para preenchimento manual
      } finally {
        setIsCepLoading(false);
      }
    }
  };

  // Itens em checkout
  const effectiveItems = directItem
    ? [
        {
          product_id: directItem.product.product_id || Number(directItem.product.id),
          name: directItem.product.name,
          price: directItem.product.price,
          quantity: directItem.quantity,
          image_url: directItem.product.images?.[0]?.image_url,
        },
      ]
    : items;

  const effectiveTotal = directItem
    ? directItem.product.price * directItem.quantity
    : totalAmount;

  const formattedTotal = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(effectiveTotal);

  const handleSubmitCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (effectiveItems.length === 0) {
      setErrorMessage('Nenhum item selecionado para compra.');
      return;
    }

    if (!address.street || !address.number || !address.neighborhood || !address.city || !address.zip_code) {
      setErrorMessage('Preencha todos os campos obrigatórios do endereço de entrega.');
      return;
    }

    setErrorMessage(null);
    setIsSubmitting(true);

    // Chave de Idempotência UUIDv4
    const idempotencyKey = crypto.randomUUID();

    try {
      let response;
      if (directItem) {
        response = await checkoutApi.directCheckout(
          {
            product_id: directItem.product.product_id || Number(directItem.product.id),
            quantity: directItem.quantity,
            shipping_address: address,
            payment_method: paymentMethod,
          },
          idempotencyKey
        );
        sessionStorage.removeItem('direct_checkout_item');
      } else {
        response = await checkoutApi.processCheckout(
          {
            items: effectiveItems.map((it) => ({
              product_id: it.product_id,
              quantity: it.quantity,
            })),
            shipping_address: address,
            payment_method: paymentMethod,
            customer: customer.name ? customer : undefined,
          },
          idempotencyKey
        );
        clearCart();
      }

      // Redireciona para página de sucesso com dados do Pix e pedido
      navigate(`/pedido-confirmado/${response.order_id}`, {
        state: { checkoutResponse: response },
      });
    } catch (err: any) {
      const msg = err.message || '';
      if (msg.includes('esgotado') || msg.includes('409') || msg.includes('Conflict')) {
        setErrorMessage(
          'Este produto acabou de esgotar sob alta concorrência de estoque. Atualize sua sacola para continuar.'
        );
      } else {
        setErrorMessage(msg || 'Ocorreu uma falha ao processar o pedido. Tente novamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (effectiveItems.length === 0) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <h2 className="text-xl font-bold font-serif text-neutral-800">Sua sacola está vazia</h2>
        <p className="text-xs text-neutral-500 mt-2">Adicione itens para prosseguir ao checkout.</p>
        <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
          Ir às Compras
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-500 hover:text-brand-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar</span>
        </button>

        <h1 className="text-2xl sm:text-3xl font-serif font-bold text-neutral-900 mb-6">
          Finalização do Pedido
        </h1>

        {errorMessage && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3 text-red-800 text-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-600" />
            <div>
              <strong className="font-bold block">Atenção no Checkout</strong>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmitCheckout} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Formulários (8 Colunas) */}
          <div className="lg:col-span-8 space-y-6">
            {/* 1. Identificação do Cliente */}
            <div className="bg-white rounded-xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base font-bold font-serif text-neutral-900">
                  Identificação da Cliente
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Nome Completo"
                  required
                  value={customer.name}
                  onChange={(e) => setCustomer({ ...customer, name: e.target.value })}
                  placeholder="Ana Paula Silva"
                  leftIcon={<User className="w-4 h-4" />}
                />
                <Input
                  label="E-mail"
                  type="email"
                  required
                  value={customer.email}
                  onChange={(e) => setCustomer({ ...customer, email: e.target.value })}
                  placeholder="ana.silva@exemplo.com.br"
                />
                <Input
                  label="WhatsApp / Telefone"
                  required
                  value={customer.phone}
                  onChange={(e) => setCustomer({ ...customer, phone: e.target.value })}
                  placeholder="(11) 98765-4321"
                  containerClassName="sm:col-span-2"
                />
              </div>
            </div>

            {/* 2. Endereço de Entrega */}
            <div className="bg-white rounded-xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h2 className="text-base font-bold font-serif text-neutral-900">
                  Endereço de Entrega
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-1">
                  <Input
                    label="CEP"
                    required
                    value={address.zip_code}
                    onChange={(e) => setAddress({ ...address, zip_code: e.target.value })}
                    onBlur={handleCepBlur}
                    placeholder="01310-100"
                    helperText={isCepLoading ? 'Buscando logradouro...' : 'Preenchimento automático'}
                  />
                </div>
                <div className="sm:col-span-2">
                  <Input
                    label="Logradouro / Rua / Avenida"
                    required
                    value={address.street}
                    onChange={(e) => setAddress({ ...address, street: e.target.value })}
                    placeholder="Avenida Paulista"
                  />
                </div>

                <Input
                  label="Número"
                  required
                  value={address.number}
                  onChange={(e) => setAddress({ ...address, number: e.target.value })}
                  placeholder="1000"
                />
                <Input
                  label="Complemento"
                  value={address.complement}
                  onChange={(e) => setAddress({ ...address, complement: e.target.value })}
                  placeholder="Apto 42B"
                />
                <Input
                  label="Bairro"
                  required
                  value={address.neighborhood}
                  onChange={(e) => setAddress({ ...address, neighborhood: e.target.value })}
                  placeholder="Bela Vista"
                />

                <Input
                  label="Cidade"
                  required
                  value={address.city}
                  onChange={(e) => setAddress({ ...address, city: e.target.value })}
                  placeholder="São Paulo"
                  containerClassName="sm:col-span-2"
                />
                <Input
                  label="UF (Estado)"
                  required
                  maxLength={2}
                  value={address.state}
                  onChange={(e) => setAddress({ ...address, state: e.target.value.toUpperCase() })}
                  placeholder="SP"
                />
              </div>
            </div>

            {/* 3. Forma de Pagamento */}
            <div className="bg-white rounded-xl border border-neutral-200/90 p-5 sm:p-6 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-6 h-6 rounded-full bg-brand-100 text-brand-800 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base font-bold font-serif text-neutral-900">
                  Forma de Pagamento
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Opção Pix */}
                <label
                  onClick={() => setPaymentMethod('pix')}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all
                    ${
                      paymentMethod === 'pix'
                        ? 'border-brand-700 bg-brand-50/50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'pix'}
                    onChange={() => setPaymentMethod('pix')}
                    className="mt-1 text-brand-700 focus:ring-brand-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <QrCode className="w-4 h-4 text-emerald-600" />
                      <strong className="text-xs font-bold text-neutral-900">Pix Instantâneo</strong>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Aprovação em segundos. Trava atômica anti-overselling com 30 minutos de reserva.
                    </p>
                  </div>
                </label>

                {/* Opção Cartão */}
                <label
                  onClick={() => setPaymentMethod('credit_card')}
                  className={`
                    p-4 rounded-xl border-2 cursor-pointer flex items-start gap-3 transition-all
                    ${
                      paymentMethod === 'credit_card'
                        ? 'border-brand-700 bg-brand-50/50 shadow-xs'
                        : 'border-neutral-200 hover:border-neutral-300'
                    }
                  `}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === 'credit_card'}
                    onChange={() => setPaymentMethod('credit_card')}
                    className="mt-1 text-brand-700 focus:ring-brand-700"
                  />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <CreditCard className="w-4 h-4 text-brand-700" />
                      <strong className="text-xs font-bold text-neutral-900">Cartão de Crédito</strong>
                    </div>
                    <p className="text-[11px] text-neutral-500 mt-1">
                      Processamento seguro via gateway parceiro com análise antifraude.
                    </p>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Resumo Lateral e Botão Finalizar (4 Colunas) */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-xl border border-neutral-200/90 shadow-xs p-6 sticky top-24">
              <h3 className="text-base font-bold font-serif text-neutral-900 mb-4">
                Itens do Pedido ({effectiveItems.length})
              </h3>

              <div className="divide-y divide-neutral-100 max-h-60 overflow-y-auto mb-4 pr-1">
                {effectiveItems.map((it) => (
                  <div key={it.product_id} className="py-2.5 flex items-center justify-between text-xs">
                    <div className="truncate mr-2">
                      <span className="font-semibold text-neutral-900 block truncate">{it.name}</span>
                      <span className="text-neutral-500 text-[11px]">{it.quantity} un.</span>
                    </div>
                    <span className="font-bold text-neutral-900 font-mono">
                      {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
                        it.price * it.quantity
                      )}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-neutral-200 pt-3 space-y-2 text-xs text-neutral-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-neutral-800 font-mono">{formattedTotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Frete</span>
                  <span>Grátis</span>
                </div>
                <div className="flex justify-between text-base font-bold text-neutral-900 border-t border-neutral-200 pt-3">
                  <span>Total</span>
                  <span className="text-brand-800 font-serif text-xl">{formattedTotal}</span>
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                className="shadow-md"
              >
                Confirmar e Gerar Pagamento
              </Button>

              <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-neutral-400">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Idempotência garantida contra duplicidade</span>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CheckoutPage;
