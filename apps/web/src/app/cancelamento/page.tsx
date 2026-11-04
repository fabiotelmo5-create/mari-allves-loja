import Link from 'next/link';

export default function CancelamentoPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Política de cancelamento e reembolso</h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Cancelamento antes do pagamento</h2>
            <p>
              Para cancelar um pedido aguardando pagamento, entre em contato
              pelos canais de atendimento informados na página de{' '}
              <Link href="/contato" className="text-rosé-700 underline">Contato</Link>.
              O pedido será cancelado e os itens voltam ao estoque.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Reembolso</h2>
            <p>
              Se o pagamento já foi confirmado, o reembolso será combinado com
              a loja pela mesma forma de pagamento utilizada, após análise.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Direito de arrependimento</h2>
            <p>
              O prazo de 7 dias corridos após o recebimento, previsto no CDC,
              continua válido independentemente desta política. Consulte a
              página de Trocas e Devoluções.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
