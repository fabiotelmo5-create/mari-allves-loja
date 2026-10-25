export default function CookiesPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Política de cookies</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Usamos cookies e tecnologias semelhantes para melhorar sua experiência
          no site, lembrar suas preferências e analisar o tráfego.
        </p>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Tipos de cookies</h2>
            <ul className="list-disc list-inside text-sm space-y-2 mt-2">
              <li><b>Essenciais:</b> necessários para o funcionamento do site (carrinho, login, checkout).</li>
              <li><b>Analíticos:</b> nos ajudam a entender como o site é usado.</li>
              <li><b>Preferências:</b> lembram idioma, tema e outros ajustes.</li>
            </ul>
          </section>
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Seu controle</h2>
            <p>
              Você pode aceitar ou recusar cookies não essenciais através do
              banner de consentimento exibido ao acessar o site.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
