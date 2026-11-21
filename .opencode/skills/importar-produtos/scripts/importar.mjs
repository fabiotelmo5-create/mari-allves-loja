import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { accessSync } from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';

function arg(name, fallback) {
  const flag = `--${name}`;
  const i = process.argv.indexOf(flag);
  return i >= 0 ? process.argv[i + 1] : fallback;
}
function hasFlag(name) {
  return process.argv.includes(`--${name}`);
}
function existsSync(p) {
  try { accessSync(p); return true; } catch { return false; }
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
const require = createRequire(path.join(root, 'packages/db/package.json'));
const { PrismaClient } = require('@prisma/client');

const jsonPath = arg('json', '/tmp/opencode/produtos.json');
const imageDir = path.resolve(root, arg('dir', 'imgs_prods'));
const previewPath = path.resolve(root, arg('preview', '/tmp/opencode/preview_importacao.html'));
const reportPath = path.resolve(root, arg('report', '/tmp/opencode/relatorio_importacao.json'));
const commit = hasFlag('commit');

const rows = JSON.parse(await readFile(jsonPath, 'utf8'));
const categorySlugs = {
  blusas: 'blusas', blusa: 'blusas', 'cropped - blusa': 'blusas',
  saias: 'saias', saia: 'saias', 'saia media jeans': 'saias',
  vestidos: 'vestidos', vestido: 'vestidos', 'saia- vestido': 'vestidos',
  acessorios: 'acessorios', acessório: 'acessorios',
  calcas: 'calcas', calças: 'calcas',
  conjuntos: 'conjuntos', conjunto: 'conjuntos',
  shorts: 'shorts', short: 'shorts',
};
const slugify = (value) => String(value ?? '')
  .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...await walk(full));
    else if (/\.(jpe?g|png|webp)$/i.test(entry.name)) out.push(full);
  }
  return out;
}

const allImages = existsSync(imageDir) ? await walk(imageDir) : [];
const byBase = new Map();
for (const file of allImages) {
  const base = path.basename(file);
  byBase.set(base.toLowerCase(), file);
  byBase.set(path.parse(base).name.toLowerCase(), file);
}

const p = new PrismaClient();
const plan = [];
const seenSkus = new Set();
const errorsAll = [];

