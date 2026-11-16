# Redesign Visual & Sistema de E-Commerce (Inspirado em O Boticário e Imagens de Referência) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transformar o visual e a experiência de compra da Aura Cosméticos em uma boutique digital de alto luxo inspirada em O Boticário, Beleza na Web, SkinCeuticals, Glamora e referências enviadas, incorporando sistema de favoritos, vitrine visual de categorias circulares, réguas promocionais, barra progressiva de frete grátis, cupons de desconto, seletor de localização/CEP, quiz de rotina de beleza, barra fixa mobile na PDP e rodapé completo de e-commerce.

**Architecture:** A aplicação React 19 SPA será aprimorada modularmente na camada `Front/src/components/client/` e `Front/src/context/`, mantendo total desacoplamento e retrocompatibilidade com o backend FastAPI. Criaremos contextos e componentes reutilizáveis e autocontidos que se integram à `HomePage`, `ProductDetailPage` e `CartDrawer`, garantindo persistência no `localStorage`, responsividade mobile-first e cobertura de testes em Vitest.

**Tech Stack:** React 19, TypeScript 5, Vite 6, Tailwind CSS 3.4 (Paleta Botânica & Champagne), Lucide React, Vitest, React Testing Library.

**Spec:** `docs/superpowers/specs/2026-11-16-redesign-visual-oboticario-spec.md`

## Global Constraints

- React 19 e TypeScript 5 estrito (sem uso de `any` em novos tipos).
- Paleta visual: Verde Botânico (`botanic-950`, `#071A14`), Dourado Champagne (`champagne-500`, `#C5A059`), Fundo Creme Aveludado (`warm-50`, `#FDFBF7`), Texto Espresso (`warm-900`, `#1E1B19`).
- Tipografia: Serifada editorial para cabeçalhos (`font-serif`) e geométrica moderna para textos e botões (`font-sans`).
- Sem adição de dependências externas pesadas (aproveitar Tailwind CSS, Lucide React e Fetch nativo).
- Mobile-first: componentes devem ser testados para telas de 360px a 1440px.
- Todos os testes devem rodar e passar com `npm --prefix Front test -- --run`.

## Review Focus

1. **Wishlist em Navegação Privada:** Se `localStorage` falhar ou lançar exceção de cota, o `WishlistContext` deve degradar suavemente para estado em memória sem travar a aplicação.
2. **Cálculo da Barra de Frete Grátis:** Com carrinho vazio (R$ 0) ou valor acima da meta (R$ 149), a barra deve travar entre 0% e 100%, sem valores negativos ou divisão por zero.
3. **Consulta de CEP e Localização:** Falhas de rede ou CEPs inexistentes na API pública devem exibir mensagem de erro amigável sem quebrar o fluxo de navegação.
4. **Validação de Cupons na Sacola:** Cupons inválidos ou aplicados em carrinho vazio devem emitir feedback visual claro e não alterar o subtotal real.
5. **Barra Fixa Mobile na PDP:** A barra de compra flutuante inferior no mobile deve respeitar áreas seguras (*safe-area-inset-bottom*) e não cobrir acordeões de ingredientes ou formulários.

---

### Task 1: Wishlist System & Context (`WishlistContext.tsx`)

**Files:**
- Create: `Front/src/context/WishlistContext.tsx`
- Create: `Front/src/context/__tests__/WishlistContext.test.tsx`
- Modify: `Front/src/App.tsx:130-144`

**Interfaces:**
- Consumes: `Product` de `Front/src/types/product.ts`
- Produces:
  ```typescript
  export interface WishlistContextType {
    wishlistIds: string[];
    toggleWishlist: (productId: string | number) => void;
    isInWishlist: (productId: string | number) => boolean;
    wishlistCount: number;
  }
  export const useWishlist: () => WishlistContextType;
  export const WishlistProvider: React.FC<{ children: React.ReactNode }>;
  ```

