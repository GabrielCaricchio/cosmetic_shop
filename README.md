# 💄 Aura Cosméticos — Plataforma de E-Commerce de Alta Escala

<div align="center">

![Python](https://img.shields.io/badge/Python-3.14-3776AB?style=for-the-badge&logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![Redis](https://img.shields.io/badge/Redis-7.0-DC382D?style=for-the-badge&logo=redis&logoColor=white)
![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)
![LGPD](https://img.shields.io/badge/Compliance-LGPD-green?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

<p align="center">
  <strong>Plataforma completa de comércio eletrônico multimarca de cosméticos e beleza, projetada para alta conversão mobile, busca inteligente tolerante a erros e resiliência extrema em concorrência de estoque.</strong>
</p>

[Visão Geral](#-visão-geral) •
[Diferenciais de Engenharia](#-diferenciais-de-engenharia) •
[Arquitetura do Sistema](#-arquitetura-do-sistema) •
[Estrutura de Pastas](#-estrutura-de-pastas) •
[Tecnologias Utilizadas](#-tecnologias-utilizadas) •
[Início Rápido](#-início-rápido) •
[Documentação Detalhada](#-documentação-detalhada)

</div>

---

## 🌟 Visão Geral

A **Aura Cosméticos** é uma plataforma full-stack desacoplada projetada para suportar alta carga (50.000+ acessos/dia) com foco em produtos de perfumaria, maquiagem e cuidados dermatológicos. 

O sistema integra:
- **Área do Cliente (Mobile-First)**: Vitrine fluida com catálogo de maquiagens, busca debounced com tolerância a erros e acentos, PDP (Product Detail Page) com fotos e acordeões dermatológicos (Modo de Uso e Ingredientes), compra com 1 clique ("Comprar Agora"), sacola deslizante (*Cart Drawer*), checkout One-Page com Pix instantâneo e acompanhamento do pedido em tempo real (*Order Stepper*).
- **Backoffice Administrativo (RBAC)**: Painel protegido para administradores com métricas de vendas (Faturamento, Ticket Médio, Pedidos), gráfico de evolução diária, alertas de estoque crítico (&le; 3 unidades), gerenciamento de catálogo de cosméticos (CRUD), atualização logística de pedidos e **monitor em tempo real de travas atômicas do Redis**.

---

## 🚀 Diferenciais de Engenharia

### 1. 🔍 Busca Fuzzy Inteligente via `pg_trgm` (PostgreSQL)
Cosméticos possuem nomes técnicos, estrangeiros e variações ortográficas frequentes (ex: *"batom vermêlho"*, *"shampô hidratante"*, *"serum hialuronico"*). A plataforma utiliza a extensão `pg_trgm` do PostgreSQL associada a índices **GiST Trigram Ops**, garantindo buscas ultra-rápidas com tolerância a erros de digitação e acentuação sem depender de motores externos pesados.

### 2. ⚡ Reserva Temporária Atômica com Redis Lua Script (Anti-Overselling)
Para evitar que dois clientes comprem o último cosmético no mesmo milissegundo (*race conditions*):
- O estoque é reservado no Redis via **Lua Script Atômico**.
- Em caso de compra simultânea com estoque unitário, exatamente um usuário obtém a reserva e o outro recebe imediatamente `409 Conflict / Esgotado`.
- A trava tem **TTL estrito de 30 minutos (1800s)** para pagamentos via Pix. Se o pagamento expirar ou for rejeitado, o estoque é devolvido automaticamente sem intervenção manual.

### 3. 🔒 Checkout Idempotente sob Redes Móveis Oscilantes
Conexões 4G/5G frequentemente oscilam ao finalizar pedidos. O checkout exige o cabeçalho `Idempotency-Key` (UUIDv4). Qualquer retentativa do cliente com a mesma chave retorna a resposta original em cache sem duplicar pedidos, reservas ou cobranças financeiras.

### 4. 🛡️ Segurança Robusta & Conformidade com LGPD
- **Argon2id**: Criptografia de senhas state-of-the-art via `argon2-cffi`, imune a ataques com aceleração GPU/ASIC.
- **Tokens JWT**: Autenticação stateless baseada em Bearer Tokens para clientes e administradores com verificação granular de perfis (`superadmin`, `manager`, `support`).
- **LGPD**: Consentimento obrigatório e explícito no cadastro e checkout, minimização de dados e armazenamento restrito.

---

## 🏛️ Arquitetura do Sistema

```
                        ┌──────────────────────────────────────────────┐
                        │              Navegadores & Mobile            │
                        └──────────────────────┬───────────────────────┘
                                               │
                                 HTTPS / REST / JSON (Axios)
                                               │
                        ┌──────────────────────▼───────────────────────┐
                        │      Front-End SPA (React 19 + Vite)         │
                        │   • Vitrine Mobile-First   • Backoffice      │
                        │   • One-Page Pix Checkout  • RBAC Guards     │
                        └──────────────────────┬───────────────────────┘
                                               │
                                       Porta 8000 (/api)
                                               │
                        ┌──────────────────────▼───────────────────────┐
                        │        FastAPI Application (Python 3.14)     │
                        │   • Lifespan Extension Setup                 │
                        │   • CORS & Custom AppException Handler       │
                        │   • Repositories & Services Desacoplados     │
                        └──────────────┬───────────────────────┬───────┘
                                       │                       │
                       SQLAlchemy 2.0 (asyncpg)         redis-py (async)
                                       │                       │
            ┌──────────────────────────▼────────┐   ┌──────────▼───────────────┐
            │       PostgreSQL 16 Engine        │   │       Redis 7 Cache      │
            │  • uuid-ossp, pg_trgm (GiST)      │   │  • Lua Script Stock Lock │
            │  • Clientes, Pedidos, Catálogo    │   │  • Guest Carts & Sessions│
            │  • Preparado para Master/Replica  │   │  • Idempotency TTL Cache │
            └───────────────────────────────────┘   └──────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
cosmetic_shop/
├── Back/                          # Back-end Python 3.14 + FastAPI
│   ├── core/                      # Configurações, Engines assíncronos e Segurança
│   │   ├── config.py              # Pydantic Settings (.env)
│   │   ├── database.py            # AsyncSession, write/read engines
│   │   ├── redis_client.py        # Redis connection pool
│   │   ├── security.py            # Argon2id hasher e JWT encode/decode
│   │   ├── dependencies.py        # Injeção de dependências FastAPI
│   │   └── exceptions.py          # AppException padronizada
│   ├── dtos/                      # Schemas de validação Pydantic v2
│   ├── models/                    # Modelos de domínio SQLAlchemy 2.0
│   ├── repositories/              # Camada de persistência desacoplada
│   ├── services/                  # Regras de negócio, Lua scripts e orquestração
│   ├── routers/                   # Endpoints REST expostos
│   ├── tests/                     # 100% Cobertura de Testes Automatizados
│   │   ├── unit/                  # Testes unitários de serviços e segurança
│   │   ├── concurrency/           # Teste de concorrência com travas Lua
│   │   ├── integration/           # Smoke tests de rotas FastAPI
│   │   └── e2e/                   # Jornada de compra e ciclo administrativo
│   ├── Dockerfile                 # Container oficial do Back-end
│   └── requirements.txt           # Dependências do Python
│
├── Front/                         # Front-end React 19 + TypeScript + Vite
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Átomos reutilizáveis (Button, Input, Badge, Modal)
│   │   │   ├── client/            # Componentes da loja (Vitrine, Header, Pix, Stepper)
│   │   │   └── admin/             # Componentes do Backoffice (Sidebar, KPIs, Gráficos)
│   │   ├── context/               # AuthContext (LGPD) e CartContext (reativo)
│   │   ├── hooks/                 # useCountdown, useDebounce, useOrderPolling
│   │   ├── pages/
│   │   │   ├── client/            # HomePage, ProductDetailPage, CheckoutPage, etc.
│   │   │   └── admin/             # AdminDashboard, AdminProducts, AdminOrders, etc.
│   │   ├── services/              # Instância configurada do Axios (apiClient)
│   │   ├── types/                 # Interfaces TypeScript centralizadas
│   │   ├── App.tsx                # Roteamento completo Client + Admin
│   │   ├── main.tsx               # Bootstrap React 19
│   │   └── index.css              # Configuração Tailwind CSS
│   ├── package.json               # Dependências do Node 24 LTS
│   ├── vite.config.ts             # Configuração Vite + Proxy + Vitest
│   └── Dockerfile                 # Container multi-stage com Nginx
│
├── docs/                          # Documentação técnica e planos de engenharia
├── docker-compose.yml             # Orquestração de todos os serviços (App + DB + Redis)
├── pytest.ini                     # Configuração do Pytest assíncrono
├── HELP.md                        # Guia operacional de instalação, execução e rotas
└── README.md                      # Este arquivo
```

---

## 🛠️ Tecnologias Utilizadas

### Back-End
- **Python 3.14**: Ambiente de execução com sintaxe assíncrona pura.
- **FastAPI**: Framework web de alta performance com tipagem estática e documentação OpenAPI automática.
- **SQLAlchemy 2.0 + asyncpg**: ORM assíncrono mapeando conexões com pool de leitura e escrita.
- **Redis 7 (redis-py)**: Cache de alta velocidade e motor de travas distribuídas via scripts Lua.
- **Argon2id (`argon2-cffi`)**: Algoritmo vencedor da Password Hashing Competition.
- **Pytest + Pytest-Asyncio + AnyIO**: Suíte completa de testes automatizados com execução concorrente.

### Front-End
- **React 19 & TypeScript 5**: Renderização reativa moderna, componentes funcionais tipados e React Hooks.
- **Vite 6**: Bundler ultrarrápido com Hot Module Replacement (HMR).
- **Tailwind CSS 3.4**: Estilização utilitária mobile-first com paleta cosmética elegante.
- **Lucide React**: Biblioteca moderna de ícones vetoriais.
- **Axios**: Cliente HTTP com interceptors para tokens de autenticação e sessão de visitantes.
- **Vitest & React Testing Library**: Testes unitários e de integração de componentes com JSDOM.

---

## ⚡ Início Rápido

### Usando Docker Compose (Recomendado)

Suba toda a infraestrutura (PostgreSQL, Redis, Back-end e Front-end) com um único comando:

```bash
docker compose up --build -d
```

Acesse:
- **Loja de Cosméticos (Cliente)**: [http://localhost:3000](http://localhost:3000)
- **Painel Backoffice (Admin)**: [http://localhost:3000/admin](http://localhost:3000/admin)
- **Documentação Interativa Swagger**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **Especificação OpenAPI JSON**: [http://localhost:8000/openapi.json](http://localhost:8000/openapi.json)

---

## 📖 Documentação Detalhada

Para instruções passo a passo sobre:
- Configuração de ambiente local (virtualenv e Node 24);
- Variáveis de ambiente (`.env`);
- Como rodar os testes automatizados do Back-end e Front-end;
- Tabela completa de **todas as rotas da API REST**, parâmetros e métodos;
- Portas e serviços utilizados;

Consulte o arquivo dedicado: 👉 **[HELP.md](./HELP.md)**.

---

## 📄 Licença

Este projeto é distribuído sob a licença **MIT**. Consulte o arquivo de licença para mais detalhes.
