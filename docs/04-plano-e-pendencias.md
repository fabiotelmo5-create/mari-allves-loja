# PLANO DE FASES, RISCOS E PENDÊNCIAS — Mari Allves — Moda Modesta

## 1. Decisões registradas (log de decisões)

| # | Decisão | Escolha | Data |
|---|---|---|---|
| D1 | Stack | Next.js + TypeScript + Tailwind | 2026-10-20 |
| D2 | Banco | PostgreSQL (Supabase, região SP) | 2026-10-20 |
| D3 | Auth/Storage | Supabase Auth + Storage | 2026-10-20 |
| D4 | Deploy | Vercel (front) — Firebase Hosting não roda Next.js | 2026-10-20 |
| D5 | Pagamento | Abstraído atrás de interface; provedor real depois | 2026-10-20 |
| D6 | Escopo | MVP primeiro, entregas incrementais | 2026-10-20 |
| D7 | Fiscal (NFC-e/NF-e) | Fora do MVP — fase posterior | 2026-10-20 |
| D8 | Dados da empresa | A confirmar (PF ou PJ) | 2026-10-20 |
| D9 | Formato da entrega | Markdown + wireframes ASCII | 2026-10-20 |

## 2. Plano de fases

| Fase | Entrega | Marco de aceite | Previsão |
|---|---|---|---|
| **0 — Descoberta e setup** | Dados reais, domínio, contas, stack, repo/CI, ambientes | Stack confirmada; repositório e CI no ar | 1 semana |
| **1 — Fundação** | Schema DB + RLS, migrations, auth cliente/admin, RBAC, design system, layouts | Login/admin funcionando; migrations rodando | 1–2 semanas |
| **2 — Catálogo** | CRUD produtos/variações/imagens, home, catálogo, categorias, produto, busca, filtros, novidades, promoções, mais vendidos | Produto publicado aparece na loja; filtros corretos | 2–3 semanas |
| **3 — Carrinho e checkout** | Carrinho persistente, cupons, frete por CEP, checkout guest/conta, revisão, confirmação | Compra completa em sandbox | 2 semanas |
| **4 — Pagamentos** | Provedor real, webhooks idempotentes, reconciliação, status, reembolso | Aprovação só via webhook; sem duplicidade | 1–2 semanas |
| **5 — Área do cliente** | Pedidos, rastreio, endereços, favoritos, dados/senha | Cliente vê só os próprios dados | 1 semana |
| **6 — Admin completo** | Dashboard, estoque, pedidos, clientes, cupons, conteúdo, usuários, auditoria | Estoque nunca negativo sob concorrência | 2–3 semanas |
| **7 — Logística** | Zonas/CEPs, taxas/prazos, frete grátis, retirada, rastreamento | Frete/prazo corretos antes do pagamento | 1–2 semanas |
| **8 — Legal, LGPD, acessibilidade** | Políticas, cookies, consentimento, 404, a11y, direitos do titular | Políticas refletem o funcionamento real | 1–2 semanas |
| **9 — Fiscal (NFC-e/NF-e)** | Emissor integrado (depende de contador + certificado A1) | Nota emitida e enviada ao cliente | 2–4 semanas |
| **10 — Go-live** | Testes E2E, carga, segurança, backups, monitoramento | Loja no ar aceitando pedidos reais | 1–2 semanas |

> Previsão total do **MVP (Fases 0–6 + 8 mínimo)**: ~10–16 semanas. "MVP rápido (semanas)" exige escopo enxuto e decisões rápidas.

## 2.1 Status atual (atualizado em 2026-11-03)

Legenda: ✅ concluído · 🟡 em andamento · ⬜ não iniciado

