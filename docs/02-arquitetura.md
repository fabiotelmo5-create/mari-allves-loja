# ARQUITETURA E DADOS — Mari Allves — Moda Modesta (MVP)

## 1. Visão geral

```
┌────────────────────────────┐        HTTPS        ┌──────────────────────────────┐
│  Cliente (navegador)       │ ──────────────────► │  Vercel — Next.js (App Router)│
│  - Loja / checkout         │                     │  - SSR + Server Components    │
│  - Área do cliente         │ ◄────────────────── │  - API routes / Server Actions│
│  - Admin (/admin)          │                     │  - Auth (Supabase)            │
└────────────────────────────┘                     └───────────────┬──────────────┘
                                                                    │
                             ┌──────────────────────────────────────┼───────────────────────┐
                             │                                      ▼                       │
                             │  Supabase (região São Paulo)                                 │
                             │   - Postgres (RLS, transações, migrations)                  │
                             │   - Auth (usuários, sessões, recuperação)                   │
                             │   - Storage (imagens dos produtos)                          │
                             │   - Realtime (opcional)                                      │
                             └─────────────────────────────────────────────────────────────┘
                                                                    │
        ┌───────────────────────────────┐                           │
        │ Provedor de pagamento         │ ◄── webhook autenticado ──┘
        │ (Mercado Pago / PagBank)      │
        └───────────────────────────────┘
        ┌───────────────────────────────┐
        │ E-mail transacional           │  (confirmação, recuperação de senha)
        └───────────────────────────────┘
        ┌───────────────────────────────┐
        │ Upstash Redis                 │  (rate limiting)
        └───────────────────────────────┘
```

## 2. Camadas

1. **Apresentação:** páginas em Server Components (SSR para SEO) + componentes interativos (client).
2. **Aplicação:** Server Actions e API routes (rotas `/api/*`).
3. **Domínio:** regras de negócio (preço, estoque, cupom, frete, pedido) em módulos.
4. **Infra:** Supabase (Postgres/Auth/Storage), Vercel, Redis, e-mail.

## 3. Modelo de dados (resumo)

Tabelas principais (nomes provisórios; em inglês no banco, textos em pt-BR na UI):

| Tabela | Colunas-chave | Relações |
|---|---|---|
| `profiles` | id, user_id, full_name, cpf?, phone | 1:1 `auth.users` |
| `admin_users` | id, user_id, role | 1:1 `auth.users`; papéis: superadmin, admin, estoquista |
| `audit_log` | id, table_name, record_id, action, changed_by, changed_at, old_data, new_data | — |
| `categories` | id, name, slug, parent_id, position, active | auto-relação (subcategoria) |
| `products` | id, sku, name, slug, description, category_id, price_cents, previous_price_cents, composition, care, weight_g, dimensions, status, published_at, created_at, updated_at | N:1 categoria; 1:N variações/imagens |
| `product_variants` | id, product_id, size, color, sku, price_cents?, active | N:1 produto |
| `product_images` | id, product_id, url, alt, position | N:1 produto |
| `stock` | variant_id (PK), quantity, low_stock_threshold | 1:1 variação |
| `stock_movements` | id, variant_id, type, quantity, reason, user_id, created_at | N:1 variação |
| `addresses` | id, customer_id, label, zip, street, number, district, city, state, complement, is_default | N:1 cliente |
| `carts` | id, customer_id?, session_id?, created_at, updated_at | 1:N itens |
| `cart_items` | id, cart_id, variant_id, quantity | N:1 carrinho/variação |
| `orders` | id, code, customer_id?, guest_email, status, subtotal_cents, discount_cents, shipping_cents, total_cents, address_snapshot(jsonb), shipping_method, shipping_days, created_at | 1:N itens; 1:N pagamentos |
| `order_items` | id, order_id, variant_id?, product_name, size, color, quantity, unit_price_cents, total_cents | N:1 pedido (**congela** nome/preço/qtd) |
| `order_status_history` | id, order_id, from_status, to_status, note, changed_by, created_at | N:1 pedido |
| `payments` | id, order_id, provider, provider_tx_id (único), method, status, amount_cents, idempotency_key, raw(jsonb), created_at, updated_at | N:1 pedido |
| `payment_events` | id, payment_id, event_type, payload(jsonb), received_at | N:1 pagamento (idempotência) |
| `coupons` | id, code, type, value, starts_at, ends_at, max_uses, min_subtotal_cents, active | — |
| `coupon_usages` | id, coupon_id, order_id, customer_id | N:1 cupom/pedido |
| `shipping_zones` | id, name, zip_ranges(jsonb), price_cents, days, active | — |
| `shipments` | id, order_id, tracking_code, carrier, shipped_at, delivered_at | N:1 pedido |
| `wishlists` | id, customer_id, product_id | N:1 cliente/produto |
| `content_blocks` | id, key, type, data(jsonb), updated_by, updated_at | banners/textos/destaques |
| `settings` | key (PK), value(jsonb), updated_at | — |
| `lgpd_consents` | id, customer_id?, type, granted, ip, user_agent, created_at | — |
| `data_requests` | id, customer_id, type, status, created_at, resolved_at | — |

