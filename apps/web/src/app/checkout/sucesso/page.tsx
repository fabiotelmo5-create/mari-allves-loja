import Link from 'next/link';
import { Button } from '@/components/button';
import { CheckCircle2, Mail, Truck, CreditCard } from 'lucide-react';

export default function SucessoPage() {
  return (
    <main className="flex-1">
      <div className="max-w-2xl mx-auto px-4 py-12 text-center">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-rosé-100 rounded-full flex items-center justify-center">
            <CheckCircle2 className="h-8 w-8 text-rosé-700" />
          </div>
        </div>
        <h1 className="text-3xl font-serif text-rosé-700 mb-4">Pedido confirmado!</h1>
        <p className="text-lg text-muted-foreground mb-8">
          Obrigado pela sua compra. Seu pedido <strong>#MA-20261023-0001</strong> foi recebido com sucesso.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="p-4 rounded-lg border border-border bg-white">
            <Mail className="h-5 w-5 text-rosé-400 mb-2" />
            <p className="text-sm text-muted-foreground">Confirmação por e-mail</p>
            <p className="text-xs font-medium">envio@mariallves.com.br</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-white">
            <CreditCard className="h-5 w-5 text-rosé-400 mb-2" />
            <p className="text-sm text-muted-foreground">Pagamento aprovado</p>
            <p className="text-xs font-medium">Pix concluído</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-white">
            <Truck className="h-5 w-5 text-rosé-400 mb-2" />
            <p className="text-sm text-muted-foreground">Prazo de entrega</p>
            <p className="text-xs font-medium">1 dia útil</p>
          </div>
        </div>

        <div className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/">Voltar para a loja</Link>
          </Button>
          <Button variant="outline" asChild className="w-full">
            <Link href="/meus-pedidos">Acompanhar pedido</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}
