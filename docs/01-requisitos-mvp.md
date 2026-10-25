# REQUISITOS ATÔMICOS — MVP — Mari Allves — Moda Modesta

> **Formato:** ID · Módulo · Descrição · Tipo · Prioridade · Ator · Entradas · Saídas · Regras · Validações · Exceções · Permissões · Eventos · Auditoria · Aceite (Gherkin) · LGPD.
> **Tipo:** FUNC = funcional · DADO = dado · REGRA = regra de negócio · NFR = não funcional.
> **Prioridade:** OBRIG / ALTA / MÉDIA / BAIXA.
> **Escopo:** `MVP` = entra na primeira entrega · `PÓS-MVP` = fora da primeira entrega (registrado para não perder o requisito).
> **Classificação:** [U]niversal · [C]omum · [P]aís-BR · [O]pcional.

## Índice de módulos
- [AUT — Autenticação e acesso](#aut--autenticação-e-acesso)
- [ADM — Painel administrativo](#adm--painel-administrativo)
- [PRO — Catálogo e produtos](#pro--catálogo-e-produtos)
- [EST — Estoque](#est--estoque)
- [CAR — Carrinho](#car--carrinho)
- [CUP — Cupons](#cup--cupons)
- [FRE — Frete e logística](#fre--frete-e-logística)
- [PED — Pedidos e checkout](#ped--pedidos-e-checkout)
- [PAG — Pagamentos (abstraído)](#pag--pagamentos-abstraído)
- [CLI — Área do cliente](#cli--área-do-cliente)
- [CON — Conteúdo](#con--conteúdo)
- [LEG — Legal e LGPD](#leg--legal-e-lgpd)
- [SEG — Segurança](#seg--segurança)
- [Fora do MVP](#fora-do-mvp)

---

## AUT — Autenticação e acesso

### REQ-AUT-001 — Cadastro de cliente [FUNC/OBRIG/MVP]
- **Ator:** visitante
- **Entradas:** nome, e-mail, senha, opcional CPF
- **Saídas:** conta criada + sessão iniciada
- **Regras:** e-mail único; senha com política mínima; **nunca** expor hash
- **Validações:** e-mail válido; senha com força mínima; termos de uso aceitos quando aplicável
- **Exceções:** e-mail já cadastrado → 409 com mensagem amigável
- **Permissão:** público
- **Evento:** `customer.created`
- **Auditoria:** registra criação (sem senha)
- **Aceite:** `Given` um e-mail novo `When` envio o formulário `Then` a conta é criada e a sessão inicia · `Given` e-mail duplicado `Then` recebo 409
- **LGPD:** base legal — execução de contrato / legítimo interesse; coleta mínima

### REQ-AUT-002 — Login de cliente [FUNC/OBRIG/MVP]
- **Entradas:** e-mail, senha
- **Regras:** sessão com JWT curto + refresh; rate limiting por IP/e-mail
- **Exceções:** credenciais inválidas → 401 genérico (não revelar se o e-mail existe)
- **Evento:** `auth.login`
- **Aceite:** credenciais válidas → sessão; inválidas → 401 genérico

### REQ-AUT-003 — Recuperação de senha [FUNC/OBRIG/MVP]
- **Entradas:** e-mail
- **Saídas:** e-mail com link/token de redefinição
- **Regras:** token único, expirável (ex.: 1h), invalida uso anterior; nunca expor o token na resposta
- **Exceções:** e-mail não cadastrado → resposta neutra (segurança)
- **Evento:** `auth.password_reset_requested`
- **Aceite:** `Given` e-mail cadastrado `Then` recebo e-mail com link válido por 1h

### REQ-AUT-004 — Logout [FUNC/OBRIG/MVP]
- **Regras:** revoga refresh token; limpa cookie
- **Aceite:** após logout, rotas autenticadas retornam 401

### REQ-AUT-005 — Autenticação de administrador + RBAC [FUNC/OBRIG/MVP]
- **Atores:** superadmin, admin, estoquista
- **Regras:** acesso ao `/admin` exige perfil; permissões por função (RBAC), nunca `if role == admin` no handler
- **Permissão:** `admin.access`
- **Aceite:** usuário cliente comum acessando `/admin` → 403

### REQ-AUT-006 — Criação do primeiro administrador [FUNC/OBRIG/MVP]
- **Regras:** procedimento seguro de setup (ex.: seed com variável de ambiente + troca obrigatória no primeiro acesso); **proibido** senha padrão conhecida
- **Validações:** senha forte; registro de criação em auditoria
- **Aceite:** sem variável de setup → não existe admin; com setup → admin criado e forçado a trocar a senha

### REQ-AUT-007 — Proteção contra força bruta [NFR/OBRIG/MVP]
- **Regras:** limite de tentativas por IP/e-mail; bloqueio temporário progressivo; log de tentativas
- **Aceite:** 10 tentativas inválidas → bloqueio temporário + aviso

### REQ-AUT-008 — Checkout como visitante [FUNC/ALTA/MVP]
- **Regras:** permitir compra sem conta; se o e-mail já existir, oferecer login/recuperação (não criar conta duplicada)
- **Aceite:** compra concluída como visitante e pedido associado ao e-mail

---

## ADM — Painel administrativo

### REQ-ADM-001 — Dashboard [FUNC/OBRIG/MVP]
- **Entradas:** período (default: últimos 30 dias)
- **Saídas:** pedidos recebidos, pendentes, em preparação; vendas por período; mais vendidos; estoque baixo; pagamentos pendentes; cancelamentos/devoluções
- **Regras:** números calculados de dados reais; diferenciar **faturamento bruto**, **recebido**, **reembolsos** e **lucro** (nunca apresentar faturamento como lucro)
- **Permissão:** `admin.dashboard`
- **Aceite:** `Given` pedidos no período `Then` o total exibido bate com a soma real

### REQ-ADM-002 — Gestão de produtos [FUNC/OBRIG/MVP]
- **Entradas:** dados do produto, variações, imagens, categoria, preços, estoque
- **Regras:** criar, editar, publicar, desativar, arquivar; SKU único; preço e estoque editáveis
- **Permissão:** `product.write`
- **Aceite:** produto publicado aparece na loja; desativado não aparece

### REQ-ADM-003 — Gestão de estoque [FUNC/OBRIG/MVP]
- **Entradas:** variação, quantidade, motivo, usuário
- **Regras:** entrada/saída/ajuste/devolução; **nunca negativo**; motivo + usuário obrigatórios em ajustes
- **Permissão:** `stock.write`
- **Aceite:** ajuste para quantidade negativa → 422

### REQ-ADM-004 — Gestão de pedidos [FUNC/OBRIG/MVP]
- **Entradas:** número, cliente, período, status
- **Regras:** atualizar status, registrar rastreio, cancelar, tratar devolução; **proibido** alteração manual simular pagamento confirmado
- **Permissão:** `order.write`
- **Aceite:** status manual não muda `payment.status`

### REQ-ADM-005 — Gestão de clientes [FUNC/OBRIG/MVP]
- **Regras:** exibir só dados necessários; mascarar CPF; **nunca** expor senha/token/dados de cartão
- **Permissão:** `customer.read`
- **Aceite:** listagem de cliente não exibe senha

### REQ-ADM-006 — Gestão de cupons [FUNC/OBRIG/MVP]
- **Permissão:** `coupon.write`
- **Aceite:** ver REQ-CUP-001/002

### REQ-ADM-007 — Gestão de conteúdo [FUNC/OBRIG/MVP]
- **Entradas:** banners, textos, categorias, contatos, horários, avisos, produtos em destaque
- **Regras:** alterável sem mexer em código; alterações relevantes vão para auditoria
- **Permissão:** `content.write`
- **Aceite:** trocar banner reflete na home sem deploy

### REQ-ADM-008 — Usuários administrativos e papéis [FUNC/ALTA/MVP]
- **Regras:** criar/editar usuários admin, atribuir papéis; sem autoaprovação; log de ações
- **Permissão:** `admin.users`

### REQ-ADM-009 — Auditoria [DADO/OBRIG/MVP]
- **Saídas:** trilha quem/quando/antes/depois/origem
- **Regras:** imutável (fora DBA); registra ações críticas (preço, estoque, status, login admin)
- **Aceite:** `Given` um ajuste de preço `Then` `audit_log` guarda old/new

---

## PRO — Catálogo e produtos

### REQ-PRO-001 — Cadastro de produto [FUNC/OBRIG/MVP]
- **Entradas:** nome, SKU, categoria, subcategoria, descrição, preço de venda, preço anterior (quando verdadeiro), composição, lavagem, peso, dimensões, status
- **Regras:** SKU único; preço ≥ 0; preço anterior só se maior que o atual (promoção real)
- **Permissão:** `product.write`
- **Aceite:** produto com preço anterior menor que o atual → 422

### REQ-PRO-002 — Variações por tamanho/cor [FUNC/OBRIG/MVP]
- **Entradas:** tamanho (P/M/G/...), cor, SKU da variação, preço opcional, estoque
- **Regras:** uma peça pode ter N variações; estoque por variação
- **Aceite:** saia P/M/G com estoque independente

### REQ-PRO-003 — Imagens [FUNC/OBRIG/MVP]
- **Entradas:** múltiplas imagens, texto alternativo, ordem
- **Regras:** upload otimizado; `alt` obrigatório (acessibilidade); imagens devem representar o produto real
- **Aceite:** galeria ordenada + zoom + alt

### REQ-PRO-004 — Categorias e subcategorias [FUNC/OBRIG/MVP]
- **Regras:** cadastradas pelo admin (blusas, saias, vestidos, acessórios + novas)
- **Permissão:** `category.write`

### REQ-PRO-005 — Status de publicação [FUNC/OBRIG/MVP]
- **Valores:** rascunho, publicado, inativo, arquivado
- **Regras:** só `publicado` aparece na loja; inativo/arquivado somem sem apagar histórico

### REQ-PRO-006 — Busca [FUNC/OBRIG/MVP]
- **Entradas:** termo
- **Regras:** busca por nome e palavras-chave; relevância; sem injeção (parâmetros)
- **Aceite:** `Given` "saia" `Then` retorna produtos cujo nome/chave contém o termo

### REQ-PRO-007 — Filtros [FUNC/OBRIG/MVP]
- **Filtros:** categoria, tamanho, cor, faixa de preço, disponibilidade, novidades, promoções reais
- **Aceite:** combinação de filtros retorna interseção correta

### REQ-PRO-008 — Ordenação [FUNC/OBRIG/MVP]
- **Opções:** menor preço, maior preço, relevância, data de cadastro
- **Aceite:** ordenação estável e previsível

### REQ-PRO-009 — Página do produto [FUNC/OBRIG/MVP]
- **Saídas:** galeria, variações, preços, estoque, descrição, tabela de medidas, composição, lavagem, frete estimado
- **Regras:** exibir indisponibilidade claramente; aviso de "poucas unidades" **só** com base na quantidade real

### REQ-PRO-010 — Produto esgotado [FUNC/OBRIG/MVP]
- **Regras:** bloquear compra sem estoque; oferecer lista de interesse (se configurado)
- **Aceite:** variação zerada → botão desabilitado + opção "avise-me"

### REQ-PRO-011 — Importação/exportação CSV [FUNC/ALTA/MVP]
- **Regras:** modelo de planilha; validação por linha; relatório de erros; não importar dados inválidos parcialmente (ou registrar e ignorar)
- **Aceite:** CSV com linha inválida → erro apontando a linha; CSV válido → produtos criados

### REQ-PRO-012 — Páginas de catálogo [FUNC/OBRIG/MVP]
- **Páginas:** home, catálogo, categoria (blusas/saias/vestidos/acessórios/outras), novidades, promoções, mais vendidos (dados reais), produto, busca
- **Regras:** promoções verdadeiras; sem avaliações/contadores/artificial urgency

---

## EST — Estoque

### REQ-EST-001 — Estoque por variação [DADO/OBRIG/MVP]
- **Entidades:** `stock(variant_id, quantidade)`
- **Regras:** quantidade inteira ≥ 0

### REQ-EST-002 — Reserva atômica [REGRA/OBRIG/MVP]
- **Regras:** ao criar pedido, decrementar estoque em **transação** com `SELECT ... FOR UPDATE` ou `UPDATE ... WHERE quantidade >= x`; nunca permitir negativo; concorrência segura
- **Aceite:** 2 pedidos simultâneos com estoque 1 → 1 aprovado, 1 rejeitado

### REQ-EST-003 — Movimentações [FUNC/OBRIG/MVP]
- **Tipos:** entrada, saída, ajuste, devolução
- **Regras:** toda movimentação com data, motivo e usuário
- **Aceite:** ajuste sem motivo → 422

### REQ-EST-004 — Alerta de estoque baixo [REGRA/ALTA/MVP]
- **Regras:** limite configurável por produto/variação; destaque no admin e na loja
- **Aceite:** variação abaixo do limite aparece em "estoque baixo"

### REQ-EST-005 — Histórico de movimentações [DADO/OBRIG/MVP]
- **Aceite:** admin filtra por produto/período/usuário e vê o histórico

---

## CAR — Carrinho

### REQ-CAR-001 — Adicionar item [FUNC/OBRIG/MVP]
- **Entradas:** produto, variação, quantidade
- **Regras:** validar variação existente e estoque; somar se já estiver no carrinho

### REQ-CAR-002 — Alterar/remover [FUNC/OBRIG/MVP]
- **Regras:** alterar quantidade respeitando estoque; remover item

### REQ-CAR-003 — Carrinho persistente [FUNC/OBRIG/MVP]
- **Regras:** carrinho no banco (por cliente ou sessão); recuperação entre visitas; carrinho de visitante migrado ao logar
- **Aceite:** adiciono item, fecho o navegador, volto → item permanece

### REQ-CAR-004 — Recálculo no servidor [REGRA/OBRIG/MVP]
- **Regras:** subtotal, descontos e total recalculados no servidor; **nunca** confiar em valores do navegador

### REQ-CAR-005 — Validação de estoque no checkout [REGRA/OBRIG/MVP]
- **Regras:** ao avançar/confirmar, revalidar estoque; se indisponível, informar e ajustar

### REQ-CAR-006 — Mudança de preço/estoque [REGRA/ALTA/MVP]
- **Regras:** se preço/estoque mudou desde a adição, informar antes da finalização

---

## CUP — Cupons

### REQ-CUP-001 — Cadastro de cupom [FUNC/OBRIG/MVP]
- **Entradas:** código, tipo (percentual/valor), valor, início, fim, uso máximo, valor mínimo, produtos/categorias elegíveis, regras
- **Regras:** código único; validade obrigatória

### REQ-CUP-002 — Validação no servidor [REGRA/OBRIG/MVP]
- **Regras:** validar vigência, uso máximo, valor mínimo, elegibilidade e uso por cliente; **não** aplicar cupom expirado/não autorizado
- **Aceite:** cupom expirado → 422 com mensagem clara

### REQ-CUP-003 — Controle de uso [DADO/OBRIG/MVP]
- **Regras:** registrar uso por pedido; impedir reutilização acima do limite

---

## FRE — Frete e logística

### REQ-FRE-001 — Regras de entrega [FUNC/OBRIG/MVP]
- **Entradas:** regiões atendidas, CEPs permitidos, taxas, prazo de preparo, prazo de transporte, frete grátis acima de X, restrições, retirada
- **Regras:** não prometer entrega onde não atende

### REQ-FRE-002 — Cálculo por CEP [FUNC/OBRIG/MVP]
- **Entradas:** CEP de destino
- **Saídas:** modalidades, valor e prazo estimado
- **Regras:** cálculo no servidor; preparo + transporte somados; arredondamento consistente
- **Aceite:** CEP fora da área → mensagem de não atendimento

### REQ-FRE-003 — Retirada [FUNC/ALTA/MVP]
- **Regras:** se habilitada, mostrar endereço e horário; zerar frete

### REQ-FRE-004 — Status do pedido [REGRA/OBRIG/MVP]
- **Status:** aguardando pagamento → pagamento confirmado → em preparação → enviado → entregue → cancelado / reembolsado
- **Regras:** cada mudança com data e origem; visível ao cliente

### REQ-FRE-005 — Rastreamento [FUNC/MÉDIA/MVP]
- **Regras:** código de rastreamento quando houver; link/consulta

### REQ-FRE-006 — Preparação e transporte [REGRA/OBRIG/MVP]
- **Regras:** prazo total = preparo + transporte; exibido antes do pagamento

---

## PED — Pedidos e checkout

### REQ-PED-001 — Checkout [FUNC/OBRIG/MVP]
- **Etapas:** dados do comprador → CEP → endereço → modalidade de entrega → prazo → pagamento → cupom → revisão (itens, descontos, frete, total) → confirmar
- **Regras:** menor número razoável de etapas; tudo revisável antes de confirmar

### REQ-PED-002 — Criar pedido [REGRA/OBRIG/MVP]
- **Saídas:** pedido com itens, identificador único, valores
- **Regras:** **congelar** preço, quantidade e descrição de cada item; transação única com baixa de estoque
- **Aceite:** alterar o produto depois não altera o histórico do pedido

### REQ-PED-003 — Confirmação [FUNC/OBRIG/MVP]
- **Regras:** tela de confirmação com número do pedido; e-mail de confirmação **fora** do navegador
- **Evento:** `order.created` / `order.confirmation_email`

### REQ-PED-004 — Cancelamento [FUNC/OBRIG/MVP]
- **Regras:** cancelar libera estoque; se pago, dispara reembolso conforme regra

### REQ-PED-005 — Reembolso [FUNC/OBRIG/MVP]
- **Regras:** só via provedor; registrado; estornado no financeiro

---

## PAG — Pagamentos (abstraído)

### REQ-PAG-001 — Interface de provedor [REGRA/OBRIG/MVP]
- **Regras:** checkout depende de uma interface (`createCharge`, `getStatus`, `refund`, `handleWebhook`); provedor real plugado depois
- **Aceite:** trocar de provedor não altera checkout

### REQ-PAG-002 — Criação de cobrança com idempotência [REGRA/OBRIG/MVP]
- **Regras:** idempotency-key por pedido; identificador único da transação; nunca criar duplicata

### REQ-PAG-003 — Webhook autenticado [REGRA/OBRIG/MVP]
- **Regras:** endpoint público que valida assinatura do provedor; confirma pagamento **só** no servidor; nunca confiar na página de sucesso do cliente
- **Aceite:** `Given` notificação assinada de aprovação `Then` pedido vira "pagamento confirmado"

### REQ-PAG-004 — Status de pagamento [DADO/OBRIG/MVP]
- **Status:** pendente, aprovado, recusado, expirado, cancelado, reembolsado

### REQ-PAG-005 — Não armazenar dados do cartão [REGRA/OBRIG/MVP]
- **Regras:** usar tokenização/vault do provedor; nunca guardar número/CVV

### REQ-PAG-006 — Eventos e reconciliação [DADO/OBRIG/MVP]
- **Regras:** registrar todos os eventos; conciliar pedido ↔ pagamento ↔ estoque
- **Aceite:** evento duplicado → ignorado (idempotência)

---

## CLI — Área do cliente

### REQ-CLI-001 — Meus pedidos [FUNC/OBRIG/MVP]
- **Regras:** listar apenas os pedidos do próprio cliente

### REQ-CLI-002 — Acompanhamento [FUNC/OBRIG/MVP]
- **Saídas:** status atual, histórico, rastreio

### REQ-CLI-003 — Endereços [FUNC/OBRIG/MVP]
- **Regras:** CRUD de endereços; definir padrão

### REQ-CLI-004 — Favoritos [FUNC/ALTA/MVP]
- **Regras:** adicionar/remover; listar

### REQ-CLI-005 — Dados e senha [FUNC/OBRIG/MVP]
- **Regras:** alterar dados e senha; senha atual obrigatória para trocar

### REQ-CLI-006 — Isolamento de dados [REGRA/OBRIG/MVP]
- **Regras:** cliente só acessa os próprios dados/pedidos (RLS)
- **Aceite:** `Given` cliente A `Then` não consegue ver pedido de B

---

## CON — Conteúdo

### REQ-CON-001 — Página inicial [FUNC/OBRIG/MVP]
- **Elementos:** logo, menu, busca, conta, favoritos, carrinho com contador, banner administrável, categorias, novidades, destaques, promoções reais, coleções, entregas, benefícios reais, atendimento, redes sociais, rodapé completo

### REQ-CON-002 — Páginas institucionais [FUNC/OBRIG/MVP]
- **Páginas:** sobre, contato, FAQ, guia de tamanhos e medidas

### REQ-CON-003 — Identidade visual [NFR/OBRIG/MVP]
- **Regras:** paleta definida, tipografia elegante nos títulos e legível no texto, espaçamento equilibrado, animações discretas, responsivo (celular/tablet/note/desktop), ícones consistentes

---

## LEG — Legal e LGPD

### REQ-LEG-001 — Políticas legais [FUNC/OBRIG/MVP]
- **Páginas:** privacidade, termos de uso/condições, trocas e devoluções, cancelamento e reembolso, entrega, cookies
- **Regras:** refletir o funcionamento real; **não** eliminar direitos do consumidor (CDC); direito de arrependimento

### REQ-LEG-002 — Consentimento de cookies [FUNC/ALTA/MVP]
- **Regras:** banner de consentimento; não presumir consentimento pelo acesso; registrar escolha

### REQ-LEG-003 — Página de acessibilidade [FUNC/MÉDIA/MVP]
- **Regras:** declarar práticas, atalhos, contraste, suporte

### REQ-LEG-004 — Erros [FUNC/OBRIG/MVP]
- **Páginas:** 404, indisponibilidade temporária, mensagens de erro compreensíveis

### REQ-LEG-005 — Direitos do titular (LGPD) [FUNC/OBRIG/MVP]
- **Regras:** permitir solicitar acesso, correção, exclusão, portabilidade; retenção conforme obrigação legal

### REQ-LEG-006 — Identificação da loja [FUNC/OBRIG/MVP]
- **Regras:** exibir nome, documento (CNPJ/MEI quando houver), endereço e canais de atendimento (Decreto 7.962/2013); **não** inventar dados

---

## SEG — Segurança

### REQ-SEG-001 — HTTPS obrigatório [NFR/OBRIG/MVP]
### REQ-SEG-002 — Validação no servidor [REGRA/OBRIG/MVP]
### REQ-SEG-003 — RLS + RBAC [REGRA/OBRIG/MVP]
### REQ-SEG-004 — Proteção XSS/CSRF [NFR/OBRIG/MVP]
### REQ-SEG-005 — Rate limiting [NFR/OBRIG/MVP]
### REQ-SEG-006 — Senhas com hash forte (argon2/bcrypt) [NFR/OBRIG/MVP]
### REQ-SEG-007 — Segredos em variáveis de ambiente [NFR/OBRIG/MVP]
### REQ-SEG-008 — Backups periódicos + restore testado [NFR/OBRIG/MVP]
### REQ-SEG-009 — Logs de auditoria [NFR/OBRIG/MVP]
### REQ-SEG-010 — Erros sem vazar dados [NFR/OBRIG/MVP]

> **Nota:** cada requisito SEG acima herda o padrão de aceite do seu ERP (`audit_log` imutável; RBAC; senha argon2; backup com restore testado).

---

## Fora do MVP

Registrados para não perder escopo — entram em fases futuras:

- **Fiscal:** emissão de NFC-e/NF-e (certificado A1, contador, emissor), SPED, obrigações acessórias.
- **Logística avançada:** integração Correios/transportadoras, CT-e/MDF-e.
- **Multi-filial / multi-tenant** (hoje é loja única).
- **Marketplace/canais** (Mercado Livre, Shopee) com conciliação de estoque.
- **BI avançado** (OLAP separado do OLTP).
- **Retirada em loja física** se houver ponto físico.
