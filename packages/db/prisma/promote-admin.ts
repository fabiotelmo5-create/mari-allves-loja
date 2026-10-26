/**
 * Promove uma conta já cadastrada a administrador.
 *
 * Uso:
 *   pnpm --filter @mari-allves/db admin:promote email@exemplo.com [SUPERADMIN|ADMIN|ESTOQUISTA]
 *
 * A conta precisa existir em auth.users (ou seja, a pessoa já se cadastrou
 * em /conta/cadastro). O script apenas concede a permissão.
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const email = process.argv[2]?.trim().toLowerCase();
const roleArg = (process.argv[3] ?? 'SUPERADMIN').toUpperCase();

const ROLES = ['SUPERADMIN', 'ADMIN', 'ESTOQUISTA'] as const;
type Role = (typeof ROLES)[number];

async function main() {
  if (!email) {
    console.error('Uso: admin:promote email@exemplo.com [SUPERADMIN|ADMIN|ESTOQUISTA]');
    process.exit(1);
  }

  if (!ROLES.includes(roleArg as Role)) {
    console.error(`Papel inválido: ${roleArg}. Use um de: ${ROLES.join(', ')}`);
    process.exit(1);
  }

  const role = roleArg as Role;

  const users = await prisma.$queryRaw<{ id: string; email: string | null }[]>`
    select id::text, email from auth.users where lower(email) = ${email} limit 1
  `;

  const user = users[0];
  if (!user) {
    console.error(
      `Nenhuma conta encontrada com o e-mail ${email}.\n` +
        'Peça para a pessoa se cadastrar em /conta/cadastro primeiro.'
    );
    process.exit(1);
  }

  const profile = await prisma.profile.findUnique({ where: { userId: user.id } });

  const admin = await prisma.adminUser.upsert({
    where: { userId: user.id },
    update: { role, isActive: true },
    create: {
      userId: user.id,
      fullName: profile?.fullName ?? email,
      email,
      role,
    },
  });

  console.log(`✓ ${admin.email} agora é ${admin.role} (ativo: ${admin.isActive})`);
  console.log('  Acesse /admin/login com a senha dessa conta.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