try {
  for (const [index, row] of rows.entries()) {
    const line = index + 2;
    const errors = [];
    const nome = String(row.nome ?? '').trim();
    let sku = String(row.id ?? '').trim().toUpperCase();
    if (!sku) sku = `${slugify(nome) || 'prod'}-${slugify(row.tamanhos) || 'unico'}-${slugify(row.cores) || 'unico'}`.toUpperCase();

    if (!nome) errors.push('nome vazio');
    if (seenSkus.has(sku)) errors.push(`SKU duplicado na planilha: ${sku}`);
    seenSkus.add(sku);

    const priceStr = String(row.preco ?? '').replace(',', '.').trim();
    const priceCents = Math.round(Number(priceStr) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) errors.push(`preço inválido: ${row.preco}`);

    const originalStr = String(row.precoOriginal ?? '').replace(',', '.').trim();
    let previousPriceCents = null;
    if (originalStr) {
      previousPriceCents = Math.round(Number(originalStr) * 100);
      if (!Number.isFinite(previousPriceCents) || previousPriceCents <= priceCents) {
        errors.push(`preço original inválido ou menor que o de venda: ${row.precoOriginal}`);
        previousPriceCents = null;
      }
    }

    const catKey = String(row.categoria ?? '').trim().toLowerCase();
    const categorySlug = categorySlugs[catKey];
    if (!categorySlug) errors.push(`categoria desconhecida: ${row.categoria}`);

    const size = String(row.tamanhos ?? '').split(/[-;/]/)[0].trim() || 'Único';
    const color = String(row.cores ?? '').split(/[-;/]/)[0].trim() || 'Único';
    const stockRaw = String(row.estoque ?? '').trim();
    const stock = stockRaw ? Number(stockRaw) : 1;
    if (!Number.isInteger(stock) || stock < 0) errors.push(`estoque inválido: ${row.estoque}`);

    const statusRaw = String(row.status ?? '').trim().toUpperCase();
    const status = ['PUBLICADO', 'RASCUNHO', 'INATIVO', 'ARQUIVADO'].includes(statusRaw) ? statusRaw : 'PUBLICADO';
    const blackFriday = ['SIM', 'S', '1', 'TRUE', 'YES'].includes(String(row.blackFriday ?? '').trim().toUpperCase());

    // Resolução de fotos: nome exato primeiro, depois prefixo por SKU, depois índice numérico legado.
    const photoValues = [row.foto, row.foto2, row.foto3].map((v) => String(v ?? '').trim()).filter(Boolean);
    const files = [];
    for (const value of photoValues) {
      const exact = byBase.get(value.toLowerCase()) ?? byBase.get(path.basename(value).toLowerCase());
      if (exact) { files.push(exact); continue; }
      const prefixed = allImages
        .filter((f) => path.basename(f).toLowerCase().startsWith(`${sku.toLowerCase()}_`))
        .sort();
      if (prefixed.length) { files.push(...prefixed); break; }
      const nums = (value.match(/\d+/g) ?? []).map(Number);
      const numeric = nums.map((n) => allImages[n - 1]).filter(Boolean);
      if (numeric.length) { files.push(...numeric); continue; }
      errors.push(`foto não encontrada: ${value}`);
    }
    if (files.length === 0 && photoValues.length === 0) errors.push('nenhuma foto informada');

    const assets = [];
    for (const file of files) {
      try {
        const bytes = await readFile(file);
        const ext = path.extname(file).toLowerCase();
        const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
        if (bytes.length > 4 * 1024 * 1024) errors.push(`foto > 4MB: ${path.basename(file)}`);
        assets.push({ file: path.basename(file), bytes, mimeType });
      } catch {
        errors.push(`falha ao ler foto: ${path.basename(file)}`);
      }
    }

    let existing = null;
    let action = 'criar';
    if (!errors.length) {
      existing = await p.product.findUnique({ where: { sku }, select: { id: true, slug: true } });
      action = existing ? 'atualizar' : 'criar';
      const slug = slugify(nome);
      const slugOwner = await p.product.findUnique({ where: { slug }, select: { id: true } });
      if (slugOwner && (!existing || slugOwner.id !== existing.id)) errors.push(`slug já usado por outro produto: ${slug}`);
      const variantSku = `${sku}-${slugify(size)}-${slugify(color)}`.toUpperCase();
      const variantOwner = await p.productVariant.findUnique({ where: { sku: variantSku }, select: { productId: true } });
      if (variantOwner && (!existing || variantOwner.productId !== existing.id)) errors.push(`SKU de variação já usado: ${variantSku}`);
    }

    if (errors.length) errorsAll.push({ linha: line, sku, nome, erros: errors });

    plan.push({
      linha: line, sku, nome, categoria: categorySlug, precoCents: priceCents,
      anteriorCents: previousPriceCents, tamanho: size, cor: color,
      descricao: row.descricao || null, estoque: stock, status, blackFriday,
      fotos: files.map((f) => path.basename(f)), assets, acao: action,
      thumb: row.thumb || '', erros: errors,
    });
  }
} finally {
  await p.$disconnect();
}

