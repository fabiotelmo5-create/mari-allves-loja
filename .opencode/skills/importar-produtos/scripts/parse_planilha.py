#!/usr/bin/env python3
"""Converte planilha ODS/CSV em JSON canônico para importação segura.

Uso:
  parse_planilha.py <entrada.ods|.csv> <saida.json> [diretorio_imagens]

O terceiro argumento é opcional: gera miniaturas em base64 para o preview.
"""
import base64
import csv
import io
import json
import re
import sys
import unicodedata
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {
    "table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
    "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
    "office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
}

# Chave canônica -> aliases aceitos no cabeçalho.
ALIASES = {
    "id": ["id", "sku", "codigo", "codigo interno", "ref", "referencia"],
    "foto": ["foto", "fotos", "imagem", "imagens", "arquivo", "arquivo imagem"],
    "foto2": ["foto2", "imagem2", "imagem 2", "foto 2"],
    "foto3": ["foto3", "imagem3", "imagem 3", "foto 3"],
    "nome": ["nome", "produto", "nome do produto", "name", "title"],
    "categoria": ["categoria", "category", "categoria slug"],
    "preco": ["preco", "preco final", "preco promocional", "price", "valor"],
    "precoOriginal": ["precooriginal", "preco original", "preco completo", "original"],
    "tamanhos": ["tamanhos", "tamanho", "size"],
    "cores": ["cores", "cor", "color"],
    "descricao": ["descricao", "description"],
    "sexo": ["sexo", "genero", "gender"],
    "blackFriday": ["blackfriday", "black friday", "bf"],
    "status": ["status", "visibilidade"],
    "estoque": ["estoque", "stock", "qtd", "quantidade"],
}


def norm(value):
    text = str(value or "").strip().lower()
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    return re.sub(r"\s+", " ", text).strip()


def ods_rows(path):
    with zipfile.ZipFile(path) as z:
        root = ET.fromstring(z.read("content.xml"))
    table = root.find(".//table:table", NS)
    rows = []
    for row in table.findall("table:table-row", NS):
        cells = []
        repeat = int(row.get("{%s}number-rows-repeated" % NS["table"], 1))
        for cell in list(row):
            tag = cell.tag.split("}")[-1]
            if tag not in ("table-cell", "covered-table-cell"):
                continue
            count = int(cell.get("{%s}number-columns-repeated" % NS["table"], 1))
            value = cell.get("{%s}value" % NS["office"])
            if value is None:
                value = " ".join(
                    "".join(t.itertext()) for t in cell.findall(".//text:p", NS)
                ).strip()
            cells.extend([value] * min(count, 30))
        while cells and cells[-1] == "":
            cells.pop()
        if cells:
            rows.extend([cells] * min(repeat, 5))
    return rows


def csv_rows(path):
    raw = path.read_text(encoding="utf-8-sig", errors="replace")
    try:
        delimiter = csv.Sniffer().sniff(raw[:4096], delimiters=";,\t|").delimiter
    except csv.Error:
        delimiter = ";" if ";" in raw[:4096] else ","
    return [row for row in csv.reader(io.StringIO(raw), delimiter=delimiter) if any(str(c).strip() for c in row)]


def parse_price(value):
    """Retorna (preco_final, preco_original)."""
    raw = str(value or "").strip()
    promo = re.search(r"promo(?:ç|c)[aã]o\s*:\s*([\d.,]+)", raw, re.IGNORECASE)
    first = re.search(r"([\d]+[.,][\d]{1,2})", raw)
    if promo:
        price = promo.group(1)
        original = first.group(1) if first else ""
    else:
        price = first.group(1) if first else raw
        original = ""

    def clean(v):
        v = v.replace("R$", "").replace(" ", "")
        if "," in v and "." in v:
            v = v.replace(".", "").replace(",", ".")
        else:
            v = v.replace(",", ".")
        return v

    return clean(price), clean(original)


def thumb_data_uri(filename, imgdir):
    if not imgdir or not filename:
        return ""
    root = Path(imgdir)
    name = str(filename).strip()
    candidates = [root / name]
    # Nomes legadosnumericos podem vir sem extensao ou com zero a esquerda.
    stem = Path(name).stem
    for ext in ('.jpg', '.jpeg', '.png', '.webp'):
        candidates.append(root / f"{name}{ext}")
        candidates.append(root / f"{stem}{ext}")
        if stem.isdigit():
            candidates.append(root / f"{int(stem):02d}{ext}")
            candidates.append(root / f"{int(stem):03d}{ext}")
    chosen = next((c for c in candidates if c.exists()), None)
    if not chosen:
        matches = list(root.rglob(name))
        if not matches:
            matches = list(root.rglob(f"{stem}.*"))
        chosen = matches[0] if matches else None
    if not chosen:
        return ""
    try:
        from PIL import Image, ImageOps
        im = ImageOps.exif_transpose(Image.open(chosen).convert("RGB"))
        im.thumbnail((150, 150))
        buf = io.BytesIO()
        im.save(buf, format="JPEG", quality=72)
        return "data:image/jpeg;base64," + base64.b64encode(buf.getvalue()).decode()
    except Exception:
        return ""


def main():
    if len(sys.argv) < 3:
        print("uso: parse_planilha.py <planilha> <saida.json> [diretorio_imagens]", file=sys.stderr)
        sys.exit(2)
    source = Path(sys.argv[1])
    out = Path(sys.argv[2])
    imgdir = sys.argv[3] if len(sys.argv) > 3 else ""

    rows = ods_rows(source) if source.suffix.lower() == ".ods" else csv_rows(source)
    if not rows:
        print("planilha vazia", file=sys.stderr)
        sys.exit(1)

    header = [norm(h) for h in rows[0]]
    index = {}
    for key, aliases in ALIASES.items():
        for alias in aliases:
            if norm(alias) in header:
                index[key] = header.index(norm(alias))
                break

    if "nome" not in index and "id" not in index:
        print("cabecalho precisa de 'nome' ou 'id'", file=sys.stderr)
        sys.exit(1)

    def get(row, key):
        i = index.get(key)
        return str(row[i]).strip() if i is not None and i < len(row) else ""

    products = []
    for row in rows[1:]:
        if not any(str(c).strip() for c in row):
            continue
        price, original = parse_price(get(row, "preco"))
        raw_original = get(row, "precoOriginal")
        if raw_original:
            original = parse_price(raw_original)[0]
        foto = get(row, "foto")
        products.append({
            "id": get(row, "id"),
            "foto": foto,
            "foto2": get(row, "foto2"),
            "foto3": get(row, "foto3"),
            "nome": get(row, "nome"),
            "categoria": get(row, "categoria"),
            "preco": price,
            "precoOriginal": original,
            "tamanhos": get(row, "tamanhos"),
            "cores": get(row, "cores"),
            "descricao": get(row, "descricao") or None,
            "sexo": get(row, "sexo"),
            "blackFriday": get(row, "blackFriday"),
            "status": get(row, "status"),
            "estoque": get(row, "estoque"),
            "thumb": thumb_data_uri(foto, imgdir),
        })

    out.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"{len(products)} linhas -> {out}")


if __name__ == "__main__":
    main()
