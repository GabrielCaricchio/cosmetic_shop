# DOCUMENTO DE REQUISITOS DO PRODUTO (PRD) & ESPECIFICAÇÃO DE ARQUITETURA
## Plataforma de E-Commerce de Alta Escala para Revendedoras de Cosméticos

---

### 1. Visão Geral
Plataforma de e-commerce de alta performance e escala desenhada especificamente para revendedoras de cosméticos multimarca. Projetada para sustentar uma volumetria de **50.000 acessos diários** (~2.100 acessos/hora em média, com picos de 10.000 req/hora em datas sazonais e lançamentos de catálogos).

O sistema automatiza integralmente a jornada de compras no e-commerce (descoberta, busca tolerante a erros, carrinho, checkout direto e pagamento Pix instantâneo), desafoga o atendimento manual e mantém uma integração humanizada com suporte direto via WhatsApp.

---

### 2. Pilares Tecnológicos & Versões Obrigatórias

- **Back-end**: **Python 3.14** com **FastAPI** (execução assíncrona orientada a eventos com `uvicorn` e `asyncio`).
- **Front-end**: **React 19** com **Node 24 LTS**, **TypeScript 5.x**, **Vite** e **Tailwind CSS** (SPA mobile-first de ultrabaixa latência).
- **Banco de Dados**: **PostgreSQL 16+** com extensões `uuid-ossp` e `pg_trgm` (índices GiST para busca trigramática tolerante a erros). SQLAlchemy 2.0 assíncrono (`asyncpg`) estruturado para separação de conexões de escrita (Master) e leitura (Read Replicas).
- **Cache & Concorrência Distribuída**: **Redis 7+** (`redis-py` assíncrono) para travas atômicas via scripts Lua, gerenciamento de sessões de carrinho, controle de idempotência e cache de catálogo.
- **Segurança & Criptografia**: Hashing de senhas com algoritmo **Argon2id** (`argon2-cffi`), tokens de acesso JWT assinado com algoritmo assimétrico/simétrico e conformidade estrita com a **LGPD** (minimização de dados pessoais e consentimento explícito).
- **Infraestrutura**: Frontend pronto para hospedagem Vercel / Cloudflare Pages; Backend preparado para containers Docker e orquestração leve (Hostinger Cloud / VPS / Render / AWS).

---

### 3. Requisitos Funcionais & Regras de Negócio Críticas

#### 3.1 Catálogo, Navegação e Busca Fuzzy Inteligente
- **Vitrine Tradicional e Otimizada**: Exibição de cosméticos em grid responsivo com imagens em lazy loading, marca, volumetria (ml/g), selo de categoria e preço.
- **Busca Tolerante a Erros de Digitação**: Busca inteligente no PostgreSQL via extensão `pg_trgm` com operador de similaridade (`%`) e índice GiST. Permite encontrar produtos cosméticos com erros comuns de digitação em smartphones (ex: "baton", "protetor sollar", "rimmel", "shampo").
- **Paginação e Filtros Rápidos**: Paginação assíncrona rápida com filtros combinados por categoria, faixa de preço e ordenação (menor preço, mais vendidos, lançamentos).
- **Dupla Visão de Sistema**:
  - Visão Cliente: Foco em conversão mobile-first, descoberta rápida e finalização sem atrito.
  - Visão Administrador: Painel protegido por RBAC para gestão de catálogo, fotos, inventário, pedidos e métricas de vendas.

#### 3.2 Fluxo de Compra e Gestão de Carrinho
- **Interação Desconectada (Guest Browsing)**: O usuário navega, filtra, busca e adiciona cosméticos ao carrinho sem necessidade de cadastro ou login prévio. O carrinho de visitantes é preservado via sessão local/Redis.
- **Autenticação no Checkout**: O login ou cadastro rápido é exigido apenas no momento de fechar o pedido, reduzindo a taxa de abandono de carrinho.
- **Checkout Direto (1-Click Buy)**: Botão "Comprar Agora" na Página de Detalhes do Produto (PDP) que direciona o comprador diretamente para o resumo de pagamento do item escolhido, sem etapas intermediárias.

