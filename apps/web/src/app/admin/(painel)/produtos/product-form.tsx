'use client';

import { useEffect, useMemo, useRef, useState, useTransition } from 'react';
import { Image as ImageIcon, Info, Plus, Trash2, Upload } from 'lucide-react';
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

const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

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
  const [imageError, setImageError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [imagePreview, setImagePreview] = useState(initialValues.imageUrl);
  const [removeImage, setRemoveImage] = useState(false);
  const keyCounter = useRef(Math.max(initialVariants?.length ?? 0, 1));
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageUrlRef = useRef<HTMLInputElement>(null);
  const previewObjectUrl = useRef<string | null>(null);
  const [variants, setVariants] = useState<Variant[]>(
    initialVariants?.length
      ? initialVariants
      : [{ id: 'new-1', size: 'Único', color: '', sku: '', initialStock: 0 }]
  );

  const variantsJson = useMemo(() => JSON.stringify(variants), [variants]);
  const preview = removeImage ? '' : imagePreview;

  useEffect(() => {
    return () => {
      if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    };
  }, []);

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

  function handleImageChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setImageError(null);

    if (!file) return;

    if (file.size > MAX_IMAGE_BYTES) {
      setImageError('A foto deve ter no máximo 4 MB.');
      event.target.value = '';
      return;
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setImageError('Envie a foto em JPG, PNG ou WebP.');
      event.target.value = '';
      return;
    }

    if (previewObjectUrl.current) URL.revokeObjectURL(previewObjectUrl.current);
    const objectUrl = URL.createObjectURL(file);
    previewObjectUrl.current = objectUrl;
    setImagePreview(objectUrl);
    setRemoveImage(false);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (imageError) {
      setError(imageError);
      return;
    }

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
        <h2 className="font-medium text-foreground">Informações principais</h2>
        <p className="mt-1 text-xs text-muted-foreground">O básico que aparece na página do produto.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Nome do produto" required help="É o nome que a cliente vê na loja.">
            <input
              name="name"
              required
              minLength={3}
              defaultValue={initialValues.name}
              className="input"
              placeholder="Ex.: Vestido midi em linho"
            />
          </Field>
          <Field label="Categoria" required help="Escolha onde o produto aparece no catálogo.">
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
            <Field
              label="Descrição"
              help="Conte o tecido, o caimento e os detalhes que ajudam a cliente a escolher."
            >
              <textarea
                name="description"
                rows={4}
                defaultValue={initialValues.description}
                className="input resize-y"
                placeholder="Ex.: Vestido leve, forro em viscose e alças ajustáveis."
              />
            </Field>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-medium text-foreground">Preço e visibilidade</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Rascunho fica só no painel. Publicado aparece na loja e precisa de foto.
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field label="Preço de venda" required help="Use o valor final que a cliente paga, com vírgula. Ex.: 129,90.">
            <input
              name="price"
              inputMode="decimal"
              required
              defaultValue={initialValues.price}
              className="input"
              placeholder="0,00"
            />
          </Field>
          <Field label="Visibilidade" required help="Escolha se o produto já pode aparecer na loja.">
            <select name="status" defaultValue={initialValues.status} className="input">
              <option value="RASCUNHO">Rascunho — só você vê</option>
              <option value="PUBLICADO">Publicado — aparece na loja</option>
              <option value="INATIVO">Inativo — fora da loja</option>
              <option value="ARQUIVADO">Arquivado</option>
            </select>
          </Field>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <h2 className="font-medium text-foreground">Foto do produto</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          A primeira foto é a que aparece no catálogo. Você pode trocar depois.
        </p>
        <div className="mt-4 flex flex-col gap-5 sm:flex-row">
          <div className="flex h-44 w-full shrink-0 items-center justify-center overflow-hidden rounded-xl border border-dashed border-border bg-rosé-50 sm:w-44">
            {preview ? (
              // Prévia local; não usa next/image para funcionar antes do upload.
              <img src={preview} alt="Prévia da foto do produto" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <ImageIcon className="h-8 w-8" aria-hidden="true" />
                <span className="text-xs">Sem foto</span>
              </div>
            )}
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <label
                htmlFor="product-image"
                className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:border-rosé-300 hover:bg-rosé-50"
              >
                <Upload className="h-4 w-4" aria-hidden="true" />
                Escolher foto
              </label>
              <input
                ref={fileInputRef}
                id="product-image"
                name="imageFile"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="sr-only"
              />
              <span className="text-xs text-muted-foreground">JPG, PNG ou WebP, até 4 MB.</span>
            </div>

            {imageError && (
              <p role="alert" className="text-xs text-red-600">
                {imageError}
              </p>
            )}

            {initialValues.id && initialValues.imageUrl && (
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  name="removeImage"
                  checked={removeImage}
                  onChange={(event) => {
                    const checked = event.currentTarget.checked;
                    setRemoveImage(checked);
                    if (checked) {
                      if (previewObjectUrl.current) {
                        URL.revokeObjectURL(previewObjectUrl.current);
                        previewObjectUrl.current = null;
                      }
                      setImagePreview(initialValues.imageUrl);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                      if (imageUrlRef.current) imageUrlRef.current.value = '';
                    }
                  }}
                  className="h-4 w-4 rounded border-border"
                />
                Remover foto atual
              </label>
            )}

            <details className="text-xs text-muted-foreground">
              <summary className="cursor-pointer select-none hover:text-foreground">
                Ou usar um link de imagem
              </summary>
              <div className="mt-2">
                <input
                  ref={imageUrlRef}
                  name="imageUrl"
                  type="url"
                  defaultValue={initialValues.imageUrl.startsWith('http') ? initialValues.imageUrl : ''}
                  className="input"
                  placeholder="https://..."
                  onChange={(event) => {
                    if (!fileInputRef.current?.files?.length && !removeImage) {
                      setImagePreview(event.currentTarget.value || initialValues.imageUrl);
                    }
                  }}
                />
                <p className="mt-1">Use esta opção só se a foto já estiver publicada em outro site.</p>
              </div>
            </details>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-white p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-medium text-foreground">Tamanhos, cores e estoque</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Cada combinação tem seu próprio estoque. Os códigos internos são gerados automaticamente.
            </p>
          </div>
          <button
            type="button"
            onClick={addVariant}
            className="inline-flex items-center gap-1 text-sm font-medium text-rosé-700 hover:underline"
          >
            <Plus className="h-4 w-4" aria-hidden="true" /> Adicionar
          </button>
        </div>
        <div className="mt-4 space-y-3">
          {variants.map((variant, index) => (
            <div
              key={variant.id}
              className="grid gap-3 rounded-lg border border-border p-3 md:grid-cols-[1fr_1fr_120px_auto]"
            >
              <MiniField label="Tamanho" help="Ex.: P, M, G ou Único. É obrigatório.">
                <input
                  value={variant.size}
                  onChange={(event) => updateVariant(variant.id, 'size', event.target.value)}
                  className="input mt-1"
                  placeholder="M"
                />
              </MiniField>
              <MiniField label="Cor" help="Ex.: Rosé, Preto. Pode ficar em branco se não houver variação.">
                <input
                  value={variant.color}
                  onChange={(event) => updateVariant(variant.id, 'color', event.target.value)}
                  className="input mt-1"
                  placeholder="Rosé"
                />
              </MiniField>
              <MiniField label="Quantidade" help="Quantas peças deste tamanho e cor estão disponíveis.">
                <input
                  type="number"
                  min="0"
                  value={variant.initialStock}
                  onChange={(event) =>
                    updateVariant(variant.id, 'initialStock', Number(event.target.value))
                  }
                  className="input mt-1"
                />
              </MiniField>
              <button
                type="button"
                onClick={() => removeVariant(variant.id)}
                disabled={variants.length === 1}
                aria-label={`Remover variação ${index + 1}`}
                className="self-end rounded-md p-2 text-muted-foreground hover:bg-rosé-50 hover:text-rosé-700 disabled:opacity-40"
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      </section>

      <details className="rounded-xl border border-border bg-white p-5">
        <summary className="cursor-pointer select-none text-sm font-medium text-foreground">
          Detalhes opcionais — códigos, medidas e cuidados
        </summary>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <Field
            label="Endereço da página"
            help="É o final do link do produto. Se ficar em branco, criamos pelo nome."
            hint="Ex.: vestido-midi-em-linho"
          >
            <input
              name="slug"
              defaultValue={initialValues.slug}
              className="input"
              placeholder="gerado pelo nome"
            />
          </Field>
          <Field
            label="Código do produto"
            help="Código interno para controle. Se não tiver, deixe em branco e geramos um."
            hint="Ex.: VEST-001"
          >
            <input name="sku" defaultValue={initialValues.sku} className="input" placeholder="automático" />
          </Field>
          <Field
            label="Preço anterior"
            help="Preencha só se o produto estava realmente mais caro antes. Não use preço inventado."
            hint="Deixe em branco se não houver promoção real."
          >
            <input
              name="previousPrice"
              inputMode="decimal"
              defaultValue={initialValues.previousPrice}
              className="input"
              placeholder="0,00"
            />
          </Field>
          <Field label="Composição" help="Ex.: 70% viscose, 30% linho. Ajuda a cliente a entender o tecido.">
            <input
              name="composition"
              defaultValue={initialValues.composition}
              className="input"
              placeholder="Ex.: 70% viscose, 30% linho"
            />
          </Field>
          <Field label="Como cuidar" help="Ex.: lavar à mão, não usar secadora. Aparece na página do produto.">
            <input
              name="careInstructions"
              defaultValue={initialValues.careInstructions}
              className="input"
              placeholder="Ex.: Lavar à mão"
            />
          </Field>
          <Field label="Peso (gramas)" help="Ajuda a calcular o frete. Pode ficar em branco.">
            <input
              name="weightG"
              type="number"
              min="0"
              defaultValue={initialValues.weightG}
              className="input"
              placeholder="250"
            />
          </Field>
          <div className="md:col-span-2">
            <p className="text-xs text-muted-foreground">
              Medidas da embalagem para envio. Se não souber, deixe em branco.
            </p>
            <div className="mt-2 grid gap-4 sm:grid-cols-3">
              <Field label="Largura (cm)" help="Largura da embalagem, não da peça.">
                <input
                  name="widthCm"
                  type="number"
                  min="0"
                  defaultValue={initialValues.widthCm}
                  className="input"
                  placeholder="30"
                />
              </Field>
              <Field label="Altura (cm)" help="Altura da embalagem, não da peça.">
                <input
                  name="heightCm"
                  type="number"
                  min="0"
                  defaultValue={initialValues.heightCm}
                  className="input"
                  placeholder="5"
                />
              </Field>
              <Field label="Profundidade (cm)" help="Profundidade da embalagem, não da peça.">
                <input
                  name="depthCm"
                  type="number"
                  min="0"
                  defaultValue={initialValues.depthCm}
                  className="input"
                  placeholder="20"
                />
              </Field>
            </div>
          </div>
        </div>
      </details>

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

function HelpTip({ text }: { text: string }) {
  return (
    <span
      className="group/tip relative inline-flex align-middle"
      title={text}
      tabIndex={0}
      aria-label={text}
    >
      <Info className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
      <span
        role="tooltip"
        className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 w-56 -translate-x-1/2 rounded-md bg-foreground px-2.5 py-1.5 text-xs font-normal leading-snug text-background opacity-0 shadow-lg transition-opacity group-hover/tip:opacity-100 group-focus/tip:opacity-100"
      >
        {text}
      </span>
    </span>
  );
}

function Field({
  label,
  help,
  hint,
  required,
  children,
}: {
  label: string;
  help?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-foreground">
      <span className="inline-flex items-center gap-1.5">
        {label} {required && <span className="text-rosé-600">*</span>}
        {help && <HelpTip text={help} />}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs font-normal text-muted-foreground">{hint}</span>}
    </label>
  );
}

function MiniField({
  label,
  help,
  children,
}: {
  label: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="text-xs text-muted-foreground">
      <span className="inline-flex items-center gap-1">
        {label}
        {help && <HelpTip text={help} />}
      </span>
      {children}
    </label>
  );
}
