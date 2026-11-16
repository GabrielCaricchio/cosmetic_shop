# Front-End, Interface do Administrador e Portal da Vendedora Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar as funcionalidades ausentes no front-end do cliente (filtros avançados de preço, bottom sheet mobile, rastreamento e histórico de pedidos, sistema de toasts), a interface administrativa completa com navegação responsiva (gestão de categorias, controle de estoque físico e relatórios analíticos) e a interface da vendedora/revendedora (portal com catálogo comissionado, gerador de links para WhatsApp, calculadora de margem de lucro e venda balcão).

**Architecture:** A aplicação React 19 SPA é estruturada em três personas com layouts e guardas desacopladas (Cliente, Administrador e Vendedora). O estado global utiliza React Context (`AuthContext`, `CartContext`, `ToastContext`), os estilos seguem estritamente os tokens de design do Aura Cosméticos em Tailwind CSS, e as chamadas de rede utilizam Axios com interceptors de token JWT e cabeçalho `Idempotency-Key`. O back-end em FastAPI complementa o CRUD administrativo de categorias.

**Tech Stack:** React 19, TypeScript 5.7, Tailwind CSS 3.4, React Router 7.1, Lucide React, Vitest, Testing Library, Python 3.14 (FastAPI, SQLAlchemy 2.0).

**Spec:** `AGENTS.md` e `DESIGN_SYSTEM_AURA_COSMETICOS.md`.

## Global Constraints

- Back-end: Python 3.14 com FastAPI e SQLAlchemy 2.0 assíncrono.
- Front-end: React 19 com TypeScript estrito, Vite e Tailwind CSS.
- Design System: Paleta Aura (`brand-950` a `brand-50`, `accent-500`, semânticas `success`, `warning`, `danger`), tipografia DM Serif Display e Inter, sem dados fictícios não suportados por API.
- Mobile-first: Áreas mínimas de toque 44x44px, grid de produtos 2 colunas mobile / 4 colunas desktop, sem scroll horizontal em tarefas essenciais.
- Concorrência & Estoque: Exibição clara de estoque crítico (`<= 3` unidades) e esgotado (`0`), respeito às travas atômicas Redis e `Idempotency-Key` UUIDv4 no checkout.

## Review Focus

- Preço mínimo maior que preço máximo no filtro de catálogo: interface deve normalizar ou exibir aviso claro sem quebrar a query.
- Falha na consulta de CEP ou na rota de pedidos de cliente não logado: deve manter fallback elegante e exigir identificação sem bloquear a tela.
- Liberação ou exclusão de categoria contendo produtos associados: confirmação com aviso de impacto visual e bloqueio se não autorizado.
- Concorrência de estoque na venda balcão da vendedora: tratamento de status `409 Conflict` informando esgotamento imediato.
- Responsividade da sidebar administrativa em telas móveis: fechamento automático do drawer ao navegar por rotas.

---

### Task 1: Toast Notification System & Feedback Infrastructure

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
Expected: FAIL com erro de módulo `ToastContext` não encontrado.

- [ ] **Step 3: Implement `ToastProvider`, `Toast` and `useToast`**

