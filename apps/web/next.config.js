/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: process.env.VERCEL ? '../..' : undefined,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  // Desabilitar ESLint no build se não estiver configurado ainda (vai ser ativado depois)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
