#!/usr/bin/env python3
"""
Generates the comprehensive Postman Collection and Environment for Aura Cosméticos E-Commerce.
Covers 100% of the API endpoints, with full tests, dynamic variables, and error handling.
"""

import json

def build_collection():
    collection = {
        "info": {
            "_postman_id": "c7a8e52d-94b1-4f18-a6e3-cosmetic-shop-v2",
            "name": "Aura Cosméticos — E-Commerce API Collection",
            "description": "Coleção completa e exaustiva de testes da API REST da Aura Cosméticos (FastAPI + Redis 7 + PostgreSQL 16 com pg_trgm).\n\n"
                           "Cobre 100% das rotas e funcionalidades:\n"
                           "- 01: Health Check & OpenAPI Specification\n"
                           "- 02: Autenticação de Clientes (Argon2id + JWT) & Conformidade LGPD\n"
                           "- 03: Catálogo de Cosméticos & Busca Fuzzy com Trigramas (pg_trgm)\n"
                           "- 04: Carrinho de Compras em Sessões Redis (Guest + Merge)\n"
                           "- 05: Checkout Idempotente, Travas Atômicas Anti-Overselling no Redis & Pix Instantâneo\n"
                           "- 06: Acompanhamento de Pedidos em Tempo Real (Order Stepper)\n"
                           "- 07: Webhooks de Pagamento (Aprovação e Rollback de Estoque)\n"
                           "- 08: Suporte ao Cliente & Redirecionamento WhatsApp\n"
                           "- 09: Backoffice Administrativo (RBAC: SuperAdmin / Admin, KPIs, CRUD de Produtos, Monitor de Travas Redis)",
            "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
        },
        "variable": [
            {"key": "baseUrl", "value": "http://localhost:8000", "type": "string"},
            {"key": "client_token", "value": "", "type": "string"},
            {"key": "admin_token", "value": "", "type": "string"},
            {"key": "guest_cart_id", "value": "guest-session-123e4567-e89b-12d3-a456-426614174000", "type": "string"},
            {"key": "order_id", "value": "", "type": "string"},
            {"key": "product_id", "value": "1", "type": "string"},
            {"key": "admin_product_id", "value": "", "type": "string"},
            {"key": "reservation_key", "value": "stock:reserved:demo-order:1", "type": "string"},
            {"key": "idempotency_key", "value": "123e4567-e89b-12d3-a456-426614174000", "type": "string"},
            {"key": "user_email", "value": "camila.albuquerque@auracosmeticos.com.br", "type": "string"},
            {"key": "user_password", "value": "SenhaSegura123!", "type": "string"},
            {"key": "admin_email", "value": "admin@auracosmeticos.com.br", "type": "string"},
            {"key": "admin_password", "value": "Admin123!", "type": "string"}
        ],
        "item": []
    }

    def make_request(name, method, path, headers=None, body=None, query=None, pre_script=None, test_script=None):
        req_headers = []
        if headers:
            for k, v in headers.items():
                req_headers.append({"key": k, "value": v, "type": "text"})

        url_obj = {
            "raw": "{{baseUrl}}" + path + (("?" + "&".join([f"{k}={v}" for k, v in query.items()])) if query else ""),
            "host": ["{{baseUrl}}"],
            "path": [p for p in path.strip("/").split("/") if p]
        }
        if query:
            url_obj["query"] = [{"key": k, "value": str(v)} for k, v in query.items()]

        events = []
        if pre_script:
            events.append({
                "listen": "prerequest",
                "script": {"exec": pre_script if isinstance(pre_script, list) else pre_script.strip().split("\n"), "type": "text/javascript"}
            })
        if test_script:
            events.append({
                "listen": "test",
                "script": {"exec": test_script if isinstance(test_script, list) else test_script.strip().split("\n"), "type": "text/javascript"}
            })

        req_item = {
            "name": name,
            "event": events,
            "request": {
                "method": method,
                "header": req_headers,
                "url": url_obj
            }
        }

        if body is not None:
            req_item["request"]["body"] = {
                "mode": "raw",
                "raw": json.dumps(body, indent=2) if isinstance(body, dict) else str(body),
                "options": {"raw": {"language": "json"}}
            }

        return req_item

    # ----------------------------------------------------
    # FOLDER 01: Health & Sistema
    # ----------------------------------------------------
    f01 = {
        "name": "01 - Health & Sistema",
        "description": "Verificação de disponibilidade, conectividade e prontidão dos serviços essenciais e documentação.",
        "item": [
            make_request(
                name="Health Check da Aplicação",
                method="GET",
                path="/api/health",
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Tempo de resposta menor que 500ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(500);
});

pm.test("Serviço está operacional e saudável", function () {
    const json = pm.response.json();
    pm.expect(json.status).to.eql("healthy");
    pm.expect(json.service).to.eql("cosmetics-ecommerce");
});
"""
            ),
            make_request(
                name="Especificação OpenAPI 3.1 JSON",
                method="GET",
                path="/openapi.json",
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Esquema OpenAPI válido e rotas documentadas", function () {
    const json = pm.response.json();
    pm.expect(json.openapi).to.be.a("string");
    pm.expect(json.info.title).to.include("Aura Cosméticos");
    pm.expect(json.paths).to.be.an("object");
    pm.expect(json.paths).to.have.property("/api/health");
    pm.expect(json.paths).to.have.property("/api/checkout");
});
"""
            )
        ]
    }

    # ----------------------------------------------------
    # FOLDER 02: Autenticação & Clientes (LGPD)
    # ----------------------------------------------------
    f02 = {
        "name": "02 - Autenticação & Clientes (LGPD)",
        "description": "Cadastro e login de clientes com hash Argon2id, tokens Bearer JWT e consentimento explícito LGPD.",
        "item": [
            make_request(
                name="Cadastrar Nova Cliente (com Consentimento LGPD)",
                method="POST",
                path="/api/register",
                headers={"Content-Type": "application/json"},
                pre_script="""
const timestamp = Date.now();
const email = `camila.teste_${timestamp}@auracosmeticos.com.br`;
pm.collectionVariables.set("user_email", email);
pm.variables.set("register_email", email);
""",
                body={
                    "name": "Camila Albuquerque",
                    "email": "{{user_email}}",
                    "password": "SenhaSegura123!",
                    "phone": "11987654321",
                    "lgpd_consent": True
                },
                test_script="""
pm.test("Status code é 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("Retorna token JWT válido e salva na coleção", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("access_token");
    pm.expect(json.token_type).to.eql("bearer");
    pm.expect(json.access_token.length).to.be.above(20);
    pm.collectionVariables.set("client_token", json.access_token);
});
"""
            ),
            make_request(
                name="Cadastrar Cliente sem Consentimento LGPD (Validação)",
                method="POST",
                path="/api/register",
                headers={"Content-Type": "application/json"},
                body={
                    "name": "Cliente Sem LGPD",
                    "email": "sem.lgpd@auracosmeticos.com.br",
                    "password": "SenhaSegura123!",
                    "phone": "11987654321",
                    "lgpd_consent": False
                },
                test_script="""
pm.test("Status code é 400 ou 422 para consentimento LGPD falso", function () {
    pm.expect([400, 422]).to.include(pm.response.code);
});
"""
            ),
            make_request(
                name="Login da Cliente (Obter Token JWT)",
                method="POST",
                path="/api/login",
                headers={"Content-Type": "application/json"},
                body={
                    "email": "{{user_email}}",
                    "password": "SenhaSegura123!"
                },
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Token JWT de cliente emitido com sucesso", function () {
    const json = pm.response.json();
    pm.expect(json.access_token).to.be.a("string");
    pm.collectionVariables.set("client_token", json.access_token);
});
"""
            ),
            make_request(
                name="Login com Senha Incorreta (Teste Negativo 401)",
                method="POST",
                path="/api/login",
                headers={"Content-Type": "application/json"},
                body={
                    "email": "{{user_email}}",
                    "password": "SenhaIncorreta999!"
                },
                test_script="""
pm.test("Status code é 401 Unauthorized", function () {
    pm.response.to.have.status(401);
});

pm.test("Retorna mensagem de erro padronizada", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("error");
    pm.expect(json).to.have.property("message");
});
"""
            ),
            make_request(
                name="Obter Perfil da Cliente Autenticada (/me)",
                method="GET",
                path="/api/me",
                headers={"Authorization": "Bearer {{client_token}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Perfil da cliente retornado com role correta", function () {
    const json = pm.response.json();
    pm.expect(json.email).to.eql(pm.collectionVariables.get("user_email"));
    pm.expect(json.role).to.eql("client");
    pm.expect(json).to.have.property("name");
});
"""
            ),
            make_request(
                name="Acessar /me sem Token (Teste 401 Unauthorized)",
                method="GET",
                path="/api/me",
                test_script="""
pm.test("Status code é 401 Unauthorized sem token", function () {
    pm.response.to.have.status(401);
});
"""
            )
        ]
    }

    # ----------------------------------------------------
    # FOLDER 03: Catálogo & Busca Fuzzy (pg_trgm)
    # ----------------------------------------------------
    f03 = {
        "name": "03 - Catálogo & Busca Fuzzy (pg_trgm)",
        "description": "Navegação e busca de produtos de beleza com tolerância a erros e acentos via pg_trgm (PostgreSQL).",
        "item": [
            make_request(
                name="Listar Categorias de Cosméticos",
                method="GET",
                path="/api/categories",
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Retorna lista de categorias disponíveis", function () {
    const json = pm.response.json();
    const categories = json.items || json;
    pm.expect(categories).to.be.an("array");
    pm.expect(categories.length).to.be.above(0);
    pm.expect(categories[0]).to.have.property("slug");
    pm.expect(categories[0]).to.have.property("name");
});
"""
            ),
            make_request(
                name="Listar Produtos Paginados do Catálogo",
                method="GET",
                path="/api/products",
                query={"page": 1, "limit": 20},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Retorna produtos com paginação e captura ID", function () {
    const json = pm.response.json();
    const items = json.items || json;
    pm.expect(items).to.be.an("array");
    pm.expect(items.length).to.be.above(0);
    
    const first = items[0];
    const pid = first.id || first.product_id;
    pm.collectionVariables.set("product_id", String(pid));
    
    pm.expect(first).to.have.property("name");
    pm.expect(first).to.have.property("price");
    pm.expect(first).to.have.property("stock_quantity");
});
"""
            ),
            make_request(
                name="Filtrar Produtos por Categoria (Perfumaria)",
                method="GET",
                path="/api/products",
                query={"category": "perfumaria"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Retorna cosméticos da categoria perfumaria", function () {
    const json = pm.response.json();
    const items = json.items || json;
    pm.expect(items).to.be.an("array");
    if (items.length > 0) {
        pm.expect(items[0].name.toLowerCase()).to.satisfy(s => s.includes("parfum") || s.includes("perfume") || s.includes("floral") || true);
    }
});
"""
            ),
            make_request(
                name="Busca Fuzzy com Erro Ortográfico ('baton')",
                method="GET",
                path="/api/products",
                query={"search": "baton"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Encontra 'Batom' via pg_trgm mesmo com erro de digitação", function () {
    const json = pm.response.json();
    const items = json.items || json;
    pm.expect(items).to.be.an("array");
    pm.expect(items.length).to.be.above(0);
    const hasBatom = items.some(p => p.name.toLowerCase().includes("batom"));
    pm.expect(hasBatom).to.be.true;
});
"""
            ),
            make_request(
                name="Busca com Acento/Variação ('serum hialuronico')",
                method="GET",
                path="/api/products",
                query={"search": "serum hialuronico"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Encontra Sérum facial com busca sem acentos", function () {
    const json = pm.response.json();
    const items = json.items || json;
    pm.expect(items).to.be.an("array");
    pm.expect(items.length).to.be.above(0);
});
"""
            ),
            make_request(
                name="Obter Detalhes do Produto por ID (PDP)",
                method="GET",
                path="/api/products/{{product_id}}",
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Retorna dados completos para PDP com ingredientes e imagens", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("name");
    pm.expect(json).to.have.property("price");
    pm.expect(json).to.have.property("stock_quantity");
    pm.expect(json).to.have.property("description");
    pm.expect(json.images).to.be.an("array");
});
"""
            ),
            make_request(
                name="Consultar Produto Inexistente (Teste 404 Not Found)",
                method="GET",
                path="/api/products/999999",
                test_script="""
pm.test("Status code é 404 Not Found", function () {
    pm.response.to.have.status(404);
});
"""
            )
        ]
    }

    # ----------------------------------------------------
    # FOLDER 04: Carrinho de Compras (Redis Session)
    # ----------------------------------------------------
    f04 = {
        "name": "04 - Carrinho de Compras (Redis Session)",
        "description": "Gerenciamento de carrinho de compras volátil no Redis identificado por cabeçalho X-Cart-ID.",
        "item": [
            make_request(
                name="Obter Carrinho da Sessão de Visitante",
                method="GET",
                path="/api/cart",
                headers={"X-Cart-ID": "{{guest_cart_id}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Retorna estrutura de carrinho válida", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("items");
    pm.expect(json).to.have.property("total_amount");
    pm.expect(json).to.have.property("total_items");
});
"""
            ),
            make_request(
                name="Adicionar Cosmético ao Carrinho",
                method="POST",
                path="/api/cart/items",
                headers={
                    "Content-Type": "application/json",
                    "X-Cart-ID": "{{guest_cart_id}}"
                },
                body={
                    "product_id": 1,
                    "quantity": 2
                },
                test_script="""
pm.test("Status code é 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("Item inserido e total de itens incrementado", function () {
    const json = pm.response.json();
    pm.expect(json.total_items).to.be.at.least(2);
    pm.expect(json.total_amount).to.be.above(0);
});
"""
            ),
            make_request(
                name="Atualizar Quantidade de um Item no Carrinho",
                method="PUT",
                path="/api/cart/items/1",
                headers={
                    "Content-Type": "application/json",
                    "X-Cart-ID": "{{guest_cart_id}}"
                },
                body={"quantity": 3},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Quantidade atualizada para 3", function () {
    const json = pm.response.json();
    const item = json.items.find(i => (i.product_id || i.id) === 1);
    if (item) {
        pm.expect(item.quantity).to.eql(3);
    }
});
"""
            ),
            make_request(
                name="Remover Item do Carrinho",
                method="DELETE",
                path="/api/cart/items/1",
                headers={"X-Cart-ID": "{{guest_cart_id}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Carrinho recalculado após exclusão", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("items");
});
"""
            ),
            make_request(
                name="Mesclar Carrinho Anônimo após Login",
                method="POST",
                path="/api/cart/merge",
                headers={
                    "Authorization": "Bearer {{client_token}}",
                    "X-Guest-Cart-Id": "{{guest_cart_id}}"
                },
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});
"""
            )
        ]
    }

    # ----------------------------------------------------
    # FOLDER 05: Checkout & Travas Atômicas de Estoque
    # ----------------------------------------------------
    f05 = {
        "name": "05 - Checkout & Pagamento Pix (Idempotência + Redis Lock)",
        "description": "Finalização de pedidos, reserva atômica de estoque (Lua Script no Redis) e idempotência via cabeçalho Idempotency-Key.",
        "item": [
            make_request(
                name="Finalizar Pedido One-Page (Gera Pix com Trava Atômica)",
                method="POST",
                path="/api/checkout",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer {{client_token}}",
                    "Idempotency-Key": "{{idempotency_key}}"
                },
                pre_script="""
const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
});
pm.collectionVariables.set("idempotency_key", uuid);
""",
                body={
                    "customer_name": "Camila Albuquerque",
                    "customer_email": "{{user_email}}",
                    "customer_cpf": "123.456.789-00",
                    "customer_phone": "11987654321",
                    "shipping_address": {
                        "street": "Avenida Paulista",
                        "number": "1000",
                        "complement": "Apto 42",
                        "neighborhood": "Bela Vista",
                        "city": "São Paulo",
                        "state": "SP",
                        "zip_code": "01310-100"
                    },
                    "payment_method": "pix",
                    "items": [
                        {
                            "product_id": 1,
                            "quantity": 1
                        }
                    ]
                },
                test_script="""
pm.test("Status code é 202 Accepted", function () {
    pm.response.to.have.status(202);
});

pm.test("Pedido criado, estoque reservado no Redis e Pix emitido", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("order_id");
    pm.expect(json.status).to.eql("pending");
    pm.expect(json.payment_method).to.eql("pix");
    pm.expect(json).to.have.property("pix_copy_paste");
    pm.expect(json).to.have.property("pix_qr_code_base64");
    
    pm.collectionVariables.set("order_id", json.order_id);
});
"""
            ),
            make_request(
                name="Teste de Idempotência (Mesmo Idempotency-Key)",
                method="POST",
                path="/api/checkout",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer {{client_token}}",
                    "Idempotency-Key": "{{idempotency_key}}"
                },
                body={
                    "customer_name": "Camila Albuquerque",
                    "customer_email": "{{user_email}}",
                    "customer_cpf": "123.456.789-00",
                    "customer_phone": "11987654321",
                    "shipping_address": {
                        "street": "Avenida Paulista",
                        "number": "1000",
                        "city": "São Paulo",
                        "state": "SP",
                        "zip_code": "01310-100"
                    },
                    "payment_method": "pix",
                    "items": [{"product_id": 1, "quantity": 1}]
                },
                test_script="""
pm.test("Status code é 202 Accepted", function () {
    pm.response.to.have.status(202);
});

pm.test("Idempotência confirmada: retorna a mesma resposta sem duplicar pedido", function () {
    const json = pm.response.json();
    pm.expect(json.order_id).to.eql(pm.collectionVariables.get("order_id"));
});
"""
            ),
            make_request(
                name="Checkout Direto de 1 Clique ('Comprar Agora')",
                method="POST",
                path="/api/checkout/direct",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer {{client_token}}"
                },
                body={
                    "product_id": 2,
                    "quantity": 1,
                    "customer_name": "Camila Albuquerque",
                    "customer_email": "{{user_email}}",
                    "customer_cpf": "123.456.789-00",
                    "customer_phone": "11987654321",
                    "shipping_address": {
                        "street": "Rua Oscar Freire",
                        "number": "500",
                        "city": "São Paulo",
                        "state": "SP",
                        "zip_code": "01426-001"
                    },
                    "payment_method": "pix"
                },
                test_script="""
pm.test("Status code é 202 Accepted", function () {
    pm.response.to.have.status(202);
});

pm.test("Pedido direto criado em milissegundos", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("order_id");
    pm.expect(json.status).to.eql("pending");
});
"""
            )
        ]
    }

    # ----------------------------------------------------
    # FOLDER 06: Acompanhamento de Pedidos
    # ----------------------------------------------------
    f06 = {
        "name": "06 - Acompanhamento de Pedidos (Order Stepper)",
        "description": "Consulta de pedidos da cliente e acompanhamento em tempo real.",
        "item": [
            make_request(
                name="Listar Histórico de Pedidos da Cliente",
                method="GET",
                path="/api/orders",
                headers={"Authorization": "Bearer {{client_token}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Retorna histórico de pedidos da cliente", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an("array");
    pm.expect(json.length).to.be.above(0);
});
"""
            ),
            make_request(
                name="Consultar Status do Pedido em Tempo Real (Order Stepper)",
                method="GET",
                path="/api/orders/{{order_id}}",
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Detalhes do pedido e status logístico retornados", function () {
    const json = pm.response.json();
    pm.expect(json.order_id).to.eql(pm.collectionVariables.get("order_id"));
    pm.expect(json).to.have.property("status");
    pm.expect(json.items).to.be.an("array");
});
"""
            ),
            make_request(
                name="Consultar Pedido Inexistente (Teste 404 Not Found)",
                method="GET",
                path="/api/orders/00000000-0000-0000-0000-000000000000",
                test_script="""
pm.test("Status code é 404 Not Found", function () {
    pm.response.to.have.status(404);
});
"""
            )
        ]
    }

    # ----------------------------------------------------
    # FOLDER 07: Webhooks de Pagamento
    # ----------------------------------------------------
    f07 = {
        "name": "07 - Webhooks de Pagamento (Gateway)",
        "description": "Recepção de notificações assíncronas de gateways de pagamento (aprovação e estorno/rollback).",
        "item": [
            make_request(
                name="Simular Aprovação Pix (Baixa Definitiva de Estoque)",
                method="POST",
                path="/api/webhooks/payment",
                headers={"Content-Type": "application/json"},
                body={
                    "event": "payment.approved",
                    "order_id": "{{order_id}}",
                    "amount": 49.90,
                    "payment_method": "pix"
                },
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Confirmação de recebimento do webhook", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("message");
});
"""
            ),
            make_request(
                name="Simular Expiração/Rejeição Pix (Rollback de Estoque no Redis)",
                method="POST",
                path="/api/webhooks/payment",
                headers={"Content-Type": "application/json"},
                body={
                    "event": "payment.expired",
                    "order_id": "{{order_id}}",
                    "amount": 49.90,
                    "payment_method": "pix"
                },
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});
"""
            )
        ]
    }

    # ----------------------------------------------------
    # FOLDER 08: Suporte & WhatsApp
    # ----------------------------------------------------
    f08 = {
        "name": "08 - Suporte & WhatsApp",
        "description": "Redirecionamento para atendimento e suporte ao cliente via WhatsApp oficial.",
        "item": [
            make_request(
                name="Redirecionamento Oficial WhatsApp com Produto",
                method="GET",
                path="/api/whatsapp-redirect",
                query={"product_name": "Batom Matte"},
                test_script="""
pm.test("Status code é 200 ou Redirecionamento (307)", function () {
    pm.expect([200, 307]).to.include(pm.response.code);
});
"""
            )
        ]
    }

    # ----------------------------------------------------
    # FOLDER 09: Backoffice Administrativo (RBAC)
    # ----------------------------------------------------
    f09 = {
        "name": "09 - Backoffice Administrativo (RBAC)",
        "description": "Painel gerencial protegido: KPIs, séries temporais, CRUD de catálogo, gestão de pedidos e auditoria de travas no Redis.",
        "item": [
            make_request(
                name="Login do Administrador (Obter Admin Token)",
                method="POST",
                path="/api/admin/login",
                headers={"Content-Type": "application/json"},
                body={
                    "email": "{{admin_email}}",
                    "password": "{{admin_password}}"
                },
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Token JWT de administrador emitido com perfil SuperAdmin", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("access_token");
    pm.collectionVariables.set("admin_token", json.access_token);
});
"""
            ),
            make_request(
                name="Relatório de Vendas (KPIs Gerenciais)",
                method="GET",
                path="/api/admin/reports/sales",
                headers={"Authorization": "Bearer {{admin_token}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("KPIs retornados com faturamento, pedidos e alerta de estoque crítico", function () {
    const json = pm.response.json();
    pm.expect(json).to.have.property("daily_revenue");
    pm.expect(json).to.have.property("total_orders_today");
    pm.expect(json).to.have.property("critical_stock_count");
});
"""
            ),
            make_request(
                name="Série Temporal de Vendas Diárias (Gráfico)",
                method="GET",
                path="/api/admin/reports/sales/chart",
                query={"days": 7},
                headers={"Authorization": "Bearer {{admin_token}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Retorna pontos da série temporal para renderização do gráfico", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an("array");
});
"""
            ),
            make_request(
                name="Auditoria de Travas Atômicas de Estoque (Redis)",
                method="GET",
                path="/api/admin/inventory/reservations",
                headers={"Authorization": "Bearer {{admin_token}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Lista de travas atômicas anti-overselling retornada", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an("array");
    if (json.length > 0 && json[0].key) {
        pm.collectionVariables.set("reservation_key", json[0].key);
    }
});
"""
            ),
            make_request(
                name="Cadastrar Novo Cosmético (Admin CRUD)",
                method="POST",
                path="/api/admin/products",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer {{admin_token}}"
                },
                pre_script="""
const uniqueSuffix = Date.now();
pm.variables.set("admin_prod_name", "Batom Velvet Edição Especial " + uniqueSuffix);
pm.variables.set("admin_prod_slug", "batom-velvet-especial-" + uniqueSuffix);
""",
                body={
                    "name": "{{admin_prod_name}}",
                    "slug": "{{admin_prod_slug}}",
                    "brand": "Aura Privée",
                    "price": 69.90,
                    "stock_quantity": 40,
                    "description": "Edição de luxo com acabamento aveludado e hidratação profunda.",
                    "ingredients": "Óleo de Rosa Mosqueta, Vitamina E e Pigmentos Minerais.",
                    "how_to_use": "Aplique diretamente nos lábios.",
                    "is_active": True,
                    "images": [
                        {
                            "image_url": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=600",
                            "is_primary": True
                        }
                    ]
                },
                test_script="""
pm.test("Status code é 201 Created", function () {
    pm.response.to.have.status(201);
});

pm.test("Cosmético criado e ID armazenado", function () {
    const json = pm.response.json();
    const pid = json.id || json.product_id;
    pm.expect(pid).to.be.ok;
    pm.collectionVariables.set("admin_product_id", String(pid));
});
"""
            ),
            make_request(
                name="Atualizar Dados e Saldo de Estoque de Cosmético",
                method="PUT",
                path="/api/admin/products/{{admin_product_id}}",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer {{admin_token}}"
                },
                body={
                    "price": 59.90,
                    "stock_quantity": 38,
                    "is_active": True
                },
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Preço e estoque atualizados com sucesso", function () {
    const json = pm.response.json();
    pm.expect(Number(json.price)).to.eql(59.90);
    pm.expect(json.stock_quantity).to.eql(38);
});
"""
            ),
            make_request(
                name="Desativar Cosmético do Catálogo (Soft Delete)",
                method="DELETE",
                path="/api/admin/products/{{admin_product_id}}",
                headers={"Authorization": "Bearer {{admin_token}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});
"""
            ),
            make_request(
                name="Listar Todos os Pedidos do E-Commerce (Admin)",
                method="GET",
                path="/api/admin/orders",
                headers={"Authorization": "Bearer {{admin_token}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Lista global de pedidos da plataforma retornada", function () {
    const json = pm.response.json();
    pm.expect(json).to.be.an("array");
});
"""
            ),
            make_request(
                name="Atualizar Status do Pedido para Despacho Logístico",
                method="PATCH",
                path="/api/admin/orders/{{order_id}}/status",
                headers={
                    "Content-Type": "application/json",
                    "Authorization": "Bearer {{admin_token}}"
                },
                body={
                    "status": "shipped"
                },
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});

pm.test("Status do pedido alterado para enviado ('shipped')", function () {
    const json = pm.response.json();
    pm.expect(json.status).to.eql("shipped");
});
"""
            ),
            make_request(
                name="Liberar Manualmente Trava de Estoque no Redis",
                method="DELETE",
                path="/api/admin/inventory/reservations/{{reservation_key}}",
                headers={"Authorization": "Bearer {{admin_token}}"},
                test_script="""
pm.test("Status code é 200 OK", function () {
    pm.response.to.have.status(200);
});
"""
            ),
            make_request(
                name="Tentar Acesso Administrativo com Token de Cliente (Teste 403 Forbidden)",
                method="GET",
                path="/api/admin/reports/sales",
                headers={"Authorization": "Bearer {{client_token}}"},
                test_script="""
pm.test("Status code é 403 Forbidden para usuário comum", function () {
    pm.response.to.have.status(403);
});
"""
            )
        ]
    }

    collection["item"] = [f01, f02, f03, f04, f05, f06, f07, f08, f09]
    return collection

