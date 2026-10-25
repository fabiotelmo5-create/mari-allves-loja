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

### Ações que posso executar agora (Fase 0/1)
- [ ] Criar repositório e estrutura do monorepo (`apps/web`, `apps/admin`, `packages/db`, `packages/ui`).
- [ ] Configurar projeto Supabase (região SP) e variáveis de ambiente.
- [ ] Definir schema Prisma + migrations iniciais (auth, perfis, admin, produtos, variações, estoque).
- [ ] Implementar design system com a paleta + componentes base.
- [ ] Implementar auth cliente/admin + RBAC + primeiro admin seguro.
- [ ] Gerar CSV de importação de produtos (modelo).

## 6. Métricas de sucesso (pós-lançamento)

- Pedidos criados por semana; taxa de checkout abandonado.
- Itens mais vendidos e giro de estoque.
- Ticket médio; faturamento vs. recebido vs. reembolso.
- Tempo de resposta de APIs críticas (p95 < 300 ms).
- Erros por dia (Sentry); incidentes de segurança.

## 7. Fora de escopo (por enquanto)

Fiscal (NFC-e/NF-e), Correios/transportadoras, multi-filial, marketplace, BI avançado, retirada em loja física.
