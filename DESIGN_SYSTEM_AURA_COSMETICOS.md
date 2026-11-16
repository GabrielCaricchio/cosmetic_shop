# Aura Cosméticos — Design System e Especificação de Interface

> **Documento de referência para implementação no Antigravity**  
> Versão: 1.0 · Data: 16/11/2026  
> Escopo: loja virtual do cliente + painel administrativo (backoffice)  
> Stack de interface definida no projeto: React 19, TypeScript 5.x, Vite e Tailwind CSS.

---

## 0. Como utilizar este documento

Este arquivo define a direção visual, os tokens, os componentes, os padrões de interação e as telas que devem orientar a implementação da Aura Cosméticos.

Antes de alterar o código:

1. Leia `README.md` e `agent.md`.
2. Inspecione a estrutura e os componentes já existentes no projeto. Preserve o que estiver correto e reutilizável.
3. Use este documento como referência visual e de experiência; use o PRD e os contratos reais da API como fonte das regras de negócio.
4. Não crie dados, preços, avaliações, descontos, permissões, estados de pedido, métodos de pagamento ou promessas de entrega fictícios para preencher a interface.
5. Quando houver divergência entre documentação, código e API, não esconda a divergência com valores hardcoded. Registre o ponto e implemente a representação mais segura possível até a confirmação do contrato.

**Objetivo de produto:** uma loja de cosméticos multimarca com apresentação sofisticada e acolhedora, navegação rápida em telas pequenas e compra simples; acompanhada de um backoffice claro, operacional e confiável.

---

# 1. Leitura das referências visuais e pesquisa de mercado

## 1.1 Referências enviadas pelo usuário

As capturas fornecidas devem ser tratadas como referências de direção visual, não como telas para copiar literalmente.

| Referência | Características observadas | O que aproveitar | O que evitar na Aura |
|---|---|---|---|
| Beleza na Web | Cabeçalho escuro, busca evidente, categorias, faixa promocional e banner de campanha com forte contraste. | Hierarquia entre busca, navegação e campanha; acesso rápido às categorias. | Excesso de faixas, avisos e elementos concorrendo pela atenção no primeiro viewport. |
| FIXADerme | Base clara, detalhes rosa e banner de campanha de alto contraste com produto em destaque. | Uso de uma cor de campanha para comunicar uma oferta específica; produto como protagonista. | Transformar toda a identidade da loja em uma campanha de desconto permanente. |
| SkinCeuticals | Composição premium, fundo escuro e vermelho, fotografia de produto com iluminação dramática. | Fotografia editorial e áreas de destaque para linhas premium. | Usar fundo escuro em toda a experiência, reduzindo legibilidade e variedade visual. |
| La Roche-Posay | Fundo claro, tipografia limpa, tons frios e apresentação organizada de uma linha de produtos. | Clareza, aparência clínica, leitura do nome e da variante do produto. | Aparência excessivamente clínica para categorias que pedem uma apresentação mais sensorial. |
| Glamora | Estrutura de loja completa, barra superior de benefícios, hero, categorias, mais vendidos, promoções e rodapé. | Organização da página inicial em seções comerciais reconhecíveis. | Muitos cards e banners com a mesma prioridade visual. |
| Elixora | Hero editorial com modelo, bastante espaço em branco, categorias simples e cards compactos. | Hero com uma mensagem principal, boa área de respiro e categorias fáceis de identificar. | Imagens genéricas que não correspondam aos produtos reais cadastrados. |
| Velvetique | Tons rosados suaves, fotografia de produto, benefícios e categorias em blocos. | Uso moderado de tons quentes e apresentação consistente de benefícios. | Excesso de rosa claro em textos, botões e fundos, prejudicando contraste. |
| Purelis | Paleta verde e clara, discurso visual natural, foco em ingredientes e sustentabilidade. | Organização visual limpa e espaço para comunicar atributos reais do produto. | Declarar atributos como vegano, natural, sustentável ou cruelty-free sem dados que comprovem isso. |

### Síntese das referências

A Aura deve combinar:

- **Estrutura comercial:** busca, categorias, campanhas e produtos em destaque.
- **Estética de beleza:** fotografia editorial, composição de produtos e tipografia expressiva em títulos de campanha.
- **Clareza dermocosmética:** informações de uso e composição apresentadas de forma organizada.
- **Conversão:** preço, disponibilidade, CTA e acesso ao carrinho sempre fáceis de localizar.

A interface não deve parecer um template genérico de loja, nem uma cópia visual de uma marca específica.

## 1.2 Pesquisa complementar de lojas brasileiras

A pesquisa dos sites oficiais observou estes padrões úteis:

### O Boticário

- Busca em destaque, acesso à conta, pedidos e favoritos, além da sacola.
- Entrada por localização/CEP para contextualizar disponibilidade e frete.
- Navegação por categorias, linhas, tipos de produto, promoções e faixas de preço.
- Cards que podem combinar preço original, preço promocional, parcelamento, avaliação, selo de campanha e ações de compra.
- Ações de compra rápida como “Compre Agora” e “Adicionar à sacola”.

**Aplicação na Aura:** aproveitar a descoberta por categorias, o acesso visível à busca e ao carrinho, o contexto de CEP e a hierarquia de preço. Avaliações, parcelamento e preço promocional só devem aparecer quando houver dados reais e suporte da API.

