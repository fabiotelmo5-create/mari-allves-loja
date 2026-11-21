---
name: importar-produtos
description: Importa produtos reais da Mari Allves com IDs estáveis, foto por nome de arquivo exato, validação, preview HTML e dry-run antes de gravar. Use quando o usuário enviar fotos/planilha, pedir para adicionar produtos ou corrigir o catálogo.
---

# Importar produtos (Mari Allves) — fluxo seguro

Nunca importe direto. O fluxo sempre tem **dry-run + preview + aprovação**.

## 1. Preparar
Se o usuário mandou só as fotos, gere o modelo:
```bash
python3 .opencode/skills/importar-produtos/scripts/gerar_modelo.py imgs_prods/novas imgs_prods/modelo.csv
```
Isso cria uma linha por imagem com:
- `id` = `MA-001`, `MA-002`... (**chave estável**, vira SKU)
- `foto` = **nome exato do arquivo** (não use posição/número)
- `status=PUBLICADO`, `estoque=1`

O usuário preenche apenas `nome`, `categoria`, `preco`, `tamanhos`, `cores`, `descricao`.
Opcionais: `precoOriginal`, `foto2`, `foto3`, `blackFriday`, `estoque`, `status`.

## 2. Validar (DRY-RUN — padrão)
```bash
bash .opencode/skills/importar-produtos/scripts/importar.sh imgs_prods/modelo.csv imgs_prods/novas
```
O script:
- casa a foto pelo **nome exato** (ou prefixo `MA-001_`), nunca por ordem de lista;
- valida nome, preço, categoria, SKU duplicado, slug conflitante, estoque e foto ≤4MB;
- grava `/tmp/opencode/preview_importacao.html` e `/tmp/opencode/relatorio_importacao.json`;
- **não grava no banco**.

Abra o preview e confira thumbnail + dados + erros.

## 3. Aplicar (somente após aprovação)
```bash
bash .opencode/skills/importar-produtos/scripts/importar.sh imgs_prods/modelo.csv imgs_prods/novas --commit
```
Antes de gravar, salva backup em `imgs_prods/backups/backup_importacao_*.json`.
Upsert feito por **SKU (`id`)**, não por nome.

## Regras
- Nunca inventar nome/preço/descrição. Se faltar, fica no relatório como erro.
- Linha com erro é ignorada no commit; corrigir e rodar de novo.
- `preco` = valor final; `precoOriginal` = valor sem desconto (opcional).
- Texto `319,80 (promoção: 255,80)` é aceito: vira preço 255,80 e original 319,80.
- `foto2`/`foto3` viram galeria na ordem informada.
- Estoque padrão = 1.
- Compatibilidade: planilhas antigas com `fotos` numérico ainda funcionam, mas o ideal é migrar para `id` + `foto` exata.