Implementar `ToastContext.tsx` e `Toast.tsx` com auto-dismiss após 3.5s, animação respeitando `prefers-reduced-motion` e suporte a tipos (`success`, `warning`, `error`, `info`).

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/context/__tests__/ToastContext.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/context/ToastContext.tsx Front/src/components/common/Toast.tsx Front/src/context/__tests__/ToastContext.test.tsx
git commit -m "feat(front): adicionar sistema de notificações toast e contexto global"
```

---

### Task 2: Advanced Price Range Filter & Mobile FilterSheet Component

**Files:**
- Create: `Front/src/components/client/FilterSheet.tsx`
- Modify: `Front/src/pages/client/HomePage.tsx`
- Test: `Front/src/components/client/__tests__/FilterSheet.test.tsx`

**Interfaces:**
- Consumes: `Category` de `Front/src/types/product.ts`, `Button`, `Input`.
- Produces: `FilterSheet` aceitando `isOpen`, `onClose`, `categories`, `selectedCategorySlug`, `minPrice`, `maxPrice`, `onApplyFilters(filters)`, `onClearFilters()`.

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

  it('renderiza categorias e campos de preço e aplica filtros', () => {
    const handleApply = vi.fn();
    const handleClose = vi.fn();

    render(
      <FilterSheet
        isOpen={true}
        onClose={handleClose}
        categories={categories}
        selectedCategorySlug="skincare"
        minPrice={20}
        maxPrice={150}
        onApplyFilters={handleApply}
        onClearFilters={vi.fn()}
      />
    );

    expect(screen.getByText('Filtros do Catálogo')).toBeInTheDocument();
    expect(screen.getByText('Skincare')).toBeInTheDocument();

    const applyButton = screen.getByText('Aplicar Filtros');
    fireEvent.click(applyButton);

    expect(handleApply).toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/components/client/__tests__/FilterSheet.test.tsx`
Expected: FAIL com módulo `FilterSheet` não encontrado.

- [ ] **Step 3: Implement `FilterSheet.tsx` and integrate into `HomePage.tsx`**

Implementar gaveta inferior/modal mobile com inputs de preço mínimo/máximo, chips de categoria, botões "Limpar" e "Aplicar Filtros". Em `HomePage.tsx`, conectar estado de `minPrice` e `maxPrice` à chamada `productApi.getProducts({ min_price, max_price })`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/components/client/__tests__/FilterSheet.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/client/FilterSheet.tsx Front/src/pages/client/HomePage.tsx Front/src/components/client/__tests__/FilterSheet.test.tsx
git commit -m "feat(front): adicionar filtro de faixa de preço e bottom sheet mobile"
```

---

### Task 3: Client Order Tracking & Order History Pages

**Files:**
- Create: `Front/src/pages/client/ClientOrdersPage.tsx`
- Create: `Front/src/pages/client/OrderTrackingPage.tsx`
- Modify: `Front/src/services/orderApi.ts`
- Test: `Front/src/pages/client/__tests__/ClientOrdersPage.test.tsx`
- Test: `Front/src/pages/client/__tests__/OrderTrackingPage.test.tsx`

**Interfaces:**
- Consumes: `orderApi.getMyOrders()`, `orderApi.getOrder(orderId)`, `OrderStepper`, `Badge`.
- Produces: Telas de histórico do cliente (`/meus-pedidos`) e rastreamento unitário (`/pedidos/:id`).

- [ ] **Step 1: Write the failing tests**

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
  it('renderiza lista de pedidos do cliente com status e valor', async () => {
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

Implementar chamada `GET /orders` autenticada no `orderApi.ts`. Criar `ClientOrdersPage.tsx` com lista paginada, busca por código para visitantes, status stepper e link de suporte WhatsApp com ID do pedido. Criar `OrderTrackingPage.tsx` acessível via `/pedidos/:id`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/pages/client/__tests__/ClientOrdersPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/services/orderApi.ts Front/src/pages/client/ClientOrdersPage.tsx Front/src/pages/client/OrderTrackingPage.tsx Front/src/pages/client/__tests__/ClientOrdersPage.test.tsx
git commit -m "feat(front): adicionar páginas de histórico e rastreamento de pedidos"
```

---

### Task 4: Backend Admin Categories Router & Frontend Category API Integration

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
      data: { category_id: 10, name: 'Unhas', slug: 'unhas' },
    });

    const result = await adminApi.createCategory({ name: 'Unhas', slug: 'unhas' });
    expect(apiClient.post).toHaveBeenCalledWith('/admin/categories', { name: 'Unhas', slug: 'unhas' });
    expect(result.name).toBe('Unhas');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/services/__tests__/adminApiCategories.test.ts`
Expected: FAIL com `createCategory is not a function`.

- [ ] **Step 3: Implement backend category router and frontend methods**

1. Em `Back/dtos/category_dto.py`, adicionar schema `CategoryCreateRequest(name: str, slug: Optional[str] = None)`.
2. Criar `Back/routers/admin_category_router.py` com `POST` e `DELETE`.
3. Registrar em `Back/main.py` com prefixo `/api/admin/categories`.
4. Em `Front/src/services/adminApi.ts`, adicionar `createCategory` e `deleteCategory`.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/services/__tests__/adminApiCategories.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Back/routers/admin_category_router.py Back/dtos/category_dto.py Back/main.py Front/src/services/adminApi.ts Front/src/services/__tests__/adminApiCategories.test.ts
git commit -m "feat(api): implementar router administrativo de categorias e integração no front"
```

