#!/usr/bin/env python3
"""Gera um modelo de importação com IDs estáveis e nomes de arquivo exatos.

Uso:
  gerar_modelo.py <diretorio_imagens> <saida.csv>

O CSV sai com uma linha por imagem, já preenchido com:
  id = MA-001, MA-002 ...
  foto = nome exato do arquivo
  status = PUBLICADO
  estoque = 1

Você só preenche nome, categoria, preço, tamanho, cor e descrição.
"""
import base64
import csv
import io
import sys
from pathlib import Path

HEADERS = [
    "id", "foto", "foto2", "foto3", "nome", "categoria", "preco",
    "precoOriginal", "tamanhos", "cores", "descricao", "sexo",
    "blackFriday", "status", "estoque",
]


def main():
    if len(sys.argv) < 3:
        print("uso: gerar_modelo.py <diretorio_imagens> <saida.csv>", file=sys.stderr)
        sys.exit(2)
    imgdir = Path(sys.argv[1])
    out = Path(sys.argv[2])
    files = sorted(
        f for f in imgdir.rglob('*')
        if f.is_file() and f.suffix.lower() in ('.jpeg', '.jpg', '.png', '.webp')
    )
    if not files:
        print(f"nenhuma imagem em {imgdir}", file=sys.stderr)
        sys.exit(1)

    rows = []
    for i, f in enumerate(files, 1):
        rows.append({
            "id": f"MA-{i:03d}",
            "foto": f.name,
            "foto2": "",
            "foto3": "",
            "nome": "",
            "categoria": "",
            "preco": "",
            "precoOriginal": "",
            "tamanhos": "",
            "cores": "",
            "descricao": "",
            "sexo": "",
            "blackFriday": "",
            "status": "PUBLICADO",
            "estoque": "1",
        })

    with out.open('w', encoding='utf-8-sig', newline='') as fh:
        w = csv.DictWriter(fh, fieldnames=HEADERS, delimiter=';')
        w.writeheader()
        w.writerows(rows)

    # Montagem com ID + nome do arquivo para conferência visual.
    try:
        from PIL import Image, ImageDraw, ImageFont
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 13)
        tw, th, label = 170, 170, 46
        cols = 6
        lines = (len(files) + cols - 1) // cols
        sheet = Image.new('RGB', (cols * tw, lines * (th + label)), 'white')
        draw = ImageDraw.Draw(sheet)
        for i, f in enumerate(files):
            im = Image.open(f)
            im.thumbnail((tw - 8, th - 8))
            if im.mode != 'RGB':
                im = im.convert('RGB')
            x = (i % cols) * tw + (tw - im.width) // 2
            y = (i // cols) * (th + label) + (th - im.height) // 2
            sheet.paste(im, (x, y))
            draw.text(((i % cols) * tw + 4, (i // cols) * (th + label) + th + 2),
                      f'MA-{i+1:03d}', fill='#A85F70', font=font)
            draw.text(((i % cols) * tw + 4, (i // cols) * (th + label) + th + 20),
                      f.name[:24], fill='black', font=font)
        contact = out.with_name('modelo_contato.jpg')
        sheet.save(contact, quality=85)
        print(f"modelo: {out}")
        print(f"contato: {contact}")
    except Exception as exc:
        print(f"modelo: {out}")
        print(f"contato não gerado: {exc}")


if __name__ == '__main__':
    main()
