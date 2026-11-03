'use client';

import { useMemo, useRef, useState, useTransition } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import type { ProductFormState } from '@/app/admin/actions';

type Category = { id: string; name: string };

type Variant = {
  id: string;
  size: string;
  color: string;
  sku: string;
  initialStock: number;
};

type Values = {
  id?: string;
  name: string;
  slug: string;
  sku: string;
  description: string;
  categoryId: string;
  price: string;
  previousPrice: string;
  composition: string;
  careInstructions: string;
  weightG: string;
  widthCm: string;
  heightCm: string;
  depthCm: string;
  imageUrl: string;
  status: 'RASCUNHO' | 'PUBLICADO' | 'INATIVO' | 'ARQUIVADO';
};

type Props = {
  categories: Category[];
  initialValues?: Values;
  initialVariants?: Variant[];
  action: (state: ProductFormState, formData: FormData) => Promise<ProductFormState>;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const emptyValues: Values = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  categoryId: '',
  price: '',
  previousPrice: '',
  composition: '',
  careInstructions: '',
  weightG: '',
  widthCm: '',
  heightCm: '',
  depthCm: '',
  imageUrl: '',
  status: 'RASCUNHO',
};

export function ProductForm({ categories, initialValues = emptyValues, initialVariants, action }: Props) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [slugWasEdited, setSlugWasEdited] = useState(Boolean(initialValues.slug));
  const keyCounter = useRef(Math.max(initialVariants?.length ?? 0, 1));
  const [variants, setVariants] = useState<Variant[]>(
    initialVariants?.length
      ? initialVariants
      : [{ id: 'new-1', size: 'Único', color: '', sku: '', initialStock: 0 }]
  );

  const variantsJson = useMemo(() => JSON.stringify(variants), [variants]);

  function updateVariant(id: string, field: keyof Variant, value: string | number) {
    setVariants((current) =>
      current.map((variant) => (variant.id === id ? { ...variant, [field]: value } : variant))
    );
  }

  function addVariant() {
    keyCounter.current += 1;
    setVariants((current) => [
      ...current,
      { id: `new-${keyCounter.current}`, size: '', color: '', sku: '', initialStock: 0 },
    ]);
  }

  function removeVariant(id: string) {
    setVariants((current) =>
      current.length > 1 ? current.filter((variant) => variant.id !== id) : current
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setError(null);

    startTransition(async () => {
      const result = await action(null, formData);
      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {initialValues.id && <input type="hidden" name="id" value={initialValues.id} />}
      <input type="hidden" name="variants" value={variantsJson} />

      {error && (
        <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-medium text-foreground">Informações do produto</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nome" required>
            <input
              name="name"
              required
              minLength={3}
              defaultValue={initialValues.name}
              onChange={(event) => {
                if (!slugWasEdited) {
                  const slugField = event.currentTarget.form?.elements.namedItem('slug') as HTMLInputElement | null;
                  if (slugField) slugField.value = slugify(event.currentTarget.value);
                }
              }}
              className="input"
              placeholder="Ex.: Vestido midi em linho"
            />
          </Field>
          <Field label="SKU do produto" required hint="Identificador interno único.">
            <input name="sku" required minLength={3} defaultValue={initialValues.sku} className="input" placeholder="MA-VEST-001" />
          </Field>
          <Field label="Slug" required hint="URL da página do produto.">
            <input
              name="slug"
              required
              minLength={3}
              defaultValue={initialValues.slug}
              onChange={() => setSlugWasEdited(true)}
              className="input"
              placeholder="vestido-midi-em-linho"
            />
          </Field>
          <Field label="Categoria" required>
            <select name="categoryId" required defaultValue={initialValues.categoryId} className="input">
              <option value="">Selecione</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </Field>
          <div className="md:col-span-2">
            <Field label="Descrição">
              <textarea
                name="description"
                rows={4}
                defaultValue={initialValues.description}
                className="input resize-y"
                placeholder="Descreva modelagem, caimento e detalhes."
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-medium text-foreground">Preço e publicação</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <Field label="Preço" required hint="Ex.: 129,90">
            <input name="price" inputMode="decimal" required defaultValue={initialValues.price} className="input" placeholder="0,00" />
          </Field>
          <Field label="Preço anterior" hint="Só se a promoção for real.">
            <input name="previousPrice" inputMode="decimal" defaultValue={initialValues.previousPrice} className="input" placeholder="0,00" />
          </Field>
          <Field label="Status" required>
            <select name="status" defaultValue={initialValues.status} className="input">
              <option value="RASCUNHO">Rascunho</option>
              <option value="PUBLICADO">Publicado</option>
              <option value="INATIVO">Inativo</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-medium text-foreground">Variações e estoque</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Tamanho, cor e SKU são independentes por variação. Alterar o estoque registra um ajuste.
            </p>
          </div>
          <button type="button" onClick={addVariant} className="inline-flex items-center gap-1 text-sm font-medium text-rosé-700 hover:underline">
            <Plus className="h-4 w-4" /> Adicionar
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {variants.map((variant, index) => (
            <div key={variant.id} className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_1fr_1.2fr_110px_auto]">
              <label className="text-xs text-muted-foreground">
                Tamanho
                <input value={variant.size} onChange={(event) => updateVariant(variant.id, 'size', event.target.value)} className="input mt-1" placeholder="M" />
              </label>
              <label className="text-xs text-muted-foreground">
                Cor
                <input value={variant.color} onChange={(event) => updateVariant(variant.id, 'color', event.target.value)} className="input mt-1" placeholder="Rosé" />
              </label>
              <label className="text-xs text-muted-foreground">
                SKU da variação
                <input value={variant.sku} onChange={(event) => updateVariant(variant.id, 'sku', event.target.value.toUpperCase())} className="input mt-1" placeholder="MA-VEST-001-M-ROSE" />
              </label>
              <label className="text-xs text-muted-foreground">
                Estoque
                <input type="number" min="0" value={variant.initialStock} onChange={(event) => updateVariant(variant.id, 'initialStock', Number(event.target.value))} className="input mt-1" />
              </label>
              <button
                type="button"
                onClick={() => removeVariant(variant.id)}
                disabled={variants.length === 1}
                aria-label={`Remover variação ${index + 1}`}
                className="self-end rounded-md p-2 text-muted-foreground hover:bg-rosé-50 hover:text-rosé-700 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-medium text-foreground">Imagem e informações de envio</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="URL da imagem principal" hint="http(s) — upload próprio entra depois.">
            <input name="imageUrl" type="url" defaultValue={initialValues.imageUrl} className="input" placeholder="https://..." />
          </Field>
          <Field label="Composição">
            <input name="composition" defaultValue={initialValues.composition} className="input" placeholder="Ex.: 70% viscose, 30% linho" />
          </Field>
          <Field label="Cuidados">
            <input name="careInstructions" defaultValue={initialValues.careInstructions} className="input" placeholder="Ex.: Lavar à mão" />
          </Field>
          <Field label="Peso (g)">
            <input name="weightG" type="number" min="0" defaultValue={initialValues.weightG} className="input" placeholder="250" />
          </Field>
          <Field label="Largura (cm)">
            <input name="widthCm" type="number" min="0" defaultValue={initialValues.widthCm} className="input" placeholder="30" />
          </Field>
          <Field label="Altura (cm)">
            <input name="heightCm" type="number" min="0" defaultValue={initialValues.heightCm} className="input" placeholder="5" />
          </Field>
          <Field label="Profundidade (cm)">
            <input name="depthCm" type="number" min="0" defaultValue={initialValues.depthCm} className="input" placeholder="20" />
          </Field>
        </div>
      </section>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-lg bg-rosé-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-rosé-600 disabled:opacity-60"
      >
        {pending ? 'Salvando…' : initialValues.id ? 'Salvar alterações' : 'Criar produto'}
      </button>
    </form>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      {label} {required && <span className="text-rosé-600">*</span>}
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}
