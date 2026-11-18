#!/usr/bin/env python3
"""Converte a planilha de produtos (ODS ou CSV) em JSON normalizado."""
import csv
import io
import json
import re
import sys
import zipfile
import xml.etree.ElementTree as ET
from pathlib import Path

NS = {
    "table": "urn:oasis:names:tc:opendocument:xmlns:table:1.0",
    "text": "urn:oasis:names:tc:opendocument:xmlns:text:1.0",
    "office": "urn:oasis:names:tc:opendocument:xmlns:office:1.0",
}
COLUMNS = ["fotos", "categoria", "nome", "preco", "precoOriginal", "tamanhos", "cores", "descricao"]


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
                    "".join(p.itertext()) for p in cell.findall(".//text:p", NS)
                ).strip()
            cells.extend([value] * min(count, 20))
        while cells and cells[-1] == "":
            cells.pop()
        if not cells:
            continue
        rows.extend([cells] * min(repeat, 5))
    return rows


def csv_rows(path):
    raw = path.read_text(encoding="utf-8-sig", errors="replace")
    sample = raw[:4096]
    try:
        delimiter = csv.Sniffer().sniff(sample, delimiters=";,\t|").delimiter
    except csv.Error:
        delimiter = ";" if ";" in sample else ","
    return [row for row in csv.reader(io.StringIO(raw), delimiter=delimiter) if any(row)]


def normalize_price(value):
    raw = str(value or "").strip()
    # "319,80 (promoção: 255,80)" -> preço promocional 255,80
    match = re.search(r"promo(?:ç|c)[aã]o\s*:\s*([\d.,]+)", raw, re.IGNORECASE)
    if match:
        raw = match.group(1)
    value = raw.replace("R$", "").replace(" ", "")
    if "," in value and "." in value:
        value = value.replace(".", "").replace(",", ".")
    else:
        value = value.replace(",", ".")
    return value


def main():
    if len(sys.argv) < 2:
        print("uso: parse_planilha.py <planilha.ods|.csv> [saida.json]", file=sys.stderr)
        sys.exit(2)
    source = Path(sys.argv[1])
    rows = ods_rows(source) if source.suffix.lower() == ".ods" else csv_rows(source)
    if not rows:
        print("planilha vazia", file=sys.stderr)
        sys.exit(1)

    header = [str(h).strip().lower() for h in rows[0]]
    index = {name.lower(): header.index(name.lower()) for name in COLUMNS if name.lower() in header}
    if "nome" not in index:
        print("coluna 'nome' não encontrada", file=sys.stderr)
        sys.exit(1)

    def get(row, key):
        i = index.get(key.lower())
        return str(row[i]).strip() if i is not None and i < len(row) else ""

    products = []
    for row in rows[1:]:
        if not get(row, "nome"):
            continue
        products.append({
            "fotos": get(row, "fotos"),
            "categoria": get(row, "categoria"),
            "nome": get(row, "nome"),
            "preco": normalize_price(get(row, "preco")),
            "precoOriginal": normalize_price(get(row, "precoOriginal")),
            "tamanhos": get(row, "tamanhos"),
            "cores": get(row, "cores"),
            "descricao": get(row, "descricao") or None,
        })

    output = json.dumps(products, ensure_ascii=False, indent=2)
    if len(sys.argv) > 2:
        Path(sys.argv[2]).write_text(output, encoding="utf-8")
        print(f"{len(products)} produtos -> {sys.argv[2]}")
    else:
        print(output)


if __name__ == "__main__":
    main()
