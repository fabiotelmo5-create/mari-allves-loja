import { readFile, readdir } from 'node:fs/promises';
import { accessSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

function arg(name, fallback) {
  const flag = `--${name}`;
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
}

function findRoot(start) {
  let dir = path.resolve(start);
  while (dir !== path.parse(dir).root) {
    if (existsSync(path.join(dir, '.git'))) return dir;
    dir = path.dirname(dir);
  }
  return path.resolve(start);
}

const root = findRoot(process.cwd());

function existsSync(p) {
  try {
    accessSync(p);
    return true;
  } catch {
    return false;
  }
}
const require = createRequire(path.join(root, 'packages/db/package.json'));
const { PrismaClient } = require('@prisma/client');
const jsonPath = arg('json', '/tmp/opencode/produtos.json');
const imageDir = path.resolve(root, arg('dir', 'imgs_prods/extraidas'));
const rows = JSON.parse(await readFile(jsonPath, 'utf8'));

const categorySlugs = {
  blusas: 'blusas', blusa: 'blusas',
  saias: 'saias', saia: 'saias',
  vestidos: 'vestidos', vestido: 'vestidos',
  acessorios: 'acessorios', acessório: 'acessorios', acessorios: 'acessorios',
};

const slugify = (value) => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const images = (await readdir(imageDir))
  .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
  .sort();

const p = new PrismaClient();
const summary = [];

try {
  for (const row of rows) {
    const name = String(row.nome ?? '').trim();
    if (!name) continue;

    const numbers = (String(row.fotos ?? '').match(/\d+/g) ?? []).map(Number);
    const files = numbers.map((n) => images[n - 1]).filter(Boolean);
    if (files.length === 0) throw new Error(`${name}: nenhuma foto encontrada (fotos=${row.fotos})`);

    const priceCents = Math.round(Number(String(row.preco ?? '').replace(',', '.')) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) throw new Error(`${name}: preço inválido (${row.preco})`);

    const categorySlug = categorySlugs[String(row.categoria ?? '').trim().toLowerCase()];
    if (!categorySlug) throw new Error(`${name}: categoria inválida (${row.categoria})`);
    const category = await p.category.findUniqueOrThrow({ where: { slug: categorySlug } });

    const size = String(row.tamanhos ?? '').split(/[-;/]/)[0].trim() || 'Único';
    const color = String(row.cores ?? '').split(/[-;/]/)[0].trim() || 'Único';
    const slug = slugify(name);
    const sku = `${slug}-${slugify(size)}-${slugify(color)}`.toUpperCase();
    const description = row.descricao ? String(row.descricao).trim() : null;

    const bySku = await p.product.findUnique({ where: { sku } });
    let existing = await p.product.findUnique({ where: { slug } });
    if (existing && bySku && existing.id !== bySku.id) {
      throw new Error(`${name}: SKU ${sku} já pertence a outro produto`);
    }
    existing ??= bySku;

    const assets = [];
    for (const file of files) {
      const bytes = await readFile(path.join(imageDir, file));
      const ext = path.extname(file).toLowerCase();
      const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
      assets.push({ bytes, mimeType });
    }

    await p.$transaction(async (tx) => {
      const imageRows = [];
      let productId;

      if (existing) {
        productId = existing.id;
        const oldAssets = (await tx.productImage.findMany({
          where: { productId }, select: { url: true },
        })).map((img) => img.url.match(/\/api\/imagens\/(.+)$/)?.[1]).filter(Boolean);

        await tx.productImage.deleteMany({ where: { productId } });
        await tx.product.update({
          where: { id: productId },
          data: {
            sku, name, slug, description, priceCents,
            categoryId: category.id, status: 'PUBLICADO', publishedAt: new Date(),
          },
        });

        for (const id of oldAssets) {
          const stillUsed = await tx.productImage.count({ where: { url: { contains: `/api/imagens/${id}` } } });
          if (!stillUsed) await tx.imageAsset.deleteMany({ where: { id } });
        }
      } else {
        const created = await tx.product.create({
          data: {
            sku, name, slug, description, priceCents,
            categoryId: category.id, status: 'PUBLICADO', publishedAt: new Date(),
          },
        });
        productId = created.id;
      }

      for (const [position, asset] of assets.entries()) {
        const stored = await tx.imageAsset.create({
          data: { mimeType: asset.mimeType, size: asset.bytes.length, data: asset.bytes },
        });
        imageRows.push({
          productId, url: `/api/imagens/${stored.id}`,
          alt: files.length > 1 ? `${name} — vista ${position + 1}` : name,
          position,
        });
      }
      await tx.productImage.createMany({ data: imageRows });

      let variant = await tx.productVariant.findFirst({ where: { productId, sku } })
        ?? await tx.productVariant.findFirst({ where: { productId } });

      if (variant) {
        await tx.productVariant.update({
          where: { id: variant.id }, data: { size, color, sku, priceCents: null },
        });
      } else {
        variant = await tx.productVariant.create({
          data: { productId, size, color, sku, priceCents: null },
        });
      }

      const stock = await tx.stock.findUnique({ where: { variantId: variant.id } });
      if (stock) await tx.stock.update({ where: { id: stock.id }, data: { quantity: 1 } });
      else await tx.stock.create({ data: { variantId: variant.id, quantity: 1 } });
    });

    summary.push(`${name} | R$ ${(priceCents / 100).toFixed(2)} | ${size}/${color} | fotos ${numbers.join('-')} | ${existing ? 'atualizado' : 'criado'}`);
  }

  console.log(summary.join('\n'));
  console.log(`total de produtos no banco: ${await p.product.count()}`);
} finally {
  await p.$disconnect();
}
