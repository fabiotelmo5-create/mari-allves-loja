import Link from 'next/link';

export default function CookiesPage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Política de cookies</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Usamos apenas cookies essenciais para autenticação e segurança. O
          carrinho fica no armazenamento local do seu navegador.
        </p>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Cookies essenciais</h2>
            <p>
              Os cookies do Supabase Auth mantêm a sessão de clientes e
              administradores. Sem eles, o login e as áreas restritas não
              funcionam. Esses cookies não são usados para publicidade.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Armazenamento local</h2>
            <p>
              O carrinho é salvo no localStorage do navegador com a chave{' '}
              <code>ma_cart</code>. Ele não é enviado automaticamente para
              terceiros e pode ser apagado nas configurações do navegador.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">O que não usamos</h2>
            <p>
              No momento, não usamos cookies analíticos, de publicidade ou de
              preferências. Por isso, não exibimos banner de consentimento de
              cookies não essenciais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">Seu controle</h2>
            <p>
              Você pode limpar cookies e o localStorage nas configurações do
              navegador. Isso encerra a sessão e esvazia o carrinho. Para
              dúvidas, acesse a página de{' '}
              <Link href="/contato" className="text-rosé-700 underline">Contato</Link>.
            </p>
          </section>
        </div>
        <p className="mt-10 text-xs text-muted-foreground text-center">
          Última atualização: 3 de novembro de 2026.
        </p>
      </div>
    </main>
  );
}
