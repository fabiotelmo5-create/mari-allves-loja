import Link from 'next/link';

export default function TrocasPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Política de trocas e devoluções</h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Direito de arrependimento</h2>
            <p>
              Você pode desistir da compra em até <b>7 dias corridos</b> após o
              recebimento do produto, sem necessidade de justificativa, conforme
              o Código de Defesa do Consumidor.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Condições para troca/devolução</h2>
            <ul className="list-disc list-inside text-sm space-y-2 mt-2">
              <li>A peça deve estar sem uso, sem lavagem e com a etiqueta intacta.</li>
              <li>Devolva na embalagem original, quando possível.</li>
              <li>O frete da primeira troca fica por conta da loja (para Barreiras/BA e região).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Como solicitar</h2>
            <p>
              Entre em contato pelo e-mail <b>contato@mariallves.com.br</b> ou
              WhatsApp (77) 9 9999-9999 informando o número do pedido e o motivo
              da troca.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Reembolso</h2>
            <p>
              O reembolso será processado pela mesma forma de pagamento utilizada
              na compra, após o recebimento e análise da peça devolvida.
            </p>
          </section>
        </div>
        <Link href="/contato" className="mt-8 inline-block text-rosé-700 hover:underline font-medium">
          Solicitar troca →
        </Link>
      </div>
    </main>
  );
}
