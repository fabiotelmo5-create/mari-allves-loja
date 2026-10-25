# DEPLOY NO VERCEL — Mari Allves — Moda Modesta

> Este guia coloca a loja virtual no ar **sem custo** no plano Hobby do Vercel.
> Atenção: esta primeira versão usa **dados mockados**. O banco Supabase (produtos, carrinho, pagamentos reais) é conectado em uma etapa posterior.

---

## Antes de começar

Tenha em mãos:
- Uma conta no [GitHub](https://github.com)
- Uma conta no [Vercel](https://vercel.com) (pode entrar com o GitHub)
- O código da loja enviado para um repositório GitHub

---

## Passo 1 — Enviar o código para o GitHub

No terminal, dentro da pasta do projeto:

```bash
cd /home/fabio/Documentos/opencAI/mari-allves
git init
git add .
git commit -m "feat: versão inicial para deploy no Vercel"
```

Depois crie um repositório no GitHub (ex: `mari-allves-loja`) e envie:

```bash
git remote add origin https://github.com/SEU_USUARIO/mari-allves-loja.git
git branch -M main
git push -u origin main
```

---

## Passo 2 — Criar o projeto no Vercel

1. Acesse [vercel.com](https://vercel.com) e faça login.
2. Clique em **"Add New"** → **"Project"**.
3. Importe o repositório `mari-allves-loja`.
4. Nas configurações de importação:
   - **Framework Preset:** Next.js
   - **Root Directory:** `apps/web` (é aqui que está o Next.js)
   - Clique em **Deploy**.

O Vercel detecta o Next.js automaticamente e gera uma URL como:

```
https://mari-allves-loja-xxx.vercel.app
```

---

## Passo 3 — Variáveis de ambiente no Vercel

No painel do Vercel, vá em **Project Settings → Environment Variables** e adicione:

| Chave | Valor (desenvolvimento) | Produção |
|-------|------------------------|----------|
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | `https://seu-dominio.com.br` |
| `NEXT_PUBLIC_APP_NAME` | Mari Allves — Moda Modesta | Mari Allves — Moda Modesta |

> As variáveis do Supabase e pagamento (`DATABASE_URL`, `MERCADO_PAGO_ACCESS_TOKEN`, etc.) só são necessárias quando conectarmos o banco. Por enquanto, deixe apenas as duas acima.

Clique em **Save** e depois em **Redeploy** para aplicar.

---

## Passo 4 — Domínio próprio (opcional, recomendado)

Para usar o seu `.com.br`:

1. Registre o domínio no [registro.br (NIC.br)](https://registro.br) (~R$ 40–60/ano).
2. No Vercel, vá em **Project Settings → Domains**.
3. Clique em **Add** e digite seu domínio (ex: `www.mariallves.com.br`).
4. O Vercel mostrará os registros DNS que você deve configurar no registro.br:
   - Um registro **A** apontando para o IP do Vercel
   - Um registro **CNAME** para `www` (ou use a opção de nameservers do Vercel)
5. Após configurar o DNS, aguarde a propagação (pode demorar de minutos a algumas horas).
6. O Vercel gera o **SSL/HTTPS automaticamente** quando o domínio está ativo.

---

## Passo 5 — Verificar o site

Acesse:
- `https://seu-projeto.vercel.app` (ou seu domínio)
- Teste: navegue pelo catálogo, abra um produto, adicione ao carrinho, simule o checkout

---

## O que já funciona nesta versão

- Página inicial com categorias, novidades, destaques e promoções
- Catálogo e páginas de categoria (saias, blusas, vestidos, acessórios)
- Página individual do produto com variações, medidas e estoque
- Carrinho de compras (funciona no navegador via `localStorage`)
- Checkout com simulação de frete e pagamento
- Página de confirmação de pedido
- Login/cadastro (interface, ainda sem banco real)
- Páginas legais: privacidade, termos, trocas, entrega, cancelamento, cookies, acessibilidade
- Páginas institucionais: sobre, contato, FAQ, guia de tamanhos
- Painel administrativo (interface de login)
- 404 e página de indisponibilidade

---

## O que ainda falta conectar (próximas etapas)

| Item | O que fazer |
|------|-------------|
| Banco de dados | Criar projeto Supabase (região São Paulo) e rodar `prisma migrate dev` |
| Autenticação real | Conectar Supabase Auth (login, cadastro, recuperação de senha) |
| Catálogo dinâmico | Buscar produtos do banco em vez do mock |
| Carrinho persistente | Migrar de `localStorage` para tabela `Cart`/`CartItem` no Supabase |
| Pagamento real | Configurar Mercado Pago/PagBank com webhooks idempotentes |
| Admin completo | Produtos, estoque, pedidos, cupons, conteúdo |

---

## Comandos úteis

```bash
# Build local para testar antes de enviar
cd apps/web
pnpm build

# Rodar em modo produção localmente
pnpm start
```

---

## Suporte

Se o deploy falhar, verifique os **Logs** no painel do Vercel (Functions → Logs). Erros comuns são variáveis de ambiente ausentes ou caminhos incorretos do `Root Directory`.
