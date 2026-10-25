# Mari Allves — Moda Modesta

Loja virtual completa para a marca **Mari Allves — Moda Modesta** (moda modesta: blusas, saias, vestidos e acessórios).

> **Status:** Fase 0 — Planejamento. MVP em preparação.
> **Escopo inicial:** Barreiras/BA e região. Expansão futura para outras cidades e para o Brasil.

## 1. Objetivo

Sistema de comércio eletrônico **real**, publicado na internet, com domínio próprio, banco de dados persistente, painel administrativo, controle de estoque por variação (tamanho/cor), carrinho, checkout, pagamentos, entregas, páginas legais e conformidade com a LGPD. **Não** é protótipo nem demonstração visual.

## 2. Stack (decisão confirmada)

| Camada | Tecnologia |
|---|---|
| Front-end + API | Next.js (App Router) + TypeScript |
| Estilização | Tailwind CSS + design system próprio |
| Banco de dados | PostgreSQL (Supabase) |
| Auth / Storage | Supabase Auth + Supabase Storage |
| Deploy do front | Vercel |
| Pagamento | Abstraído atrás de interface (provedor a definir: Mercado Pago / PagBank) |
| E-mail transacional | A definir (Resend / SendGrid) |
| Busca | Full-text do Postgres (Meilisearch depois, se necessário) |
| Rate limiting | Upstash Redis |
| Monitoramento | Sentry + logs estruturados |

**Hospedagem:** a hospedagem atual (Firebase Hosting) é **estática** e não roda o servidor do Next.js (rotas de API, webhooks, SSR). Será substituída pelo Vercel ou usada apenas como redirect.
**Domínio:** ainda não registrado — recomenda-se `.com.br` no **NIC.br (registro.br)**, ~R$ 40–60/ano.

## 3. Estrutura planejada

```
mari-allves/
  docs/                 # planejamento (esta pasta)
  apps/
    web/                # Next.js — loja, checkout, área do cliente
    admin/              # painel administrativo (pode ser rota /admin no mesmo app)
  packages/
    ui/                 # design system (tokens de cor, componentes)
    db/                 # schema Prisma + migrations + seeds
    config/             # eslint, tsconfig, tailwind, env
```

## 4. Ambientes

- **dev** — execução local
- **staging** — homologação (pagamento em **sandbox**)
- **production** — loja real (pagamento real; **sem** simulação)

## 5. Pré-requisitos para rodar

- Node.js 20+ e `pnpm`
- Projeto Supabase (região **São Paulo**, para LGPD/latência)
- Variáveis de ambiente (modelo em `.env.example`)

## 6. Documentos

| Documento | Conteúdo |
|---|---|
| [01-requisitos-mvp.md](./docs/01-requisitos-mvp.md) | Requisitos atômicos do MVP (regras, validações, aceite) |
| [02-arquitetura.md](./docs/02-arquitetura.md) | Arquitetura, modelo de dados, segurança, LGPD |
| [03-wireframes.md](./docs/03-wireframes.md) | Wireframes ASCII das telas |
| [04-plano-e-pendencias.md](./docs/04-plano-e-pendencias.md) | Fases, aceite, riscos, pendências e decisões |

## 7. Identidade visual

| Token | Cor | Uso |
|---|---|---|
| Rosé principal | `#C98798` | destaques, botões primários |
| Rosa suave | `#F4E4E8` | fundos, áreas claras |
| Rosa escuro | `#713E4B` | texto de destaque, hover |
| Branco | `#FFFFFF` | superfícies |
| Cinza-claro | `#F7F6F6` | fundos alternados |

A grafia **Mari Allves** (com dois L) deve ser mantida em todos os locais.
