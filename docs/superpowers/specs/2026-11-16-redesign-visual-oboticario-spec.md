# 💄 Especificação de Design & Estudo de Caso — Aura Cosméticos
**Referência de Benchmark**: O Boticário, Natura & Sephora Brasil  
**Data**: 16/11/2026  
**Status**: Proposta de Design para Aprovação  

---

## 1. 📋 Análise dos Requisitos e Funções do Sistema Atual

A **Aura Cosméticos** é uma plataforma full-stack moderna de e-commerce voltada para beleza, perfumaria e cosméticos, com as seguintes capacidades fundamentais:

### 1.1 Arquitetura & Infraestrutura
- **Back-End**: Python 3.14 com FastAPI assíncrono, SQLAlchemy 2.0 (asyncpg) e PostgreSQL 16.
- **Motor de Busca Tolerante a Erros**: Extensão PostgreSQL `pg_trgm` associada a índices GiST Trigram Ops. Permite busca *fuzzy* com alta velocidade para termos comuns em cosméticos com acentos ou digitação imprecisa (ex.: *"serum hialuronico"*, *"batom vermêlho"*, *"shampoo de argan"*).
- **Anti-Overselling & Concorrência de Estoque**: Travas atômicas em Redis através de Lua Scripts (`stock_lock_service.py`), garantindo que compras simultâneas em produtos com estoque unitário ou crítico não gerem venda duplicada. TTL estrito de 30 minutos (1800s) para conclusão de Pix.
- **Checkout Idempotente**: Proteção via cabeçalho `Idempotency-Key` (UUIDv4) para conexões móveis oscilantes (3G/4G/5G).
- **Segurança & LGPD**: Hashing com Argon2id, tokens JWT stateless com RBAC (`SuperAdmin`, `Manager`, `Support`), consentimento explícito de termos e dados.
- **Backoffice Administrativo**: Gestão de catálogo, pedidos com transição logística e monitor em tempo real das travas de estoque no Redis.

### 1.2 Front-End & Experiência Atual
- **Stack**: React 19, TypeScript 5, Vite 6, Tailwind CSS 3.4 e Lucide React.
- **Fluxos Existentes**:
  - Vitrine Mobile-First (`HomePage.tsx`) com busca debounced (350ms) e filtro por categorias.
  - Página de Detalhes (`ProductDetailPage.tsx`) com galeria de fotos, acordeões dermatológicos (Modo de Uso, Ingredientes) e compra com 1 clique.
  - Sacola Lateral Deslizante (`CartDrawer.tsx`) sincronizada via `CartContext` com armazenamento local e carrinho de visitante via Redis.
  - Checkout One-Page (`CheckoutPage.tsx`) com geração dinâmica de QR Code Pix, chave Copia e Cola, contador regressivo e polling automático de status a cada 3 segundos (`useOrderPolling.ts`).
  - Confirmação de Pedido (`OrderSuccessPage.tsx`) com *Order Stepper* logístico em tempo real.

---

## 2. 📊 Estudo de Caso de Mercado (Benchmark: O Boticário, Natura e Sephora)

### 2.1 O Cenário Brasileiro de E-Commerce de Beleza
O mercado de cosméticos e cuidados pessoais no Brasil é um dos 4 maiores do mundo. O comportamento do consumidor brasileiro de beleza possui características muito particulares:
1. **Sensorialidade Visual**: O cliente não pode cheirar o perfume nem tocar na textura do creme; portanto, o visual deve transmitir *toque aveludado, frescor, luxo e eficácia*.
2. **Urgência e Ocasião de Compra**: Forte apelo para presentes (datas comemorativas, aniversários, autocuidado) e necessidade de entrega rápida.
3. **Pagamento Pix com Desconto**: O Pix é o método dominante, onde o consumidor espera confirmação instantânea e benefício claro (ex.: 5% de desconto no Pix).
4. **Mobile First**: Mais de 80% do tráfego e 70% das conversões ocorrem em smartphones.

### 2.2 Análise Comparativa de Benchmark

