import Link from 'next/link';
import { Button } from '@/components/button';

export default function IndisponibilidadePage() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center py-20">
      <div className="text-center">
        <h1 className="text-3xl font-serif text-rosé-700 mb-4">Estamos passando por uma manutenção</h1>
        <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
          O site está temporariamente indisponível. Volte em instantes ou entre
          em contato conosco.
        </p>
        <Button asChild className="w-auto">
          <Link href="/contato">Fale conosco</Link>
        </Button>
      </div>
    </main>
  );
}