#### 3.3 Concorrência Rigorosa e Prevenção de Overselling
- **Cenário de Concorrência Extrema**: Quando restar apenas 1 unidade de um cosmético no estoque e 2 ou mais usuários tentarem finalizar a compra simultaneamente, **apenas 1 usuário conseguirá reservar e pagar**. O outro receberá notificação imediata de estoque esgotado.
- **Trava Temporária de Estoque via Redis**:
  - Ao iniciar a submissão do pedido, um **Script Lua atômico no Redis** decrementa o estoque virtual e cria a reserva vinculada ao `order_id` com TTL configurado por método de pagamento:
    - **Pix**: 30 minutos (TTL = 1.800 segundos).
    - **Cartão de Crédito**: 40 minutos (TTL = 2.400 segundos).
    - **Boleto Bancário**: 1 a 3 dias úteis.
- **Reconciliação e Rollback Automático**:
  - Se o pagamento for recusado pelo gateway ou o prazo do Pix expirar (timeout de 30 min), a trava no Redis é liberada imediatamente de forma autônoma, restaurando a disponibilidade do cosmético no catálogo.
  - Se o pagamento for aprovado pelo gateway (via Webhook), uma transação isolada no PostgreSQL consolida a baixa física no estoque (`products.stock_quantity`) e descarta a reserva provisória do Redis.
- **Idempotência de Requisição**:
  - Toda chamada de checkout exige o envio do cabeçalho `Idempotency-Key` (UUIDv4 gerado pelo frontend). Evita pedidos e cobranças duplicadas sob cliques duplos do usuário ou instabilidades de conexão móvel.

#### 3.4 Máquina de Estados do Pedido
Os pedidos transitam estritamente pelos seguintes estados:
- `pending`: Pedido gerado; estoque reservado no Redis com contador regressivo (30 min para Pix).
- `processing`: Gateway recebeu a transação e está processando a liquidação.
- `under_review`: Transação em análise manual ou antifraude.
- `approved`: Pagamento confirmado; baixa definitiva de estoque efetuada; pedido apto para separação.
- `rejected`: Pagamento recusado pela instituição financeira; estoque liberado instantaneamente via rollback.
- `cancelled`: Pedido cancelado por timeout (falta de pagamento após 30 min) ou ação manual; trava de estoque estornada.
- `refunded`: Pagamento devolvido ao cliente; estorno registrado no sistema.

#### 3.5 Integração com Gateways de Pagamento & Pix
- Conexão nativa com provedores de pagamento brasileiros (Mercado Pago, Pagar.me ou Adyen).
- **Pix Obrigatório**:
  - Geração instantânea de QRCode (imagem base64) e código "Pix Copia e Cola".
  - Endpoint de Webhook assinado para confirmação passiva e polling reativo no frontend para notificação visual imediata de "Pagamento Aprovado" sem recarregar a página.

#### 3.6 Atendimento Humanizado (WhatsApp)
- Transição fluida para WhatsApp com mensagens personalizadas geradas via rota `/api/whatsapp-redirect`:
  - Dúvida sobre produto: mensagem já inclui o nome do cosmético e o link da página.
  - Dúvida sobre pedido: mensagem já inclui o código do pedido (`order_id`) e status atual.

---

### 4. Especificações Detalhadas de Interface Gráfica (GUI)

#### 4.1 Interface do Cliente (Mobile-First SPA)