| Elemento | Design Atual Aura | Referência: O Boticário | Referência: Natura | Referência: Sephora |
| :--- | :--- | :--- | :--- | :--- |
| **Paleta de Cores** | Rosa genérico (`rose-500` / `#f43f5e`) | Verde Floresta Botânico (`#0F382C`), Dourado Nobre (`#C5A059`) e Creme Quente | Tons terrosos, verde oliva, texturas orgânicas e kraft sustentável | Preto, branco puro, tipografia editorial de alto contraste e dourado |
| **Top Announcement** | Inexistente (apenas header padrão) | Ticker superior fixo com Frete Grátis progressivo e cupom de boas-vindas | Banner de causa socioambiental e frete | Banner promocional de amostras grátis e programa Beauty Club |
| **Cards de Produto** | Básico com foto quadrada e botão de sacola | Badges de status ("Lançamento", "Mais Vendido"), parcelamento claro ("ou 3x de R$ X"), indicação olfativa/acabamento | Selos de sustentabilidade ("Refilável", "Vegano") | Selo de exclusividade, notas/avaliações em estrelas |
| **Sacola (Drawer)** | Lista simples de itens | Barra de progresso para Frete Grátis ("Faltam R$ 25 para Frete Grátis!"), embalagem para presente | Sugestão de refil e produtos complementares | Amostras grátis a escolher |
| **PDP (Detalhes)** | Acordeões simples | Pirâmide olfativa interativa, benefícios dermatológicos com ícones e botão fixo no rodapé mobile | Informações da biodiversidade e cadeia ética | Avaliações verificadas de clientes e swatches de cores |

---

## 3. 👤 Persona & Jornada do Usuário

### 3.1 Perfil da Persona
- **Nome**: Camila Albuquerque
- **Idade**: 31 anos
- **Profissão**: Advogada & Coordenadora de Compliance
- **Localização**: São Paulo / SP
- **Dispositivo**: iPhone 15 Pro (navegação móvel 4G/5G durante intervalos e à noite)
- **Comportamento**: Ama rituais de skincare noturno e perfumaria marcante; pesquisa ingredientes ativos (Ácido Hialurônico, Niacinamida, Vitamina C) e prefere marcas com identidade sofisticada e ingredientes seguros.

### 3.2 Dores e Frustrações
- Lojas com aparência de farmácia barata ou visual genérico sem identidade estética.
- Descrições confusas sem selos claros sobre se a fórmula é hipoalergênica, vegana ou cruelty-free.
- Medo de instabilidade no Pix ou falta de retorno visual imediato após o pagamento.
- Descobrir custos ocultos de frete apenas na última tela.

### 3.3 Necessidades Atendidas pelo Novo Design
- **Estética "Botica Premium"**: Sensação acolhedora e de luxo acessível (Verde Esmeralda Botânico + Dourado Champagne + Fundo Creme Aveludado).
- **Transparência de Frete & Benefícios**: Barra progressiva de frete grátis na sacola e no topo da página.
- **Clareza de Ativos e Notas**: Selos de fórmula limpa, crueldade zero e notas de topo, coração e fundo.
- **Checkout Blindado & Confiável**: Selos de segurança bancária, contador dinâmico e cópia de Pix em 1 toque.

---

## 4. 🎨 Novo Sistema de Design (O Boticário & Luxury Beauty Standard)

### 4.1 Paleta de Cores e Tokens Tailwind

```javascript
// Front/tailwind.config.js - Extensão da Paleta
colors: {
  botanic: {
    50: '#F4F9F6',
    100: '#E4F1EC',
    200: '#C5E2D6',
    300: '#9BCBB8',
    400: '#68AE94',
    500: '#3D8E73',
    600: '#2A725A',
    700: '#1F5A47',
    800: '#164335',
    900: '#0F2F25',
    950: '#071A14', // Verde O Boticário Principal
  },
  champagne: {
    100: '#FAF6ED',
    200: '#F3EBD4',
    300: '#E7D7A8',
    400: '#D9C07B',
    500: '#C5A059', // Dourado Boticário / Glamour
    600: '#AC8540',
    700: '#86642E',
  },
  warm: {
    50: '#FDFBF7',  // Fundo Creme Premium
    100: '#F7F3EB',
    200: '#EDE5D8',
    800: '#34302D',
    900: '#1E1B19', // Texto Principal Espresso
  },
  terracotta: {
    500: '#C25D4E',
    600: '#A84B3D',
  }
}
```

