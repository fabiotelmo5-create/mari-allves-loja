---
name: importar-produtos
description: Importa produtos reais da loja Mari Allves a partir de planilha ODS/CSV e fotos numeradas em imgs_prods. Use quando o usuário enviar/atualizar a planilha de produtos, pedir para adicionar produtos/preços/fotos ou corrigir o catálogo.
---

# Importar produtos (Mari Allves)

Um comando, sem re-explicar o processo.

## Quando usar
- "adicionei os produtos na planilha", "pode aplicar", "mandei as fotos", "corrige o catálogo".
- Planilha em `imgs_prods/` (`.ods` ou `.csv`) e fotos em `imgs_prods/extraidas/`.

## Fluxo
1. Rode: `bash .opencode/skills/importar-produtos/scripts/importar.sh`
2. O script encontra a planilha mais recente, converte ODS/CSV → JSON, grava as imagens em `ImageAsset`, cria/atualiza produtos por slug e estoque 1 por variação, e imprime um resumo.
3. Confira com `curl -sS 'http://localhost:3000/api/produtos?slugs=slug-1,slug-2'` (se houver servidor local) ou na produção.
4. Responda só com o resumo e erros. Não re-leia código.

## Regras
- Nunca invente nome, preço, descrição, composição ou estoque.
- `fotos` aceita `21-22` (duas fotos do mesmo produto).
- Estoque padrão = 1 até o usuário definir outro.
- ODS é lido direto: não peça conversão para CSV.
- Se houver conflito de SKU com outro produto, pare e pergunte antes de sobrescrever.
- Para regenerar a montagem numerada: `python3 .opencode/skills/importar-produtos/scripts/contato.py`.
