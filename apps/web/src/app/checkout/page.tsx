import Link from 'next/link';
import { getCurrentProfile } from '@/lib/auth';
import { CheckoutForm } from './checkout-form';

export const metadata = { title: 'Finalizar compra — Mari Allves' };
export const dynamic = 'force-dynamic';

export default async function CheckoutPage() {
  const profile = await getCurrentProfile();

  return (
    <main className="flex-1">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <nav className="mb-6 flex items-center gap-1 text-xs text-muted-foreground">
          <Link href="/" className="hover:text-rosé-700">
            Início
          </Link>
          <span className="text-rosé-300">/</span>
          <Link href="/carrinho" className="hover:text-rosé-700">
            Carrinho
          </Link>
          <span className="text-rosé-300">/</span>
          <span className="text-foreground">Checkout</span>
        </nav>

        <div className="mb-8">
          <h1 className="text-3xl font-serif text-rosé-700">Finalizar compra</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Confira seus dados, calcule o frete e conclua o pedido.
          </p>
        </div>

        <CheckoutForm
          profile={
            profile
              ? {
                  fullName: profile.fullName,
                  email: profile.email,
                  phone: profile.phone,
                }
              : null
          }
        />
      </div>
    </main>
  );
}
