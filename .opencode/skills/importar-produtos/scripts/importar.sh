#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$(cd "$SKILL_DIR/../../.." && pwd)"
cd "$ROOT"

mkdir -p /tmp/opencode

COMMIT=0
ARGS=()
for arg in "$@"; do
  if [ "$arg" = "--commit" ]; then COMMIT=1; else ARGS+=("$arg"); fi
done

MANIFEST="${ARGS[0]:-}"
IMAGE_DIR="${ARGS[1]:-imgs_prods}"

if [ -z "$MANIFEST" ]; then
  MANIFEST="$(find imgs_prods -type f \( -iname '*.ods' -o -iname '*.csv' \) -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)"
fi
if [ -z "${MANIFEST:-}" ]; then
  echo "Nenhuma planilha informada/encontrada em imgs_prods/." >&2
  exit 1
fi

echo "Planilha: $MANIFEST"
echo "Imagens: $IMAGE_DIR"
python3 "$SKILL_DIR/scripts/parse_planilha.py" "$MANIFEST" /tmp/opencode/produtos.json "$IMAGE_DIR"

COMMIT_FLAG=""
if [ "$COMMIT" -eq 1 ]; then COMMIT_FLAG="--commit"; fi

node "$SKILL_DIR/scripts/importar.mjs" \
  --json /tmp/opencode/produtos.json \
  --dir "$IMAGE_DIR" \
  --preview /tmp/opencode/preview_importacao.html \
  --report /tmp/opencode/relatorio_importacao.json \
  $COMMIT_FLAG
