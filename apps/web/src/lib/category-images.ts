export const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  saias: '/categorias/saias.svg',
  blusas: '/categorias/blusas.svg',
  vestidos: '/categorias/vestidos.svg',
  acessorios: '/categorias/acessorios.svg',
};

export function getCategoryImage(imageUrl: string | null | undefined, slug: string) {
  return imageUrl || CATEGORY_PLACEHOLDERS[slug] || '/categorias/categoria.svg';
}
