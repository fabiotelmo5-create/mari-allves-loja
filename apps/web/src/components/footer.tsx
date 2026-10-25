import Link from 'next/link';
import { Mail, Phone, Instagram, Clock, MapPin } from 'lucide-react';

const LEGAL_LINKS = [
  { label: 'Sobre a Mari Allves', href: '/sobre' },
  { label: 'Contato', href: '/contato' },
  { label: 'Perguntas frequentes', href: '/faq' },
  { label: 'Guia de tamanhos', href: '/guias-tamanhos' },
  { label: 'Política de privacidade', href: '/privacidade' },
  { label: 'Termos de uso', href: '/termos' },
  { label: 'Trocas e devoluções', href: '/trocas' },
  { label: 'Política de entrega', href: '/entrega' },
  { label: 'Política de cancelamento', href: '/cancelamento' },
  { label: 'Acessibilidade', href: '/acessibilidade' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-rosé-50/50 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 lg:col-span-1">
            <Link href="/" className="flex items-center gap-1 mb-4">
              <span className="text-rosé-700 font-serif font-bold text-lg tracking-tight">Mari</span>
              <span className="text-rosé-400 font-serif font-bold text-lg tracking-tight">Allves</span>
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Moda modesta com elegância, delicadeza e profissionalismo.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-rosé-700 mb-4">Loja</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/categoria/saias" className="hover:text-rosé-700">Saias</Link></li>
              <li><Link href="/categoria/blusas" className="hover:text-rosé-700">Blusas</Link></li>
              <li><Link href="/categoria/vestidos" className="hover:text-rosé-700">Vestidos</Link></li>
              <li><Link href="/categoria/acessorios" className="hover:text-rosé-700">Acessórios</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-rosé-700 mb-4">Institucional</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {LEGAL_LINKS.slice(0, 5).map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-rosé-700">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-rosé-700 mb-4">Atendimento</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-rosé-400" />
                <span>contato@mariallves.com.br</span>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="h-4 w-4 mt-0.5 text-rosé-400" />
                <span>(77) 9 9999-9999</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-rosé-400" />
                <span>Seg a Sex, 9h às 18h</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-rosé-400" />
                <span>Barreiras, Bahia — Brasil</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-rosé-700 mb-4">Redes sociais</h3>
            <div className="flex gap-3">
              <a href="#" className="text-muted-foreground hover:text-rosé-700 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-rosé-700 transition-colors">
                <Phone className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-xs text-muted-foreground text-center">
            Mari Allves — Moda Modesta. CNPJ a definir. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
