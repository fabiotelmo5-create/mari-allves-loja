'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingBag, User, Heart, X } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const pathname = usePathname();

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

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-1">
            <span className="text-rosé-700 font-serif font-bold text-lg tracking-tight">Mari</span>
            <span className="text-rosé-400 font-serif font-bold text-lg tracking-tight">Allves</span>
          </Link>
          <span className="text-xs text-muted-foreground ml-1 hidden md:inline">— Moda Modesta</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Busca */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Buscar produtos..."
                className="pl-9 pr-3 h-9 rounded-lg border border-input bg-background text-sm focus:ring-1 focus:ring-rosé-700"
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href={isLoggedIn ? '/conta' : '/conta/login'}>
                <User className="h-4 w-4" /> {isLoggedIn ? 'Minha conta' : 'Entrar'}
              </Link>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/carrinho">
                <ShoppingBag className="h-4 w-4" /> <span className="hidden sm:inline">Carrinho</span>
              </Link>
            </Button>
            <Button asChild>
              <Link href="/favoritos">
                <Heart className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {/* Mobile menu toggle */}
          <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden border-t border-border bg-background">
          <div className="px-4 py-3 space-y-4">
            <Link href="/" className="block py-2 text-rosé-700 font-medium">Início</Link>
            <Link href="/categoria/saias" className="block py-2 text-foreground hover:text-rosé-700">Saias</Link>
            <Link href="/categoria/blusas" className="block py-2 text-foreground hover:text-rosé-700">Blusas</Link>
            <Link href="/categoria/vestidos" className="block py-2 text-foreground hover:text-rosé-700">Vestidos</Link>
            <Link href="/categoria/acessorios" className="block py-2 text-foreground hover:text-rosé-700">Acessórios</Link>
            <Link href="/novidades" className="block py-2 text-foreground hover:text-rosé-700">Novidades</Link>
            <Link href="/promocoes" className="block py-2 text-foreground hover:text-rosé-700">Promoções</Link>
            <button onClick={() => setSearchOpen(!searchOpen)} className="w-full text-left py-2 text-foreground hover:text-rosé-700 flex items-center justify-between">
              Buscar produtos <X className="h-4 w-4" />
            </button>
            {searchOpen && (
              <div className="mt-2 px-2">
                <input
                  type="search"
                  placeholder="Buscar..."
                  className="w-full pl-3 pr-8 h-9 rounded-lg border border-input bg-background text-sm focus:ring-1 focus:ring-rosé-700"
                />
              </div>
            )}
            <Link href={isLoggedIn ? '/conta' : '/conta/login'} className="block py-2 text-foreground hover:text-rosé-700">
              {isLoggedIn ? 'Minha conta' : 'Entrar'}
            </Link>
            <Link href="/carrinho" className="block py-2 text-foreground hover:text-rosé-700">Carrinho</Link>
          </div>
        </div>
      )}

      {/* Desktop menu */}
      <nav className="hidden md:flex items-center space-x-1 text-sm font-medium">
        <Link href="/" className="px-3 py-2 text-rosé-700 border-b-2 border-rosé-700">Início</Link>
        <Link href="/categoria/saias" className="px-3 py-2 text-foreground hover:text-rosé-700 transition-colors">Saias</Link>
        <Link href="/categoria/blusas" className="px-3 py-2 text-foreground hover:text-rosé-700 transition-colors">Blusas</Link>
        <Link href="/categoria/vestidos" className="px-3 py-2 text-foreground hover:text-rosé-700 transition-colors">Vestidos</Link>
        <Link href="/categoria/acessorios" className="px-3 py-2 text-foreground hover:text-rosé-700 transition-colors">Acessórios</Link>
        <Link href="/novidades" className="px-3 py-2 text-foreground hover:text-rosé-700 transition-colors">Novidades</Link>
        <Link href="/promocoes" className="px-3 py-2 text-foreground hover:text-rosé-700 transition-colors">Promoções</Link>
      </nav>
    </header>
  );
}
