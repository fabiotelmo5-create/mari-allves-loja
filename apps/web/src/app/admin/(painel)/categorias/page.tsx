import Image from 'next/image';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, ExternalLink, Image as ImageIcon, Upload } from 'lucide-react';
import { prisma } from '@mari-allves/db';
import { requireAdmin } from '@/lib/auth';
import { getCategoryImage } from '@/lib/category-images';
import { updateCategoryImageAction } from '@/app/admin/category-actions';

export const metadata = { title: 'Imagens de categorias — Painel Mari Allves' };
export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: Promise<{ salvo?: string; erro?: string }>;
}) {
  await requireAdmin();
  const { salvo, erro } = await searchParams;

  const categories = await prisma.category.findMany({
    orderBy: [{ position: 'asc' }, { name: 'asc' }],
    select: { id: true, name: true, slug: true, imageUrl: true },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-serif text-rosé-700">Imagens de categorias</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Troque as imagens que aparecem na home e no catálogo. JPG, PNG ou WebP, até 4 MB.
        </p>
      </div>

      {salvo && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          <CheckCircle2 className="h-4 w-4" />
          Imagem atualizada.
        </div>
      )}

      {erro && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertCircle className="h-4 w-4" />
          {erro}
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-2">
        {categories.map((category) => {
          const image = getCategoryImage(category.imageUrl, category.slug);

          return (
            <section key={category.id} className="rounded-xl border border-border bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-medium text-foreground">{category.name}</h2>
                  <p className="text-xs text-muted-foreground">/categoria/{category.slug}</p>
                </div>
                <Link
                  href={`/categoria/${category.slug}`}
                  target="_blank"
                  className="inline-flex items-center gap-1 text-xs text-rosé-700 hover:underline"
                >
                  Ver página <ExternalLink className="h-3.5 w-3.5" />
                </Link>
              </div>

              <div className="mt-4 flex flex-col gap-4 sm:flex-row">
                <div className="relative h-32 w-full shrink-0 overflow-hidden rounded-lg border border-border bg-rosé-50 sm:w-32">
                  {image ? (
                    <Image
                      src={image}
                      alt={`Imagem da categoria ${category.name}`}
                      fill
                      className="object-cover"
                      sizes="128px"
                      unoptimized={image.endsWith('.svg')}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted-foreground">
                      <ImageIcon className="h-7 w-7" />
                    </div>
                  )}
                </div>

                <form action={updateCategoryImageAction} className="min-w-0 flex-1 space-y-3">
                  <input type="hidden" name="id" value={category.id} />

                  <label className="block text-xs font-medium text-foreground">
                    Adicionar ou trocar imagem
                    <span className="mt-1 flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-input bg-background px-3 py-2 text-xs text-muted-foreground hover:border-rosé-300">
                      <Upload className="h-4 w-4 text-rosé-700" />
                      Escolher arquivo
                      <input
                        type="file"
                        name="imageFile"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                      />
                    </span>
                  </label>

                  <label className="block text-xs font-medium text-foreground">
                    Ou usar um link
                    <input
                      type="url"
                      name="imageUrl"
                      placeholder="https://..."
                      className="input"
                    />
                  </label>

                  {category.imageUrl && (
                    <label className="flex items-center gap-2 text-xs text-muted-foreground">
                      <input type="checkbox" name="removeImage" className="h-4 w-4 rounded border-border" />
                      Remover imagem atual
                    </label>
                  )}

                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-lg bg-rosé-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-rosé-600"
                  >
                    Salvar imagem
                  </button>
                </form>
              </div>
            </section>
          );
        })}
      </div>

      {categories.length === 0 && (
        <div className="rounded-xl border border-dashed border-border bg-white p-10 text-center text-sm text-muted-foreground">
          Nenhuma categoria cadastrada.
        </div>
      )}
    </div>
  );
}