### 4.2 Tipografia e Atmosfera
- **Headings & Títulos**: Serifada editorial suave (`Playfair Display` ou `font-serif` balanceada com peso médio/bold) para remeter às antigas boticas e à perfumaria de alta estirpe.
- **Corpo & UI**: Sans-serif geométrica limpa (`Inter` / `system-ui`) com tracking aprimorado, legibilidade máxima em telas OLED e alta densidade de pixels.
- **Estilo de Superfícies**: Bordas sutis em tons quentes (`border-warm-200/80`), sombras suaves difusas (`shadow-sm` e `shadow-md`), sem cantos brutos (raios de 16px a 24px - `rounded-2xl` e `rounded-3xl`).

---

## 5. 🛠️ Mapa de Transformação de Componentes

1. **Top Announcement Bar (`TopBanner.tsx`)**:
   - Mensagem dinâmica: *"✨ Frete Grátis para todo o Brasil acima de R$ 149 • Parcele em até 6x sem juros • 5% OFF no Pix"*.
2. **Header (`Header.tsx`)**:
   - Novo logotipo "AURA" com monograma botânico dourado e subtítulo *"BOTICA & COSMÉTICOS"*.
   - Barra de busca refinada com ícone de folha/lupa e atalhos rápidos (*"Vitamina C"*, *"Batom Velvet"*, *"Perfumaria"*).
   - Contador de itens com pílula champagne/dourada sobre fundo verde floresta.
3. **Hero Banner & Destaques (`HomePage.tsx`)**:
   - Banner principal editorial com fundo verde floresta acetinado (`botanic-950`), detalhes dourados e tipografia de luxo.
   - Régua de Vantagens O Boticário:
     - 🚚 *Frete Grátis acima de R$ 149*
     - 🌿 *Fórmulas Veganas & Cruelty-Free*
     - ⚡ *Pix com Desconto Instantâneo*
     - 🎁 *Embalagem para Presente Disponível*
4. **Pílulas de Categoria (`CategoryPills.tsx`)**:
   - Estilo pill em tom bege/creme suave com borda refinada, ativando com fundo verde botânico profundo e texto em dourado.
5. **Card de Produto (`ProductCard.tsx`)**:
   - Tags especiais: *"Exclusivo"*, *"Lançamento"*, *"Restam poucas unidades"*.
   - Nome da marca em destaque com tipografia espaçada.
   - Preço De / Por com cálculo automático de parcelamento (*"ou até 3x de R$ X sem juros"*).
   - Botão rápido de adicionar com micro-interação refinada.
6. **Sacola Deslizante (`CartDrawer.tsx`)**:
   - Barra progressiva de Frete Grátis com animação de porcentagem.
   - Seletor de embalagem para presente.
   - Destaque da economia gerada com pagamento no Pix.
7. **Página de Detalhes (`ProductDetailPage.tsx`)**:
   - Destaques de Pirâmide Olfativa (Saída, Coração, Fundo) e Ativos Dermatológicos.
   - Seletor de quantidade refinado com botões arredondados.
   - Barra de compra fixa no rodapé para dispositivos móveis.
8. **Checkout & Confirmação (`CheckoutPage.tsx` e `OrderSuccessPage.tsx`)**:
   - Selos de segurança criptográfica no checkout.
   - Caixa Pix com temporizador visual e cópia de chave em um toque.
   - Stepper de pedido em tons verde botânico e dourado.

---

## 6. 🚦 Abordagens & Critérios de Decisão

- **Abordagem 1: O Boticário Botânica Nobre (Recomendada)**
  - Cores: Verde Floresta Profundo (`#0F2F25`), Dourado Champagne (`#C5A059`), Fundo Creme Aveludado (`#FDFBF7`) e Acentos Terracotta.
  - Vantagens: Conecta instantaneamente o usuário com o imaginário das boticas tradicionais, perfumaria de prestígio e cosméticos naturais de alta eficácia. Alinha perfeitamente com o catálogo de produtos da Aura (perfumes, séruns, manteigas corporais e maquiagens).
- **Abordagem 2: Sephora Minimalista Monocromática**
  - Cores: Preto Ônix, Branco Puro e listras monocromáticas com toques de magenta.
  - Vantagens: Estilo cosmopolita e urbano.
  - Desvantagens: Menos acolhedora e calorosa que o estilo O Boticário/Natura, que é a maior referência do público brasileiro.
