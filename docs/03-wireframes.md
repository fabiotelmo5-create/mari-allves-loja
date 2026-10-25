# WIREFRAMES (ASCII) — Mari Allves — Moda Modesta

> Esboços de baixa fidelidade. Objetivo: validar fluxo e hierarquia antes do código.
> Convenção: `[ ]` = botão/ação · `(x)` = campo · `[#]` = ícone · `···` = menu · `>` = navegação.

---

## 1. Home — Desktop

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  MARI ALLVES — Moda Modesta   Buscar... [ (____________) [#] ]  (Conta) (♥) (🛒 2) │
├──────────────────────────────────────────────────────────────────────────────┤
│  ···  Início  Blusas  Saias  Vestidos  Acessórios  Novidades  Promoções  Contato ··· │
├──────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────────┐  │
│  │                        BANNER PRINCIPAL (administrável)                 │  │
│  │           Coleção Moda Modesta — delicadeza que veste você             │  │
│  │                        [ Ver coleção ]                                   │  │
│  └────────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  Categorias em destaque                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │  BLUSAS  │  │  SAIAS   │  │VESTIDOS  │  │ACESSÓRIOS│                      │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘                      │
│                                                                              │
│  Novidades                                            [ Ver todas > ]          │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                                  │
│  │  img   │ │  img   │ │  img   │ │  img   │                                  │
│  │ Nome   │ │ Nome   │ │ Nome   │ │ Nome   │                                  │
│  │ R$ 89  │ │ R$ 120 │ │ R$ 180 │ │ R$ 45  │                                  │
│  │ [♡][🛒]│ │ [♡][🛒]│ │ [♡][🛒]│ │ [♡][🛒]│                                  │
│  └────────┘ └────────┘ └────────┘ └────────┘                                  │
│                                                                              │
│  Promoções (somente reais)                        [ Ver todas > ]              │
│  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                                  │
│  │  img   │ │  img   │ │  img   │ │  img   │                                  │
│  │ Nome   │ │ Nome   │ │ Nome   │ │ Nome   │                                  │
│  │R$ 150  │ │R$ 200  │ │R$ 90   │ │R$ 60   │                                  │
│  │R$ 120  │ │R$ 160  │ │R$ 72   │ │R$ 48   │  ← riscado = preço anterior     │
│  │ [♡][🛒]│ │ [♡][🛒]│ │ [♡][🛒]│ │ [♡][🛒]│                                  │
│  └────────┘ └────────┘ └────────┘ └────────┘                                  │
│                                                                              │
│  Benefícios:  🚚 Entrega em Barreiras e região  ·  🔒 Compra segura           │
│              ↩️ Troca fácil  ·  💬 Atendimento                               │
│                                                                              │
├──────────────────────────────────────────────────────────────────────────────┤
│  Institucional        Ajuda               Contato                            │
│  Sobre a Mari Allves  FAQ                 contato@...                        │
│  Trocas e devoluções  Guia de tamanhos    (11) 9...                          │
│  Privacidade          Prazos de entrega   @mariallves                        │
│  Termos de uso        Acessibilidade                                         │
│  © 2026 Mari Allves — Moda Modesta. CNPJ: [a definir]                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 2. Home — Mobile

```
┌────────────────────────────┐
│ [#] MARI ALLVES      (♥)(🛒)│
├────────────────────────────┤
│ [ (Buscar...__________)]   │
├────────────────────────────┤
│  ··· Início Blusas Saias ··· │  ← menu rolável
├────────────────────────────┤
│ ┌────────────────────────┐ │
│ │     BANNER PRINCIPAL   │ │
│ │    [ Ver coleção ]     │ │
│ └────────────────────────┘ │
│                            │
│  Categorias                │
│  ┌───────┐ ┌───────┐       │
│  │Blusas │ │ Saias │ ...   │
│  └───────┘ └───────┘       │
│                            │
│  Novidades                 │
│  ┌──────┐ ┌──────┐         │
│  │ img  │ │ img  │         │
│  │ Nome │ │ Nome │         │
│  │R$ 89 │ │R$120 │         │
│  └──────┘ └──────┘         │
│                            │
│  Benefícios / rodapé       │
└────────────────────────────┘
```

## 3. Catálogo com filtros

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  (cabeçalho idêntico à home)                                                  │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ FILTROS       │  Saias                              [ Ordenar: Relevância ▾] │
│               │                                                                │
│ Categoria     │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│ [x] Saias     │  │  img   │ │  img   │ │  img   │ │  img   │                   │
│ [ ] Blusas    │  │ Nome   │ │ Nome   │ │ Nome   │ │ Nome   │                   │
│               │  │R$ 120  │ │R$ 150  │ │R$ 110  │ │R$ 135  │                   │
│ Tamanho       │  └────────┘ └────────┘ └────────┘ └────────┘                   │
│ [ ] P [ ] M   │                                                                │
│ [ ] G [ ] GG  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐                   │
│               │  │  img   │ │  img   │ │  img   │ │  img   │                   │
│ Cor           │  │ Nome   │ │ Nome   │ │ Nome   │ │ Nome   │                   │
│ ● Rosa ● Azul │  │R$ 100  │ │R$ 140  │ │R$  95  │ │R$ 160  │                   │
│ ● Verde       │  └────────┘ └────────┘ └────────┘ └────────┘                   │
│               │                                                                │
│ Preço         │              1  2  3  4  …  12  >  (paginação)                 │
│ (__) a (__)   │                                                                │
│               │                                                                │
│ [ ] Em oferta │                                                                │
│ [ ] Disponível│                                                                │
│               │                                                                │
│ [ Limpar ]    │                                                                │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

## 4. Página do produto

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  (cabeçalho)                                                                  │
├───────────────────────────────────────────┬──────────────────────────────────┤
│                                           │  MARI ALLVES                     │
│   ┌───────────┐   ┌───┐┌───┐┌───┐          │  Saia Midi Plissada             │
│   │           │   │ 1 ││ 2 ││ 3 │          │  SKU: SA-001                    │
│   │  IMAGEM   │   └───┘└───┘└───┘          │                                  │
│   │  ampliada │   ← miniaturas             │  R$ 150,00                       │
│   │           │                            │  ou R$ 135,00 no Pix             │
│   └───────────┘                            │                                  │
│                                           │  Tamanho:  ( P ) ( M ) ( G )      │
│   [🔍 ampliar]                            │  Cor:      ● Rosa  ● Azul         │
│                                           │                                  │
│                                           │  Quantidade:  [ - ] 1 [ + ]       │
│                                           │                                  │
│                                           │  Calcular frete:                  │
│                                           │  CEP (__________)  [ Calcular ]   │
│                                           │  → R$ 12 · 3-5 dias úteis          │
│                                           │                                  │
│                                           │  [ Adicionar ao carrinho ]        │
│                                           │  [ Comprar agora ]                │
│                                           │  [ ♡ Favoritar ]                  │
│                                           │                                  │
│                                           │  ✓ Em estoque                      │
├───────────────────────────────────────────┴──────────────────────────────────┤
│  Descrição                                  │  Tabela de medidas / Guia      │
│  Tecido, modelagem, caimento...             │  Composição: 100% poliéster     │
│  Lavagem: à mão / não alvejar               │  Lavagem: ver etiqueta          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 5. Carrinho

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Carrinho (3 itens)                                              [ Continuar ] │
├──────────────────────────────────────────────────────────────────────────────┤
│  ┌──────┐  Saia Midi Plissada            Tamanho M · Cor Rosa                 │
│  │ img  │  R$ 150,00                                            [ ♡ ] [ 🗑 ]  │
│  └──────┘  Quantidade: [ - ] 2 [ + ]                                            │
│                                                                              │
│  ┌──────┐  Blusa Manga Longa             Tamanho P · Cor Azul                 │
│  │ img  │  R$ 120,00                                            [ ♡ ] [ 🗑 ]  │
│  └──────┘  Quantidade: [ - ] 1 [ + ]                                            │
│                                                                              │
│  Cupom:  (__________ )  [ Aplicar ]    → BEMVINDA10 aplicado (-R$ 27,00)       │
├──────────────────────────────────────────────────────────────────────────────┤
│  Subtotal:                                   R$ 420,00                         │
│  Desconto:                                  -R$  27,00                         │
│  Frete (CEP 47800-000):                      R$  12,00                         │
│  ────────────────────────────────────────────────────────────                 │
│  Total:                                      R$ 405,00                         │
│                                                                              │
│  [ Finalizar compra ]                                                          │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 6. Checkout

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Checkout                                                              (🔒 SSL)│
├──────────────────────────┬───────────────────────────────────────────────────┤
│ 1. Identificação         │  Resumo do pedido                                  │
│ ( Nome completo ____)    │  ┌──────┐ Saia Midi M/Rosa  x2  R$ 300,00          │
│ ( E-mail __________)     │  └──────┘                                          │
│ ( CPF ____)              │  ┌──────┐ Blusa P/Azul     x1  R$ 120,00          │
│ [x] Quero criar conta   │  └──────┘                                          │
│                          │  Cupom: BEMVINDA10   -R$ 27,00                     │
│ 2. Entrega               │  Frete:             R$  12,00                      │
│ ( CEP ________ ) [Calcular]│  ─────────────────────────────                  │
│  ● Motoboy — R$ 12 · 1 dia │  Total:             R$ 405,00                    │
│  ○ Retirada — grátis       │                                                   │
│ ( Endereço: rua, n°, ... ) │                                                   │
│                          │                                                   │
│ 3. Pagamento             │                                                   │
│  ● Pix                   │                                                   │
│  ○ Cartão de crédito     │                                                   │
│  ○ Boleto                │                                                   │
│  (campos do cartão...)   │                                                   │
│                          │                                                   │
│ [ Revisar e confirmar ]  │                                                   │
└──────────────────────────┴───────────────────────────────────────────────────┘
```

## 7. Confirmação de pedido

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          ✓ Pedido confirmado!                                 │
│                                                                              │
│   Número do pedido:  #2026-000123                                            │
│   Pagamento: Pix — aguardando pagamento                                      │
│                                                                              │
│   [ Abrir QR Code Pix ]   [ Copiar código Pix ]                              │
│                                                                              │
│   Enviamos os detalhes para seu e-mail.                                       │
│                                                                              │
│   Previsão de entrega: 3-5 dias úteis                                          │
│                                                                              │
│   [ Acompanhar pedido ]   [ Voltar à loja ]                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 8. Área do cliente — Meus pedidos

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Minha conta · Maria Silva                              [ Sair ]             │
├───────────────────┬──────────────────────────────────────────────────────────┤
│ Menu              │  Meus pedidos                                              │
│  Meus pedidos     │  ┌──────────────────────────────────────────────────────┐│
│  Endereços        │  │ #2026-000123 · 18/10/2026 · R$ 405,00                ││
│  Favoritos        │  │ Status: Em preparação                                 ││
│  Dados            │  │ Saia Midi M/Rosa x2 · Blusa P/Azul x1                ││
│  Senha            │  │ Rastreio: BR123456789SP  [ Acompanhar > ]            ││
│  Privacidade      │  └──────────────────────────────────────────────────────┘│
│                   │  ┌──────────────────────────────────────────────────────┐│
│                   │  │ #2026-000119 · 10/10/2026 · R$ 120,00                ││
│                   │  │ Status: Entregue                                     ││
│                   │  └──────────────────────────────────────────────────────┘│
└───────────────────┴──────────────────────────────────────────────────────────┘
```

## 9. Admin — Login

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                    MARI ALLVES — Área administrativa                          │
│                                                                              │
│                    ( E-mail ____________ )                                   │
│                    ( Senha  ____________ )                                   │
│                                                                              │
│                    [ Entrar ]                                                │
│                                                                              │
│                    🔒 Acesso restrito · autenticado no servidor               │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 10. Admin — Dashboard

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ MARI ALLVES ADMIN                              Maria (Superadmin) [ Sair ]    │
├───────────────┬──────────────────────────────────────────────────────────────┤
│ Dashboard           │  Período: [ Últimos 30 dias ▾ ]                                │
│ Produtos     │                                                                │
│ Estoque      │  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐   │
│ Pedidos      │  │ Pedidos    │ │ Recebido   │ │ Pendentes  │ │ Reembolsos │   │
│ Clientes     │  │   128      │ │ R$ 12.400  │ │     6      │ │ R$   180   │   │
│ Cupons       │  └────────────┘ └────────────┘ └────────────┘ └────────────┘   │
│ Conteúdo     │                                                                │
│ Usuários     │  Vendas por período (gráfico de barras/linha)                   │
│ Configurações│  ┌──────────────────────────────────────────────────────┐    │
│ Logs         │  │                                                       │    │
│              │  │        ▂▃▅▆▇█▇▆▅▃▂                                    │    │
│              │  └──────────────────────────────────────────────────────┘    │
│              │                                                                │
│              │  Mais vendidos            Estoque baixo                        │
│              │  1. Saia Midi   42 un.    ● Blusa P/Azul   2 un ⚠             │
│              │  2. Vestido...  30 un.    ● Saia G/Rosa    0 un (esgotado)    │
│              │  3. Blusa...    25 un.    ● Vestido M      3 un ⚠             │
└───────────────┴──────────────────────────────────────────────────────────────┘
```

## 11. Admin — Produtos (lista)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Produtos                                            [ + Novo produto ]        │
├──────────────────────────────────────────────────────────────────────────────┤
│ (Buscar__________)  (Categoria ▾) (Status ▾)   [ Importar CSV ] [ Exportar ]  │
├──────────────────────────────────────────────────────────────────────────────┤
│ □  img  Nome              SKU      Categoria  Preço    Est.  Status   Ações     │
│ □  [img] Saia Midi       SA-001   Saias      R$ 150   12    Public.  [Ed][🗑]   │
│ □  [img] Blusa Manga      BL-002   Blusas     R$ 120    0    Inativo  [Ed][🗑]   │
│ □  [img] Vestido Floral   VS-003   Vestidos   R$ 180    5    Rascunho[Ed][🗑]   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 12. Admin — Estoque / movimentações

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Estoque · Saia Midi Plissada (SA-001)                                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Variação        Disponível   Reservado   Mínimo   Situação      Ações          │
│ P · Rosa             4          0         3     OK            [+ Entrada]     │
│ M · Rosa             0          0         3     Esgotado      [+ Entrada]     │
│ G · Azul             2          0         3     Baixo ⚠       [+ Entrada]     │
├──────────────────────────────────────────────────────────────────────────────┤
│ Histórico de movimentações                                                    │
│ Data        Tipo     Qtd   Motivo                    Usuário                   │
│ 18/10/2026  Saída    -1    Pedido #2026-000123       sistema                   │
│ 15/10/2026  Entrada  +10   Reposição fornecedor      Maria                     │
│ 12/10/2026  Ajuste   -2    Avaria                     Maria                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 13. Admin — Detalhe do pedido

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Pedido #2026-000123                                        [ Voltar ]          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Cliente: Maria Silva · maria@email.com · CPF ***.***.***-**                  │
│ Status: [ Em preparação ▾ ]                                                    │
│ Pagamento: Aprovado (Mercado Pago · BR-...)      [ Reembolsar ]               │
│                                                                              │
│ Itens                        Qtd   Unit.      Total                          │
│ Saia Midi M/Rosa             2     R$ 150     R$ 300                          │
│ Blusa P/Azul                 1     R$ 120     R$ 120                          │
│ Cupom BEMVINDA10                          -R$  27                            │
│ Frete (Motoboy)                             R$  12                            │
│ ─────────────────────────────────────────────────────────                    │
│ Total                                        R$ 405                            │
│                                                                              │
│ Entrega: Rua das Flores, 123 · Barreiras/BA · Motoboy · 1 dia                  │
│ Rastreio: ( ____________ ) [ Salvar ]                                          │
│                                                                              │
│ Histórico:                                                                   │
│ 18/10  Aguardando pagamento → Pagamento confirmado                            │
│ 18/10  Pagamento confirmado → Em preparação                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 14. Admin — Cupons

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Cupons                                                [ + Novo cupom ]         │
├──────────────────────────────────────────────────────────────────────────────┤
│ Código        Tipo        Valor   Vigência            Usos    Limite  Status    │
│ BEMVINDA10    %           10%     01/10–31/10/2026    45/100  100     Ativo      │
│ FRETEGRATIS   valor       R$ 0    01/11–30/11/2026     0       —       Agendado  │
│                                                                              │
│ [+ Novo cupom] → formulário: código, tipo, valor/%, início, fim, uso máximo,  │
│ valor mínimo, elegibilidade (produtos/categorias)                            │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 15. Admin — Conteúdo (banners)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│ Conteúdo · Banners da home                                                     │
├──────────────────────────────────────────────────────────────────────────────┤
│  Posição      Título              Imagem      Link             Ativo  Ações     │
│  Principal    Coleção Moda...     [img]       /colecao         Sim    [Ed]     │
│  Secundário   Frete grátis...     [img]       /entrega         Sim    [Ed]     │
│                                                                              │
│  [ Salvar alterações ]  → grava em content_blocks + audit_log                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 16. Página legal (Privacidade)

```
┌──────────────────────────────────────────────────────────────────────────────┐
│  Privacidade                                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│  1. Dados coletados                                                             │
│  2. Finalidades do tratamento                                                   │
│  3. Bases legais (LGPD)                                                         │
│  4. Compartilhamento                                                             │
│  5. Retenção e descarte                                                         │
│  6. Seus direitos                                                               │
│  7. Contato do responsável                                                       │
│  8. Alterações desta política                                                   │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 17. Erro 404

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                                                                              │
│                          404 — Página não encontrada                          │
│                                                                              │
│                A página que você procura não existe ou saiu do ar.            │
│                                                                              │
│                [ Voltar para a loja ]   [ Ver promoções ]                     │
│                                                                              │
└──────────────────────────────────────────────────────────────────────────────┘
```