const ok = plan.filter((r) => !r.erros.length);
const bad = plan.filter((r) => r.erros.length);

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Preview de importação</title>
<style>body{font-family:system-ui,sans-serif;margin:24px;color:#333}h1{color:#A85F70}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border:1px solid #eee;padding:8px;vertical-align:top;text-align:left}th{background:#FFF9FA}img{width:90px;height:90px;object-fit:cover;border-radius:8px}.erro{color:#b91c1c;font-weight:600}.ok{color:#15803d}.tag{background:#FDF0F3;color:#A85F70;padding:2px 6px;border-radius:99px;font-size:11px}</style></head><body>
<h1>Preview de importação — ${plan.length} linha(s)</h1>
<p><span class="ok">${ok.length} prontas</span> · <span class="erro">${bad.length} com erro</span> · modo: <strong>${commit ? 'COMMIT' : 'DRY-RUN'}</strong></p>
<table><thead><tr><th>Foto</th><th>Linha</th><th>ID/SKU</th><th>Produto</th><th>Categoria</th><th>Preço</th><th>Original</th><th>Var.</th><th>Est.</th><th>BF</th><th>Ação</th><th>Status</th></tr></thead><tbody>
${plan.map((r) => `<tr>
<td>${r.thumb ? `<img src="${r.thumb}">` : '—'}<br><small>${r.fotos.join('<br>') || '—'}</small></td>
<td>${r.linha}</td><td><code>${r.sku}</code></td><td>${r.nome || '<em>vazio</em>'}</td>
<td>${r.categoria || '—'}</td><td>R$ ${(r.precoCents / 100).toFixed(2).replace('.', ',')}</td>
<td>${r.anteriorCents ? 'R$ ' + (r.anteriorCents / 100).toFixed(2).replace('.', ',') : '—'}</td>
<td>${r.tamanho}/${r.cor}</td><td>${r.estoque}</td><td>${r.blackFriday ? 'sim' : '—'}</td>
<td><span class="tag">${r.acao}</span></td>
<td>${r.erros.length ? `<span class="erro">${r.erros.join('<br>')}</span>` : '<span class="ok">OK</span>'}</td>
</tr>`).join('')}
</tbody></table></body></html>`;

await mkdir(path.dirname(previewPath), { recursive: true });
await writeFile(previewPath, html, 'utf8');
await writeFile(reportPath, JSON.stringify({ total: plan.length, ok: ok.length, erros: errorsAll, plano: plan.map(({ assets, thumb, ...rest }) => rest) }, null, 2), 'utf8');

if (!commit) {
  console.log(`DRY-RUN: ${ok.length} prontas, ${bad.length} com erro.`);
  console.log(`Preview: ${previewPath}`);
  console.log(`Relatório: ${reportPath}`);
  if (bad.length) {
    console.log('\nERROS:');
    for (const e of errorsAll) console.log(`  linha ${e.linha} [${e.sku}] ${e.nome}: ${e.erros.join('; ')}`);
  }
  process.exit(bad.length ? 1 : 0);
}

if (bad.length) {
  console.error('Importação abortada: corrija os erros do relatório antes de usar --commit.');
  process.exit(1);
}

const backupDir = path.join(root, 'imgs_prods/backups');
await mkdir(backupDir, { recursive: true });
const backupFile = path.join(backupDir, `backup_importacao_${Date.now()}.json`);
const skus = ok.map((r) => r.sku);
const backup = await p.product.findMany({
  where: { sku: { in: skus } },
  include: { images: true, variants: { include: { stock: true } } },
});
await writeFile(backupFile, JSON.stringify(backup, null, 2), 'utf8');
console.log(`Backup: ${backupFile}`);

const summary = [];
for (const r of ok) {
  await p.$transaction(async (tx) => {
    let product;
    if (r.acao === 'atualizar') {
      product = await tx.product.update({
        where: { sku: r.sku },
        data: {
          name: r.nome, slug: slugify(r.nome), categoryId: (await tx.category.findUniqueOrThrow({ where: { slug: r.categoria } })).id,
          priceCents: r.precoCents, previousPriceCents: r.anteriorCents,
          description: r.descricao, status: r.status, blackFriday: r.blackFriday,
          publishedAt: r.status === 'PUBLICADO' ? new Date() : null,
        },
      });
      const old = await tx.productImage.findMany({ where: { productId: product.id }, select: { url: true } });
      const oldIds = old.map((i) => i.url.match(/\/api\/imagens\/(.+)$/)?.[1]).filter(Boolean);
      await tx.productImage.deleteMany({ where: { productId: product.id } });
      for (const id of oldIds) {
        const used = await tx.productImage.count({ where: { url: { contains: `/api/imagens/${id}` } } });
        if (!used) await tx.imageAsset.deleteMany({ where: { id } });
      }
    } else {
      product = await tx.product.create({
        data: {
          sku: r.sku, name: r.nome, slug: slugify(r.nome),
          categoryId: (await tx.category.findUniqueOrThrow({ where: { slug: r.categoria } })).id,
          priceCents: r.precoCents, previousPriceCents: r.anteriorCents,
          description: r.descricao, status: r.status, blackFriday: r.blackFriday,
          publishedAt: r.status === 'PUBLICADO' ? new Date() : null,
        },
      });
    }

    for (const [position, asset] of r.assets.entries()) {
      const stored = await tx.imageAsset.create({
        data: { mimeType: asset.mimeType, size: asset.bytes.length, data: asset.bytes },
      });
      await tx.productImage.create({
        data: {
          productId: product.id, url: `/api/imagens/${stored.id}`,
          alt: r.assets.length > 1 ? `${r.nome} — vista ${position + 1}` : r.nome,
          position,
        },
      });
    }

    const variantSku = `${r.sku}-${slugify(r.tamanho)}-${slugify(r.cor)}`.toUpperCase();
    let variant = await tx.productVariant.findUnique({ where: { sku: variantSku } })
      ?? await tx.productVariant.findFirst({ where: { productId: product.id } });
    if (variant) {
      await tx.productVariant.update({ where: { id: variant.id }, data: { productId: product.id, size: r.tamanho, color: r.cor, sku: variantSku, priceCents: null } });
    } else {
      variant = await tx.productVariant.create({ data: { productId: product.id, size: r.tamanho, color: r.cor, sku: variantSku, priceCents: null } });
    }
    const stock = await tx.stock.findUnique({ where: { variantId: variant.id } });
    if (stock) await tx.stock.update({ where: { id: stock.id }, data: { quantity: r.estoque } });
    else await tx.stock.create({ data: { variantId: variant.id, quantity: r.estoque } });
  });
  summary.push(`${r.sku} | ${r.nome} | R$ ${(r.precoCents / 100).toFixed(2)} | ${r.fotos.join(',')} | ${r.acao}`);
}

console.log(summary.join('\n'));
console.log(`Importados: ${summary.length}. Total no banco: ${await p.product.count()}`);
