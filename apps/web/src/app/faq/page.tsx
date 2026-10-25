import Link from 'next/link';

const FAQS = [
  {
    q: 'Vocês entregam para todo o Brasil?',
    a: 'Inicialmente atendemos Barreiras, Bahia, e localidades próximas confirmadas pela administração. Em breve expandiremos para outras cidades e, posteriormente, para todo o Brasil.',
  },
  {
    q: 'Qual o prazo de entrega?',
    a: 'O prazo é calculado no checkout com base no seu CEP, considerando o tempo de preparação e transporte. Você confere o valor do frete e o prazo antes de finalizar a compra.',
  },
  {
    q: 'Posso trocar ou devolver um produto?',
    a: 'Sim. Dentro do prazo legal de 7 dias após o recebimento, desde que a peça esteja sem uso e com a etiqueta. Consulte nossa Política de Trocas e Devoluções.',
  },
  {
    q: 'Como faço para calcular o frete?',
    a: 'Na página do produto, informe seu CEP no campo "Calcular frete". No checkout, você confere as modalidades de entrega disponíveis para sua região.',
  },
  {
    q: 'Vocês têm loja física?',
    a: 'Por enquanto somos uma loja virtual focada em Barreiras/BA e região. A retirada pode ser oferecida conforme configuração da administração.',
  },
  {
    q: 'As fotos dos produtos são reais?',
    a: 'Sim. Todas as imagens representam fielmente as peças vendidas. Não usamos imagens ilustrativas como se fossem fotos do produto sem deixar isso claro.',
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
