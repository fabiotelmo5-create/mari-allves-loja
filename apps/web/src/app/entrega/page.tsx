export default function EntregaPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Política de entrega</h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Regiões atendidas</h2>
            <p>
              Inicialmente atendemos <b>Barreiras, Bahia, e localidades
              próximas</b>. O CEP é validado no checkout antes da confirmação
              da compra.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Modalidades</h2>
            <ul className="list-disc list-inside text-sm space-y-2 mt-2">
              <li>Entrega por motoboy na região.</li>
              <li>Retirada na loja (quando disponível).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Prazo</h2>
            <p>
              O prazo total = preparação + transporte. Você confere o valor do
              frete e o prazo estimado antes de pagar.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Frete grátis</h2>
            <p>
              Condições de frete grátis são definidas pela administração e
              exibidas no carrinho/checkout quando aplicáveis.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
