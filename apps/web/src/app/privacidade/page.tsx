import Link from 'next/link';

export default function PrivacidadePage() {
  return (
    <main className="flex-1">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-serif text-rosé-700 mb-8">Política de privacidade</h1>
        <p className="text-muted-foreground mb-6 leading-relaxed">
          Esta política explica como a Mari Allves — Moda Modesta coleta, usa,
          armazena e protege seus dados pessoais, em conformidade com a Lei
          Geral de Proteção de Dados Pessoais (LGPD — Lei nº 13.709/2018).
        </p>

        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">1. Dados coletados</h2>
            <p>
              Coletamos somente os dados necessários para atender sua compra:
              nome, e-mail, telefone, endereço de entrega e itens do pedido.
              Não coletamos CPF nem dados de cartão de crédito nesta etapa.
            </p>
            <p className="mt-2">
              O carrinho é armazenado no seu próprio navegador (localStorage).
              A autenticação de clientes e administradores usa os cookies
              essenciais do Supabase.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">2. Finalidades</h2>
            <p>
              Seus dados são usados para processar pedidos, calcular frete,
              entregar produtos, enviar confirmações, prestar atendimento e
              cumprir obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">3. Compartilhamento</h2>
            <p>
              Seus dados podem ser compartilhados com a Supabase (banco de
              dados e autenticação), a Vercel (hospedagem), serviços de entrega
              e, quando o pagamento online for habilitado, com o provedor de
              pagamento. Não vendemos seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">4. Retenção</h2>
            <p>
              Os dados de pedidos são mantidos pelo prazo necessário ao
              cumprimento de obrigações legais, fiscais e de defesa em
              processos. Os dados de conta permanecem enquanto a conta existir
              ou até solicitação de exclusão, ressalvadas as obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">5. Seus direitos (LGPD)</h2>
            <p>
              Você pode solicitar acesso, correção, exclusão ou portabilidade
              dos seus dados, além de revogar consentimentos. As solicitações
              podem ser feitas pelos canais de atendimento publicados na
              página de <Link href="/contato" className="text-rosé-700 underline">Contato</Link>.
              Os dados do controlador (CNPJ e endereço) serão incluídos aqui
              assim que forem definidos.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">6. Segurança</h2>
            <p>
              O acesso ao banco de dados é restrito, as senhas são gerenciadas
              pelo Supabase Auth e o site usa HTTPS. Não armazenamos dados de
              cartão de crédito.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">7. Cookies</h2>
            <p>
              Usamos apenas cookies essenciais de autenticação. O carrinho fica
              no localStorage do navegador. Veja a{' '}
              <Link href="/cookies" className="text-rosé-700 underline">
                política de cookies
              </Link>{' '}
              para mais detalhes.
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