```
+-------------------------------------------------------------+
| [Logo Cosméticos]     [Pesquisa inteligente...]     [Cart 3]|
+-------------------------------------------------------------+
| (Todos) (Skincare) (Maquiagem) (Cabelos) (Perfumes) (Corpo) |
+-------------------------------------------------------------+
|  BANNER PROMOCIONAL / LANÇAMENTOS DO MÊS (Carrossel)        |
+-------------------------------------------------------------+
|  +--------------------+         +--------------------+      |
|  | [Foto Cosmético]   |         | [Foto Cosmético]   |      |
|  | Marca - Linha      |         | Marca - Linha      |      |
|  | Sérum Vitamina C   |         | Batom Líquido Matte|      |
|  | R$ 79,90           |         | R$ 34,90           |      |
|  | [Últimas Unidades] |         | [Em Estoque]       |      |
|  | [Adicionar +]      |         | [Adicionar +]      |      |
|  +--------------------+         +--------------------+      |
+-------------------------------------------------------------+
| [Suporte WhatsApp Flutuante]                                |
+-------------------------------------------------------------+
```

1. **Header e Barra de Busca**:
   - Logomarca da revendedora.
   - Barra de busca sticky com debounce de 300ms e dropdown de sugestões em tempo real.
   - Pílulas horizontais de categorias de cosméticos com rolagem suave.
   - Ícone do carrinho com badge animado de quantidade.
   - Botão de acesso à conta do cliente ("Entrar" / "Meu Perfil").

2. **Vitrine e Catálogo**:
   - Layout em grid (2 colunas no mobile, 4 colunas no desktop).
   - Card de produto: Imagem otimizada, marca, nome em destaque, preço, badge de disponibilidade ("Últimas 2 unidades", "Esgotado") e botão de adição rápida.

3. **Página de Detalhes do Produto (PDP)**:
   - Galeria de fotos do cosmético com miniaturas e zoom touch.
   - Título, SKU, marca e categoria.
   - Preço à vista no Pix com destaque e simulação de parcelas.
   - Seletor de quantidade com limite travado no estoque real disponível.
   - **Botão Principal CTA**: "Comprar Agora" (Checkout Direto em 1 clique).
   - **Botão Secundário**: "Adicionar ao Carrinho" (abre gaveta lateral sem sair da página).
   - Link de suporte: "Dúvidas sobre o produto? Fale com a revendedora no WhatsApp".
   - Abas sanfonadas de informações: Descrição, Modo de Aplicação, Ingredientes/Composição (crucial para cosméticos e alergias) e Prazo de Validade.

4. **Gaveta e Página de Carrinho (Cart Drawer)**:
   - Lista deslizante de itens com thumbnail, nome, preço unitário, botões +/- para alterar quantidade e botão de lixeira.
   - Cálculo dinâmico de subtotal e frete.
   - Botão destacado "Avançar para o Pagamento".

5. **Modal/Página de Autenticação e LGPD**:
   - Abas "Entrar" e "Criar Conta".
   - Cadastro ágil: Nome, e-mail, telefone (WhatsApp) e senha criptografada via Argon2.
   - Checkbox obrigatório de consentimento LGPD: *"Concordo com os Termos e com o tratamento dos meus dados para fins de compra conforme a LGPD"*.

6. **Checkout & Tela de Pagamento Pix**:
   - Formulário de endereço de entrega com busca automática de logradouro via CEP.
   - Seleção da forma de pagamento (destaque visual para Pix com aprovação em segundos).
   - Resumo claro de valores com chave de idempotência gerada no frontend.
   - **Bloco de Pagamento Pix**:
     - Temporizador regressivo em destaque ("Pague em até 29:59 minutos para garantir seus itens").
     - Imagem do QR Code renderizada para leitura por aplicativo bancário.
     - Botão "Copiar Chave Pix (Copia e Cola)" com feedback visual ("Chave copiada!").
     - Polling de verificação de pagamento assíncrono: ao aprovar, a tela transita automaticamente para sucesso com animação de celebração.

7. **Acompanhamento de Pedido**:
   - Número do pedido, status visual em esteira (`Pendente` -> `Aprovado` -> `Em Separação` -> `Enviado`), código de rastreamento e resumo dos cosméticos.

---

