import Link from 'next/link';
import { Mail, Phone, MapPin, Clock, Package } from 'lucide-react';

export default function ContatoPage() {
  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="lg:grid lg:grid-cols-2 lg:gap-12">
          <div>
            <h1 className="text-3xl font-serif text-rosé-700 mb-6">Fale conosco</h1>
            <p className="text-muted-foreground mb-8 leading-relaxed">
              Tem dúvidas sobre tamanhos, produtos, entrega ou qualquer outra
              coisa? Estamos aqui para ajudar.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 mt-0.5 text-rosé-700" />
                <div>
                  <p className="font-medium">E-mail</p>
                  <p className="text-muted-foreground">A definir</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-rosé-700" />
                <div>
                  <p className="font-medium">Telefone/WhatsApp</p>
                  <p className="text-muted-foreground">A definir</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-rosé-700" />
                <div>
                  <p className="font-medium">Localização</p>
                  <p className="text-muted-foreground">Barreiras, Bahia — Brasil</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Endereço completo: a definir.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 text-rosé-700" />
                <div>
                  <p className="font-medium">Horário de atendimento</p>
                  <p className="text-muted-foreground">A definir</p>
                </div>
              </div>
            </div>

            <div className="mt-10 p-6 rounded-xl border border-border bg-white">
              <h3 className="text-sm font-semibold text-rosé-700 mb-4">Perguntas frequentes</h3>
              <div className="space-y-4">
                <details className="border-b border-border pb-2 last:border-0">
                  <summary className="cursor-pointer text-sm font-medium text-rosé-700">
                    Vocês entregam para todo o Brasil?
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2">
                    Inicialmente atendemos Barreiras, Bahia, e localidades
                    próximas. Em breve expandiremos para outras regiões.
                  </p>
                </details>
                <details className="border-b border-border pb-2 last:border-0">
                  <summary className="cursor-pointer text-sm font-medium text-rosé-700">
                    Qual o prazo de entrega?
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2">
                    O prazo é calculado no checkout com base no seu CEP.
                  </p>
                </details>
                <details className="border-b border-border pb-2 last:border-0">
                  <summary className="cursor-pointer text-sm font-medium text-rosé-700">
                    Posso trocar um produto?
                  </summary>
                  <p className="text-sm text-muted-foreground mt-2">
                    Sim. Dentro do prazo legal de 7 dias após o recebimento,
                    desde que a peça esteja sem uso e com etiqueta.
                  </p>
                </details>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4 lg:mt-0">
            <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
              <Package className="h-6 w-6 text-rosé-700 mb-4" />
              <h3 className="text-sm font-semibold text-rosé-700 mb-3">
                Já fez um pedido?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Acompanhe o status, o pagamento e o rastreio na página do seu
                pedido.
              </p>
              <Link
                href="/meus-pedidos"
                className="mt-4 inline-block text-sm font-medium text-rosé-700 hover:underline"
              >
                Ver meus pedidos →
              </Link>
            </div>

            <div className="bg-rosé-50/60 p-6 rounded-xl border border-rosé-100">
              <h3 className="text-sm font-semibold text-rosé-700 mb-2">
                Canais oficiais em configuração
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                O e-mail, o WhatsApp e o endereço completo da loja serão
                publicados aqui assim que forem definidos. Nenhum dado de
                contato provisório é exibido para não induzir a erro.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
