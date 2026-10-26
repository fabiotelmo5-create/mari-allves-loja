import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'Mari Allves — Moda Modesta',
  description: 'Roupas e acessórios de moda modesta. Blusas, saias, vestidos e acessórios com elegância e delicadeza.',
  openGraph: {
    siteName: 'Mari Allves — Moda Modesta',
    title: 'Mari Allves — Moda Modesta',
    description: 'Roupas e acessórios de moda modesta.',
    locale: 'pt_BR',
    type: 'website',
  },
  icons: {
    icon: '/favicon.svg',
  },
  other: {
    'x-build-check': 'marker-2026-10-26-a',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable}>
      <body className="antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
