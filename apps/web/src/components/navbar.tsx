'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Menu,
  Package,
  Search,
  ShoppingBag,
  Truck,
  User,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

const CATEGORY_LINKS = [
  { label: 'Início', href: '/' },
  { label: 'Saias', href: '/categoria/saias' },
  { label: 'Blusas', href: '/categoria/blusas' },
  { label: 'Vestidos', href: '/categoria/vestidos' },
  { label: 'Acessórios', href: '/categoria/acessorios' },
  { label: 'Novidades', href: '/novidades' },
  { label: 'Promoções', href: '/promocoes' },
];

const INSTITUTIONAL_LINKS = [
  { label: 'Sobre a Mari Allves', href: '/sobre' },
  { label: 'Contato', href: '/contato' },
  { label: 'Perguntas frequentes', href: '/faq' },
  { label: 'Guia de tamanhos', href: '/guias-tamanhos' },
];

function SearchForm({
  className,
  inputClassName,
  placeholder = 'Buscar produtos...',
}: {
  className?: string;
  inputClassName?: string;
  placeholder?: string;
}) {
  return (
    <form action="/busca" method="get" className={cn('items-center', className)}>
      <div className="relative w-full">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="search"
          name="q"
          aria-label="Buscar produtos"
          placeholder={placeholder}
          className={cn(
            'h-9 w-full rounded-full border border-input bg-background pl-9 pr-4 text-sm outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-rosé-300 focus:ring-2 focus:ring-rosé-200',
            inputClassName
          )}
        />
      </div>
    </form>
  );
}

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [infoHidden, setInfoHidden] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const pathname = usePathname();
  const lastScrollY = useRef(0);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Revalida a cada navegação: o login/logout acontece em server action,
  // então o layout não remonta sozinho.
  useEffect(() => {
    const supabase = createClient();
    let active = true;

    supabase.auth.getSession().then(({ data }) => {
      if (active) setIsLoggedIn(Boolean(data.session?.user));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(Boolean(session?.user));
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [pathname]);

  // Quantidade de peças no carrinho (localStorage).
  useEffect(() => {
    function updateCartCount() {
      try {
        const raw = window.localStorage.getItem('ma_cart');
        const items = raw ? (JSON.parse(raw) as Array<{ quantity?: number }>) : [];
        const total = Array.isArray(items)
          ? items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
          : 0;
        setCartCount(total);
      } catch {
        setCartCount(0);
      }
    }

    updateCartCount();
    window.addEventListener('ma_cart_updated', updateCartCount);
    window.addEventListener('storage', updateCartCount);
    return () => {
      window.removeEventListener('ma_cart_updated', updateCartCount);
      window.removeEventListener('storage', updateCartCount);
    };
  }, [pathname]);

  // A linha de informações some ao descer e volta ao subir.
  useEffect(() => {
    lastScrollY.current = window.scrollY;

    function onScroll() {
      const currentY = window.scrollY;
      if (currentY < 64) {
        setInfoHidden(false);
      } else if (currentY > lastScrollY.current + 6) {
        setInfoHidden(true);
      } else if (currentY < lastScrollY.current - 6) {
        setInfoHidden(false);
      }
      lastScrollY.current = currentY;
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setMenuOpen(false);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const navLinkClass = (href: string) => {
    const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
    return cn(
      'origin-center whitespace-nowrap px-3 py-2 transition-[color,transform] duration-200 hover:scale-105 hover:text-rosé-700',
      active
        ? 'border-b-2 border-rosé-700 text-rosé-700'
        : 'text-foreground'
    );
  };

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div
          className={cn(
            'overflow-hidden bg-rosé-700 text-white transition-[height] duration-300',
            infoHidden ? 'h-0' : 'h-9'
          )}
        >
          <div className="mx-auto flex h-9 max-w-7xl items-center justify-center gap-2 px-4 text-[11px] font-medium tracking-wide sm:text-xs">
            <Truck className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span className="truncate">Entrega em Barreiras e região</span>
            <span className="hidden text-white/60 sm:inline">•</span>
            <span className="hidden sm:inline">Frete calculado pelo CEP no checkout</span>
            <span className="hidden text-white/60 md:inline">•</span>
            <span className="hidden md:inline">Pagamento a combinar</span>
          </div>
        </div>

        <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-3 sm:gap-3">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            aria-label="Abrir menu"
            aria-expanded={menuOpen}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-rosé-700 transition-colors hover:bg-rosé-50"
          >
            <Menu className="h-5 w-5" />
          </button>

          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="Mari Allves — início">
            <Image
              src="/logo-mari-allves.svg"
              alt=""
              width={40}
              height={40}
              className="h-10 w-10"
              priority
              unoptimized
            />
            <span className="flex flex-col leading-none">
              <span className="flex items-baseline gap-1 font-serif text-lg font-bold tracking-tight">
                <span className="text-rosé-700">Mari</span>
                <span className="text-rosé-400">Allves</span>
              </span>
              <span className="mt-1 hidden text-[10px] uppercase tracking-[0.18em] text-muted-foreground sm:block">
                Moda Modesta
              </span>
            </span>
          </Link>

          <SearchForm className="ml-2 hidden min-w-0 flex-1 md:flex" inputClassName="h-10" />

          <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
            <Link
              href={isLoggedIn ? '/conta' : '/conta/login'}
              className="hidden items-center gap-1.5 rounded-full px-2.5 py-2 text-sm font-medium text-foreground transition-colors hover:bg-rosé-50 hover:text-rosé-700 sm:inline-flex"
            >
              <User className="h-4 w-4" />
              <span className="hidden lg:inline">{isLoggedIn ? 'Minha conta' : 'Entrar'}</span>
            </Link>

            <Link
              href="/carrinho"
              className="relative inline-flex h-10 items-center gap-2 rounded-full bg-rosé-700 px-3 text-sm font-semibold text-white shadow-[0_6px_16px_rgba(168,95,112,0.28)] transition-all hover:-translate-y-0.5 hover:bg-rosé-600 hover:shadow-[0_8px_20px_rgba(168,95,112,0.34)] sm:px-4"
            >
              <ShoppingBag className="h-4 w-4" />
              <span className="hidden sm:inline">Carrinho</span>
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rosé-50 px-1 text-[10px] font-bold text-rosé-700 ring-2 ring-rosé-700">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        <div className="px-4 pb-3 md:hidden">
          <SearchForm className="flex w-full" inputClassName="h-10" placeholder="Buscar produtos..." />
        </div>

        <nav className="mx-auto hidden max-w-7xl items-center gap-1 overflow-x-auto px-4 text-sm font-medium md:flex">
          {CATEGORY_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className={navLinkClass(link.href)}>
              {link.label}
            </Link>
          ))}
        </nav>
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Fechar menu"
            onClick={closeMenu}
            className="absolute inset-0 cursor-default bg-black/40 backdrop-blur-sm"
          />

          <aside
            role="dialog"
            aria-modal="true"
            aria-label="Menu da loja"
            className="absolute left-0 top-0 flex h-full w-[min(88vw,360px)] flex-col overflow-y-auto bg-background p-5 shadow-2xl"
          >
            <div className="flex items-center justify-between gap-3">
              <Link href="/" onClick={closeMenu} className="flex items-center gap-2">
                <Image
                  src="/logo-mari-allves.svg"
                  alt=""
                  width={40}
                  height={40}
                  className="h-10 w-10"
                  unoptimized
                />
                <span className="flex flex-col leading-none">
                  <span className="flex items-baseline gap-1 font-serif text-lg font-bold tracking-tight">
                    <span className="text-rosé-700">Mari</span>
                    <span className="text-rosé-400">Allves</span>
                  </span>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Moda Modesta
                  </span>
                </span>
              </Link>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeMenu}
                aria-label="Fechar menu"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-colors hover:bg-rosé-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SearchForm className="mt-5 flex w-full" inputClassName="h-10" />

            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Navegação
              </p>
              <nav className="mt-2 space-y-1">
                {CATEGORY_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-rosé-50 hover:text-rosé-700"
                  >
                    {link.label}
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
              </nav>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Sua conta
              </p>
              <div className="mt-2 space-y-1">
                <Link
                  href={isLoggedIn ? '/conta' : '/conta/login'}
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-rosé-50 hover:text-rosé-700"
                >
                  <User className="h-4 w-4" />
                  {isLoggedIn ? 'Minha conta' : 'Entrar ou criar conta'}
                </Link>
                <Link
                  href="/meus-pedidos"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-rosé-50 hover:text-rosé-700"
                >
                  <Package className="h-4 w-4" />
                  Meus pedidos
                </Link>
                <Link
                  href="/carrinho"
                  onClick={closeMenu}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-rosé-50 hover:text-rosé-700"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Carrinho
                  {cartCount > 0 && (
                    <span className="ml-auto rounded-full bg-rosé-100 px-2 py-0.5 text-[10px] font-bold text-rosé-700">
                      {cartCount > 99 ? '99+' : cartCount}
                    </span>
                  )}
                </Link>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Institucional
              </p>
              <div className="mt-2 space-y-1">
                {INSTITUTIONAL_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={closeMenu}
                    className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm text-muted-foreground transition-colors hover:bg-rosé-50 hover:text-rosé-700"
                  >
                    {link.label}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-6">
              <div className="rounded-xl bg-rosé-50 p-4 text-xs leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">Atendimento</p>
                <p className="mt-1">Barreiras, Bahia — Brasil</p>
                <p>E-mail e WhatsApp serão publicados em breve.</p>
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
