import Link from 'next/link';
import { Button } from '@/components/button';
import { ChevronLeft, Mail, Phone, MapPin, CreditCard, Banknote, Truck, CheckCircle2, Bus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function CheckoutPage() {
  return (
    <main className="flex-1">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progresso */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-rosé-700" />
            <span>1. Dados</span>
          </div>
          <span className="text-rosé-200">/</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">2. Entrega</span>
          </div>
          <span className="text-rosé-200">/</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">3. Pagamento</span>
          </div>
          <span className="text-rosé-200">/</span>
          <div className="flex items-center gap-1">
            <span className="text-muted-foreground">4. Confirmação</span>
          </div>
        </div>

        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
          {/* Formulário */}
          <section className="lg:col-span-8 space-y-6">
            <div className="border border-border rounded-xl p-6 bg-white">
              <h2 className="text-lg font-serif text-rosé-700 mb-6">1. Seus dados</h2>
              <form className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">Nome completo</label>
                    <input
                      type="text"
                      className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground">E-mail</label>
                    <input
                      type="email"
                      className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">CPF</label>
                    <input
                      type="text"
                      placeholder="000.000.000-00"
                      className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                    />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Telefone</label>
                    <input
                      type="tel"
                      placeholder="(77) 9 9999-9999"
                      className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                    />
                </div>
              </form>
            </div>

            <div className="border border-border rounded-xl p-6 bg-white">
              <h2 className="text-lg font-serif text-rosé-700 mb-6">2. Entrega</h2>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">CEP</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="47800-000"
                      className="flex-1 border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                    />
                    <Button variant="outline" size="sm">Calcular</Button>
                  </div>
                </div>
                <div className="space-y-2 p-4 rounded-lg border border-rosé-100 bg-rosé-50">
                  <div className="flex items-start gap-2">
                    <Truck className="h-4 w-4 mt-0.5 text-rosé-700" />
                    <div>
                      <p className="text-sm font-medium">Motoboy — Barreiras/BA</p>
                      <p className="text-xs text-muted-foreground">Prazo: 1 dia útil · Frete: R$ 12,00</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 p-4 rounded-lg border border-input bg-white">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Retirada na loja</p>
                      <p className="text-xs text-muted-foreground">Grátis · Barreiras/BA</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-foreground">Endereço de entrega</label>
                  <input
                    type="text"
                    placeholder="Rua, número, bairro, cidade"
                    className="border border-input rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-rosé-700"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Resumo */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="border border-border rounded-xl p-6 bg-white sticky top-4">
              <h2 className="text-lg font-serif text-rosé-700 mb-4">Resumo do pedido</h2>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium">R$ 159,90</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Frete</span>
                  <span className="font-medium">R$ 12,00</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-muted-foreground">Total</span>
                  <span className="font-bold text-rosé-700">R$ 171,90</span>
                </div>
              </div>
              <div className="mt-6 space-y-3">
                <div className="p-3 rounded-lg border border-input bg-white">
                  <div className="flex items-start gap-2">
                    <Bus className="h-5 w-5 mt-0.5 text-rosé-700" />
                    <div>
                      <p className="text-sm font-medium">Pix</p>
                      <p className="text-xs text-muted-foreground">Pagamento instantâneo</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-input bg-white">
                  <div className="flex items-start gap-2">
                    <CreditCard className="h-5 w-5 mt-0.5 text-rosé-700" />
                    <div>
                      <p className="text-sm font-medium">Cartão de crédito</p>
                      <p className="text-xs text-muted-foreground">Até 6x sem juros</p>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded-lg border border-input bg-white">
                  <div className="flex items-start gap-2">
                    <Banknote className="h-5 w-5 mt-0.5 text-rosé-700" />
                    <div>
                      <p className="text-sm font-medium">Boleto bancário</p>
                      <p className="text-xs text-muted-foreground">Pagamento até vencimento</p>
                    </div>
                  </div>
                </div>
              </div>
              <Button className="w-full mt-6" asChild>
                <Link href="/checkout/sucesso">Confirmar pedido</Link>
              </Button>
            </div>

            <div className="text-xs text-muted-foreground leading-relaxed">
              Seus dados estão protegidos. Não armazenamos dados de cartão.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
