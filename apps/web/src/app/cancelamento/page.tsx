export default function CancelamentoPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Política de cancelamento e reembolso</h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Cancelamento antes do pagamento</h2>
            <p>
              Pedidos aguardando pagamento podem ser cancelados a qualquer
              momento em "Meus pedidos" ou entrando em contato conosco.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Reembolso</h2>
            <p>
              Se o pagamento já foi confirmado, o reembolso será processado
              pela mesma forma de pagamento, após análise e conforme as regras
              do provedor de pagamento.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