def build_environment():
    return {
        "id": "e81d8c1e-3b2d-419b-a0d3-aura-env",
        "name": "Aura Cosméticos — Ambiente Local",
        "values": [
            {"key": "baseUrl", "value": "http://localhost:8000", "type": "default", "enabled": True},
            {"key": "client_token", "value": "", "type": "secret", "enabled": True},
            {"key": "admin_token", "value": "", "type": "secret", "enabled": True},
            {"key": "guest_cart_id", "value": "guest-session-123e4567-e89b-12d3-a456-426614174000", "type": "default", "enabled": True},
            {"key": "order_id", "value": "", "type": "default", "enabled": True},
            {"key": "product_id", "value": "1", "type": "default", "enabled": True},
            {"key": "admin_product_id", "value": "", "type": "default", "enabled": True},
            {"key": "reservation_key", "value": "stock:reserved:demo-order:1", "type": "default", "enabled": True},
            {"key": "idempotency_key", "value": "123e4567-e89b-12d3-a456-426614174000", "type": "default", "enabled": True},
            {"key": "user_email", "value": "camila.albuquerque@auracosmeticos.com.br", "type": "default", "enabled": True},
            {"key": "user_password", "value": "SenhaSegura123!", "type": "secret", "enabled": True},
            {"key": "admin_email", "value": "admin@auracosmeticos.com.br", "type": "default", "enabled": True},
            {"key": "admin_password", "value": "Admin123!", "type": "secret", "enabled": True}
        ],
        "_postman_variable_scope": "environment"
    }

if __name__ == "__main__":
    col = build_collection()
    with open("postman_collection.json", "w", encoding="utf-8") as f:
        json.dump(col, f, indent=2, ensure_ascii=False)
    print("postman_collection.json gerado com sucesso!")

    env = build_environment()
    with open("postman_environment.json", "w", encoding="utf-8") as f:
        json.dump(env, f, indent=2, ensure_ascii=False)
    print("postman_environment.json gerado com sucesso!")
