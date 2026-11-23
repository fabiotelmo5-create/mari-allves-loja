import Image from 'next/image';
import Link from 'next/link';
import { Instagram, Mail, Clock, MapPin, Phone } from 'lucide-react';

const INSTITUTIONAL_LINKS = [
  { label: 'Sobre a Mari Allves', href: '/sobre' },
  { label: 'Contato', href: '/contato' },
  { label: 'Perguntas frequentes', href: '/faq' },
  { label: 'Guia de tamanhos', href: '/guias-tamanhos' },
  { label: 'Acessibilidade', href: '/acessibilidade' },
];

const POLICY_LINKS = [
  { label: 'Política de privacidade', href: '/privacidade' },
  { label: 'Política de cookies', href: '/cookies' },
  { label: 'Termos de uso', href: '/termos' },
  { label: 'Trocas e devoluções', href: '/trocas' },
  { label: 'Política de entrega', href: '/entrega' },
  { label: 'Política de cancelamento', href: '/cancelamento' },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-rosé-50/50 mt-auto py-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="mb-4 flex items-center" aria-label="Mari Allves — início">
              <Image
                src="/logo-mari-allves.png"
                alt="Mari Allves — Moda Evangélica"
                width={128}
                height={128}
                className="h-12 w-12 rounded-lg object-cover"
                unoptimized
              />
            </Link>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Moda evangélica com elegância, delicadeza e profissionalismo.
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
              {INSTITUTIONAL_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="hover:text-rosé-700">{l.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-rosé-700 mb-4">Políticas</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {POLICY_LINKS.map((l) => (
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
                <Phone className="h-4 w-4 mt-0.5 text-rosé-400" />
                <a href="https://wa.me/5577999671649" target="_blank" rel="noopener noreferrer" className="hover:text-rosé-700 hover:underline">
                  (77) 9996-71649
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Instagram className="h-4 w-4 mt-0.5 text-rosé-400" />
                <a href="https://instagram.com/mariallves432" target="_blank" rel="noopener noreferrer" className="hover:text-rosé-700 hover:underline">
                  @mariallves432
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="h-4 w-4 mt-0.5 text-rosé-400" />
                <a
                  href="mailto:mariallves432@gmail.com"
                  className="hover:text-rosé-700 hover:underline"
                >
                  mariallves432@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 mt-0.5 text-rosé-400" />
                <span>Horário de atendimento: a definir.</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-rosé-400" />
                <span>Barreiras, Bahia — Brasil</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8">
          <p className="text-xs text-muted-foreground text-center">
            Mari Allves. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
