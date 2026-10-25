import Link from 'next/link';
import { Button } from '@/components/button';

export default function NotFound() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-6xl font-serif text-rosé-700 mb-2">404</h1>
        <h2 className="text-2xl font-serif text-rosé-400 mb-6">Página não encontrada</h2>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          A página que você procura não existe ou saiu do ar. Que tal explorar
          nossa loja?
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="w-auto">
            <Link href="/">Ir para a loja</Link>
          </Button>
          <Button variant="outline" asChild className="w-auto">
            <Link href="/catalogo">Ver catálogo</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