Referência: [O Boticário — loja oficial](https://www.boticario.com.br/).

### Natura

- Navegação por famílias de produtos: perfumaria, corpo e banho, cabelos, maquiagem, rosto, casa e outras.
- Organização por ocasião, linha, ritual, faixa de preço, kits e presentes.
- Destaque para ofertas de categorias e coleções comerciais.

**Aplicação na Aura:** estruturar categorias que façam sentido para cosméticos multimarca e permitir que o cliente encontre produtos por tipo. A classificação por tipo de pele, necessidade, ritual ou ocasião depende de atributos existentes no catálogo; não deve ser simulada com filtros sem dados.

Referência: [Natura — loja oficial](https://www.natura.com.br/).

### Sephora Brasil

- Categorias primárias muito fáceis de localizar: maquiagem, perfumes, skincare e cabelos.
- Acesso visível à conta, wishlist/sacola, atendimento e serviços.
- Destaques comerciais separados por campanha, novidades, coleções e marcas.
- Mensagem de progresso para benefício de frete na sacola, baseada em um limite comercial.

**Aplicação na Aura:** manter categorias principais curtas, assistência acessível e informações de sacola claras. Não criar wishlist, fidelidade, loja física ou meta de frete grátis enquanto essas funcionalidades e regras não fizerem parte do produto.

Referência: [Sephora Brasil — loja oficial](https://www.sephora.com.br/).

### Beleza na Web

- Navegação muito segmentada para cabelo e skincare: tipo de fio, condição do cabelo, tipo de pele, ativo, tratamento, marca e faixa de preço.
- Páginas de listagem com filtros e ordenação.
- Comunicação de preço no Pix separada do preço no cartão em produtos que oferecem essa condição.

**Aplicação na Aura:** manter os filtros obrigatórios do PRD (categoria, faixa de preço e ordenação) simples e rápidos. Uma segunda camada de filtros por tipo de pele, ativo, cabelo ou preocupação deve ser adicionada somente quando o modelo de produto e a API oferecerem esses atributos.

Referências: [Beleza na Web — novidades](https://www.belezanaweb.com.br/novidades) · [Mapa do site](https://www.belezanaweb.com.br/Institucional/MapaSite).

---

# 2. Princípios de experiência

1. **Mobile-first real:** projetar primeiro para uma tela de 360–390 px de largura. A versão desktop amplia e reorganiza a experiência; não é a versão principal reduzida.
2. **Descoberta sem barreiras:** visitante pode navegar, pesquisar, filtrar e montar o carrinho sem criar conta.
3. **Compra sem surpresa:** preço, quantidade, disponibilidade, frete e forma de pagamento devem ser claros antes da confirmação.
4. **CTA inequívoco:** cada tela deve ter uma ação principal visualmente dominante e ações secundárias menos chamativas.
5. **Informação de cosmético bem organizada:** marca, nome, apresentação/volume, descrição, modo de aplicação, composição e validade devem ser fáceis de localizar quando fornecidos pela API.
6. **Feedback imediato:** toda ação deve responder com estado visual — carregando, concluída, indisponível ou com erro.
7. **Confiança sem exagero:** comunicar Pix, suporte e acompanhamento do pedido de forma objetiva. Não inventar selos, depoimentos, avaliações ou políticas comerciais.
8. **Administração funcional:** densidade de dados maior que na loja, mas sem tabelas ilegíveis ou controles pequenos.
9. **Acessibilidade desde a base:** teclado, leitores de tela, contraste, foco visível e áreas de toque adequadas.
10. **Consistência:** os mesmos estados, cores, espaçamentos e componentes devem ser reconhecíveis em todas as rotas.

---

# 3. Identidade visual da Aura

## 3.1 Direção criativa

**Conceito:** beleza contemporânea, cuidado e curadoria multimarca.

**Personalidade visual:** sofisticada, acolhedora, limpa, confiável e comercial.

A loja deve lembrar uma curadoria de beleza bem organizada: fotografias expressivas, fundos claros, títulos elegantes e elementos de compra diretos. O painel administrativo deve compartilhar a identidade da marca, mas priorizar neutralidade e produtividade.

## 3.2 Paleta de cores proposta

A documentação do projeto não define cores oficiais. Portanto, esta é uma proposta inicial de identidade para a Aura, que deve ser centralizada em tokens para facilitar ajustes posteriores.

### Cores da marca

| Token | Hex | Uso |
|---|---|---|
| `brand-950` | `#3D202F` | Texto de alto destaque em contextos de marca e fundos institucionais. |
| `brand-900` | `#4D293B` | Hover/active de controles principais e elementos de marca escuros. |
| `brand-800` | `#63354B` | Cor principal de identidade. |
| `brand-700` | `#7A405B` | Botão primário, links principais e foco de marca. |
| `brand-600` | `#965B72` | Elementos secundários e estados ativos suaves. |
| `brand-500` | `#B8798E` | Destaques decorativos e elementos de campanha. |
| `brand-100` | `#F2E4E9` | Fundo suave de chips, banners e blocos de marca. |
| `brand-50` | `#FBF5F7` | Superfície rosada quase branca. |

### Cores neutras

| Token | Hex | Uso |
|---|---|---|
| `neutral-950` | `#252229` | Texto principal. |
| `neutral-800` | `#403B43` | Texto secundário forte. |
| `neutral-700` | `#5F5962` | Texto secundário. |
| `neutral-500` | `#817A83` | Texto auxiliar e ícones discretos. |
| `neutral-300` | `#DAD4D9` | Bordas e divisores. |
| `neutral-200` | `#EAE5E8` | Bordas suaves. |
| `neutral-100` | `#F5F1F3` | Superfícies discretas. |
| `neutral-50` | `#FCFAFB` | Fundo de página. |
| `white` | `#FFFFFF` | Cards e superfícies elevadas. |

### Cor de acento

| Token | Hex | Uso |
|---|---|---|
| `accent-700` | `#8B693D` | Acento champagne em elementos pequenos. |
| `accent-500` | `#C29B65` | Detalhe visual premium, ícone ou selo não crítico. |
| `accent-100` | `#F3EBDD` | Fundo de destaque suave. |

O dourado/champagne não deve ser usado como cor de texto pequeno sobre branco. Também não deve comunicar estado de sucesso ou erro.

### Cores semânticas

| Token | Hex | Significado |
|---|---|---|
| `success-700` | `#176B4A` | Pagamento confirmado, ação concluída e estoque disponível. |
| `success-100` | `#E7F4ED` | Fundo de alerta positivo. |
| `warning-700` | `#8B5A16` | Estoque baixo, prazo próximo do fim ou atenção necessária. |
| `warning-100` | `#FFF3D9` | Fundo de aviso. |
| `danger-700` | `#B12E42` | Erro, pedido recusado, item esgotado e ações destrutivas. |
| `danger-100` | `#FCEAED` | Fundo de erro. |
| `info-700` | `#315F89` | Informação neutra e processamento. |
| `info-100` | `#EAF2FA` | Fundo informativo. |

**Regra:** não usar apenas cor para comunicar estado. Combinar cor com texto e ícone/indicador.

## 3.3 Temas por área

### Loja do cliente

- Fundo predominante: `neutral-50` ou branco.
- Superfícies: branco.
- Cor primária: `brand-700`.
- Acentos: `brand-100` e champagne, com moderação.
- Fotografia dos produtos deve ser o foco visual dos cards.

### Backoffice

- Fundo geral: `#F6F7F9` (token específico `admin-canvas`).
- Sidebar: `brand-950` ou `neutral-950`.
- Área de conteúdo: neutra e clara.
- Cor principal de ação: `brand-700`.
- Tabelas e gráficos com cores neutras; sem gradientes decorativos.
- Usar vermelho apenas para falhas e ações destrutivas, amarelo/âmbar para alertas e verde para sucesso.

## 3.4 Tipografia

**Fontes propostas:**

- **Títulos editoriais e campanhas:** `DM Serif Display`, com fallback `Georgia, serif`.
- **Interface, formulários, preços e conteúdo:** `Inter`, com fallback `system-ui, sans-serif`.

Se a aplicação precisar operar sem fontes externas, manter os fallbacks locais. Não usar a fonte serifada em tabelas, botões, preços ou formulários.

| Estilo | Tamanho | Peso | Line-height | Aplicação |
|---|---:|---:|---:|---|
| Display | 40–48 px | 400 | 1.05–1.15 | Hero em desktop. |
| H1 | 32 px | 600 | 1.15 | Título de página. |
| H2 | 26–28 px | 600 | 1.2 | Seção principal. |
| H3 | 20–22 px | 600 | 1.25 | Bloco ou card. |
| H4 | 18 px | 600 | 1.3 | Subtítulo. |
| Body large | 18 px | 400 | 1.5 | Texto introdutório. |
| Body | 16 px | 400 | 1.5 | Texto padrão. |
| Body small | 14 px | 400 | 1.45 | Metadados e apoio. |
| Caption | 12 px | 500 | 1.35 | Rótulos auxiliares. |
| Button | 14–16 px | 600 | 1.0 | Botões e CTAs. |

Em telas pequenas, o Display pode cair para 32–36 px e H1 para 28 px. Não reduzir texto de informação essencial abaixo de 14 px.

---

# 4. Tokens de layout e composição

## 4.1 Espaçamento

Usar escala baseada em múltiplos de 4 px:

`space-1: 4px` · `space-2: 8px` · `space-3: 12px` · `space-4: 16px` · `space-5: 20px` · `space-6: 24px` · `space-8: 32px` · `space-10: 40px` · `space-12: 48px` · `space-16: 64px` · `space-20: 80px`.

Padrões:

- Padding horizontal no mobile: 16 px.
- Padding horizontal em tablet: 24 px.
- Padding horizontal em desktop: 32 px.
- Espaço entre seções da loja: 32–48 px no mobile e 48–64 px no desktop.
- Espaço interno padrão de cards: 12–16 px.

## 4.2 Bordas e sombras

| Token | Valor | Uso |
|---|---|---|
| `radius-sm` | 8 px | Inputs compactos, badges retangulares. |
| `radius-md` | 12 px | Botões, campos e cards pequenos. |
| `radius-lg` | 16 px | Cards de produto e painéis. |
| `radius-xl` | 24 px | Banners e superfícies de destaque. |
| `radius-pill` | 999 px | Chips e filtros. |
| `shadow-sm` | `0 1px 3px rgba(37,34,41,.06)` | Cards discretos. |
| `shadow-md` | `0 8px 24px rgba(37,34,41,.10)` | Drawers e popovers. |
| `shadow-lg` | `0 16px 40px rgba(37,34,41,.14)` | Modal e overlay elevado. |

Bordas preferencialmente de 1 px em `neutral-200`. Evitar sombras escuras e fortes em todos os cards.

## 4.3 Larguras e breakpoints

| Breakpoint | Largura | Comportamento |
|---|---:|---|
| `xs` | 360 px | Menor viewport de referência. |
| `sm` | 640 px | Telas grandes e celulares em paisagem. |
| `md` | 768 px | Tablet; ampliar grid e reorganizar filtros. |
| `lg` | 1024 px | Desktop; navegação completa e 4 colunas de produto. |
| `xl` | 1280 px | Conteúdo centralizado. |
| `2xl` | 1440 px | Limitar largura e preservar respiro. |

- Container máximo da loja: 1280 px.
- Container máximo do backoffice: 1440 px.
- Grid de produtos: 2 colunas no mobile; 3 em tablet; 4 em desktop. Em larguras intermediárias, priorizar card legível em vez de forçar quatro colunas.
- Imagens de produto: proporção consistente (preferencialmente 1:1 ou 4:5, conforme o asset real). Não distorcer fotos.

---

# 5. Iconografia, imagens e fotografia

## 5.1 Ícones

Usar `Lucide React`, já alinhado à stack documentada.

- Ícones com traço consistente, preferencialmente 1.75–2 px.
- Ícones de ação devem ter rótulo acessível (`aria-label`) quando não acompanhados de texto.
- Não misturar famílias de ícones diferentes.
- Evitar emojis como substitutos de ícones de interface.

Ícones recorrentes: Search, ShoppingBag, UserRound, Menu, X, Heart somente se houver funcionalidade, ChevronDown, SlidersHorizontal, Plus, Minus, Trash2, Package, Truck, CreditCard, QrCode, Copy, MessageCircle, CircleHelp, Bell, LayoutDashboard, Tags, Boxes, ClipboardList, ChartNoAxesCombined, ShieldCheck e AlertTriangle.

**Não exibir um coração/favoritos como controle funcional enquanto não existir persistência de favoritos no produto.**

## 5.2 Direção de fotografia

- Priorizar imagens reais e autorizadas dos produtos cadastrados.
- Fundo neutro, luz suave e recorte nítido para cards de produto.
- Banners podem usar fotografia editorial de beleza, desde que a imagem tenha relação com a campanha e não prometa características inexistentes.
- Para dermocosméticos, destacar embalagem, linha e apresentação com clareza.
- Não usar imagens de produto de outra marca como substituto de item real.
- Não gerar nomes, rótulos ou embalagens fictícias para representar produtos reais.
- Definir fallback visual elegante para produto sem imagem.
- Usar `loading="lazy"` nas imagens fora do primeiro viewport e dimensões reservadas para evitar layout shift.

## 5.3 Banner de campanha

- Uma mensagem principal por banner.
- Uma CTA clara.
- Texto curto e com contraste alto.
- No mobile, usar composição própria ou `object-position` ajustado; não apenas cortar o banner desktop.
- Carrossel com controles visíveis e pausável; não trocar automaticamente em velocidade que dificulte leitura.
- Quando não existir campanha configurada, não renderizar um banner vazio ou conteúdo promocional fictício.

---

# 6. Navegação e arquitetura de informação

## 6.1 Navegação da loja

### Mobile

1. Faixa de campanha opcional, apenas quando houver conteúdo válido.
2. Header compacto com logotipo, acesso à conta e sacola.
3. Busca em linha própria e facilmente alcançável; manter sticky quando não ocupar área excessiva.
4. Categorias em chips com rolagem horizontal.
5. Conteúdo principal em blocos verticais.
6. Barra inferior opcional com atalhos para Início, Categorias, Sacola e Conta; respeitar `safe-area-inset-bottom` e não cobrir CTAs.
7. Botão flutuante de WhatsApp em posição que não cubra o botão principal, o carrinho ou o QR Code.

### Desktop

- Header com logotipo, busca ampla, conta e sacola.
- Navegação horizontal por categorias principais.
- Menu expandido para categorias/subcategorias quando a quantidade de dados justificar.
- Conteúdo centralizado em container máximo.

### Categorias iniciais sugeridas

Usar somente categorias existentes ou cadastradas pelo administrador. A apresentação inicial pode acomodar:

- Todos os produtos
- Skincare / Cuidados com a pele
- Maquiagem
- Cabelos
- Perfumes / Perfumaria
- Corpo e banho

Os rótulos finais devem vir da API de categorias; essa lista é referência de organização, não substitui o cadastro real.

## 6.2 Rotas de referência — cliente

- `/` — início/vitrine.
- `/categoria/:slug` — listagem por categoria.
- `/busca?q=...` — resultado de busca.
- `/produto/:slug` — detalhe do produto.
- `/sacola` — carrinho completo.
- `/checkout` — identificação, endereço e pagamento.
- `/pedido/:id` — confirmação e acompanhamento do pedido.
- `/entrar` — login/cadastro, se for necessário encaminhar o usuário a uma rota separada.

Adaptar os nomes às rotas já existentes no projeto; não duplicar páginas se já houver implementação equivalente.

---

# 7. Telas da loja do cliente

## 7.1 Página inicial

Ordem recomendada de conteúdo:

1. **Faixa de campanha:** mensagem curta configurável; ocultar se não houver campanha ativa.
2. **Header e busca:** logo Aura, campo “O que você está procurando?”, conta e sacola com badge de quantidade.
3. **Categorias principais:** chips ou tiles compactos, com texto legível.
4. **Hero principal:** campanha ou coleção em destaque, título curto, texto auxiliar e CTA.
5. **Atalhos comerciais:** Mais vendidos, Lançamentos e Ofertas, somente se essas listas forem disponibilizadas pelo sistema.
6. **Vitrine de produtos:** grid responsivo de cards.
7. **Bloco de confiança:** destacar informações verdadeiras como atendimento via WhatsApp, compra com Pix e acompanhamento do pedido.
8. **Rodapé:** categorias, contato/WhatsApp, políticas e informações institucionais que existirem.

**Evitar:** uma sucessão longa de carrosséis; três ou mais banners antes dos produtos; pop-ups imediatos; contadores regressivos de campanhas sem prazo real.

## 7.2 Busca e listagem de produtos

### Busca

- Placeholder: “Busque por produto, marca ou categoria”.
- Debounce de 300 ms, conforme PRD.
- Dropdown de sugestões enquanto o usuário digita, com teclado e toque.
- Mostrar estado de carregamento sem bloquear o campo.
- A busca deve aceitar erros de digitação e variações comuns conforme serviço `pg_trgm`.
- Exemplo de comportamento esperado: a consulta “baton” pode localizar “Batom”.
- Se não houver resultados, informar a consulta e oferecer limpar ou ajustar os filtros. Só sugerir correções se a API retornar uma sugestão real.

### Filtros obrigatórios

- Categoria.
- Faixa de preço.
- Ordenação: menor preço, mais vendidos e lançamentos.

No mobile, abrir filtros em bottom sheet com botão “Aplicar filtros” e ação “Limpar”. No desktop, usar painel lateral ou barra de filtros acima do grid.

Filtros por tipo de pele, tipo de cabelo, ativos, fragrância, marca ou necessidade são evolução possível, mas dependem de atributos e índices no catálogo. Não implementar filtros sem fonte de dados.

### Card de produto

Estrutura:

1. Imagem principal.
2. Badge contextual, quando existir: Oferta, Lançamento, Últimas unidades ou Esgotado.
3. Marca.
4. Nome do produto.
5. Volume/apresentação, se fornecido.
6. Preço vigente e informação promocional, se fornecida.
7. Botão “Adicionar” ou controle de quantidade, conforme comportamento de carrinho.

Regras:

- Imagem em área estável, com fundo neutro e `object-fit: contain`.
- Nome com altura controlada para manter alinhamento do grid; permitir leitura do texto completo na página de produto.
- Preço em destaque, mas sem tipografia exagerada.
- Estado esgotado deve ser legível; desabilitar adição.
- A adição rápida deve confirmar o resultado por toast ou feedback no card e atualizar o contador da sacola.
- Não exibir estrelas/avaliações se não houver endpoint e modelo de avaliações.
- Não inventar preço anterior, porcentagem de desconto, preço Pix ou quantidade disponível.

## 7.3 Página de detalhes do produto (PDP)

### Mobile

- Galeria de imagens no topo, com swipe e miniaturas quando existirem várias imagens.
- Marca, nome, SKU e categoria.
- Apresentação/volume quando disponível.
- Preço atual, condição Pix ou parcelamento somente com dados retornados pela API.
- Indicador de estoque.
- Seletor de quantidade limitado à disponibilidade confirmada pelo sistema.
- CTA principal fixo próximo ao rodapé: **Comprar agora**.
- CTA secundária: **Adicionar à sacola**.
- Atalho “Dúvidas sobre este produto? Fale com a revendedora no WhatsApp”.
- Acordeões para Descrição, Modo de aplicação, Ingredientes/Composição e Prazo de validade.

### Desktop

- Galeria à esquerda e bloco de compra à direita.
- Resumo de compra visível sem exigir rolagem excessiva.
- Informações complementares abaixo, em abas ou acordeões acessíveis.

### Comportamentos

- “Comprar agora” encaminha diretamente para o checkout do item selecionado, preservando a regra de checkout direto.
- “Adicionar à sacola” abre cart drawer sem remover o usuário da PDP.
- Se o backend informar estoque insuficiente, atualizar a quantidade e exibir mensagem objetiva.
- O link de WhatsApp deve carregar nome do produto e URL atual, conforme rota de suporte.

## 7.4 Sacola / Carrinho

### Drawer

- Desktop: painel lateral pela direita.
- Mobile: bottom sheet alto ou tela dedicada, sem reduzir a área de toque.
- Mostrar thumbnail, nome, preço unitário, quantidade, subtotal da linha e ação remover.
- Controles `+` e `−` devem respeitar o estoque confirmado.
- Resumo: subtotal, frete quando calculado e total.
- CTA: “Avançar para o pagamento”.

### Página completa

- Permitir revisão do carrinho e alteração de quantidade.
- Exibir estado vazio com CTA “Continuar comprando”.
- Preservar a sessão de visitante conforme integração local/Redis.
- Ao receber item indisponível ou alteração de preço do servidor, explicar e pedir revisão antes de continuar.

Não usar barra de progresso de frete grátis sem que exista regra comercial e valor mínimo fornecidos pela aplicação.

## 7.5 Identificação, login e cadastro

- Login e criar conta em abas ou painéis alternáveis.
- Pedir autenticação apenas ao iniciar a finalização da compra, conforme PRD.
- Cadastro rápido com nome, e-mail, telefone/WhatsApp e senha.
- Consentimento LGPD explícito, com link acessível para os Termos e política correspondente.
- Não marcar consentimento opcional como aceito previamente.
- Exibir erros junto ao campo e preservar valores que não sejam sensíveis.
- Senha nunca deve ser exibida em logs ou mensagens de erro.

## 7.6 Checkout

O checkout deve ser uma experiência de página única, com seções claramente agrupadas e resumo do pedido sempre acessível.

### Seções

1. Identificação do cliente (login ou cadastro).
2. Endereço de entrega.
3. Consulta de CEP e preenchimento de logradouro, com validação dos dados.
4. Método de pagamento disponível.
5. Resumo de itens, subtotal, frete e total.
6. CTA de confirmação.

### Regras críticas

- Enviar `Idempotency-Key` UUIDv4 na solicitação de checkout.
- A chave deve ser preservada em retentativas da mesma operação; uma falha de rede não pode criar uma cobrança duplicada.
- Mostrar erros de disponibilidade com mensagem específica, por exemplo “Este produto acabou de esgotar. Atualize sua sacola para continuar”.
- Não apresentar o pedido como confirmado antes de a API confirmar o pagamento.
- Não simular taxa ou prazo de entrega sem resposta do serviço correspondente.

## 7.7 Pagamento Pix

Componente `PixPaymentPanel`:

- QR Code retornado pelo gateway, exibido em tamanho adequado para leitura por outro dispositivo.
- Campo Pix Copia e Cola, com botão “Copiar código Pix”.
- Feedback acessível: “Código Pix copiado”.
- Temporizador regressivo sincronizado com a expiração da reserva; prazo descrito no PRD: 30 minutos.
- Mensagem de orientação para concluir o pagamento antes do fim do prazo.
- Estado de verificação: “Aguardando confirmação do pagamento”.
- Polling assíncrono conforme `useOrderPolling`, sem recarregar a página.
- Ao receber aprovação confirmada, exibir sucesso e encaminhar para acompanhamento.
- Se expirar ou for rejeitado, comunicar o estado e a consequência para a reserva de estoque.

A animação de sucesso deve ser breve e respeitar `prefers-reduced-motion`.

## 7.8 Sucesso e acompanhamento do pedido

- Número/código do pedido.
- Resumo dos produtos e valores.
- Estado atual com texto e ícone.
- Linha do tempo visual.
- Código de rastreamento quando existir.
- Atalho de suporte WhatsApp com mensagem que inclua o identificador do pedido e seu estado atual.

Estados internos documentados: `pending`, `processing`, `under_review`, `approved`, `rejected`, `cancelled`, `refunded`.

A timeline comercial pode apresentar textos amigáveis, mas não pode inventar estados logísticos não retornados pela API. Verificar a lacuna descrita em “Pontos de alinhamento com o backend”.

---

# 8. Telas do painel administrativo

## 8.1 Estrutura do backoffice

Acesso protegido em `/admin` ou rotas equivalentes existentes.

### Desktop

- Sidebar fixa ou recolhível à esquerda.
- Topbar com título da área, notificações se houver fonte de dados, perfil e sair.
- Área principal com largura flexível.
- Breadcrumbs nas páginas internas.

### Mobile/tablet

- Sidebar convertida em drawer acionado por menu.
- Topbar compacta com título, menu e perfil.
- Filtros em drawer ou bottom sheet.
- Tabelas convertidas em cards/listas empilhadas quando a largura não permitir leitura adequada.
- Não exigir scroll horizontal para executar ações essenciais.

## 8.2 Navegação administrativa

Menu recomendado, alinhado à GUI do PRD:

1. Dashboard.
2. Produtos/Cosméticos.
3. Categorias.
4. Pedidos.
5. Estoque.
6. Reservas e concorrência.
7. Relatórios.

O que cada perfil pode visualizar ou alterar deve vir das permissões reais do backend. Não usar apenas ocultação de botões como mecanismo de segurança.

## 8.3 Login administrativo

- Tela independente do login de cliente.
- Identidade Aura discreta, formulário centralizado e linguagem objetiva.
- Campos de e-mail e senha, mostrar/ocultar senha, loading e erro.
- Em caso de sessão expirada, redirecionar ao login e preservar a rota de destino quando seguro.
- Proteger rotas administrativas com guard no frontend e autorização no backend.

## 8.4 Dashboard

### Indicadores no topo

- Faturamento do dia.
- Quantidade de pedidos.
- Ticket médio.
- Produtos em estoque crítico (limite documentado: quantidade menor ou igual a 3 unidades).

Cada KPI deve mostrar título, valor, período e contexto. Não inventar percentuais de variação se não houver comparação retornada pela API.

### Conteúdo complementar

- Gráfico de faturamento/evolução dos últimos 7 dias.
- Indicador de conversão se a API fornecer dados de visitas e conversão.
- Lista dos pedidos mais recentes, com status, data, cliente e total.
- Alertas de estoque crítico com link para gestão do item.

### Visualização

- Desktop: KPIs em linha e gráfico/tabela em duas colunas quando houver espaço.
- Mobile: cards empilhados; gráfico com legenda simplificada e rolagem controlada.
- Filtros de período apenas quando suportados pela API.

## 8.5 Produtos e catálogo

### Listagem

- Tabela paginada em desktop; cards ou linhas adaptáveis em telas pequenas.
- Busca rápida por nome/marca.
- Filtro por categoria.
- Ordenação.
- Colunas recomendadas: imagem, produto, marca, categoria, preço, estoque e status.
- Ações: visualizar, editar e ativar/desativar, conforme permissões.
- Estado de estoque baixo claramente sinalizado.

### Cadastro/edição

Campos documentados no PRD:

- Nome do cosmético.
- Marca.
- Categoria.
- Preço de venda.
- Estoque inicial/quantidade.
- Descrição.
- Ingredientes/composição.
- Upload múltiplo de imagens.
- Preview das imagens.
- Seleção da imagem principal.

Campos exigidos pela experiência de produto, mas que precisam de confirmação no contrato da API:

- Apresentação/volume (ml/g).
- Modo de aplicação/uso.
- Prazo de validade.
- Preço específico no Pix, preço anterior, desconto ou opções de parcelamento, se aplicáveis.

Não exibir esses campos como persistidos se o backend não os aceitar. Até a definição do contrato, manter esses pontos sinalizados para integração.

### Formulário

- Agrupar campos em: Informações básicas, Preço e estoque, Descrição e composição, Imagens.
- Validar campos obrigatórios inline.
- Preview de imagem antes de salvar.
- Indicar imagem principal de forma inequívoca.
- Confirmar sucesso ou falha do upload.
- Preservar dados digitados em falhas não destrutivas.

## 8.6 Categorias

- Listagem com nome e slug.
- Ações de criar, editar e remover/desativar somente se os endpoints e permissões existirem.
- Avisar quando a alteração puder afetar produtos associados.
- Usar a API como origem da lista; não fixar a navegação do cliente em arrays paralelos sem sincronização.

## 8.7 Pedidos

### Listagem

- Abas/filtros por estados existentes.
- Busca pelo código do pedido ou cliente, se suportada.
- Colunas: código, cliente, data, total, pagamento e status.
- Atualização de dados sem recarregar a tela quando possível.

### Detalhes

- Dados do cliente necessários à operação.
- Endereço de entrega.
- Itens, quantidades e preços registrados no pedido.
- Método e status do pagamento.
- Comprovante/dados do gateway apenas conforme disponibilidade e regras de segurança.
- Linha do tempo e ações permitidas para o perfil atual.

### Ações

- Despachar pedido, cancelar ou estornar somente quando a API autorizar e oferecer a operação.
- Ações críticas devem abrir confirmação com resumo do impacto.
- Após executar, atualizar o status com base na resposta do backend; não alterar visualmente de forma definitiva antes da confirmação.

## 8.8 Estoque

- Visão de produtos, quantidade e status de disponibilidade.
- Filtro para estoque crítico (<= 3 unidades).
- Indicar esgotados, estoque baixo e estoque regular por texto e badge.
- Não permitir ajuste de estoque por controle visual se a API não tiver operação própria para isso.

## 8.9 Monitor de reservas e concorrência

Tela especializada para auditoria das reservas temporárias no Redis:

- Produto reservado.
- Identificador do pedido/reserva, conforme o backend permitir expor.
- Quantidade reservada.
- Tempo restante de TTL.
- Situação da reserva.
- Ação de liberação forçada em caso de anomalia, somente para perfil autorizado.

**Ação de risco:** a liberação forçada deve exigir confirmação explícita e explicar que pode alterar a disponibilidade do item. Não executar com clique acidental. Registrar a ação conforme mecanismo de auditoria disponível no backend.

Não exibir dados internos sensíveis do Redis ao cliente final.

## 8.10 Relatórios

- Faturamento e vendas conforme dados existentes.
- Filtros temporais somente quando suportados.
- Estados vazios claros quando ainda não houver vendas.
- Não inventar gráfico ou taxa de conversão se o backend não disponibilizar os dados.

---

# 9. Componentes do sistema

Os componentes devem ser pequenos, reutilizáveis, tipados e acessíveis. A lista abaixo é referência de nomenclatura; adaptar ao padrão real do repositório.

## 9.1 Componentes compartilhados

| Componente | Variantes/estados necessários |
|---|---|
| `Button` | Primary, secondary, outline, ghost, danger; sm/md/lg; loading, disabled. |
| `IconButton` | Normal, hover, focus, disabled; rótulo acessível obrigatório. |
| `Input` | Default, focus, filled, error, disabled; label e helper text. |
| `SearchInput` | Default, typing, loading, suggestions, no-results. |
| `Select` | Default, open, error, disabled. |
| `Checkbox` | Unchecked, checked, indeterminate, error, disabled. |
| `Badge` | Neutral, success, warning, danger, info, brand. |
| `Chip` | Default, selected, removable, disabled. |
| `Card` | Default, interactive, selected. |
| `Modal` | Confirmation, form, details; foco preso e escape quando apropriado. |
| `Drawer` | Right drawer desktop; bottom sheet mobile. |
| `Toast` | Success, error, warning, info; duração e fechamento acessíveis. |
| `Skeleton` | Product card, KPI, table row, content block. |
| `EmptyState` | Ícone, título, explicação e ação de recuperação. |
| `ErrorState` | Mensagem objetiva e ação de tentar novamente. |
| `Pagination` | Página atual, anterior/próxima e disabled. |

## 9.2 Componentes da loja

- `StoreHeader`
- `PromoBar`
- `CategoryChips`
- `CampaignHero`
- `ProductCard`
- `ProductGrid`
- `ProductPrice`
- `StockBadge`
- `ProductGallery`
- `ProductAccordion`
- `QuantitySelector`
- `CartDrawer`
- `CartItem`
- `CartSummary`
- `FilterSheet`
- `CheckoutSection`
- `AddressForm`
- `PaymentMethodSelector`
- `PixPaymentPanel`
- `CountdownTimer`
- `OrderStepper`
- `WhatsAppSupportButton`

## 9.3 Componentes do backoffice

- `AdminLayout`
- `AdminSidebar`
- `AdminTopbar`
- `AdminPageHeader`
- `KpiCard`
- `SalesChart`
- `DataTable`
- `MobileDataList`
- `ProductForm`
- `ProductImageUploader`
- `OrderStatusBadge`
- `OrderDetailsPanel`
- `InventoryStatus`
- `ReservationMonitorTable`
- `ConfirmDangerAction`

---

# 10. Estados, mensagens e microinterações

## 10.1 Estados universais

Todo componente que depende de dados deve prever:

- Inicial/loading.
- Sucesso com dados.
- Vazio sem dados.
- Erro recuperável.
- Erro não recuperável/permissão.
- Desabilitado/indisponível.

Não renderizar tela branca enquanto a API carrega. Usar skeletons com dimensões próximas do conteúdo real.

## 10.2 Mensagens recomendadas

| Situação | Mensagem de interface |
|---|---|
| Produto adicionado | “Produto adicionado à sacola.” |
| Código Pix copiado | “Código Pix copiado.” |
| Aguardando Pix | “Aguardando confirmação do pagamento.” |
| Pagamento confirmado | “Pagamento aprovado. Seu pedido foi confirmado.” |
| Estoque esgotado | “Este produto acabou de esgotar. Atualize sua sacola para continuar.” |
| Falha de conexão | “Não foi possível conectar agora. Verifique sua internet e tente novamente.” |
| Busca vazia | “Não encontramos produtos para essa busca. Tente outro termo ou remova filtros.” |
| Reserva expirada | “O prazo de pagamento terminou e a reserva dos produtos foi encerrada.” |
| Ação administrativa concluída | “Alteração salva com sucesso.” |

As mensagens devem refletir a resposta real do backend. Não mostrar “pedido confirmado” em estado `pending`.

## 10.3 Movimento

- Transições curtas de 150–220 ms para drawers, dropdowns e feedbacks.
- Evitar animações contínuas e efeitos de parallax.
- Microanimação breve no badge da sacola quando a quantidade mudar.
- Skeleton com animação discreta.
- Respeitar `prefers-reduced-motion` em todas as animações.

## 10.4 Toques e foco

- Área de toque mínima recomendada: 44 × 44 px.
- Inputs com altura mínima de 44 px; botões principais de 48–52 px em mobile.
- Focus ring visível e consistente.
- Não remover outline sem substituto acessível.
- Não depender de hover para revelar ações essenciais.

---

# 11. Acessibilidade, responsividade e desempenho

## 11.1 Acessibilidade

Meta de qualidade: WCAG 2.2 AA.

- Contraste adequado entre texto e fundo.
- HTML semântico e hierarquia correta de headings.
- Labels explícitos nos campos.
- Mensagens de erro associadas ao campo correspondente.
- Navegação completa por teclado.
- Foco inicial e retorno de foco em modal/drawer.
- Texto alternativo para imagens relevantes; imagens decorativas com alt vazio.
- Status de pagamento e estoque anunciados de forma acessível.
- Não transmitir significado apenas por cor.
- Zoom de navegador sem quebra da interface.

## 11.2 Responsividade

Testar no mínimo em:

- 360 × 800 px.
- 390 × 844 px.
- 768 × 1024 px.
- 1024 × 768 px.
- 1440 × 900 px.

Verificar especialmente header, busca, cards, filtros, PDP, sacola, checkout Pix, sidebar administrativa, tabelas e modais.

## 11.3 Desempenho percebido

- Lazy loading em imagens fora da primeira dobra.
- Definir `width`, `height` ou `aspect-ratio` para imagens.
- Comprimir e servir imagens em dimensões adequadas.
- Paginar listagens e evitar carregar o catálogo inteiro.
- Debounce de busca de 300 ms.
- Evitar bibliotecas visuais grandes se componentes nativos ou a stack já existente resolverem.
- Usar skeletons e feedback imediato; não bloquear toda a página por uma pequena operação.
- Manter banners e imagens de campanha otimizados para mobile.

---

# 12. Diretrizes de integração com a aplicação

## 12.1 Stack e bibliotecas

Respeitar a stack do projeto:

- React 19.
- TypeScript 5.x com tipagem estrita.
- Vite.
- Tailwind CSS.
- Lucide React para ícones.
- Axios/API client já definido no projeto.

Não migrar para outro framework ou criar uma segunda aplicação separada para o admin. Loja e backoffice são áreas distintas da mesma SPA, com layouts e guards separados.

## 12.2 Tokens no código

- Definir cores, tipografia, espaçamento, raio e sombras como CSS custom properties.
- Mapear tokens no Tailwind sem espalhar valores hexadecimais arbitrários pelos componentes.
- Criar variantes consistentes para botões, badges e campos.
- Manter tema de loja e tema administrativo baseados no mesmo conjunto de tokens.

Exemplo de organização conceitual:

```text
src/
  styles/
    tokens.css
    globals.css
  components/
    common/
    client/
    admin/
  pages/
    client/
    admin/
  services/
  context/
  hooks/
  types/
```

Adaptar essa organização à estrutura já existente, evitando duplicar pastas e serviços.

## 12.3 Dados reais e contratos

- A API é a fonte de verdade para preço, estoque, status, pedido, permissões e pagamento.
- Fixtures/mock data só podem ser usadas explicitamente no ambiente de desenvolvimento ou em telas de protótipo identificadas como demonstração.
- Nunca usar métricas fixas do exemplo do PRD como se fossem vendas reais.
- Nunca simular QR Code válido ou confirmação real de Pix.
- Em checkout, manter a chave de idempotência da mesma tentativa durante retentativas.
- Tratar `409 Conflict` de reserva/estoque como estado de negócio e não como erro genérico.
- Não armazenar dados sensíveis no estado de URL ou logs desnecessários.

## 12.4 Organização de responsabilidades

- Páginas orquestram componentes e carregamento de dados.
- Componentes visuais não devem conter regras de estoque ou pagamento.
- Hooks devem encapsular comportamentos reutilizáveis, como debounce, countdown e polling.
- Serviços de API ficam fora da camada visual.
- Componentes do cliente e do admin podem compartilhar átomos, mas não devem compartilhar layouts incompatíveis.

---

# 13. Pontos de alinhamento com o backend antes de fechar a UI

Os documentos atuais têm lacunas ou divergências que afetam o que a interface pode prometer. O Antigravity deve sinalizá-las, sem mascará-las com conteúdo hardcoded.

| Ponto | O que a documentação informa | Efeito na interface / ação necessária |
|---|---|---|
| `agent.md` e `prd.md` | Os dois arquivos enviados possuem conteúdo idêntico. | `agent.md` não contém instruções específicas adicionais para o agente; manter esta especificação como complemento e corrigir o arquivo de agente se desejado. |
| Perfis administrativos | PRD cita `SuperAdmin`, `Admin`, `Operator`; README descreve `superadmin`, `manager`, `support`. | Definir enum/claims/permissões canônicos no backend. Até lá, a UI deve consumir permissões efetivas, não inferir equivalência entre nomes. |
| Estados do pedido | O enum relacional lista `pending`, `processing`, `under_review`, `approved`, `rejected`, `cancelled`, `refunded`. A UI desejada também cita “Em Separação” e “Enviado”. | Definir se as etapas logísticas serão campos/eventos separados ou novos estados. A UI não deve fabricar essas transições a partir de `approved`. |
| Volume/apresentação | A vitrine exige volume em ml/g, mas a tabela `products` exibida não apresenta coluna correspondente. | Incluir campo no modelo/DTO/API ou ocultar o valor quando não existir. |
| Modo de aplicação e validade | A PDP exige essas informações, mas o schema apresentado contém `description` e `ingredients`, sem campos específicos para modo de uso e validade. | Definir campos e origem dos dados; não preencher conteúdo genérico. |
| Preço Pix e parcelamento | A PDP pede preço à vista no Pix e simulação de parcelas; o schema apresentado tem `price` e o método de pagamento, mas não detalha política de desconto Pix/parcelamento. | Definir contrato de precificação/condições do gateway. Só mostrar condições efetivamente retornadas. |
| Avaliações | Sites de referência exibem estrelas e notas, mas a documentação da Aura não define módulo ou tabela de avaliações. | Não exibir estrelas, quantidade de avaliações ou depoimentos até existir fonte de dados. |
| Frete | O checkout prevê CEP, endereço e resumo de frete, mas os arquivos não detalham serviço/endpoint de cotação. | Definir cálculo e prazos. Até lá, não prometer frete grátis, prazo ou valor. |
| Gestão de categorias | O PRD pede gestão de categorias, mas a estrutura de routers descrita não deixa explícito um router administrativo de categorias. | Confirmar endpoint/permissões de CRUD antes de construir ações administrativas funcionais. |
| Campanhas e banners | As referências têm banners e campanhas, mas não há especificação clara de CMS/CRUD de banners. | Renderizar campanhas vindas de configuração ou dados já disponíveis; não construir painel de campanha como requisito obrigatório sem decisão de produto. |
| Métodos de pagamento | O modelo cita Pix, cartão e boleto; a experiência prioriza Pix. | Exibir apenas métodos realmente habilitados pelo gateway/ambiente. |

---

# 14. Critérios de aceite visual e funcional

## Loja do cliente

- [ ] Primeira dobra mobile apresenta marca, busca, sacola e categorias sem poluição visual.
- [ ] Catálogo usa duas colunas em mobile e imagens sem distorção.
- [ ] Busca com debounce de 300 ms apresenta estados de carregamento, sugestões e vazio.
- [ ] Filtros obrigatórios funcionam com dados reais da API.
- [ ] Visitante consegue navegar e montar a sacola sem login.
- [ ] PDP apresenta CTA “Comprar agora” e “Adicionar à sacola”.
- [ ] Informações de descrição, uso, composição e validade são apresentadas somente quando disponíveis.
- [ ] Carrinho permite rever itens, alterar quantidades e remover itens.
- [ ] Login/cadastro é solicitado apenas ao finalizar a compra.
- [ ] Checkout apresenta endereço/CEP, forma de pagamento e resumo.
- [ ] Checkout usa `Idempotency-Key` e trata repetição de requisição sem duplicar pedido.
- [ ] Pix mostra QR Code real, Copia e Cola, countdown e estado de confirmação.
- [ ] Estoque esgotado/concorrência é comunicado de modo compreensível.
- [ ] Pedido apresenta status verdadeiro e suporte WhatsApp contextual.

## Backoffice

- [ ] Rotas protegidas por autenticação e autorização de backend.
- [ ] Layout responsivo com sidebar/drawer adaptável.
- [ ] Dashboard apresenta KPIs e alertas com dados reais.
- [ ] Produtos podem ser listados e gerenciados conforme as permissões existentes.
- [ ] Upload permite preview e seleção de imagem principal.
- [ ] Categorias usam dados e operações reais.
- [ ] Pedidos podem ser filtrados por status e visualizados em detalhes.
- [ ] Ações de despacho/cancelamento/estorno exigem confirmação e resposta da API.
- [ ] Estoque crítico <= 3 é destacado.
- [ ] Monitor de reservas apresenta TTL e restringe liberação forçada a perfis autorizados.
- [ ] Interface móvel não exige scroll horizontal para tarefas operacionais essenciais.

## Qualidade geral

- [ ] Design consistente entre rotas.
- [ ] Estados loading, vazio, erro e sucesso implementados.
- [ ] Contraste, foco e teclado verificados.
- [ ] Nenhuma informação comercial fictícia.
- [ ] Sem sobreposição de WhatsApp, bottom navigation, drawers ou CTAs.
- [ ] Layout verificado nas resoluções da seção 11.2.
- [ ] Nenhuma regra de negócio do PRD foi alterada pela camada visual.

---

# 15. Instrução final para o Antigravity

Implemente a interface da Aura Cosméticos seguindo este Design System. Comece inspecionando o projeto e identificando o que já existe; preserve e refatore componentes úteis antes de criar alternativas. Priorize a loja mobile-first e o backoffice responsivo, mantendo separados os layouts e os guards de autorização.

Implemente a experiência com dados reais da API sempre que disponível. Não use placeholders de aparência final para preencher lacunas de backend: quando faltar um campo, endpoint, permissão ou estado, deixe a área preparada, sinalize o bloqueio e registre o ponto de alinhamento. Não altere contratos, regras de estoque, idempotência, pagamento, RBAC ou estados de pedido para facilitar a interface.

A entrega deve resultar em telas coesas, acessíveis, responsivas e funcionais — não apenas em uma homepage ilustrativa. Inclua estados vazios, carregamento, erro e sucesso; valide a jornada completa de descoberta, produto, sacola, autenticação, checkout Pix, acompanhamento e as rotinas centrais de administração.

---

## Fontes de referência consultadas

- O Boticário: https://www.boticario.com.br/
- Natura: https://www.natura.com.br/
- Sephora Brasil: https://www.sephora.com.br/
- Beleza na Web: https://www.belezanaweb.com.br/novidades
- Mapa do site Beleza na Web: https://www.belezanaweb.com.br/Institucional/MapaSite
- Referências visuais adicionais: capturas fornecidas pelo usuário nesta conversa (Beleza na Web, FIXADerme, SkinCeuticals, La Roche-Posay e modelos de lojas de beleza).
