export interface ProductVariant {
  id: string;
  size: string;
  color: string;
  sku: string;
  priceCents?: number;
  active: boolean;
  stockQuantity: number;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  categorySlug: string;
  priceCents: number;
  previousPriceCents?: number;
  composition?: string;
  careInstructions?: string;
  weightG?: number;
  widthCm?: number;
  heightCm?: number;
  depthCm?: number;
  variants: ProductVariant[];
  images: Array<{ url: string; alt: string; position: number }>;
  measurement?: {
    bustCm?: number;
    waistCm?: number;
    hipsCm?: number;
    lengthCm?: number;
    sleeveCm?: number;
  };
  status: 'PUBLICADO' | 'RASCUNHO' | 'INATIVO' | 'ARQUIVADO';
  createdAt: string;
}

const baseImages = (slug: string, count = 3) =>
  Array.from({ length: count }, (_, i) => ({
    url: `https://placehold.co/800x1000/png?text=${encodeURIComponent(slug)}&bg=C98798&txt=FFFFFF&font=playfair-display`,
    alt: `${slug} - vista ${i + 1}`,
    position: i + 1,
  }));

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    sku: 'SA-001',
    name: 'Saia Midi Plissada Rosé',
    slug: 'saia-midi-plissada-rose',
    description:
      'Saia midi em tecido plissado leve, caimento elegante e comprimento abaixo do joelho. Ideal para ocasiões especiais e dia a dia com modéstia.',
    category: 'Saias',
    categorySlug: 'saias',
    priceCents: 15990,
    previousPriceCents: 19990,
    composition: '100% poliéster',
    careInstructions: 'Lavar à mão. Não alvejar. Secar à sombra.',
    weightG: 250,
    variants: [
      { id: 'v1', size: 'P', color: 'Rosé', sku: 'SA-001-P-R', priceCents: 15990, active: true, stockQuantity: 8 },
      { id: 'v2', size: 'M', color: 'Rosé', sku: 'SA-001-M-R', priceCents: 15990, active: true, stockQuantity: 12 },
      { id: 'v3', size: 'G', color: 'Rosé', sku: 'SA-001-G-R', priceCents: 15990, active: true, stockQuantity: 5 },
      { id: 'v4', size: 'P', color: 'Azul Marinho', sku: 'SA-001-P-A', priceCents: 15990, active: true, stockQuantity: 6 },
      { id: 'v5', size: 'M', color: 'Azul Marinho', sku: 'SA-001-M-A', priceCents: 15990, active: true, stockQuantity: 0 },
      { id: 'v6', size: 'G', color: 'Azul Marinho', sku: 'SA-001-G-A', priceCents: 15990, active: true, stockQuantity: 4 },
    ],
    images: baseImages('saia-midi-plissada-rose'),
    measurement: { waistCm: 70, hipsCm: 96, lengthCm: 82 },
    status: 'PUBLICADO',
    createdAt: '2026-10-20T10:00:00Z',
  },
  {
    id: 'p2',
    sku: 'BL-002',
    name: 'Blusa Manga Longa Gola Alta',
    slug: 'blusa-manga-longa-gola-alta',
    description:
      'Blusa de manga longa com gola alta, tecido macio e modelagem confortável. Peça-chave do guarda-roupa modesto.',
    category: 'Blusas',
    categorySlug: 'blusas',
    priceCents: 12990,
    composition: '95% viscose, 5% elastano',
    careInstructions: 'Lavar à máquina em ciclo delicado.',
    weightG: 180,
    variants: [
      { id: 'v7', size: 'P', color: 'Branco', sku: 'BL-002-P-B', priceCents: 12990, active: true, stockQuantity: 10 },
      { id: 'v8', size: 'M', color: 'Branco', sku: 'BL-002-M-B', priceCents: 12990, active: true, stockQuantity: 15 },
      { id: 'v9', size: 'G', color: 'Branco', sku: 'BL-002-G-B', priceCents: 12990, active: true, stockQuantity: 3 },
      { id: 'v10', size: 'P', color: 'Preto', sku: 'BL-002-P-P', priceCents: 12990, active: true, stockQuantity: 7 },
      { id: 'v11', size: 'M', color: 'Preto', sku: 'BL-002-M-P', priceCents: 12990, active: true, stockQuantity: 9 },
      { id: 'v12', size: 'G', color: 'Preto', sku: 'BL-002-G-P', priceCents: 12990, active: true, stockQuantity: 0 },
    ],
    images: baseImages('blusa-manga-longa-gola-alta'),
    measurement: { bustCm: 86, lengthCm: 62, sleeveCm: 60 },
    status: 'PUBLICADO',
    createdAt: '2026-10-21T10:00:00Z',
  },
  {
    id: 'p3',
    sku: 'VS-003',
    name: 'Vestido Longo Floral Modesto',
    slug: 'vestido-longo-floral-modesto',
    description:
      'Vestido longo com estampa floral delicada, mangas três quartos e cintura marcada. Elegância para eventos e encontros.',
    category: 'Vestidos',
    categorySlug: 'vestidos',
    priceCents: 24990,
    previousPriceCents: 29990,
    composition: '100% viscose',
    careInstructions: 'Lavar à mão. Passar em temperatura baixa.',
    weightG: 320,
    variants: [
      { id: 'v13', size: 'P', color: 'Floral Rosa', sku: 'VS-003-P-FR', priceCents: 24990, active: true, stockQuantity: 4 },
      { id: 'v14', size: 'M', color: 'Floral Rosa', sku: 'VS-003-M-FR', priceCents: 24990, active: true, stockQuantity: 6 },
      { id: 'v15', size: 'G', color: 'Floral Rosa', sku: 'VS-003-G-FR', priceCents: 24990, active: true, stockQuantity: 2 },
      { id: 'v16', size: 'P', color: 'Floral Azul', sku: 'VS-003-P-FA', priceCents: 24990, active: true, stockQuantity: 5 },
      { id: 'v17', size: 'M', color: 'Floral Azul', sku: 'VS-003-M-FA', priceCents: 24990, active: true, stockQuantity: 0 },
      { id: 'v18', size: 'G', color: 'Floral Azul', sku: 'VS-003-G-FA', priceCents: 24990, active: true, stockQuantity: 3 },
    ],
    images: baseImages('vestido-longo-floral-modesto'),
    measurement: { bustCm: 90, waistCm: 74, hipsCm: 100, lengthCm: 135 },
    status: 'PUBLICADO',
    createdAt: '2026-10-22T10:00:00Z',
  },
  {
    id: 'p4',
    sku: 'AC-004',
    name: 'Lenço de Seda Estampado',
    slug: 'lenco-de-seda-estampado',
    description:
      'Lenço de seda leve e macio, ideal para compor looks com modéstia e elegância. Estampa exclusiva Mari Allves.',
    category: 'Acessórios',
    categorySlug: 'acessorios',
    priceCents: 6990,
    composition: '100% seda',
    careInstructions: 'Lavar à mão separadamente.',
    weightG: 40,
    variants: [
      { id: 'v19', size: 'Único', color: 'Rosé', sku: 'AC-004-U-R', priceCents: 6990, active: true, stockQuantity: 20 },
      { id: 'v20', size: 'Único', color: 'Verde', sku: 'AC-004-U-V', priceCents: 6990, active: true, stockQuantity: 15 },
      { id: 'v21', size: 'Único', color: 'Azul', sku: 'AC-004-U-A', priceCents: 6990, active: true, stockQuantity: 10 },
    ],
    images: baseImages('lenco-de-seda-estampado'),
    status: 'PUBLICADO',
    createdAt: '2026-10-18T10:00:00Z',
  },
  {
    id: 'p5',
    sku: 'SA-005',
    name: 'Saia Godê Jeans Modesta',
    slug: 'saia-gode-jeans-modesta',
    description:
      'Saia godê em jeans com comprimento midi, abertura lateral discreta e modelo que não marca o corpo.',
    category: 'Saias',
    categorySlug: 'saias',
    priceCents: 18990,
    composition: '98% algodão, 2% elastano',
    careInstructions: 'Lavar do lado avesso.',
    weightG: 450,
    variants: [
      { id: 'v22', size: 'P', color: 'Azul Jeans', sku: 'SA-005-P-J', priceCents: 18990, active: true, stockQuantity: 0 },
      { id: 'v23', size: 'M', color: 'Azul Jeans', sku: 'SA-005-M-J', priceCents: 18990, active: true, stockQuantity: 7 },
      { id: 'v24', size: 'G', color: 'Azul Jeans', sku: 'SA-005-G-J', priceCents: 18990, active: true, stockQuantity: 9 },
    ],
    images: baseImages('saia-gode-jeans-modesta'),
    measurement: { waistCm: 72, hipsCm: 98, lengthCm: 80 },
    status: 'PUBLICADO',
    createdAt: '2026-10-15T10:00:00Z',
  },
  {
    id: 'p6',
    sku: 'BL-006',
    name: 'Blusa Cremê Manga Curta',
    slug: 'blusa-creme-manga-curta',
    description:
      'Blusa em tecido cremê, manga curta, decote arredondado e modelagem solta. Conforto e discrição.',
    category: 'Blusas',
    categorySlug: 'blusas',
    priceCents: 8990,
    previousPriceCents: 11990,
    composition: 'Viscose',
    careInstructions: 'Lavar à máquina em ciclo suave.',
    weightG: 160,
    variants: [
      { id: 'v25', size: 'P', color: 'Rosé', sku: 'BL-006-P-R', priceCents: 8990, active: true, stockQuantity: 14 },
      { id: 'v26', size: 'M', color: 'Rosé', sku: 'BL-006-M-R', priceCents: 8990, active: true, stockQuantity: 11 },
      { id: 'v27', size: 'G', color: 'Rosé', sku: 'BL-006-G-R', priceCents: 8990, active: true, stockQuantity: 0 },
      { id: 'v28', size: 'P', color: 'Nude', sku: 'BL-006-P-N', priceCents: 8990, active: true, stockQuantity: 8 },
      { id: 'v29', size: 'M', color: 'Nude', sku: 'BL-006-M-N', priceCents: 8990, active: true, stockQuantity: 13 },
      { id: 'v30', size: 'G', color: 'Nude', sku: 'BL-006-G-N', priceCents: 8990, active: true, stockQuantity: 6 },
    ],
    images: baseImages('blusa-creme-manga-curta'),
    measurement: { bustCm: 92, lengthCm: 58 },
    status: 'PUBLICADO',
    createdAt: '2026-10-10T10:00:00Z',
  },
];

export const CATEGORIES = [
  { name: 'Saias', slug: 'saias' },
  { name: 'Blusas', slug: 'blusas' },
  { name: 'Vestidos', slug: 'vestidos' },
  { name: 'Acessórios', slug: 'acessorios' },
];

export function getProductBySlug(slug: string) {
  return MOCK_PRODUCTS.find((p) => p.slug === slug);
}

export function getProductsByCategory(categorySlug: string) {
  return MOCK_PRODUCTS.filter((p) => p.categorySlug === categorySlug && p.status === 'PUBLICADO');
}

export function getFeaturedProducts() {
  return MOCK_PRODUCTS.filter((p) => p.status === 'PUBLICADO').slice(0, 4);
}

export function getNewArrivals() {
  return [...MOCK_PRODUCTS]
    .filter((p) => p.status === 'PUBLICADO')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4);
}

export function getPromotions() {
  return MOCK_PRODUCTS.filter(
    (p) => p.status === 'PUBLICADO' && p.previousPriceCents && p.previousPriceCents > p.priceCents
  );
}

export function getBestSellers() {
  // Baseado em dados mockados (substituir por dados reais depois)
  return MOCK_PRODUCTS.filter((p) => p.status === 'PUBLICADO').slice(0, 4);
}
