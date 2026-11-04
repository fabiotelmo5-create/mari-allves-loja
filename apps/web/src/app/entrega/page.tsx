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
              <li>Entrega na região de Barreiras/BA, conforme a opção calculada no checkout.</li>
              <li>A retirada não está disponível no momento.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Prazo</h2>
            <p>
              O prazo estimado é exibido no checkout após o cálculo do frete.
              Ele pode variar conforme a região e a disponibilidade dos itens.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Frete grátis</h2>
            <p>
              No momento, não há promoção de frete grátis. Se uma condição for
              configurada, ela aparecerá no checkout.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
