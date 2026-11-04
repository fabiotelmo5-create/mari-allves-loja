'use client';

import { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  function toggleTheme() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try {
      window.localStorage.setItem('ma_theme', next ? 'dark' : 'light');
    } catch {
      // Se o navegador bloquear o localStorage, o tema ainda funciona nesta sessão.
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-white p-4">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-rosé-50 text-rosé-700">
          {dark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
        </span>
        <div>
          <p className="text-sm font-medium text-foreground">Modo escuro</p>
          <p className="text-xs text-muted-foreground">
            Fundo escuro e textos claros para ler com mais conforto.
          </p>
        </div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Ativar modo escuro"
        onClick={toggleTheme}
        className={cn(
          'relative grid h-7 w-12 shrink-0 place-items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-rosé-300 focus:ring-offset-2',
          dark ? 'bg-rosé-600' : 'bg-muted'
        )}
      >
        <span
          className={cn(
            'absolute h-5 w-5 rounded-full bg-[#fff] shadow-sm transition-transform',
            dark ? 'translate-x-[11px]' : '-translate-x-[11px]'
          )}
        />
      </button>
    </div>
  );
}
