# E-Commerce Usabilidade, 3 GUIs, Modo Escuro, Responsividade e Acessibilidade — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar as correções de usabilidade e funcionalidades essenciais de e-commerce que faltam na plataforma Aura Cosméticos, incluindo as 3 interfaces gráficas completas (Cliente, Administrador, Vendedora/Dona), Modo Escuro com suporte a temas, Responsividade mobile-first aprimorada (touch targets >= 44px, sticky CTAs, drawer layouts) e Acessibilidade (WCAG 2.2 AA) com aumento de tamanho de fonte e modos para daltônicos (deuteranopia, protanopia, tritanopia e alto contraste).

**Architecture:** A aplicação React 19 SPA adota arquitetura modular com separação estrita de contextos (`A11yContext`, `ToastContext`, `WishlistContext`, `AuthContext`, `CartContext`), layout engine responsivo e estilização com Tailwind CSS configurado com `darkMode: 'class'`. A acessibilidade é gerenciada via atributos HTML raiz (`data-theme`, `data-font-size`, `data-colorblind`) com filtros CSS de alta fidelidade e persistência em `localStorage`. No back-end FastAPI, endpoints complementares de categorias e inventário garantem suporte integral aos fluxos administrativos.

**Tech Stack:** React 19, TypeScript 5.7, Vite, Tailwind CSS 3.4, Lucide React, Vitest, React Testing Library, Python 3.14 (FastAPI + SQLAlchemy 2.0).

**Spec:** `AGENTS.md`, `DESIGN_SYSTEM_AURA_COSMETICOS.md`.

## Global Constraints

- Back-end: Python 3.14 com FastAPI e SQLAlchemy 2.0 assíncrono.
- Front-end: React 19 com TypeScript estrito, Vite e Tailwind CSS.
- Design System: Paleta Aura (`brand-950` a `brand-50`, `accent-500`, semânticas `success`, `warning`, `danger`), tipografia DM Serif Display e Inter.
- Modo Escuro: Configurado em Tailwind (`darkMode: 'class'`), com superfícies escuras quentes (`#151214`, `#1E1B1D`), bordas suaves e contraste de texto preservado.
- Acessibilidade: WCAG 2.2 AA com controles de aumento de fonte (Normal 100%, Grande 115%, Extra Grande 130%), 4 modos para daltonismo (Deuteranopia, Protanopia, Tritanopia, Alto Contraste) e áreas de toque mínimas de 44x44px.
- Concorrência & Estoque: Exibição clara de estoque crítico (`<= 3` unidades) e esgotado (`0`), respeito às travas atômicas Redis e `Idempotency-Key` UUIDv4 no checkout.

## Review Focus

- Interação entre Modo Escuro e Filtros para Daltônicos: o contraste de textos, badges e botões deve permanecer legível (taxa >= 4.5:1 para texto normal e 7:1 em alto contraste) sem quebras de layout.
- Aumento de fonte (130%): textos não devem sofrer corte (`overflow: hidden` destrutivo) em cards de produto, tabelas administrativas ou cabeçalho móvel.
- Sticky CTA Mobile na PDP: em telas estreitas (360px), o botão inferior não deve sobrepor a barra de navegação, modais ou o botão flutuante de WhatsApp.
- Venda rápida no balcão da Vendedora: tratamento do erro `409 Conflict` (trava Lua no Redis) informando que o produto esgotou no momento do fechamento.
- Persistência das preferências de acessibilidade: recarregamento da página deve restaurar instantaneamente tema, tamanho de fonte e modo daltônico sem flash visual.

---

### Task 1: Theme & Accessibility Engine (Dark Mode, Font Scaling, Color Blindness)

**Files:**
- Modify: `Front/tailwind.config.js`
- Modify: `Front/src/index.css`
- Create: `Front/src/context/A11yContext.tsx`
- Create: `Front/src/components/common/A11yToolbar.tsx`
- Test: `Front/src/context/__tests__/A11yContext.test.tsx`

**Interfaces:**
- Consumes: `localStorage`, Tailwind `darkMode: 'class'`, Lucide React (`Sun`, `Moon`, `Type`, `Eye`, `Contrast`).
- Produces: `A11yProvider`, `useA11y()` expondo:
  - `theme`: `'light' | 'dark' | 'system'`
  - `setTheme(theme)`
  - `fontSize`: `'normal' | 'large' | 'xlarge'`
  - `setFontSize(size)`
  - `colorBlindMode`: `'none' | 'protanopia' | 'deuteranopia' | 'tritanopia' | 'high-contrast'`
  - `setColorBlindMode(mode)`
  - `A11yToolbar` component.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/context/__tests__/A11yContext.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { A11yProvider, useA11y } from '../A11yContext';

