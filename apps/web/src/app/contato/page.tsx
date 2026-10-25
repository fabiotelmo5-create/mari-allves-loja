import Link from 'next/link';
import { Button } from '@/components/button';
import { Mail, Phone, MapPin, Clock } from 'lucide-react';

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
                  <p className="text-muted-foreground">contato@mariallves.com.br</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 mt-0.5 text-rosé-700" />
                <div>
                  <p className="font-medium">Telefone/WhatsApp</p>
                  <p className="text-muted-foreground">(77) 9 9999-9999</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 mt-0.5 text-rosé-700" />
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-muted-foreground">Barreiras, Bahia — Brasil</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 mt-0.5 text-rosé-700" />
                <div>
                  <p className="font-medium">Horário de atendimento</p>
                  <p className="text-muted-foreground">Segunda a sexta, 9h às 18h</p>
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

          <div className="bg-white p-8 rounded-xl border border-border shadow-sm">
            <h3 className="text-sm font-semibold text-rosé-700 mb-6">Envie uma mensagem</h3>
            <form className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Nome</label>
                <input type="text" className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">E-mail</label>
                <input type="email" className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Assunto</label>
                <input type="text" className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">Mensagem</label>
                <textarea rows={5} className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700" required />
              </div>
              <Button type="submit" className="w-full">Enviar mensagem</Button>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}