**Regras de modelagem**
- Dinheiro em **centavos** (`BIGINT`), nunca float.
- Todo pedido **congela** nome/preço/quantidade do item.
- `status` de produto e de pedido são `ENUM` (ou tabela de domínio).
- Índices em: `products(status, category_id)`, `product_variants(product_id)`, `orders(customer_id, created_at)`, `order_items(order_id)`, `payments(provider_tx_id)` único, `cart_items(cart_id)`.
- `deleted_at` (soft delete) onde fizer sentido (produtos/categorias).

## 4. Concorrência de estoque

- Reserva em **transação** (`SERIALIZABLE` ou `SELECT ... FOR UPDATE` na variação).
- Alternativa: `UPDATE stock SET quantity = quantity - $1 WHERE variant_id = $2 AND quantity >= $1 RETURNING quantity` → se `0` linhas, sem estoque.
- Nunca estoque negativo; teste de concorrência obrigatório no aceite.

## 5. Fluxo de pagamento (abstraído)

```
1. Cliente confirma pedido  → cria order (status: aguardando_pagamento) + reserva estoque
2. Checkout chama PaymentProvider.createCharge(order) → provider_tx_id + idempotency_key
3. Cliente paga no provedor (Pix/cartão/boleto)
4. Provedor chama POST /api/webhooks/payments (com assinatura)
5. Handler valida assinatura → grava payment_event (idempotente) → atualiza payment + order
6. NUNCA confiar em página de sucesso do cliente
7. Reembolso: PaymentProvider.refund(payment) → atualiza status + financeiro
```

## 6. Autenticação e autorização

- **Cliente:** Supabase Auth (e-mail/senha), JWT curto + refresh, cookie `httpOnly`/`Secure`/`SameSite`.
- **Admin:** `admin_users` com papel; middleware de rota verifica sessão + papel antes de qualquer consulta.
- **RLS:** toda tabela de cliente/pedido/carrinho com política que restringe por `auth.uid()`; admin usa service role (fora do RLS) com permissão de papel.
- **Primeiro admin:** seed via variável de ambiente + troca obrigatória.

## 7. Segurança

- HTTPS obrigatório; HSTS.
- Validação de entrada em todas as rotas (zod), sanitização de saída (XSS), CSRF para ações de cookie.
- Rate limiting em login, recuperação de senha e webhooks (Upstash).
- Senhas com argon2/bcrypt; nunca logar segredos.
- Segredos em variáveis de ambiente (`.env` não versionado).
- Erros tratados sem vazar stack/dados; logs estruturados.
- Backups diários + restore testado; RPO/RTO definidos.

## 8. LGPD

- Região **São Paulo** no Supabase.
- Coleta mínima; `lgpd_consents` registra finalidade e escolha.
- Direitos do titular via `data_requests` (acesso, correção, exclusão, portabilidade).
- Retenção conforme obrigação legal; descarte seguro ao fim.
- Política de privacidade reflete o funcionamento real.

## 9. Ambientes e CI/CD

| Ambiente | Uso | Pagamento |
|---|---|---|
| `dev` | local | sandbox |
| `staging` | homologação | sandbox |
| `production` | loja real | real |

- CI: lint, typecheck, testes unitários e E2E (Playwright).
- Migrations versionadas; sem operação destrutiva em produção.
- Feature flags para funcionalidades em rollout.

## 10. Jobs e tarefas

- Envio de e-mail: fila leve (ex.: `pg_cron` + tabela de e-mails ou provedor com retentativa).
- Webhooks: handlers curtos e idempotentes; trabalho pesado vai para fila.
- Backups: agendados fora do pico.
