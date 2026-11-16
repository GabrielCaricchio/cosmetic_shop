# 📘 Guia Operacional — Aura Cosméticos

Este documento fornece instruções completas para instalação, configuração, execução, testes e consumo das rotas da API da plataforma **Aura Cosméticos**.

---

## 📌 Sumário
1. [Requisitos de Sistema](#1-requisitos-de-sistema)
2. [Portas e Serviços Utilizados](#2-portas-e-serviços-utilizados)
3. [Variáveis de Ambiente](#3-variáveis-de-ambiente)
4. [Instalação e Execução com Docker (Recomendado)](#4-instalação-e-execução-com-docker-recomendado)
5. [Instalação e Execução Local (Sem Docker)](#5-instalação-e-execução-local-sem-docker)
6. [Execução dos Testes Automatizados](#6-execução-dos-testes-automatizados)
7. [Testando via Postman Collection](#7-testando-via-postman-collection)
8. [Referência Completa de Rotas da API REST](#8-referência-completa-de-rotas-da-api-rest)
9. [Perfis de Acesso no Painel Backoffice](#9-perfis-de-acesso-no-painel-backoffice)
10. [Solução de Problemas Frequentes](#10-solução-de-problemas-frequentes)

---

## 1. Requisitos de Sistema

Para executar a aplicação localmente sem Docker, certifique-se de ter instalado:
- **Python**: Versão `3.14` (ou superior) com `pip` e suporte assíncrono.
- **Node.js**: Versão `24 LTS` (ou `22+`) com `npm`.
- **PostgreSQL**: Versão `16+` com suporte às extensões `pg_trgm` e `uuid-ossp`.
- **Redis**: Versão `7.0+` com suporte a comandos e scripts Lua.

---

## 2. Portas e Serviços Utilizados

A arquitetura opera nas seguintes portas de rede padronizadas:

| Porta | Serviço | Descrição | URL de Acesso |
|---|---|---|---|
| **3000** | Front-End | Aplicação React 19 SPA (Vite / Nginx) | [http://localhost:3000](http://localhost:3000) |
| **8000** | Back-End | API FastAPI / Uvicorn | [http://localhost:8000](http://localhost:8000) |
| **8000** | Swagger UI | Documentação interativa OpenAPI | [http://localhost:8000/docs](http://localhost:8000/docs) |
| **5432** | PostgreSQL | Banco de dados relacional principal | `localhost:5432` |
| **6379** | Redis | Cache em memória e travas de estoque | `localhost:6379` |

---

## 3. Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto (ou no diretório `Back/`) baseado no modelo abaixo:

```ini
# ==========================================
# CONFIGURAÇÃO GERAL
# ==========================================
PROJECT_NAME="Cosmetic Shop API"
ENVIRONMENT="development"
DEBUG=True

# ==========================================
# BANCO DE DADOS (PostgreSQL)
# ==========================================
# Conexão de escrita (Master)
DATABASE_URL="postgresql+asyncpg://postgres:postgrespassword@localhost:5432/cosmetics_db"
# Conexão de leitura (Pode apontar para réplica)
DATABASE_READ_URL="postgresql+asyncpg://postgres:postgrespassword@localhost:5432/cosmetics_db"

# ==========================================
# REDIS (Travas de Estoque & Cache)
# ==========================================
REDIS_URL="redis://localhost:6379/0"

# ==========================================
# SEGURANÇA & TOKENS
# ==========================================
JWT_SECRET_KEY="sua_chave_secreta_super_segura_jwt_2026_mude_em_producao"
JWT_ALGORITHM="HS256"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# ==========================================
# REGRAS DE NEGÓCIO DE E-COMMERCE
# ==========================================
# Tempo de expiração do Pix para liberação automática de estoque (segundos): 1800s = 30min
PIX_EXPIRATION_SECONDS=1800
CARD_EXPIRATION_SECONDS=2400
WHATSAPP_SUPPORT_PHONE="5511999999999"
```

No Front-End (`Front/.env` ou `Front/.env.local` opcional):
```ini
VITE_API_URL="/api"
```

---

## 4. Instalação e Execução com Docker (Recomendado)

O arquivo `docker-compose.yml` pré-configurado sobe todos os contêineres com dependências resolvidas, migrações de extensões e redes internas configuradas.

### 4.1 Iniciar todos os serviços
```bash
docker compose up --build -d
```

### 4.2 Verificar o status dos contêineres
```bash
docker compose ps
```
Você verá:
- `cosmetics_postgres` (porta 5432 - healthy)
- `cosmetics_redis` (porta 6379 - healthy)
- `cosmetics_backend` (porta 8000)
- `cosmetics_frontend` (porta 3000)

### 4.3 Ver logs em tempo real
```bash
# Todos os logs
docker compose logs -f

# Apenas logs do Back-end
docker compose logs -f backend

# Apenas logs do Front-end
docker compose logs -f frontend
```

### 4.4 Encerrar a aplicação
```bash
docker compose down
```

---

## 5. Instalação e Execução Local (Sem Docker)

Se preferir rodar os servidores nativamente no seu ambiente:

### 5.1 Configurando o Back-End (Python 3.14)

1. Crie e ative o ambiente virtual:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Instale as dependências:
   ```bash
   pip install --upgrade pip
   pip install -r Back/requirements.txt
   ```

3. Certifique-se de que o PostgreSQL e Redis locais estão ativos e crie a base:
   ```sql
   CREATE DATABASE cosmetics_db;
   ```

4. Execute o servidor de desenvolvimento FastAPI:
   ```bash
   uvicorn Back.main:app --host 0.0.0.0 --port 8000 --reload
   ```

A API estará acessível em `http://localhost:8000` e o Swagger em `http://localhost:8000/docs`.

---

### 5.2 Configurando o Front-End (React 19 + Node 24)

1. Entre na pasta `Front`:
   ```bash
   cd Front
   ```

2. Instale as dependências:
   ```bash
   npm install
   ```

3. Inicie o servidor Vite:
   ```bash
   npm run dev
   ```

A aplicação cliente estará acessível em `http://localhost:3000`.

---

## 6. Execução dos Testes Automatizados

A plataforma possui cobertura total de testes unitários, concorrência atômica, integração e ponta a ponta (E2E).

### 6.1 Rodando a Suíte do Back-End (Pytest)

Com o `.venv` ativado:

```bash
# Executa todos os testes do Back-End
.venv/bin/pytest Back/tests/ -v

# Executar apenas o teste de concorrência de estoque (Race condition com Redis Lua):
.venv/bin/pytest Back/tests/concurrency/test_stock_locking.py -v

# Executar apenas o teste de idempotência e rollback de pagamento Pix:
.venv/bin/pytest Back/tests/unit/test_idempotency.py -v

# Executar o teste de ponta a ponta (E2E) simulando a jornada completa:
.venv/bin/pytest Back/tests/e2e/test_full_purchase_journey.py -v
```

### 6.2 Rodando a Suíte do Front-End (Vitest)

```bash
# Executa todos os testes de componentes e hooks do React 19
npm --prefix Front test

# Executa o build de produção para validação estrita de tipos TypeScript
npm --prefix Front run build
```

---

## 7. Testando via Postman Collection

O projeto inclui uma coleção completa e pré-configurada no padrão Postman Collection v2.1.0 no arquivo `postman_collection.json`.

### 7.1 Como importar no Postman:
1. Abra o Postman (Desktop ou Web).
2. Clique no botão **Import** (canto superior esquerdo).
3. Selecione o arquivo `postman_collection.json` localizado na raiz deste projeto.
4. A coleção **"Aura Cosméticos — E-Commerce API Collection"** será carregada com todas as pastas e requisições organizadas.

### 7.2 Recursos da Coleção:
- **Variáveis de Coleção**: `{{baseUrl}}` (padrão: `http://localhost:8000`), `{{client_token}}`, `{{admin_token}}`, `{{order_id}}`, etc.
- **Automação de Autenticação**: Ao executar as requisições de login ou cadastro, os tokens JWT são automaticamente salvos nas variáveis da coleção via scripts de teste pós-execução.
- **Geração Dinâmica de Idempotência**: No checkout, o cabeçalho `Idempotency-Key` é gerado automaticamente com UUIDv4 para testes de concorrência e retentativa em redes móveis.
- **Asserções Automatizadas**: Cada requisição contém testes verificando código de status HTTP, tempo de resposta e integridade dos esquemas JSON.

---

## 8. Referência Completa de Rotas da API REST

Todas as rotas públicas e administrativas utilizam o prefixo `/api`.

### 7.1 Sistema & Saúde
| Método | Endpoint | Descrição | Autenticação |
|---|---|---|---|
| `GET` | `/api/health` | Verifica a saúde do sistema e do banco | Nenhuma |
| `GET` | `/docs` | Interface interativa Swagger UI | Nenhuma |
| `GET` | `/openapi.json` | Esquema OpenAPI 3.0 em JSON | Nenhuma |

---

### 7.2 Autenticação & Clientes (LGPD)
| Método | Endpoint | Descrição | Payload Principal |
|---|---|---|---|
| `POST` | `/api/register` | Cria nova conta de cliente | `name`, `email`, `password`, `cpf`, `phone`, `lgpd_consent: true` |
| `POST` | `/api/login` | Autentica cliente e retorna JWT | `email`, `password` |
| `GET` | `/api/me` | Obtém perfil do cliente logado | Bearer Token no cabeçalho `Authorization` |

---

### 7.3 Catálogo de Cosméticos & Busca Fuzzy (`pg_trgm`)
| Método | Endpoint | Parâmetros de Query | Descrição |
|---|---|---|---|
| `GET` | `/api/categories` | — | Lista todas as categorias de cosméticos ativas ordenadas por exibição. |
| `GET` | `/api/products` | `page`, `limit`, `search`, `category_id`, `min_price`, `max_price` | Lista produtos paginados com busca fuzzy (tolera acentos e erros ortográficos). |
| `GET` | `/api/products/{id_or_slug}` | — | Retorna detalhes completos do cosmético, galeria de fotos, estoque, modo de uso e ingredientes. |

---

### 7.4 Carrinho de Compras & Sessões de Visitantes
| Método | Endpoint | Cabeçalho Obrigatório | Descrição |
|---|---|---|---|
| `GET` | `/api/cart` | `X-Cart-ID` (UUID) ou Bearer Token | Obtém itens do carrinho e subtotal da sessão. |
| `POST` | `/api/cart/items` | `X-Cart-ID` | Adiciona cosmético ao carrinho validando estoque. |
| `PUT` | `/api/cart/items/{id}` | `X-Cart-ID` | Atualiza quantidade de um item no carrinho. |
| `DELETE`| `/api/cart/items/{id}` | `X-Cart-ID` | Remove cosmético do carrinho. |
| `POST` | `/api/cart/merge` | `Authorization: Bearer <token>` | Mescla carrinho anônimo do visitante com a conta após o login. |

---

### 7.5 Checkout One-Page & Pagamento Pix
| Método | Endpoint | Cabeçalho Obrigatório | Descrição |
|---|---|---|---|
| `POST` | `/api/checkout` | `Idempotency-Key: <UUIDv4>` | Processa a compra com trava atômica no Redis. Retorna QR Code Pix e linha digitável. |

**Exemplo de Payload do Checkout:**
```json
{
  "payment_method": "pix",
  "customer": {
    "name": "Maria Silva",
    "email": "maria.silva@exemplo.com",
    "cpf": "123.456.789-00",
    "phone": "(11) 98765-4321",
    "lgpd_consent": true
  },
  "shipping_address": {
    "street": "Avenida Paulista",
    "number": "1000",
    "complement": "Apto 42",
    "neighborhood": "Bela Vista",
    "city": "São Paulo",
    "state": "SP",
    "zip_code": "01310-100"
  },
  "items": [
    {
      "product_id": 1,
      "quantity": 2
    }
  ]
}
```

---

### 7.6 Acompanhamento de Pedidos
| Método | Endpoint | Descrição |
|---|---|---|
| `GET` | `/api/orders` | Lista histórico de pedidos do cliente autenticado. |
| `GET` | `/api/orders/{id}` | Consulta status em tempo real do pedido (`pending`, `approved`, `processing`, etc.). |

---

### 7.7 Webhook de Pagamentos (Pix & Cartão)
| Método | Endpoint | Descrição |
|---|---|---|
| `POST` | `/api/webhooks/payment` | Recebe notificação do gateway bancário. Se `status: approved`, baixa o estoque definitivo no PostgreSQL; se `rejected` ou `expired`, executa rollback imediato liberando o estoque no Redis. |

---

### 7.8 Suporte e Redirecionamento WhatsApp
| Método | Endpoint | Parâmetros | Descrição |
|---|---|---|---|
| `GET` | `/api/whatsapp-redirect` | `product_name`, `order_id` | Redirecionamento HTTP 307 para o link oficial da API do WhatsApp com mensagem contextual pré-preenchida. |

---

### 7.9 Painel Administrativo / Backoffice (RBAC)
Requer cabeçalho `Authorization: Bearer <admin_token>` em todas as requisições:

| Método | Endpoint | Permissão Mínima | Descrição |
|---|---|---|---|
| `POST` | `/api/admin/login` | Pública | Login de funcionários/administradores. |
| `GET` | `/api/admin/reports/sales` | `manager` / `superadmin` | Retorna KPIs consolidados (Faturamento hoje, Ticket Médio, Total de Pedidos). |
| `GET` | `/api/admin/reports/sales/chart` | `manager` / `superadmin` | Retorna pontos de evolução diária de vendas para renderização de gráficos. |
| `GET` | `/api/admin/inventory/reservations` | `manager` / `superadmin` | Monitora em tempo real as chaves de travas atômicas ativas no Redis com TTL restante. |
| `DELETE`| `/api/admin/inventory/reservations/{key}` | `superadmin` | Liberação manual de uma trava travada no Redis. |
| `POST` | `/api/admin/products` | `manager` / `superadmin` | Criação de novo cosmético no catálogo. |
| `PUT` | `/api/admin/products/{id}` | `manager` / `superadmin` | Edição de preços, estoque e descrições. |
| `DELETE`| `/api/admin/products/{id}` | `superadmin` | Desativação de produto no catálogo. |
| `GET` | `/api/admin/orders` | `support` / `manager` | Listagem operacional de pedidos. |
| `PATCH` | `/api/admin/orders/{id}/status` | `manager` / `superadmin` | Transição manual de status do pedido (`approved`, `processing`, `cancelled`, `refunded`). |

---

## 9. Perfis de Acesso no Painel Backoffice

O sistema utiliza controle de acesso baseado em papéis (RBAC):

1. **`superadmin`**: Acesso irrestrito a todos os relatórios, exclusão de produtos, liberação manual de travas de estoque Redis e cancelamentos.
2. **`manager`**: Acesso à gestão de catálogo, atualização de estoque, aprovação de pedidos e relatórios de vendas.
3. **`support`**: Acesso restrito à consulta de pedidos de clientes para suporte via WhatsApp/Chat.

---

## 10. Solução de Problemas Frequentes

### 1. Erro: `type "gist_trgm_ops" does not exist`
- **Causa**: O banco PostgreSQL foi criado sem a extensão `pg_trgm`.
- **Solução**: Conecte-se ao banco como superusuário e execute:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "pg_trgm";
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```
  *(Nota: O evento `lifespan` do FastAPI em `Back/main.py` tenta criar essas extensões automaticamente na inicialização).*

### 2. Erro de Conexão com Redis (`ConnectionRefusedError`)
- **Causa**: O serviço do Redis não está rodando na porta `6379`.
- **Solução**:
  - Com Docker: execute `docker compose up -d redis`.
  - Nativamente: execute `redis-server` ou `sudo systemctl start redis`.

### 3. Reserva de Estoque Expirada no Checkout Pix
- **Causa**: O cliente demorou mais de 30 minutos (1800 segundos) para efetuar o pagamento.
- **Comportamento esperado**: A trava no Redis expira automaticamente, o pedido é cancelado para evitar que o produto fique bloqueado indefinidamente e o estoque volta a ficar disponível para outros clientes. O cliente deve simplesmente refazer o checkout.

---

<p align="center">
  <strong>Aura Cosméticos — Tecnologia de Alta Performance para Beleza Consciente.</strong>
</p>