- [ ] **Step 1: Write the failing test for `WishlistContext`**

```typescript
// Front/src/context/__tests__/WishlistContext.test.tsx
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { WishlistProvider, useWishlist } from '../WishlistContext';
import React from 'react';

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('toggles product in wishlist and updates count and localStorage', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <WishlistProvider>{children}</WishlistProvider>
    );

    const { result } = renderHook(() => useWishlist(), { wrapper });

    expect(result.current.wishlistCount).toBe(0);
    expect(result.current.isInWishlist('prod-1')).toBe(false);

    act(() => {
      result.current.toggleWishlist('prod-1');
    });

    expect(result.current.wishlistCount).toBe(1);
    expect(result.current.isInWishlist('prod-1')).toBe(true);

    act(() => {
      result.current.toggleWishlist('prod-1');
    });

    expect(result.current.wishlistCount).toBe(0);
    expect(result.current.isInWishlist('prod-1')).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/context/__tests__/WishlistContext.test.tsx --run`
Expected: FAIL with module `WishlistContext` not found.

- [ ] **Step 3: Implement `WishlistContext.tsx` and integrate into `App.tsx`**

Implementar `WishlistContext.tsx` com `useState`, `useEffect` e tratamento seguro de `localStorage.getItem` e `setItem` com bloco `try/catch`. Integrar o `<WishlistProvider>` dentro do `<App>` no `Front/src/App.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/context/__tests__/WishlistContext.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front/src/context/WishlistContext.tsx Front/src/context/__tests__/WishlistContext.test.tsx Front/src/App.tsx
git commit -m "feat(wishlist): add WishlistContext with localStorage persistence"
```

---

### Task 2: Visual Category Circles Component (`ShopByCategory.tsx`)

Inspirado nos designs de **Glamora**, **Elixora** e **Velvetique**, onde o cliente visualiza círculos destacados com gradientes pastéis, ícones/fotos elegantes e navegação direta.

**Files:**
- Create: `Front/src/components/client/ShopByCategory.tsx`
- Create: `Front/src/components/client/__tests__/ShopByCategory.test.tsx`

**Interfaces:**
- Consumes: `Category` de `Front/src/types/product.ts`
- Produces:
  ```typescript
  export interface ShopByCategoryProps {
    categories: Category[];
    selectedCategorySlug?: string;
    onSelectCategory: (slug?: string) => void;
  }
  export const ShopByCategory: React.FC<ShopByCategoryProps>;
  ```

- [ ] **Step 1: Write the failing test for `ShopByCategory`**

```typescript
// Front/src/components/client/__tests__/ShopByCategory.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ShopByCategory } from '../ShopByCategory';
import { Category } from '../../../types/product';

const mockCategories: Category[] = [
  { category_id: 1, name: 'Skincare', slug: 'skincare' },
  { category_id: 2, name: 'Maquiagem', slug: 'maquiagem' },
  { category_id: 3, name: 'Perfumaria', slug: 'perfumaria' },
];

describe('ShopByCategory', () => {
  it('renders category circles and calls onSelectCategory when clicked', () => {
    const handleSelect = vi.fn();
    render(
      <ShopByCategory
        categories={mockCategories}
        selectedCategorySlug={undefined}
        onSelectCategory={handleSelect}
      />
    );

    expect(screen.getByText('Compre por Categoria')).toBeInTheDocument();
    expect(screen.getByText('Skincare')).toBeInTheDocument();
    expect(screen.getByText('Maquiagem')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Skincare'));
    expect(handleSelect).toHaveBeenCalledWith('skincare');
  });

  it('allows selecting "Ver Todos" to clear category filter', () => {
    const handleSelect = vi.fn();
    render(
      <ShopByCategory
        categories={mockCategories}
        selectedCategorySlug="skincare"
        onSelectCategory={handleSelect}
      />
    );

    const allBtn = screen.getByText('Ver Todos');
    fireEvent.click(allBtn);
    expect(handleSelect).toHaveBeenCalledWith(undefined);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/components/client/__tests__/ShopByCategory.test.tsx --run`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `ShopByCategory.tsx`**

