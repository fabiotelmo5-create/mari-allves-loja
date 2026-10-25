export default function AcessibilidadePage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Página de acessibilidade</h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Nosso compromisso</h2>
            <p>
              Buscamos tornar o site da Mari Allves — Moda Modesta acessível ao
              maior número possível de pessoas, incluindo aquelas com deficiência.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Recursos</h2>
            <ul className="list-disc list-inside text-sm space-y-2 mt-2">
              <li>Contraste de cores adequado para leitura.</li>
              <li>Textos alternativos nas imagens dos produtos.</li>
              <li>Navegação por teclado em menus e formulários.</li>
              <li>Tipografia legível e espaçamento equilibrado.</li>
              <li>Site responsivo em celulares, tablets e computadores.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Contato</h2>
            <p>
              Se encontrar alguma barreira de acessibilidade, escreva para
              <b>contato@mariallves.com.br</b>.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
