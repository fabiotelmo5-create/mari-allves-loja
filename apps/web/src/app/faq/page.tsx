import Link from 'next/link';

const FAQS = [
  {
    q: 'Vocês entregam para todo o Brasil?',
    a: 'Inicialmente atendemos Barreiras, Bahia, e localidades próximas confirmadas pela administração. Em breve expandiremos para outras cidades e, posteriormente, para todo o Brasil.',
  },
  {
    q: 'Qual o prazo de entrega?',
    a: 'O prazo estimado é exibido no checkout após o cálculo do frete. Ele pode variar conforme a região e a disponibilidade dos itens.',
  },
  {
    q: 'Posso trocar ou devolver um produto?',
    a: 'Sim. Dentro do prazo legal de 7 dias após o recebimento, desde que a peça esteja sem uso e com a etiqueta. Consulte nossa Política de Trocas e Devoluções.',
  },
  {
    q: 'Como faço para calcular o frete?',
    a: 'No checkout, informe seu CEP para calcular o frete e o prazo. O valor é confirmado antes de finalizar a compra.',
  },
  {
    q: 'Vocês têm loja física?',
    a: 'Por enquanto somos uma loja virtual focada em Barreiras/BA e região. A retirada não está disponível no checkout; a entrega é combinada com a loja.',
  },
  {
    q: 'As fotos dos produtos são reais?',
    a: 'As fotos são cadastradas pela loja a partir das peças reais. Quando um produto ainda não tem foto real, exibimos uma imagem provisória identificada, sem simular a peça.',
  },
];

export default function FaqPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Perguntas frequentes</h1>
        <div className="space-y-4">
          {FAQS.map((item, i) => (
            <details key={i} className="border-b border-border pb-4 last:border-0">
              <summary className="cursor-pointer text-sm font-medium text-rosé-700 flex items-center justify-between">
                {item.q}
                <span>▾</span>
              </summary>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed">{item.a}</p>
            </details>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/contato" className="text-rosé-700 hover:underline font-medium">
            Ainda tem dúvidas? Fale conosco →
          </Link>
        </div>
      </div>
    </main>
  );
}
