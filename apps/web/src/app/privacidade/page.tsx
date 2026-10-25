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
              nome, e-mail, CPF, telefone, endereço de entrega e informações de
              pagamento (processadas pelo provedor de pagamento, não por nós).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">2. Finalidades</h2>
            <p>
              Seus dados são usados para processar pedidos, calcular frete,
              entregar produtos, enviar confirmações, atendimento ao cliente e
              cumprir obrigações legais.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">3. Compartilhamento</h2>
            <p>
              Seus dados podem ser compartilhados com provedores de pagamento,
              serviços de entrega e plataformas de hospedagem, estritamente para
              execução do serviço. Não vendemos seus dados.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">4. Seus direitos (LGPD)</h2>
            <p>
              Você pode solicitar acesso, correção, exclusão ou portabilidade
              dos seus dados, além de revogar consentimentos, entrando em contato
              conosco.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-serif text-rosé-700 mb-2">5. Contato</h2>
            <p>
              Dúvidas sobre esta política: <b>contato@mariallves.com.br</b>.
            </p>
          </section>
        </div>

        <p className="mt-10 text-xs text-muted-foreground text-center">
          Última atualização: 23 de outubro de 2026.
        </p>
      </div>
    </main>
  );
}