#### 4.2 Interface do Administrador (Backoffice GUI)

```
+-------------------------------------------------------------+
| [Painel Cosméticos Admin]        [Notificações] [Perfil Sair]
+-------------------------------------------------------------+
| [Menu Lateral]  | [Dashboard Analítico de Vendas]           |
| - Dashboard     | Total Vendas Hoje: R$ 4.820,00 (34 ped.)  |
| - Cosméticos    | Taxa de Conversão: 4.2%                   |
| - Categorias    | Estoque Crítico: 3 itens precisam reposição|
| - Pedidos       | ----------------------------------------- |
| - Concorrência  | [Gráfico de Faturamento - Últimos 7 dias]  |
| - Relatórios    | ----------------------------------------- |
|                 | [Últimos Pedidos em Tempo Real (Tabela)]  |
+-------------------------------------------------------------+
```

1. **Autenticação Administrativa & RBAC**:
   - Acesso em `/admin/login` com validação de perfil (`SuperAdmin`, `Admin`, `Operator`).
   - Proteção de rotas no frontend (`AdminRouteGuard`) e dependência FastAPI no backend (`require_admin_role`).

2. **Dashboard Analítico (KPIs)**:
   - Faturamento do dia, quantidade de pedidos e ticket médio.
   - Alertas imediatos de produtos com estoque baixo (<= 3 unidades).
   - Gráfico de evolução de vendas e conversão.

3. **Gestão de Catálogo de Cosméticos**:
   - Tabela paginada com ordenação, filtro por categoria e busca rápida.
   - **Modal de Cadastro/Edição de Produto**:
     - Nome do cosmético, marca, categoria, preço de venda, estoque inicial.
     - Descrição detalhada e composição química/ingredientes.
     - Upload múltiplo de fotos com preview em tempo real e seleção da imagem principal.

4. **Monitor de Reservas e Concorrência**:
   - Tela de auditoria de travas ativas no Redis: visualização de produtos sob reserva em checkouts correntes, tempo restante de TTL e botão de liberação forçada em caso de anomalia.

5. **Gestão de Pedidos do Backoffice**:
   - Listagem com abas por status (`pending`, `approved`, `cancelled`, etc.).
   - Visualização dos itens comprados, dados do cliente e comprovante de pagamento.
   - Ações de atualização de status (ex: "Despachar pedido", "Cancelar e estornar estoque").

---

### 5. Arquitetura de Software: Separação Estrita de Responsabilidades

Para garantir arquivos pequenos, alta coesão, baixo acoplamento e facilidade de testes automatizados, o código é estritamente dividido por responsabilidades.

#### 5.1 Back-end (Python 3.14 + FastAPI + SQLAlchemy 2.0 + Redis)

