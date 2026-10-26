/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@mari-allves/db', '@mari-allves/ui'],
  serverExternalPackages: ['@prisma/client'],
  // Copia o Query Engine do Prisma para o bundle da função serverless.
  // Sem isso, em monorepo pnpm, o binário fica fora do bundle e o runtime falha
  // com "Prisma Client could not locate the Query Engine".
  outputFileTracingIncludes: {
    '/**': [
      '../../node_modules/.pnpm/@prisma+client*/node_modules/.prisma/client/**/*',
      '../../node_modules/.pnpm/@prisma+engines*/node_modules/@prisma/engines/**/*',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'placehold.co',
      },
    ],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