| Fase | Status | O que já existe | O que falta |
|---|---|---|---|
| **0 — Descoberta e setup** | 🟡 80% | Monorepo, GitHub, Vercel, Supabase SP, banco criado | Domínio, dados da empresa, logo, produtos reais, conta de pagamento, e-mail |
| **1 — Fundação** | 🟡 90% | Schema + migrations, design system, layouts, **Supabase Auth (cadastro/login/logout/senha)**, RBAC admin, RLS no Profile | RLS nas demais tabelas, SMTP próprio |
| **2 — Catálogo** | 🟡 85% | Páginas, leitura do banco via Prisma, seed (6 produtos), **CRUD de produtos no admin**, **busca `/busca`**, **filtros de categoria (tamanho, preço, ordenação)** | Produtos/fotos reais, "mais vendidos" (sem histórico de vendas), curadoria de destaques |
| **3 — Carrinho e checkout** | ✅ 90% | Carrinho localStorage, frete por CEP, checkout guest/conta, pedido no banco com idempotência, baixa atômica de estoque, pagamento manual, rastreio público, admin de pedidos, cancelamento com devolução | Cupom, carrinho persistente no banco, pagamento real (Fase 4) |
| **4 — Pagamentos** | ⬜ 0% | Interface de pagamento manual (`provider='manual'`, `method='a_combinar'`) | Provedor, webhooks, reconciliação |
| **5 — Área do cliente** | 🟡 70% | Login/cadastro, `/conta`, `/meus-pedidos`, rastreio, redefinição de senha | Endereços salvos, favoritos, edição de dados |
| **6 — Admin completo** | 🟡 70% | RBAC, dashboard, CRUD produtos/variações/estoque, pedidos (lista/detalhe/status/rastreio), auditoria | Clientes, cupons, conteúdo, usuários admin, relatórios |
| **7 — Logística** | 🟡 40% | Zona de frete por CEP (Barreiras, R$ 12 placeholder), prazo, rastreio por shipment | Regras/taxas confirmadas, transportadoras, retirada |
| **8 — Legal, LGPD, a11y** | 🟡 70% | Políticas corrigidas para o funcionamento real (sem CPF, sem analytics, sem promessas falsas), CDC art. 49, LGPD, a11y básica | Dados da empresa/contato, revisão jurídica, banner de cookies (desnecessário enquanto não houver cookies não essenciais) |
| **9 — Fiscal** | ⬜ 0% | — | Fora do MVP |
| **10 — Go-live** | 🟡 15% | Produção Vercel + Supabase, E2E local | Backups/restore, monitoramento, carga, segurança, domínio |

### Ordem recomendada a partir daqui

1. ~~**Auth (Fase 1)** — cadastro/login real com Supabase Auth + perfis.~~ ✅ concluído
2. ~~**Admin de produtos (Fase 6, recorte)** — criar, editar, publicar, arquivar, variações e estoque.~~ ✅ concluído
3. ~~**Pedidos (Fase 3)** — checkout gravando no banco, com baixa de estoque transacional.~~ ✅ concluído
4. **Dados reais + fotos** — bloqueia o catálogo de produção.
5. **Dados da empresa/contato** — bloqueia páginas legais, contato e rodapé completos.
6. **SMTP + URLs do Supabase** — bloqueia confirmação de cadastro e recuperação de senha.
7. **Frete real** — confirmar zona, taxa e prazo de Barreiras/BA.
8. **Pagamento (Fase 4)** — depende de conta homologada.
9. **Go-live** — domínio, backups, monitoramento e E2E em produção.

## 2.2 Configuração pendente no Supabase (Auth)

Duas configurações precisam ser feitas **no painel do Supabase** (não há como
fazer por código com a chave anon):

**A. URLs de redirecionamento** (obrigatório para confirmação de e-mail e
recuperação de senha)

Authentication → URL Configuration:

- **Site URL:** `https://mari-allves-loja.vercel.app`
- **Redirect URLs:**
  - `https://mari-allves-loja.vercel.app/auth/callback`
  - `http://localhost:3000/auth/callback`

Sem isso, os links de e-mail caem em `localhost` e não funcionam em produção.