```
Back/
├── core/
│   ├── config.py              # Configurações do app e variáveis de ambiente (Pydantic Settings)
│   ├── database.py            # Async engine, sessionmaker e controle Master/Replica
│   ├── redis_client.py        # Conexão assíncrona ao Redis e health check
│   ├── security.py            # Hashing Argon2id e geração/validação de tokens JWT
│   ├── dependencies.py        # Injeção de dependências FastAPI (get_db, get_current_user, require_admin)
│   └── exceptions.py          # Exceções de domínio customizadas e handlers HTTP globais
├── models/
│   ├── base.py                # Base declarativa do SQLAlchemy com timestamps
│   ├── client_model.py        # Entidade de Clientes
│   ├── admin_model.py         # Entidade de Administradores
│   ├── category_model.py      # Entidade de Categorias de Cosméticos
│   ├── product_model.py       # Entidade de Produtos e índice GiST trigram
│   ├── product_image_model.py # Entidade de Imagens dos Produtos
│   ├── order_model.py         # Entidade de Pedidos e Enum de Estados
│   ├── order_item_model.py    # Entidade de Itens do Pedido
│   └── payment_model.py       # Entidade de Pagamentos Pix / Cartão
├── dtos/
│   ├── auth_dto.py            # Schemas Pydantic para registro, login e tokens
│   ├── category_dto.py        # Schemas para listagem e criação de categorias
│   ├── product_dto.py         # Schemas para catálogo, filtros e busca
│   ├── cart_dto.py            # Schemas para itens do carrinho e cálculos
│   ├── checkout_dto.py        # Schemas para submissão com Idempotency-Key
│   ├── order_dto.py           # Schemas para acompanhamento e status
│   └── admin_dto.py           # Schemas para relatórios e métricas de vendas
├── repositories/
│   ├── client_repo.py         # Operações de banco para clientes
│   ├── admin_repo.py          # Operações de banco para administradores
│   ├── category_repo.py       # Operações de banco para categorias
│   ├── product_repo.py        # Queries de produtos com similaridade pg_trgm
│   ├── order_repo.py          # Criação e atualização de status de pedidos
│   └── payment_repo.py        # Registro e atualização de pagamentos
├── services/
│   ├── auth_service.py        # Regra de negócio de autenticação e validação LGPD
│   ├── catalog_service.py     # Busca fuzzy, paginação e detalhes de produtos
│   ├── cart_service.py        # Gerenciamento de itens no Redis/Sessão
│   ├── stock_lock_service.py  # Script Lua de reserva atômica e rollback de estoque
│   ├── payment_service.py     # Geração de Pix e integração com Gateway
│   ├── checkout_service.py    # Orquestração do checkout com trava e idempotência
│   └── report_service.py      # Agregação analítica para o dashboard admin
├── routers/
│   ├── auth_router.py         # /api/register, /api/login, /api/me
│   ├── catalog_router.py      # /api/categories, /api/products, /api/products/{id}
│   ├── cart_router.py         # /api/cart, /api/cart/items
│   ├── checkout_router.py     # /api/checkout, /api/checkout/direct
│   ├── order_router.py        # /api/orders, /api/orders/{id}
│   ├── webhook_router.py      # /api/webhooks/payment
│   ├── support_router.py      # /api/whatsapp-redirect
│   ├── admin_auth_router.py   # /api/admin/login
│   ├── admin_product_router.py# /api/admin/products
│   ├── admin_order_router.py  # /api/admin/orders
│   └── admin_report_router.py # /api/admin/reports/sales
├── tests/
│   ├── conftest.py            # Fixtures de banco em memória / testcontainers e mock redis
│   ├── unit/                  # Testes unitários de serviços e hashing
│   ├── integration/           # Testes de rotas HTTP com FastAPI TestClient
│   └── concurrency/           # Teste de race condition (10 requests para 1 item)
├── main.py                    # Inicialização do FastAPI e inclusão de rotas
├── requirements.txt           # Dependências congeladas
└── Dockerfile                 # Multi-stage build Python 3.14
```

---

#### 5.2 Front-end (React 19 + Node 24 LTS + TypeScript + Vite)