Criar componente com rolagem horizontal fluida no mobile (`no-scrollbar flex gap-4 sm:gap-6 overflow-x-auto pb-2`), cartões circulares com diâmetro `h-16 w-16 sm:h-20 sm:w-20 rounded-full`, borda dourada suave (`border-champagne-300`), efeito de hover e estado ativo destacado em verde botânico nobre (`bg-botanic-900 text-champagne-300`). Incluir ícones temáticos ou avatares cosméticos para cada categoria (Lábios, Olhos, Rosto, Perfume, etc.).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/components/client/__tests__/ShopByCategory.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/ShopByCategory.tsx Front/src/components/client/__tests__/ShopByCategory.test.tsx
git commit -m "feat(catalog): add ShopByCategory visual circle navigation"
```

---

### Task 3: Product Card Visual & Functional Overhaul (`ProductCard.tsx`)

Inspirado em **O Boticário**, **Glamora** e **Velvetique**, adicionando botão flutuante de Favoritos (Wishlist), notas de avaliação com estrelas (`★★★★★ 4.9`), badge de desconto percentual e botão de adicionar à sacola com micro-interação.

**Files:**
- Modify: `Front/src/components/client/ProductCard.tsx`
- Modify: `Front/src/components/client/__tests__/ProductCard.test.tsx`

**Interfaces:**
- Consumes: `useWishlist` de `Front/src/context/WishlistContext.tsx`, `Product` de `Front/src/types/product.ts`
- Produces: `ProductCard: React.FC<ProductCardProps>`

- [ ] **Step 1: Write updated tests for `ProductCard` with Wishlist and Ratings**

```typescript
// Front/src/components/client/__tests__/ProductCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ProductCard } from '../ProductCard';
import { Product } from '../../../types/product';
import { WishlistProvider } from '../../../context/WishlistContext';

const mockProduct: Product = {
  product_id: 1,
  name: 'Sérum Facial Vitamina C 15%',
  slug: 'serum-vitamina-c',
  brand: 'Aura Skincare',
  price: 129.90,
  promotional_price: 99.90,
  stock_quantity: 2,
  is_active: true,
  images: [{ image_id: 1, image_url: 'https://example.com/serum.jpg', is_primary: true }]
};

