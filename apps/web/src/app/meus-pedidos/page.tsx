import Link from 'next/link';

export default function MeusPedidosPage() {
  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <nav className="flex items-center gap-1 text-xs text-muted-foreground mb-6">
          <Link href="/" className="hover:text-rosé-700">Início</Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Meus pedidos</span>
        </nav>
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Meus pedidos</h1>
        <div className="text-center py-20 text-muted-foreground">
          <p>Você ainda não tem pedidos cadastrados.</p>
          <Link href="/" className="mt-4 inline-block text-rosé-700 hover:underline font-medium">
            Começar a comprar →
          </Link>
        </div>
      </div>
    </main>
  );
}
