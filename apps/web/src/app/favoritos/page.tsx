import Link from 'next/link';
import { Heart } from 'lucide-react';

export default function FavoritosPage() {
  return (
    <main className="flex-1">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">Início</Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Meus favoritos</span>
        </nav>
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Lista de favoritos</h1>
        <div className="text-center py-20 text-muted-foreground">
          <Heart className="h-10 w-10 mx-auto mb-4 text-rosé-300" />
          <p className="font-medium text-foreground">Favoritos em breve</p>
          <p className="mt-2 text-sm">
            Estamos preparando esta funcionalidade. Enquanto isso, explore o
            catálogo e conheça as peças.
          </p>
          <Link href="/catalogo" className="mt-4 inline-block text-rosé-700 hover:underline font-medium">
            Ver catálogo →
          </Link>
        </div>
      </div>
    </main>
  );
}