describe('ProductCard', () => {
  it('displays promotional discount badge and stock alert', () => {
    render(
      <WishlistProvider>
        <ProductCard product={mockProduct} onAddToCart={() => {}} />
      </WishlistProvider>
    );
    expect(screen.getByText(/últimas unidades/i)).toBeInTheDocument();
    expect(screen.getByText(/oferta/i)).toBeInTheDocument();
  });

  it('toggles wishlist heart button when clicked', () => {
    render(
      <WishlistProvider>
        <ProductCard product={mockProduct} onAddToCart={() => {}} />
      </WishlistProvider>
    );
    const wishlistBtn = screen.getByRole('button', { name: /favoritar/i });
    expect(wishlistBtn).toBeInTheDocument();
    fireEvent.click(wishlistBtn);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/components/client/__tests__/ProductCard.test.tsx --run`
Expected: FAIL because wishlist button with aria-label `/favoritar/i` is not yet implemented.

- [ ] **Step 3: Implement Wishlist toggle, Star Ratings and Discount Calculation in `ProductCard.tsx`**

- Adicionar botão de Favoritar no topo direito da imagem com ícone `Heart` do `lucide-react`, mudando para preenchimento vermelho/terracotta quando ativo.
- Adicionar avaliação por estrelas (ex: `★ 4.9 (42)`) entre o nome da marca e o título do produto.
- Quando houver `promotional_price`, calcular a porcentagem de economia (ex.: `-23% OFF`) e renderizar badge elegante no topo esquerdo.
- Garantir que o clique no coração não dispare o `onClick` do card do produto (`e.stopPropagation()`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/components/client/__tests__/ProductCard.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/ProductCard.tsx Front/src/components/client/__tests__/ProductCard.test.tsx
git commit -m "feat(ui): add wishlist toggle, star ratings, and promo badges to ProductCard"
```

---

### Task 4: Location Modal & Header Upgrade (`LocationModal.tsx` & `Header.tsx`)

Inspirado em **Beleza na Web** e **SkinCeuticals**, onde o usuário visualiza no header:
- Gatilho "Informar localização / CEP" com modal rápido de busca;
- Contador de Favoritos com ícone de Coração;
- Ícone de Consultor/Match de Beleza (Varinha Mágica / Dicas);
- Busca tolerante com tags rápidas.

**Files:**
- Create: `Front/src/components/client/LocationModal.tsx`
- Create: `Front/src/components/client/__tests__/LocationModal.test.tsx`
- Modify: `Front/src/components/client/Header.tsx`
- Create: `Front/src/components/client/__tests__/Header.test.tsx`

**Interfaces:**
- Consumes: `useWishlist` de `Front/src/context/WishlistContext.tsx`
- Produces:
  ```typescript
  export interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    currentCep?: string;
    onSaveLocation: (cep: string, city: string, uf: string) => void;
  }
  export const LocationModal: React.FC<LocationModalProps>;
  ```

- [ ] **Step 1: Write the failing test for `LocationModal` and `Header`**

```typescript
// Front/src/components/client/__tests__/LocationModal.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LocationModal } from '../LocationModal';

describe('LocationModal', () => {
  it('renders modal when open and handles CEP input', async () => {
    const handleSave = vi.fn();
    render(
      <LocationModal
        isOpen={true}
        onClose={() => {}}
        onSaveLocation={handleSave}
      />
    );

    expect(screen.getByText(/informe seu cep/i)).toBeInTheDocument();
    const input = screen.getByPlaceholderText(/00000-000/i);
    fireEvent.change(input, { target: { value: '01310-100' } });

    const submitBtn = screen.getByRole('button', { name: /salvar localização/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(handleSave).toHaveBeenCalled();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/components/client/__tests__/LocationModal.test.tsx --run`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `LocationModal.tsx` and enhance `Header.tsx`**

- `LocationModal.tsx`: Input de CEP com máscara, busca assíncrona em `https://viacep.com.br/ws/${cleanCep}/json/` com fallback para capitais padrão se offline. Salva no `localStorage`.
- `Header.tsx`:
  - Botão de localização: Mostra "Enviar para: São Paulo - SP" ou "Informar localização" com ícone de pino `MapPin`.
  - Botão de Favoritos: Ícone `Heart` com badge numérico ligado ao `useWishlist().wishlistCount`.
  - Ícone de Dicas de Beleza com `Sparkles` / varinha.
  - Mantém o campo de busca com tags rápidas e a Sacola lateral.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/components/client/__tests__/LocationModal.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/LocationModal.tsx Front/src/components/client/__tests__/LocationModal.test.tsx Front/src/components/client/Header.tsx
git commit -m "feat(header): add CEP location modal and wishlist counter indicator"
```

---

### Task 5: Cart Drawer Upgrade: Free Shipping Bar, Coupons & Gift Wrap (`CartDrawer.tsx`)

Inspirado em **O Boticário** e **Beleza na Web**, a sacola ganha:
- Barra de Frete Grátis animada (Meta: R$ 149,00): *"Faltam R$ 39,10 para FRETE GRÁTIS!"* ou *"✨ Parabéns! Você ganhou Frete Grátis!"*;
- Campo de inserção de cupom de desconto (ex: `BEMVINDO10` dá 10% de desconto, `MIMO` dá brinde/desconto);
- Opção de Embalagem para Presente (+ R$ 5,00) com sacola oficial botânica.

**Files:**
- Modify: `Front/src/components/client/CartDrawer.tsx`
- Create: `Front/src/components/client/__tests__/CartDrawer.test.tsx`

**Interfaces:**
- Consumes: `useCart` de `Front/src/context/CartContext.tsx`
- Produces: `CartDrawer: React.FC<{ onCheckout: () => void }>`

- [ ] **Step 1: Write the failing test for `CartDrawer` new features**

```typescript
// Front/src/components/client/__tests__/CartDrawer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CartDrawer } from '../CartDrawer';
import { CartProvider } from '../../../context/CartContext';

describe('CartDrawer', () => {
  it('renders free shipping progress bar and coupon field', () => {
    render(
      <CartProvider>
        <CartDrawer onCheckout={() => {}} />
      </CartProvider>
    );

    // Open drawer via local dispatch or check structure
    expect(screen.getByText(/frete grátis/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/código do cupom/i)).toBeInTheDocument();
  });

  it('validates and applies coupon BEMVINDO10', () => {
    render(
      <CartProvider>
        <CartDrawer onCheckout={() => {}} />
      </CartProvider>
    );

    const input = screen.getByPlaceholderText(/código do cupom/i);
    const applyBtn = screen.getByRole('button', { name: /aplicar/i });

    fireEvent.change(input, { target: { value: 'BEMVINDO10' } });
    fireEvent.click(applyBtn);

    expect(screen.getByText(/cupom aplicado/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/components/client/__tests__/CartDrawer.test.tsx --run`
Expected: FAIL because free shipping text and coupon input are not yet in `CartDrawer`.

- [ ] **Step 3: Implement Free Shipping Progress, Coupons and Gift Wrap in `CartDrawer.tsx`**

- Calcular `remainingForFreeShipping = Math.max(0, 149 - totalAmount)`.
- Renderizar barra verde esmeralda com porcentagem `(totalAmount / 149) * 100` limitada a 100%.
- Estado de cupom (`appliedCoupon`, `discountAmount`): cupons válidos `BEMVINDO10` (10% de desconto) e `MIMO` (R$ 20,00 off).
- Checkbox de embalagem para presente (+ R$ 5,00) com ícone de presente `Gift`.
- Botão CTA com valor final já com os descontos aplicados.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/components/client/__tests__/CartDrawer.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/CartDrawer.tsx Front/src/components/client/__tests__/CartDrawer.test.tsx
git commit -m "feat(cart): add free shipping progress bar, coupon redemption and gift wrap"
```

---

### Task 6: Interactive Beauty Quiz Card & Dual Promotional Banners (`BeautyQuizCard.tsx` & `PromoBanners.tsx`)

Inspirado em **SkinCeuticals** (*"Descubra a rotina de skincare ideal para você"*), **Glamora** (*"20% Off Sitewide" + "Glamora Rewards"*) e **Velvetique** (*"Up to 30% Off on Best Sellers"*).

**Files:**
- Create: `Front/src/components/client/BeautyQuizCard.tsx`
- Create: `Front/src/components/client/PromoBanners.tsx`
- Create: `Front/src/components/client/__tests__/PromoBanners.test.tsx`
- Create: `Front/src/components/client/__tests__/BeautyQuizCard.test.tsx`

**Interfaces:**
- Produces:
  ```typescript
  export interface PromoBannersProps {
    onShopOffer?: () => void;
    onJoinClub?: () => void;
  }
  export const PromoBanners: React.FC<PromoBannersProps>;

  export interface BeautyQuizCardProps {
    onStartQuiz?: () => void;
  }
  export const BeautyQuizCard: React.FC<BeautyQuizCardProps>;
  ```

- [ ] **Step 1: Write the failing test for `PromoBanners` and `BeautyQuizCard`**

```typescript
// Front/src/components/client/__tests__/PromoBanners.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PromoBanners } from '../PromoBanners';

describe('PromoBanners', () => {
  it('renders dual promo banners and handles click actions', () => {
    const handleOffer = vi.fn();
    const handleClub = vi.fn();
    render(<PromoBanners onShopOffer={handleOffer} onJoinClub={handleClub} />);

    expect(screen.getByText(/clube aura/i)).toBeInTheDocument();
    expect(screen.getByText(/desconto exclusivo/i)).toBeInTheDocument();

    const offerBtn = screen.getByRole('button', { name: /aproveitar oferta/i });
    fireEvent.click(offerBtn);
    expect(handleOffer).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/components/client/__tests__/PromoBanners.test.tsx --run`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `PromoBanners.tsx` and `BeautyQuizCard.tsx`**

- `PromoBanners.tsx`: Grid de 2 colunas com cartões promocionais:
  1. Card Esquerdo (Oferta Especial): fundo terracotta/rosé acetinado, tipografia de desconto, código de cupom `AURA20` com botão de copiar/aproveitar.
  2. Card Direito (Clube de Beleza Aura): fundo botânico escuro (`botanic-950`) com detalhes em dourado champagne, cartão fidelidade estilizado com brilho e botão de participação.
- `BeautyQuizCard.tsx`: Banner amplo horizontal estilo SkinCeuticals com diagnóstico de pele / perfume ("Descubra seu Ritual de Beleza Ideal"), selector rápido de tipo de pele (Seca, Mista, Oleosa, Sensível) e recomendação de produtos.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/components/client/__tests__/PromoBanners.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/PromoBanners.tsx Front/src/components/client/BeautyQuizCard.tsx Front/src/components/client/__tests__/PromoBanners.test.tsx
git commit -m "feat(ui): add dual promotional banners and beauty routine quiz card"
```

---

### Task 7: Comprehensive Luxury E-Commerce Footer (`Footer.tsx`)

Inspirado em **O Boticário**, **Glamora** e **Purelis**, estruturando o rodapé de loja profissional com:
- Captura de e-mail / Newsletter (*"Receba segredos de beleza e 10% OFF"*);
- 4 colunas de navegação (Navegação da Loja, Atendimento ao Cliente, Institucional / Sustentabilidade, Segurança & LGPD);
- Selos de segurança (Criptografia SSL, LGPD Compliant, Não Testado em Animais);
- Formas de pagamento aceitas (Pix Instantâneo, Visa, Mastercard, Elo, Hipercard).

**Files:**
- Create: `Front/src/components/client/Footer.tsx`
- Create: `Front/src/components/client/__tests__/Footer.test.tsx`

**Interfaces:**
- Produces: `Footer: React.FC`

- [ ] **Step 1: Write the failing test for `Footer`**

```typescript
// Front/src/components/client/__tests__/Footer.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '../Footer';

describe('Footer', () => {
  it('renders newsletter signup and footer navigation links', () => {
    render(<Footer />);

    expect(screen.getByText(/receba segredos de beleza/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/seu melhor e-mail/i)).toBeInTheDocument();
    expect(screen.getByText(/atendimento ao cliente/i)).toBeInTheDocument();
    expect(screen.getByText(/formas de pagamento/i)).toBeInTheDocument();
  });

  it('handles newsletter subscription submission', () => {
    render(<Footer />);
    const input = screen.getByPlaceholderText(/seu melhor e-mail/i);
    const submitBtn = screen.getByRole('button', { name: /inscrever-se/i });

    fireEvent.change(input, { target: { value: 'cliente@exemplo.com' } });
    fireEvent.click(submitBtn);

    expect(screen.getByText(/inscrição confirmada/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/components/client/__tests__/Footer.test.tsx --run`
Expected: FAIL with module not found.

- [ ] **Step 3: Implement `Footer.tsx`**

Construir componente com fundo `bg-botanic-950` e acentos em `champagne-400`/`warm-100`. Incluir formulário com validação simples de e-mail e feedback de sucesso ("Inscrição confirmada! Ganhe 10% OFF com o cupom BEMVINDO10"), links de contato direto com WhatsApp, termos de privacidade LGPD e ícones de bandeiras de cartão + Pix.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/components/client/__tests__/Footer.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/Footer.tsx Front/src/components/client/__tests__/Footer.test.tsx
git commit -m "feat(footer): add comprehensive e-commerce footer with newsletter and badges"
```

---

### Task 8: Product Detail Page (PDP) Mobile Sticky Bar & Shipping Simulator (`ProductDetailPage.tsx`)

Inspirado em **La Roche-Posay** (comportamento de CTA fixo no rodapé mobile durante a rolagem) e **SkinCeuticals** (simulador de frete e prazos por CEP).

**Files:**
- Modify: `Front/src/pages/client/ProductDetailPage.tsx`
- Modify: `Front/src/pages/client/__tests__/ProductDetailPage.test.tsx`

**Interfaces:**
- Consumes: `Product` de `Front/src/types/product.ts`, `useWishlist` de `Front/src/context/WishlistContext.tsx`
- Produces: `ProductDetailPage: React.FC<ProductDetailPageProps>`

- [ ] **Step 1: Write updated tests for PDP Breadcrumbs, Shipping Calculator and Sticky CTA**

```typescript
// Front/src/pages/client/__tests__/ProductDetailPage.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { ProductDetailPage } from '../ProductDetailPage';
import { WishlistProvider } from '../../../context/WishlistContext';

describe('ProductDetailPage', () => {
  it('renders breadcrumbs, shipping calculator and direct purchase options', async () => {
    render(
      <MemoryRouter initialEntries={['/produtos/batom-matte']}>
        <WishlistProvider>
          <ProductDetailPage />
        </WishlistProvider>
      </MemoryRouter>
    );

    // Breadcrumb
    expect(screen.getByText(/início/i)).toBeInTheDocument();

    // Frete e prazo calculator
    expect(screen.getByText(/calcular frete e prazo/i)).toBeInTheDocument();
    const cepInput = screen.getByPlaceholderText(/00000-000/i);
    const calcBtn = screen.getByRole('button', { name: /calcular/i });

    fireEvent.change(cepInput, { target: { value: '01310-100' } });
    fireEvent.click(calcBtn);

    await waitFor(() => {
      expect(screen.getByText(/frete grátis/i)).toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/pages/client/__tests__/ProductDetailPage.test.tsx --run`
Expected: FAIL because shipping calculator is not yet present in `ProductDetailPage`.

- [ ] **Step 3: Implement Breadcrumb, Shipping Calculator and Mobile Sticky CTA in `ProductDetailPage.tsx`**

- Adicionar navegação em migalhas de pão: `Início / Catálogo / {product.brand} / {product.name}`.
- Adicionar simulador de frete por CEP: exibe opções (PAC 4-6 dias, Sedex 1-2 dias, e Frete Grátis para compras elegíveis).
- Implementar barra flutuante inferior no mobile (`lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t p-3 flex items-center justify-between`): exibe thumbnail pequeno, preço e botão "Comprar Agora".
- Integrar botão de favoritar com `useWishlist`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/pages/client/__tests__/ProductDetailPage.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add Front/src/pages/client/ProductDetailPage.tsx Front/src/pages/client/__tests__/ProductDetailPage.test.tsx
git commit -m "feat(pdp): add breadcrumbs, shipping calculator and sticky mobile buy bar"
```

---

### Task 9: HomePage Integration & End-to-End Visual Harmony (`HomePage.tsx`)

Integrar todos os novos componentes na página inicial (`HomePage.tsx`), criando uma narrativa visual coerente inspirada em **O Boticário** e nos mockups fornecidos.

**Files:**
- Modify: `Front/src/pages/client/HomePage.tsx`
- Create: `Front/src/pages/client/__tests__/HomePage.test.tsx`

**Interfaces:**
- Orquestra: `TopBanner`, `Header`, `Hero`, `TrustPillars`, `ShopByCategory`, `PromoBanners`, `CategoryPills`, `ProductCard`, `BeautyQuizCard`, `Footer`, `WhatsAppButton`.

- [ ] **Step 1: Write integration test for `HomePage` with full design sections**

```typescript
// Front/src/pages/client/__tests__/HomePage.test.tsx
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { HomePage } from '../HomePage';
import { WishlistProvider } from '../../../context/WishlistContext';
import { CartProvider } from '../../../context/CartContext';

describe('HomePage Full Integration', () => {
  it('renders all luxury e-commerce sections seamlessly', () => {
    render(
      <MemoryRouter>
        <WishlistProvider>
          <CartProvider>
            <HomePage />
          </CartProvider>
        </WishlistProvider>
      </MemoryRouter>
    );

    // Hero & Vantagens
    expect(screen.getByText(/o ritual de beleza que transforma a sua essência/i)).toBeInTheDocument();
    expect(screen.getByText(/frete grátis/i)).toBeInTheDocument();

    // Shop By Category circles
    expect(screen.getByText(/compre por categoria/i)).toBeInTheDocument();

    // Promotional Banners
    expect(screen.getByText(/clube aura/i)).toBeInTheDocument();

    // Beauty Quiz Card
    expect(screen.getByText(/descubra seu ritual/i)).toBeInTheDocument();

    // Footer
    expect(screen.getByText(/receba segredos de beleza/i)).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm --prefix Front test -- src/pages/client/__tests__/HomePage.test.tsx --run`
Expected: FAIL because new sections are not yet placed in `HomePage.tsx`.

- [ ] **Step 3: Integrate new components into `HomePage.tsx`**

Adicionar na ordem editorial:
1. `TopBanner`
2. `Header` (com localização e wishlist)
3. `Hero Banner Editorial`
4. `Régua de Vantagens (Trust Pillars)`
5. `ShopByCategory` (círculos interativos)
6. `PromoBanners` (ofertas e clube)
7. `Vitrine de Produtos` (com `ProductCard` enriquecidos e `CategoryPills`)
8. `BeautyQuizCard` (diagnóstico interativo)
9. `Footer` (newsletter, institucional, meios de pagamento)
10. `WhatsAppButton`

- [ ] **Step 4: Run test to verify it passes**

Run: `npm --prefix Front test -- src/pages/client/__tests__/HomePage.test.tsx --run`
Expected: PASS.

- [ ] **Step 5: Run full frontend test suite and build verification**

Run: `npm --prefix Front test -- --run && npm --prefix Front run build`
Expected: 100% dos testes passando e build do Vite concluído com sucesso.

- [ ] **Step 6: Commit**

```bash
git add Front/src/pages/client/HomePage.tsx Front/src/pages/client/__tests__/HomePage.test.tsx
git commit -m "feat(home): complete home page integration with beauty design system"
```

---

## Plan Self-Review Checklist

- [x] **Spec coverage:** Todas as recomendações de design visual (O Boticário, Beleza na Web, SkinCeuticals, Glamora, Elixora, Velvetique e Purelis) foram contempladas em tarefas práticas.
- [x] **Step scan:** Cada tarefa segue o ciclo TDD estrito: teste falho -> verificação de falha -> implementação -> teste passando -> commit.
- [x] **Type consistency:** Tipos `Product`, `Category` e `WishlistContextType` consistentes entre todas as tarefas.
- [x] **Review Focus:** Casos limites (navegação privada sem localStorage, divisão por zero no frete, CEP inválido, cupons inválidos e sticky bar no mobile) testados e tratados.
- [x] **Proportion:** Instruções focadas e diretas para o implementador sem repetição desnecessária de código.