**B. Envio de e-mail** (recomendado)

O SMTP padrão do Supabase é limitado (poucos e-mails por hora) e costuma cair
em spam. Opções:

1. **Produção:** configurar SMTP próprio (Resend, SendGrid, Amazon SES) em
   Authentication → SMTP Settings.
2. **MVP/validação:** desligar "Confirm email" em Authentication → Providers →
   Email, para o cadastro entrar direto (a recuperação de senha continua
   dependendo do item A + SMTP).

## 2.3 Como criar o primeiro administrador

1. A pessoa se cadastra normalmente em `/conta/cadastro`.
2. No servidor, com o banco configurado:

   ```bash
   pnpm --filter @mari-allves/db admin:promote email@exemplo.com SUPERADMIN
   ```

3. Acessa `/admin/login` com o e-mail e a senha dessa conta.

Papéis disponíveis: `SUPERADMIN`, `ADMIN`, `ESTOQUISTA`.

## 2.4 Correção de schema (2026-11-03)

A migração inicial não tinha três colunas já previstas no schema Prisma:
`StockMovement.adminUserId`, `Order.adminUserId` e `OrderItem.productId`.
A migração `20261103000000_fix_missing_admin_product_fks` adiciona as colunas e
as FKs opcionais, sem perda de dados. Já aplicada no Supabase.

Também foi corrigido o fallback de produto sem imagem (card e página do produto)
e adicionada a validação que exige imagem principal para publicar.


## 2.5 Fase 3 — entregue (2026-11-03)

Fluxo de compra completo, ainda **sem pagamento online**:

- Checkout recalcula preços e frete no servidor e ignora valores enviados pelo cliente.
- Pedido criado em transação com baixa atômica de estoque e `StockMovement` (`SAIDA`).
- Chave de idempotência impede pedido duplicado em reenvio.
- Pagamento manual (`provider='manual'`, `method='a_combinar'`); pedido fica em `AGUARDANDO_PAGAMENTO`.
- Código `MA-YYYYMMDD-XXXXXXXX`; rastreio público em `/pedido/[code]`.
- Dados de contato do checkout são sempre gravados (visitante e conta); PII de visitante é mascarada no rastreio.
- Admin: lista/filtros, detalhe, transições de status, rastreio, cancelamento com devolução única ao estoque e auditoria.
- Frete por CEP via `/api/frete` e zona `Barreiras e região` (R$ 12 / 1 dia — **placeholder**).
- Busca `/busca` e filtros de categoria (tamanho, preço e ordenação).
- Conta: `/conta`, `/meus-pedidos` e redefinição de senha. Cards de endereços/dados/favoritos que levavam a 404 foram removidos; favoritos está marcado "em breve".

**Testes executados (banco real, dados depois limpos):**

- Pedido visitante completo, transições até `ENTREGUE`, rastreio `TESTE123` e pagamento aprovado.
- Pedido com conta: dados de contato gravados, vínculo `profileId`, estoque 12→11, PII completa para o dono e mascarada para visitante.
- Cancelamento: estoque restaurado e movimento `DEVOLUCAO` único.
- Dados de teste removidos; catálogo de demonstração e estoque restaurados.

**Limitações conhecidas:** pagamento manual (sem provedor), cupom não implementado, carrinho em `localStorage`, uma única zona de frete placeholder, sem nota fiscal, produtos/fotos de demonstração e dados da empresa/contato pendentes.

## 3. Definição de "pronto" (DoD)

- Pagamento confirmado **somente** por webhook autenticado.
- Estoque **nunca** negativo sob concorrência.
- Valores recalculados no servidor.
- Carrinho recuperável entre visitas.
- Admin com RBAC e auditoria.
- Backups e restore testados.
- Sandbox validado antes de produção.
- Sem simulação de pagamento em produção.

## 4. Riscos