const TestConsumer: React.FC = () => {
  const { theme, setTheme, fontSize, setFontSize, colorBlindMode, setColorBlindMode } = useA11y();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="font-size">{fontSize}</span>
      <span data-testid="colorblind">{colorBlindMode}</span>
      <button onClick={() => setTheme('dark')}>Ativar Dark</button>
      <button onClick={() => setFontSize('large')}>Aumentar Fonte</button>
      <button onClick={() => setColorBlindMode('deuteranopia')}>Ativar Deuteranopia</button>
    </div>
  );
};

describe('A11yContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-font-size');
    document.documentElement.removeAttribute('data-colorblind');
  });

  it('alterna tema para escuro e atualiza classe no html', () => {
    render(
      <A11yProvider>
        <TestConsumer />
      </A11yProvider>
    );

    expect(screen.getByTestId('theme').textContent).toBe('light');
    fireEvent.click(screen.getByText('Ativar Dark'));
    expect(screen.getByTestId('theme').textContent).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('permite aumentar tamanho da fonte e alterar modo daltônico', () => {
    render(
      <A11yProvider>
        <TestConsumer />
      </A11yProvider>
    );

    fireEvent.click(screen.getByText('Aumentar Fonte'));
    expect(screen.getByTestId('font-size').textContent).toBe('large');
    expect(document.documentElement.getAttribute('data-font-size')).toBe('large');

    fireEvent.click(screen.getByText('Ativar Deuteranopia'));
    expect(screen.getByTestId('colorblind').textContent).toBe('deuteranopia');
    expect(document.documentElement.getAttribute('data-colorblind')).toBe('deuteranopia');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/context/__tests__/A11yContext.test.tsx`
Expected: FAIL com módulo `A11yContext` não encontrado.

- [ ] **Step 3: Implement `A11yContext.tsx`, `A11yToolbar.tsx` and configure Tailwind Dark Mode**

1. Em `Front/tailwind.config.js`, adicionar `darkMode: 'class'`.
2. Em `Front/src/index.css`, configurar variáveis CSS para dark mode, classes para `[data-font-size="large"]` (115% root font-size) e `[data-font-size="xlarge"]` (130% root font-size), e filtros SVG/regras de cores para `[data-colorblind="protanopia"]`, `[data-colorblind="deuteranopia"]`, `[data-colorblind="tritanopia"]` e `[data-colorblind="high-contrast"]`.
3. Criar `Front/src/context/A11yContext.tsx` com sincronização no `localStorage`.
4. Criar `Front/src/components/common/A11yToolbar.tsx` com modal/dropdown acessível de ajustes rápidos.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/context/__tests__/A11yContext.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/tailwind.config.js Front/src/index.css Front/src/context/A11yContext.tsx Front/src/components/common/A11yToolbar.tsx Front/src/context/__tests__/A11yContext.test.tsx
git commit -m "feat(a11y): implementar motor de tema escuro, ajuste de tamanho de fonte e modos para daltonismo"
```

---

### Task 2: Toast Notification System & Feedback Infrastructure

**Files:**
- Create: `Front/src/context/ToastContext.tsx`
- Create: `Front/src/components/common/Toast.tsx`
- Test: `Front/src/context/__tests__/ToastContext.test.tsx`

**Interfaces:**
- Consumes: React Context, Lucide React (`CheckCircle`, `AlertTriangle`, `XCircle`, `Info`, `X`).
- Produces: `useToast()` hook fornecendo `showToast(message: string, type?: 'success' | 'warning' | 'error' | 'info')`.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/context/__tests__/ToastContext.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { ToastProvider, useToast } from '../ToastContext';

const TestComponent: React.FC = () => {
  const { showToast } = useToast();
  return (
    <button onClick={() => showToast('Produto adicionado à sacola!', 'success')}>
      Disparar Toast
    </button>
  );
};

describe('ToastContext', () => {
  it('exibe notificação toast e permite fechamento manual', () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    fireEvent.click(screen.getByText('Disparar Toast'));
    expect(screen.getByText('Produto adicionado à sacola!')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/context/__tests__/ToastContext.test.tsx`
Expected: FAIL com módulo `ToastContext` não encontrado.

- [ ] **Step 3: Implement `ToastProvider`, `Toast` and `useToast`**

Implementar `ToastContext.tsx` e `Toast.tsx` com auto-dismiss após 3.5s, animação respeitando `prefers-reduced-motion` e suporte ao dark mode.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/context/__tests__/ToastContext.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/context/ToastContext.tsx Front/src/components/common/Toast.tsx Front/src/context/__tests__/ToastContext.test.tsx
git commit -m "feat(front): adicionar sistema de notificações toast e contexto global"
```

---

### Task 3: Client Wishlist / Favoritos System

**Files:**
- Create: `Front/src/context/WishlistContext.tsx`
- Create: `Front/src/components/client/WishlistButton.tsx`
- Create: `Front/src/pages/client/WishlistPage.tsx`
- Modify: `Front/src/components/client/ProductCard.tsx`
- Test: `Front/src/context/__tests__/WishlistContext.test.tsx`

**Interfaces:**
- Consumes: `Product` de `Front/src/types/product.ts`, `localStorage`.
- Produces: `WishlistProvider`, `useWishlist()` expondo:
  - `wishlistItems: Product[]`
  - `toggleWishlist(product: Product): void`
  - `isInWishlist(productId: number): boolean`
  - `clearWishlist(): void`
  - Rota `/favoritos` com visualização e transferência direta para a sacola.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/context/__tests__/WishlistContext.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { WishlistProvider, useWishlist } from '../WishlistContext';
import { Product } from '../../types/product';

const mockProduct: Product = {
  product_id: 101,
  name: 'Batom Aveludado Rosa Nude',
  slug: 'batom-rosa-nude',
  brand: 'Aura Glow',
  price: 49.9,
  stock_quantity: 10,
  is_active: true,
};

const TestWishlistComponent: React.FC = () => {
  const { wishlistItems, toggleWishlist, isInWishlist } = useWishlist();
  return (
    <div>
      <span data-testid="count">{wishlistItems.length}</span>
      <span data-testid="is-in">{isInWishlist(101) ? 'SIM' : 'NAO'}</span>
      <button onClick={() => toggleWishlist(mockProduct)}>Toggle Favorito</button>
    </div>
  );
};

describe('WishlistContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('adiciona e remove produto dos favoritos com persistência local', () => {
    render(
      <WishlistProvider>
        <TestWishlistComponent />
      </WishlistProvider>
    );

    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('is-in').textContent).toBe('NAO');

    fireEvent.click(screen.getByText('Toggle Favorito'));
    expect(screen.getByTestId('count').textContent).toBe('1');
    expect(screen.getByTestId('is-in').textContent).toBe('SIM');

    fireEvent.click(screen.getByText('Toggle Favorito'));
    expect(screen.getByTestId('count').textContent).toBe('0');
    expect(screen.getByTestId('is-in').textContent).toBe('NAO');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/context/__tests__/WishlistContext.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `WishlistContext.tsx`, `WishlistButton.tsx` and `WishlistPage.tsx`**

1. Criar `Front/src/context/WishlistContext.tsx` salvando no `localStorage` sob chave `aura_wishlist_items`.
2. Criar `Front/src/components/client/WishlistButton.tsx` com ícone de coração animado e acessível (`aria-label`).
3. Adicionar botão de favoritar nos cards de produto (`ProductCard.tsx`).
4. Criar página `Front/src/pages/client/WishlistPage.tsx` para gerenciar produtos salvos e adicionar à sacola com 1 clique.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/context/__tests__/WishlistContext.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/context/WishlistContext.tsx Front/src/components/client/WishlistButton.tsx Front/src/pages/client/WishlistPage.tsx Front/src/components/client/ProductCard.tsx Front/src/context/__tests__/WishlistContext.test.tsx
git commit -m "feat(front): adicionar sistema de lista de desejos e favoritos do cliente"
```

---

### Task 4: Advanced Catalog Filters (Price Range, Brand, Mobile FilterSheet)

**Files:**
- Create: `Front/src/components/client/FilterSheet.tsx`
- Modify: `Front/src/pages/client/HomePage.tsx`
- Test: `Front/src/components/client/__tests__/FilterSheet.test.tsx`

**Interfaces:**
- Consumes: `Category` de `Front/src/types/product.ts`, `Button`, `Input`.
- Produces: `FilterSheet` aceitando `isOpen`, `onClose`, `categories`, `brands`, `selectedCategorySlug`, `selectedBrand`, `minPrice`, `maxPrice`, `onApplyFilters(filters)`, `onClearFilters()`.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/components/client/__tests__/FilterSheet.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import FilterSheet from '../FilterSheet';

describe('FilterSheet Component', () => {
  const categories = [
    { category_id: 1, name: 'Skincare', slug: 'skincare' },
    { category_id: 2, name: 'Maquiagem', slug: 'maquiagem' },
  ];
  const brands = ['Aura Glow', 'Aura Derm', 'Aura Fragrances'];

  it('renderiza categorias, marcas e campos de preço e aciona aplicação de filtros', () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();

    render(
      <FilterSheet
        isOpen={true}
        onClose={handleClose}
        categories={categories}
        brands={brands}
        selectedCategorySlug="skincare"
        selectedBrand=""
        minPrice={20}
        maxPrice={150}
        onApplyFilters={handleApply}
        onClearFilters={vi.fn()}
      />
    );

    expect(screen.getByText('Filtros do Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Skincare')).toBeInTheDocument();
    expect(screen.getByText('Aura Glow')).toBeInTheDocument();

    const applyButton = screen.getByText('Aplicar Filtros');
    fireEvent.click(applyButton);

    expect(handleApply).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/components/client/__tests__/FilterSheet.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `FilterSheet.tsx` and integrate into `HomePage.tsx`**

Implementar gaveta inferior/modal mobile com inputs de preço mínimo/máximo, chips de categoria, filtro por marca e botões "Limpar" e "Aplicar Filtros". Em `HomePage.tsx`, conectar estado de `minPrice`, `maxPrice` e `brand` à chamada `productApi.getProducts({ min_price, max_price })` e exibir chips ativos com remoção rápida.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/components/client/__tests__/FilterSheet.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/FilterSheet.tsx Front/src/pages/client/HomePage.tsx Front/src/components/client/__tests__/FilterSheet.test.tsx
git commit -m "feat(front): adicionar filtro avançado por faixa de preço e marcas com bottom sheet mobile"
```

---

### Task 5: PDP Usability & Mobile Conversions (Sticky CTA, Shipping, Zoom)

**Files:**
- Create: `Front/src/components/client/StickyMobileBuyBar.tsx`
- Create: `Front/src/components/client/ShippingSimulator.tsx`
- Modify: `Front/src/pages/client/ProductDetailPage.tsx`
- Test: `Front/src/components/client/__tests__/StickyMobileBuyBar.test.tsx`

**Interfaces:**
- Consumes: `Product`, `useCart()`, `useToast()`.
- Produces: Barra fixa no rodapé mobile para compra rápida e simulador de frete por CEP na PDP e no carrinho.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/components/client/__tests__/StickyMobileBuyBar.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import StickyMobileBuyBar from '../StickyMobileBuyBar';

describe('StickyMobileBuyBar', () => {
  it('exibe preço, botões de ação e dispara callbacks corretamente', () => {
    const handleBuyNow = vi.fn();
    const handleAddToCart = vi.fn();

    render(
      <StickyMobileBuyBar
        price={79.9}
        isOutOfStock={false}
        onBuyNow={handleBuyNow}
        onAddToCart={handleAddToCart}
      />
    );

    expect(screen.getByText('R$ 79,90')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Comprar Agora'));
    expect(handleBuyNow).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/components/client/__tests__/StickyMobileBuyBar.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `StickyMobileBuyBar.tsx`, `ShippingSimulator.tsx` and integrate into `ProductDetailPage.tsx`**

1. Implementar `StickyMobileBuyBar.tsx` visível somente em telas `< 1024px`, com `safe-area-inset-bottom`, preço e CTAs de compra.
2. Implementar `ShippingSimulator.tsx` com consulta ViaCEP e estimativa de entrega realista.
3. Integrar ambos em `ProductDetailPage.tsx` com visualizador de zoom na imagem e compartilhamento por link/WhatsApp.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/components/client/__tests__/StickyMobileBuyBar.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/StickyMobileBuyBar.tsx Front/src/components/client/ShippingSimulator.tsx Front/src/pages/client/ProductDetailPage.tsx Front/src/components/client/__tests__/StickyMobileBuyBar.test.tsx
git commit -m "feat(front): adicionar sticky CTA mobile na PDP e simulador de frete"
```

---

### Task 6: Client Order Tracking & Order History Pages

**Files:**
- Create: `Front/src/pages/client/ClientOrdersPage.tsx`
- Create: `Front/src/pages/client/OrderTrackingPage.tsx`
- Modify: `Front/src/services/orderApi.ts`
- Test: `Front/src/pages/client/__tests__/ClientOrdersPage.test.tsx`

**Interfaces:**
- Consumes: `orderApi.getMyOrders()`, `orderApi.getOrder(orderId)`, `OrderStepper`, `Badge`.
- Produces: Rota `/meus-pedidos` para cliente logado e `/pedidos/:id` para rastreamento direto por código (inclusive visitantes).

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/pages/client/__tests__/ClientOrdersPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { ClientOrdersPage } from '../ClientOrdersPage';

vi.mock('../../../services/orderApi', () => ({
  orderApi: {
    getMyOrders: vi.fn().mockResolvedValue([
      {
        order_id: 'ord-12345678-abcd',
        status: 'approved',
        total_amount: 129.8,
        created_at: '2026-11-16T10:00:00Z',
        items: [{ product_id: 1, name: 'Batom Matte Velvet', quantity: 2, unit_price: 64.9, subtotal: 129.8 }],
        shipping_address: { street: 'Rua das Flores', number: '100', city: 'São Paulo', state: 'SP', zip_code: '01001-000' }
      }
    ]),
    getOrder: vi.fn(),
  }
}));

describe('ClientOrdersPage', () => {
  it('renderiza histórico de pedidos com código e valor', async () => {
    render(
      <BrowserRouter>
        <ClientOrdersPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Meus Pedidos')).toBeInTheDocument();
    expect(await screen.findByText('ord-12345678-abcd')).toBeInTheDocument();
    expect(screen.getByText('R$ 129,80')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/pages/client/__tests__/ClientOrdersPage.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `orderApi.getMyOrders`, `ClientOrdersPage.tsx` and `OrderTrackingPage.tsx`**

1. Em `Front/src/services/orderApi.ts`, implementar método `getMyOrders(): Promise<Order[]>`.
2. Criar `ClientOrdersPage.tsx` com listagem de pedidos, status, botão "Comprar Novamente", e botão de suporte WhatsApp com ID do pedido.
3. Criar `OrderTrackingPage.tsx` permitindo ao cliente ou visitante consultar qualquer pedido pelo código ou UUID.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/pages/client/__tests__/ClientOrdersPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/services/orderApi.ts Front/src/pages/client/ClientOrdersPage.tsx Front/src/pages/client/OrderTrackingPage.tsx Front/src/pages/client/__tests__/ClientOrdersPage.test.tsx
git commit -m "feat(front): criar páginas de histórico de pedidos do cliente e rastreamento direto"
```

---

### Task 7: Backend Admin Category Router & Integration

**Files:**
- Create: `Back/routers/admin_category_router.py`
- Modify: `Back/main.py`
- Modify: `Back/dtos/category_dto.py`
- Modify: `Front/src/services/adminApi.ts`
- Test: `Front/src/services/__tests__/adminApiCategories.test.ts`

**Interfaces:**
- Consumes: `CategoryRepository`, `require_admin_role()`, FastAPI Router.
- Produces: Endpoints `POST /api/admin/categories` e `DELETE /api/admin/categories/{category_id}`; métodos `adminApi.createCategory` e `adminApi.deleteCategory`.

- [ ] **Step 1: Write the failing frontend test**

```ts
// Front/src/services/__tests__/adminApiCategories.test.ts
import { describe, it, expect, vi } from 'vitest';
import { adminApi } from '../adminApi';
import apiClient from '../apiClient';

vi.mock('../apiClient', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('adminApi Category methods', () => {
  it('envia requisição de criação de categoria para o backend', async () => {
    (apiClient.post as any).mockResolvedValueOnce({
      data: { category_id: 10, name: 'Unhas & Esmaltes', slug: 'unhas-e-esmaltes' },
    });

    const result = await adminApi.createCategory({ name: 'Unhas & Esmaltes', slug: 'unhas-e-esmaltes' });
    expect(apiClient.post).toHaveBeenCalledWith('/admin/categories', { name: 'Unhas & Esmaltes', slug: 'unhas-e-esmaltes' });
    expect(result.name).toBe('Unhas & Esmaltes');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/services/__tests__/adminApiCategories.test.ts`
Expected: FAIL com `createCategory is not a function`.

- [ ] **Step 3: Implement backend category router and frontend methods**

1. Em `Back/dtos/category_dto.py`, criar `CategoryCreateRequest`.
2. Criar `Back/routers/admin_category_router.py` com endpoints `POST` e `DELETE`.
3. Registrar router em `Back/main.py` com prefixo `/api/admin/categories`.
4. Em `Front/src/services/adminApi.ts`, adicionar `createCategory` e `deleteCategory`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/services/__tests__/adminApiCategories.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/routers/admin_category_router.py Back/dtos/category_dto.py Back/main.py Front/src/services/adminApi.ts Front/src/services/__tests__/adminApiCategories.test.ts
git commit -m "feat(api): implementar router administrativo de categorias e métodos na API do frontend"
```

---

### Task 8: Admin Layout with Responsive Mobile Drawer & Topbar Navigation

**Files:**
- Create: `Front/src/components/admin/AdminLayout.tsx`
- Create: `Front/src/components/admin/AdminTopbar.tsx`
- Modify: `Front/src/components/admin/AdminSidebar.tsx`
- Test: `Front/src/components/admin/__tests__/AdminLayout.test.tsx`

**Interfaces:**
- Consumes: `useAuth()`, `useA11y()`, Lucide React (`Menu`, `X`, `LayoutDashboard`, `Package`, `FolderTree`, `ShoppingCart`, `Boxes`, `Lock`, `BarChart3`, `Sun`, `Moon`).
- Produces: `AdminLayout` envolvendo páginas administrativas com topbar, toggle de tema escuro/claro, sidebar responsiva e drawer mobile.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/components/admin/__tests__/AdminLayout.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdminLayout from '../AdminLayout';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    adminUser: { id: 1, name: 'Gestor Geral', role: 'SuperAdmin' },
    adminLogout: vi.fn(),
  }),
}));

vi.mock('../../../context/A11yContext', () => ({
  useA11y: () => ({
    theme: 'light',
    setTheme: vi.fn(),
  }),
}));

describe('AdminLayout', () => {
  it('renderiza os 7 itens de menu no sidebar e topbar responsiva', () => {
    render(
      <BrowserRouter>
        <AdminLayout title="Dashboard de Teste">
          <div>Conteúdo Principal</div>
        </AdminLayout>
      </BrowserRouter>
    );

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Categorias')).toBeInTheDocument();
    expect(screen.getByText('Gestão de Estoque')).toBeInTheDocument();
    expect(screen.getByText('Relatórios Analíticos')).toBeInTheDocument();
    expect(screen.getByText('Conteúdo Principal')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/components/admin/__tests__/AdminLayout.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `AdminLayout.tsx`, `AdminTopbar.tsx` and update `AdminSidebar.tsx`**

1. Implementar topbar com botão hamburger mobile, título da seção, alternador de tema escuro/claro, link "Ver Loja" e perfil do administrador.
2. Na sidebar, consolidar os 7 itens de menu canônicos alinhados ao PRD.
3. No layout, garantir fechamento automático do drawer mobile ao navegar entre rotas.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/components/admin/__tests__/AdminLayout.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/admin/AdminLayout.tsx Front/src/components/admin/AdminTopbar.tsx Front/src/components/admin/AdminSidebar.tsx Front/src/components/admin/__tests__/AdminLayout.test.tsx
git commit -m "feat(admin): criar layout administrativo unificado com drawer mobile e topbar responsiva"
```

---

### Task 9: Admin Categories & Physical Stock / Inventory Management Pages

**Files:**
- Create: `Front/src/pages/admin/AdminCategoriesPage.tsx`
- Create: `Front/src/pages/admin/AdminInventoryStockPage.tsx`
- Test: `Front/src/pages/admin/__tests__/AdminCategoriesPage.test.tsx`
- Test: `Front/src/pages/admin/__tests__/AdminInventoryStockPage.test.tsx`

**Interfaces:**
- Consumes: `productApi`, `adminApi`, `AdminLayout`, `Badge`, `Button`, `Modal`.
- Produces: Rotas `/admin/categorias` e `/admin/estoque`.

- [ ] **Step 1: Write the failing tests**

```tsx
// Front/src/pages/admin/__tests__/AdminCategoriesPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AdminCategoriesPage } from '../AdminCategoriesPage';

vi.mock('../../../services/productApi', () => ({
  productApi: {
    getCategories: vi.fn().mockResolvedValue([
      { category_id: 1, name: 'Skincare Facial', slug: 'skincare-facial' },
      { category_id: 2, name: 'Maquiagem', slug: 'maquiagem' },
    ]),
  },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    adminUser: { id: 1, name: 'Admin', role: 'SuperAdmin' },
    adminLogout: vi.fn(),
  }),
}));

vi.mock('../../../context/A11yContext', () => ({
  useA11y: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

describe('AdminCategoriesPage', () => {
  it('lista as categorias e exibe botão de cadastro', async () => {
    render(
      <BrowserRouter>
        <AdminCategoriesPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Gestão de Categorias')).toBeInTheDocument();
    expect(await screen.findByText('Skincare Facial')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminCategoriesPage.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `AdminCategoriesPage.tsx` and `AdminInventoryStockPage.tsx`**

1. `AdminCategoriesPage.tsx`: listagem de categorias com contador de produtos, modal de criação e confirmação de exclusão.
2. `AdminInventoryStockPage.tsx`: tabela completa de estoque físico de cosméticos com filtros rápidos para "Estoque Crítico (<= 3 unidades)" e "Esgotados", além de modal rápido de reposição de saldo.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminCategoriesPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/pages/admin/AdminCategoriesPage.tsx Front/src/pages/admin/AdminInventoryStockPage.tsx Front/src/pages/admin/__tests__/AdminCategoriesPage.test.tsx
git commit -m "feat(admin): criar telas de gestão de categorias e controle de estoque físico"
```

---

### Task 10: Admin Sales Reports & Analytics Page

**Files:**
- Create: `Front/src/pages/admin/AdminReportsPage.tsx`
- Test: `Front/src/pages/admin/__tests__/AdminReportsPage.test.tsx`

**Interfaces:**
- Consumes: `adminApi.getSalesMetrics()`, `adminApi.getSalesChart()`, `adminApi.getOrders()`, `AdminLayout`, `KpiCard`.
- Produces: Rota `/admin/relatorios` com gráficos, filtros por período e análise de ticket médio e conversão.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/pages/admin/__tests__/AdminReportsPage.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AdminReportsPage } from '../AdminReportsPage';

vi.mock('../../../services/adminApi', () => ({
  adminApi: {
    getSalesMetrics: vi.fn().mockResolvedValue({
      daily_revenue: 12540.0,
      total_orders_today: 85,
      conversion_rate: 4.8,
      critical_stock_count: 2,
    }),
    getSalesChart: vi.fn().mockResolvedValue([
      { date: '2026-11-14', amount: 9800, orders_count: 65 },
      { date: '2026-11-15', amount: 11200, orders_count: 78 },
      { date: '2026-11-16', amount: 12540, orders_count: 85 },
    ]),
    getOrders: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    adminUser: { id: 1, name: 'Admin', role: 'SuperAdmin' },
    adminLogout: vi.fn(),
  }),
}));

vi.mock('../../../context/A11yContext', () => ({
  useA11y: () => ({ theme: 'light', setTheme: vi.fn() }),
}));

describe('AdminReportsPage', () => {
  it('renderiza indicadores de faturamento e seletor de períodos', async () => {
    render(
      <BrowserRouter>
        <AdminReportsPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Relatórios & Inteligência Analítica')).toBeInTheDocument();
    expect(await screen.findByText('R$ 12.540,00')).toBeInTheDocument();
    expect(screen.getByText('Últimos 7 dias')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminReportsPage.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `AdminReportsPage.tsx`**

Implementar visão analítica com filtro temporal (7, 15, 30 dias), KPIs detalhados (Faturamento Total, Ticket Médio, Taxa de Conversão, Volume de Pedidos), gráfico de evolução diária e tabela de cosméticos mais vendidos.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminReportsPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/pages/admin/AdminReportsPage.tsx Front/src/pages/admin/__tests__/AdminReportsPage.test.tsx
git commit -m "feat(admin): criar página de relatórios analíticos de vendas e inteligência financeira"
```

---

### Task 11: Interface da Vendedora / Dona (Portal da Revendedora)

**Files:**
- Create: `Front/src/pages/vendedora/VendedoraPortalPage.tsx`
- Create: `Front/src/components/vendedora/VendedoraHeader.tsx`
- Create: `Front/src/components/vendedora/ProfitCalculator.tsx`
- Create: `Front/src/components/vendedora/WhatsAppShareModal.tsx`
- Create: `Front/src/components/vendedora/QuickOrderModal.tsx`
- Test: `Front/src/pages/vendedora/__tests__/VendedoraPortalPage.test.tsx`
- Test: `Front/src/components/vendedora/__tests__/ProfitCalculator.test.tsx`

**Interfaces:**
- Consumes: `productApi.getProducts()`, `checkoutApi.directCheckout()`, `Product`, `useToast()`, `useA11y()`.
- Produces: Rota `/vendedora` com:
  - Painel com resumo de vendas e comissões da revendedora/dona.
  - Catálogo comissionado com preços de custo e margem por unidade.
  - Gerador de mensagens persuasivas para WhatsApp com link direto da loja.
  - Calculadora dinâmica de lucros e margem de revenda.
  - Módulo de Venda Rápida / Balcão com geração imediata de Pix para a cliente.
  - Gestão de encomendas e cobrança de clientes.

- [ ] **Step 1: Write the failing tests**

```tsx
// Front/src/components/vendedora/__tests__/ProfitCalculator.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import ProfitCalculator from '../ProfitCalculator';

describe('ProfitCalculator', () => {
  it('calcula o lucro líquido e margem de revenda com base no valor simulado', () => {
    render(<ProfitCalculator />);

    expect(screen.getByText('Calculadora de Lucro da Revendedora')).toBeInTheDocument();
    const input = screen.getByLabelText(/Valor Total em Vendas/i);
    fireEvent.change(input, { target: { value: '1000' } });

    // Com margem padrão de 30%, lucro = R$ 300,00
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/components/vendedora/__tests__/ProfitCalculator.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement Vendedora Portal, Calculator, WhatsApp Sharer and Quick Order**

1. `ProfitCalculator.tsx`: simulador com botões de margem rápida (20%, 30%, 35%, 40%), cálculo de lucro líquido e custo de reposição de cosméticos.
2. `WhatsAppShareModal.tsx`: gerador de mensagens atraentes para WhatsApp com benefícios do cosmético e link personalizado da revendedora (`?ref=vendedora`).
3. `QuickOrderModal.tsx`: lançamento ágil de pedido no balcão com geração instantânea de Pix para a cliente.
4. `VendedoraPortalPage.tsx`: painel integrando as 5 ferramentas com design elegante, dark mode e responsividade total.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd Front && npx vitest run src/components/vendedora/__tests__/ProfitCalculator.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/pages/vendedora/ Front/src/components/vendedora/
git commit -m "feat(vendedora): implementar portal completo da revendedora/dona com calculadora e venda balcão"
```

---

### Task 12: App Shell Integration, Routes & Full Verification

**Files:**
- Modify: `Front/src/App.tsx`
- Modify: `Front/src/components/client/Header.tsx`
- Test: `cd Front && npm test`
- Verification: `cd Front && npm run build`

**Interfaces:**
- Consumes: Todos os novos contextos (`A11yProvider`, `ToastProvider`, `WishlistProvider`) e rotas.
- Produces: SPA integrada de ponta a ponta.

- [ ] **Step 1: Integrate routes and context providers in `Front/src/App.tsx` and `Header.tsx`**

1. Envolver a aplicação com `A11yProvider`, `ToastProvider` e `WishlistProvider`.
2. Adicionar novas rotas no React Router:
   - `/favoritos` -> `<WishlistPage />`
   - `/meus-pedidos` -> `<ClientOrdersPage />`
   - `/pedidos/:id` -> `<OrderTrackingPage />`
   - `/vendedora` -> `<VendedoraPortalPage />`
   - `/admin/categorias` -> `<AdminRouteGuard><AdminCategoriesPage /></AdminRouteGuard>`
   - `/admin/estoque` -> `<AdminRouteGuard><AdminInventoryStockPage /></AdminRouteGuard>`
   - `/admin/relatorios` -> `<AdminRouteGuard><AdminReportsPage /></AdminRouteGuard>`
3. Atualizar `Header.tsx` com atalho de Favoritos (com badge), botão de Acessibilidade (`A11yToolbar`) e link "Sou Revendedora".

- [ ] **Step 2: Run all frontend tests**

Run: `cd Front && npm test`
Expected: Todos os testes executados com 100% de sucesso.

- [ ] **Step 3: Run production build**

Run: `cd Front && npm run build`
Expected: TypeScript check `tsc` e Vite build concluídos com sucesso sem erros.

- [ ] **Step 4: Verify health of running Docker backend container**

Run: `curl -s http://localhost:8000/api/health`
Expected: `{"status":"healthy","service":"cosmetics-ecommerce"}`

- [ ] **Step 5: Commit**

```bash
git add Front/src/App.tsx Front/src/components/client/Header.tsx
git commit -m "feat(app): integrar acessibilidade, favoritos, 3 GUIs e validar build de produção"
```
