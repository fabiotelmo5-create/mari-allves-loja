#!/usr/bin/env bash
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
ROOT="$(cd "$SKILL_DIR/../../.." && pwd)"
cd "$ROOT"

mkdir -p /tmp/opencode

PLANILHA="$(find imgs_prods -type f \( -iname '*.ods' -o -iname '*.csv' \) -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)"
if [ -z "${PLANILHA:-}" ]; then
  echo "Nenhuma planilha .ods/.csv encontrada em imgs_prods/." >&2
  exit 1
fi

echo "Planilha: $PLANILHA"
python3 "$SKILL_DIR/scripts/parse_planilha.py" "$PLANILHA" /tmp/opencode/produtos.json
IMAGE_DIR="${1:-imgs_prods/extraidas}"
node "$SKILL_DIR/scripts/importar.mjs" --json /tmp/opencode/produtos.json --dir "$IMAGE_DIR"