| Risco | Impacto | Mitigação |
|---|---|---|
| Domínio não registrado | Não há HTTPS/produção | Registrar `.com.br` no NIC.br |
| Conta de pagamento não homologada | Não recebe de verdade | Abrir/homologar conta antes da Fase 4 |
| Dados da empresa pendentes (PF/PJ) | Páginas legais e pagamento travados | Confirmar enquadramento com contador |
| Escopo grande demais | Prazo estoura | MVP enxuto; congelar escopo por fase |
| Estoque concorrente | Venda acima do estoque | Transações + `FOR UPDATE` + testes de concorrência |
| Fornecedor de e-mail não escolhido | Confirmação de pedido não sai | Definir na Fase 0 |
| Senha do banco exposta em conversa | Acesso não autorizado ao banco | Rotacionar no Supabase e atualizar `DATABASE_URL`/`DIRECT_URL` na Vercel |
| LGPD/CDC descumpridos | Risco jurídico | Políticas reais; revisão com contador |

## 5. Pendências e próximos passos imediatos

### Perguntas em aberto
1. **Domínio:** quer que eu oriente o registro no NIC.br (`.com.br`)? Ou você já tem preferência?
2. **Dados da empresa:** você disse que vai enviar depois e pode ser PF ou PJ. Preciso saber:
   - Razão social/nome fantasia, CNPJ/CPF, endereço comercial, telefone, e-mail, redes sociais.
   - Há ponto físico (para retirada) ou só entrega por motoboy?
3. **Logomarca:** qual o formato do arquivo (PNG/SVG/vetor)? Posso usar sem alterar a identidade.
4. **Produtos:** me passe a lista (nome, SKU, categoria, tamanhos, cores, preços, estoque, descrição). Posso gerar o CSV de importação.
5. **Pagamento:** quando decidir, me diga o provedor (Mercado Pago/PagBank) e se já tem conta homologada.
6. **E-mail transacional:** quer Resend, SendGrid ou outro?
7. **Frete:** a zona "Barreiras e região" (R$ 12 / 1 dia) é placeholder. Confirmar taxa, prazo e se haverá retirada.
8. **Contato:** e-mail, WhatsApp e horário de atendimento oficiais.

### Ações concluídas
- [x] Repositório e monorepo (`apps/web`, `packages/db`, `packages/ui`).
- [x] Projeto Supabase e variáveis na Vercel.
- [x] Schema Prisma + migrations (auth, perfis, admin, produtos, variações, estoque, pedidos, pagamentos).
- [x] Design system com a paleta + componentes base.
- [x] Auth cliente/admin + RBAC + criação do primeiro admin.
- [x] CRUD de produtos/variações/estoque.
- [x] Checkout, pedidos, rastreio e admin de pedidos.
- [x] Revisão de conteúdo/legal para refletir o que existe.

### Próximas ações (dependem de dados do cliente)
- [ ] Substituir os 6 produtos demo e as imagens `placehold.co` por produtos/fotos reais.
- [ ] Publicar CNPJ/CPF, endereço, e-mail, WhatsApp e horário oficiais.
- [ ] Confirmar frete e retirada.
- [ ] Configurar SMTP e URLs de redirecionamento no Supabase.
- [ ] Rotacionar a senha do banco exposta e atualizar a Vercel.
- [ ] Criar/homologar conta de pagamento (Mercado Pago/PagBank).
- [ ] Registrar o domínio e configurar o DNS.

## 6. Métricas de sucesso (pós-lançamento)

- Pedidos criados por semana; taxa de checkout abandonado.
- Itens mais vendidos e giro de estoque.
- Ticket médio; faturamento vs. recebido vs. reembolso.
- Tempo de resposta de APIs críticas (p95 < 300 ms).
- Erros por dia (Sentry); incidentes de segurança.

## 7. Fora de escopo (por enquanto)

Fiscal (NFC-e/NF-e), Correios/transportadoras, multi-filial, marketplace, BI avançado, retirada em loja física.