---

### Task 5: Admin Layout with Responsive Mobile Drawer & Topbar Navigation

**Files:**
- Create: `Front/src/components/admin/AdminLayout.tsx`
- Create: `Front/src/components/admin/AdminTopbar.tsx`
- Modify: `Front/src/components/admin/AdminSidebar.tsx`
- Test: `Front/src/components/admin/__tests__/AdminLayout.test.tsx`

**Interfaces:**
- Consumes: `useAuth()`, Lucide React (`Menu`, `X`, `LayoutDashboard`, `Package`, `FolderTree`, `ShoppingCart`, `Boxes`, `Lock`, `BarChart3`).
- Produces: `AdminLayout` envolvendo páginas administrativas com topbar, sidebar responsiva e drawer mobile.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/components/admin/__tests__/AdminLayout.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import AdminLayout from '../AdminLayout';

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    adminUser: { id: 1, name: 'Gestor Geral', role: 'SuperAdmin' },
    adminLogout: vi.fn(),
  }),
}));

describe('AdminLayout', () => {
  it('renderiza os 7 itens de menu no sidebar e abre menu no mobile', () => {
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

Implementar topbar com botão hamburger mobile, título da seção, link "Ver Loja" e perfil. Na sidebar, consolidar as 7 seções recomendadas pela especificação. No layout, sincronizar fechamento automático do drawer ao trocar de rota.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/components/admin/__tests__/AdminLayout.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/components/admin/AdminLayout.tsx Front/src/components/admin/AdminTopbar.tsx Front/src/components/admin/AdminSidebar.tsx Front/src/components/admin/__tests__/AdminLayout.test.tsx
git commit -m "feat(admin): implementar layout administrativo unificado com drawer mobile e topbar"
```

---

### Task 6: Admin Categories Management Page

**Files:**
- Create: `Front/src/pages/admin/AdminCategoriesPage.tsx`
- Test: `Front/src/pages/admin/__tests__/AdminCategoriesPage.test.tsx`

**Interfaces:**
- Consumes: `productApi.getCategories()`, `adminApi.createCategory`, `adminApi.deleteCategory`, `AdminLayout`, `Modal`, `Button`, `Input`.
- Produces: Rota administrativa `/admin/categorias` para visualização e criação de categorias.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/pages/admin/__tests__/AdminCategoriesPage.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

describe('AdminCategoriesPage', () => {
  it('lista as categorias e exibe botão para cadastrar nova categoria', async () => {
    render(
      <BrowserRouter>
        <AdminCategoriesPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Gestão de Categorias')).toBeInTheDocument();
    expect(await screen.findByText('Skincare Facial')).toBeInTheDocument();
    expect(screen.getByText('Nova Categoria')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminCategoriesPage.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `AdminCategoriesPage.tsx`**

Implementar tabela paginada com colunas ID, Nome, Slug e Ações. Modal de criação de categoria com validação de nome e auto-geração de slug. Confirmação segura para exclusão.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminCategoriesPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/pages/admin/AdminCategoriesPage.tsx Front/src/pages/admin/__tests__/AdminCategoriesPage.test.tsx
git commit -m "feat(admin): criar página de gestão de categorias de cosméticos"
```

---

### Task 7: Admin Physical Stock / Inventory Management Page

**Files:**
- Create: `Front/src/pages/admin/AdminInventoryStockPage.tsx`
- Test: `Front/src/pages/admin/__tests__/AdminInventoryStockPage.test.tsx`

**Interfaces:**
- Consumes: `productApi.getProducts()`, `adminApi.updateProduct()`, `AdminLayout`, `Badge`, `Button`.
- Produces: Rota `/admin/estoque` para acompanhamento de estoque físico, alertas de reposição e ajuste rápido.

- [ ] **Step 1: Write the failing test**

```tsx
// Front/src/pages/admin/__tests__/AdminInventoryStockPage.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { AdminInventoryStockPage } from '../AdminInventoryStockPage';

vi.mock('../../../services/productApi', () => ({
  productApi: {
    getProducts: vi.fn().mockResolvedValue({
      items: [
        { product_id: 1, name: 'Sérum Vitamina C', brand: 'Aura Derm', price: 89.9, stock_quantity: 2, is_active: true },
        { product_id: 2, name: 'Batom Matte Velvet', brand: 'Aura Glow', price: 49.9, stock_quantity: 35, is_active: true },
      ],
      total: 2,
    }),
    getCategories: vi.fn().mockResolvedValue([]),
  },
}));

vi.mock('../../../context/AuthContext', () => ({
  useAuth: () => ({
    adminUser: { id: 1, name: 'Admin', role: 'SuperAdmin' },
    adminLogout: vi.fn(),
  }),
}));

describe('AdminInventoryStockPage', () => {
  it('exibe cosméticos com status de estoque crítico e permite filtrar', async () => {
    render(
      <BrowserRouter>
        <AdminInventoryStockPage />
      </BrowserRouter>
    );

    expect(screen.getByText('Gestão e Controle de Estoque')).toBeInTheDocument();
    expect(await screen.findByText('Sérum Vitamina C')).toBeInTheDocument();
    expect(screen.getByText('Estoque Crítico')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminInventoryStockPage.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement `AdminInventoryStockPage.tsx`**

Implementar tabela completa com colunas de Imagem, Produto, Marca, Saldo em Estoque, Status (Normal, Baixo `<= 3`, Esgotado) e Ação de ajuste de saldo. Botões de filtro rápido: "Todos os Itens", "Apenas Estoque Crítico (<= 3)", "Esgotados". Modal rápido para atualização de quantidade.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminInventoryStockPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/pages/admin/AdminInventoryStockPage.tsx Front/src/pages/admin/__tests__/AdminInventoryStockPage.test.tsx
git commit -m "feat(admin): criar página de gestão de estoque físico e alertas críticos"
```

---

### Task 8: Admin Reports & Sales Analytics Page

**Files:**
- Create: `Front/src/pages/admin/AdminReportsPage.tsx`
- Test: `Front/src/pages/admin/__tests__/AdminReportsPage.test.tsx`

**Interfaces:**
- Consumes: `adminApi.getSalesMetrics()`, `adminApi.getSalesChart()`, `adminApi.getOrders()`, `AdminLayout`, `KpiCard`.
- Produces: Rota `/admin/relatorios` para análise gerencial, faturamento por período e ranking de vendas.

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

Implementar visão analítica com filtro por período (7, 15, 30 dias), KPIs detalhados (Faturamento Total, Ticket Médio, Conversão, Volume de Pedidos), gráfico de evolução diária e tabela de cosméticos mais procurados/vendidos.

- [ ] **Step 4: Run test to verify it passes**

Run: `cd Front && npx vitest run src/pages/admin/__tests__/AdminReportsPage.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/pages/admin/AdminReportsPage.tsx Front/src/pages/admin/__tests__/AdminReportsPage.test.tsx
git commit -m "feat(admin): criar página de relatórios analíticos e métricas financeiras"
```

---

### Task 9: Interface da Vendedora (Portal da Revendedora)

**Files:**
- Create: `Front/src/pages/vendedora/VendedoraPortalPage.tsx`
- Create: `Front/src/components/vendedora/VendedoraHeader.tsx`
- Create: `Front/src/components/vendedora/ProfitCalculator.tsx`
- Create: `Front/src/components/vendedora/WhatsAppShareModal.tsx`
- Create: `Front/src/components/vendedora/QuickOrderModal.tsx`
- Modify: `Front/src/components/client/Header.tsx`
- Modify: `Front/src/pages/client/HomePage.tsx`
- Test: `Front/src/pages/vendedora/__tests__/VendedoraPortalPage.test.tsx`
- Test: `Front/src/components/vendedora/__tests__/ProfitCalculator.test.tsx`

**Interfaces:**
- Consumes: `productApi.getProducts()`, `checkoutApi.directCheckout()`, `Product`, `useToast`.
- Produces: Rota `/vendedora` com abas (Meu Painel, Catálogo & Divulgação, Calculadora de Lucro, Venda Balcão, Encomendas) e atalho de navegação no cabeçalho e rodapé da loja.

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

    // Com margem padrão de 30%, lucro = 300
    expect(screen.getByText('R$ 300,00')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd Front && npx vitest run src/components/vendedora/__tests__/ProfitCalculator.test.tsx`
Expected: FAIL com módulo não encontrado.

- [ ] **Step 3: Implement Vendedora Portal, Calculator, WhatsApp Sharer and Quick Order**

1. `ProfitCalculator.tsx`: simulador interativo de vendas com seleção de comissão (20%, 30%, 35%, 40%), cálculo de lucro líquido e custo de reposição.
2. `WhatsAppShareModal.tsx`: gerador de mensagens persuasivas para WhatsApp com link de recomendação da revendedora (`?ref=vendedora`).
3. `QuickOrderModal.tsx`: lançamento ágil de pedido no balcão com geração instantânea de Pix para a cliente.
4. `VendedoraPortalPage.tsx`: painel integrando as 5 ferramentas com design elegante e acolhedor.
5. Adicionar link "Área da Revendedora" no `Header.tsx` e `HomePage.tsx`.

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd Front && npx vitest run src/components/vendedora/__tests__/ProfitCalculator.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add Front/src/pages/vendedora/ Front/src/components/vendedora/ Front/src/components/client/Header.tsx Front/src/pages/client/HomePage.tsx
git commit -m "feat(vendedora): criar portal completo da revendedora com calculadora e gerador whatsapp"
```

---

### Task 10: App Routing Integration & End-to-End Verification

**Files:**
- Modify: `Front/src/App.tsx`
- Test: `cd Front && npm test`
- Verification: `cd Front && npm run build`

**Interfaces:**
- Consumes: Todas as rotas criadas nas tasks anteriores.
- Produces: SPA 100% integrada com proteção de rotas, contexto de toast e todas as páginas navegáveis.

- [ ] **Step 1: Integrate routes in `Front/src/App.tsx`**

Adicionar as novas rotas no `App.tsx`:
- `/meus-pedidos` -> `<ClientOrdersPage />`
- `/pedidos/:id` -> `<OrderTrackingPage />`
- `/vendedora` -> `<VendedoraPortalPage />`
- `/admin/categorias` -> `<AdminRouteGuard><AdminCategoriesPage /></AdminRouteGuard>`
- `/admin/estoque` -> `<AdminRouteGuard><AdminInventoryStockPage /></AdminRouteGuard>`
- `/admin/relatorios` -> `<AdminRouteGuard><AdminReportsPage /></AdminRouteGuard>`
- Envolver `App` com `<ToastProvider>`.

- [ ] **Step 2: Run all front-end tests**

Run: `cd Front && npm test`
Expected: Todos os testes executados com sucesso (100% PASS).

- [ ] **Step 3: Run front-end build**

Run: `cd Front && npm run build`
Expected: TypeScript check `tsc` e Vite build concluídos com sucesso sem erros ou warnings de tipo.

- [ ] **Step 4: Verify live backend integration in Docker**

Run: `curl -s http://localhost:8000/api/health` e conferir status do container backend.
Expected: `{"status":"healthy","service":"cosmetics-ecommerce"}`

- [ ] **Step 5: Commit**

```bash
git add Front/src/App.tsx
git commit -m "feat(app): integrar todas as novas rotas de cliente, admin e vendedora"
```