```
Front/
├── src/
│   ├── types/
│   │   ├── auth.ts            # Tipos de Cliente, Admin e Tokens
│   │   ├── product.ts         # Tipos de Produto, Categoria e Imagens
│   │   ├── cart.ts            # Tipos de Item do Carrinho e Resumo
│   │   ├── checkout.ts        # Tipos de Endereço, Pagamento Pix e Idempotência
│   │   └── order.ts           # Tipos de Pedido, StatusEnum e Rastreamento
│   ├── services/
│   │   ├── apiClient.ts       # Instância Axios com interceptors de JWT e erros
│   │   ├── authApi.ts         # Chamadas de login, registro e dados de perfil
│   │   ├── productApi.ts      # Chamadas de catálogo e busca com debounce
│   │   ├── cartApi.ts         # Chamadas do carrinho
│   │   ├── checkoutApi.ts     # Chamadas de finalização com Idempotency-Key
│   │   ├── orderApi.ts        # Chamadas de status e pedidos do cliente
│   │   └── adminApi.ts        # Chamadas do painel administrativo
│   ├── context/
│   │   ├── AuthContext.tsx    # Contexto global de autenticação (cliente e admin)
│   │   └── CartContext.tsx    # Contexto reativo de itens do carrinho
│   ├── hooks/
│   │   ├── useDebounce.ts     # Hook utilitário para busca textual com atraso
│   │   ├── useCountdown.ts    # Hook de temporizador regressivo (30 min Pix)
│   │   └── useOrderPolling.ts # Hook de escuta ativa de confirmação de pagamento
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx     # Botão reutilizável com estados de loading
│   │   │   ├── Input.tsx      # Campo de formulário com suporte a erros
│   │   │   ├── Badge.tsx      # Badges de estoque e status
│   │   │   ├── Modal.tsx      # Diálogo modal acessível
│   │   │   └── Spinner.tsx    # Indicador de carregamento
│   │   ├── client/
│   │   │   ├── Header.tsx     # Barra de navegação com busca integrada
│   │   │   ├── SearchBar.tsx  # Input de busca tolerante com debounce
│   │   │   ├── ProductCard.tsx# Card individual do produto de cosmético
│   │   │   ├── CartDrawer.tsx # Gaveta lateral do carrinho de compras
│   │   │   ├── PixPaymentBox.tsx # QR Code, Copia-e-Cola e temporizador
│   │   │   ├── OrderStepper.tsx # Linha do tempo de status do pedido
│   │   │   └── WhatsAppButton.tsx # Botão flutuante de suporte
│   │   └── admin/
│   │       ├── AdminSidebar.tsx # Menu lateral do backoffice
│   │       ├── KpiCard.tsx      # Card de métrica analítica
│   │       ├── ProductModal.tsx # Modal de criação e edição com upload
│   │       ├── ProductRow.tsx   # Linha da tabela de produtos
│   │       └── OrderDetailsModal.tsx # Detalhes do pedido para o lojista
│   ├── pages/
│   │   ├── client/
│   │   │   ├── HomePage.tsx
│   │   │   ├── ProductDetailPage.tsx
│   │   │   ├── CartPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   ├── OrderSuccessPage.tsx
│   │   │   └── AuthPage.tsx
│   │   └── admin/
│   │       ├── AdminLoginPage.tsx
│   │       ├── AdminDashboardPage.tsx
│   │       ├── AdminProductsPage.tsx
│   │       ├── AdminOrdersPage.tsx
│   │       └── AdminInventoryPage.tsx
│   ├── App.tsx                # Configuração do React Router v7 com guards
│   ├── main.tsx               # Ponto de entrada do React 19
│   └── index.css              # Configurações do Tailwind CSS
├── package.json               # Scripts e dependências com Node 24 LTS
├── tsconfig.json              # Configurações estritas do TypeScript
└── vite.config.ts             # Configuração do Vite com proxy para o backend
```

---

### 6. Modelo Físico de Dados Relacional (PostgreSQL 16+)

