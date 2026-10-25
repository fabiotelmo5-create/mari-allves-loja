import Link from 'next/link';

export default function SobrePage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-6">Sobre a Mari Allves</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          A Mari Allves — Moda Modesta nasceu do desejo de oferecer roupas e
          acessórios que aliem elegância, discrição e qualidade para mulheres
          que valorizam a moda modesta no dia a dia e em ocasiões especiais.
        </p>
        <p className="text-lg text-muted-foreground leading-relaxed mb-6">
          Cada peça é selecionada com cuidado, pensando no conforto, no caimento
          e na discrição que a proposta da marca pede. Blusas, saias, vestidos
          e acessórios para você se sentir confiante e feminina em qualquer
          momento.
        </p>
        <div className="mt-12 p-8 bg-rosé-50 rounded-xl border border-rosé-100">
          <h3 className="text-xl font-serif text-rosé-700 mb-4">Nosso compromisso</h3>
          <ul className="space-y-2 text-muted-foreground leading-relaxed">
            <li>✓ Qualidade nos tecidos e acabamentos</li>
            <li>✓ Preços justos e promoções verdadeiras</li>
            <li>✓ Atendimento próximo e humano</li>
            <li>✓ Entrega em Barreiras, Bahia e região</li>
            <li>✓ Privacidade e segurança dos seus dados</li>
          </ul>
        </div>
        <Link href="/contato" className="mt-8 inline-block text-rosé-700 hover:underline font-medium">
          Fale conosco →
        </Link>
      </div>
    </main>
  );
}