```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Clientes
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    lgpd_consent BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_clients_email ON clients (email);

-- Administradores
CREATE TABLE administrators (
    admin_id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'Admin',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_administrators_email ON administrators (email);

-- Categorias de Cosméticos
CREATE TABLE categories (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Cosméticos e Produtos
CREATE TABLE products (
    product_id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(category_id) ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(280) UNIQUE NOT NULL,
    brand VARCHAR(100) NOT NULL,
    description TEXT,
    ingredients TEXT,
    price NUMERIC(10, 2) NOT NULL CHECK (price >= 0),
    stock_quantity INT NOT NULL CHECK (stock_quantity >= 0),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_products_name_trgm ON products USING gist (name gist_trgm_ops);
CREATE INDEX idx_products_category ON products (category_id);
CREATE INDEX idx_products_is_active ON products (is_active);

-- Imagens do Produto
CREATE TABLE product_images (
    image_id SERIAL PRIMARY KEY,
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE CASCADE,
    image_url VARCHAR(500) NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    display_order INT DEFAULT 0
);
CREATE INDEX idx_product_images_product ON product_images (product_id);

-- Pedidos
CREATE TYPE order_status_enum AS ENUM (
    'pending',
    'processing',
    'under_review',
    'approved',
    'rejected',
    'cancelled',
    'refunded'
);

CREATE TABLE orders (
    order_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id INT NOT NULL REFERENCES clients(client_id) ON DELETE RESTRICT,
    total_amount NUMERIC(10, 2) NOT NULL CHECK (total_amount >= 0),
    status order_status_enum NOT NULL DEFAULT 'pending',
    shipping_address JSONB NOT NULL,
    idempotency_key VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_orders_client ON orders (client_id);
CREATE INDEX idx_orders_status ON orders (status);
CREATE INDEX idx_orders_idempotency ON orders (idempotency_key);
CREATE INDEX idx_orders_created_at ON orders (created_at DESC);

-- Itens do Pedido
CREATE TABLE order_items (
    item_id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INT NOT NULL REFERENCES products(product_id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);
CREATE INDEX idx_order_items_order ON order_items (order_id);

-- Pagamentos
CREATE TYPE payment_method_enum AS ENUM ('pix', 'credit_card', 'boleto');

CREATE TABLE payments (
    payment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(order_id) ON DELETE CASCADE,
    method payment_method_enum NOT NULL,
    gateway VARCHAR(50) NOT NULL,
    gateway_transaction_id VARCHAR(255),
    pix_qr_code_base64 TEXT,
    pix_copy_paste TEXT,
    amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_payments_order ON payments (order_id);
CREATE INDEX idx_payments_gateway_trans ON payments (gateway_transaction_id);
```

---

### 7. Script Lua de Concorrência Atômica no Redis

Para garantir que não haja overselling sob concorrência simultânea extrema de 50.000 acessos:

```lua
-- KEYS[1]: "stock:available:{product_id}" (saldo atual em cache)
-- KEYS[2]: "stock:reserved:{order_id}:{product_id}"
-- ARGV[1]: quantidade_desejada
-- ARGV[2]: ttl_segundos (1800 para Pix)

local current_stock = tonumber(redis.call('get', KEYS[1]))
if not current_stock then
    return -1 -- Chave ausente no Redis (necessita sincronização a partir do DB)
end

local requested_qty = tonumber(ARGV[1])
if current_stock >= requested_qty then
    redis.call('decrby', KEYS[1], requested_qty)
    redis.call('set', KEYS[2], requested_qty, 'EX', tonumber(ARGV[2]))
    return 1 -- Reserva garantida com sucesso!
else
    return 0 -- Saldo insuficiente! Concorrência impedida.
end
```

---

### 8. Garantia de Qualidade e Plano de Testes (QA)

1. **Testes Unitários**:
   - `tests/unit/test_security.py`: Validação de Argon2id e geração/expiração de JWT.
   - `tests/unit/test_cart_calculations.py`: Validação de subtotais e regras de negócio.
2. **Testes de Integração**:
   - `tests/integration/test_catalog_fuzzy.py`: Validação do pg_trgm garantindo que "baton" retorna produtos do tipo "Batom".
   - `tests/integration/test_checkout_flow.py`: Criação de pedido e geração de Pix.
3. **Testes de Concorrência**:
   - `tests/concurrency/test_stock_overselling.py`: 10 requisições simultâneas assíncronas para compra do último item (`stock = 1`). Apenas 1 deve obter sucesso (`202 Accepted`) e 9 devem ser rejeitadas (`409 Conflict`).
4. **Testes de Idempotência**:
   - `tests/integration/test_idempotency.py`: Duas requisições idênticas com o mesmo `Idempotency-Key` retornam a mesma resposta sem duplicar cobrança ou reserva.
