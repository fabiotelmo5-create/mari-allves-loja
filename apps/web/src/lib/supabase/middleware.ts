import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/** Rotas que exigem login. */
const PROTECTED_PREFIXES = ['/conta', '/admin'];

/** Rotas de autenticação que ficam acessíveis sem login. */
const PUBLIC_AUTH_PATHS = [
  '/conta/login',
  '/conta/cadastro',
  '/conta/esqueceu-senha',
  '/conta/redefinir-senha',
  '/admin/login',
];

function matches(path: string, prefixes: string[]) {
  return prefixes.some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // IMPORTANTE: getUser() valida o token no servidor Supabase (não confia só no cookie).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublicAuth = matches(path, PUBLIC_AUTH_PATHS);

  // 1) Rota protegida sem sessão -> manda para o login
  if (matches(path, PROTECTED_PREFIXES) && !isPublicAuth && !user) {
    const url = request.nextUrl.clone();
    url.pathname = path.startsWith('/admin') ? '/admin/login' : '/conta/login';
    url.search = '';
    url.searchParams.set('next', path);
    return NextResponse.redirect(url);
  }

  // 2) Já logado tentando ver login/cadastro do cliente -> vai para a conta
  if (
    user &&
    (path === '/conta/login' || path === '/conta/cadastro')
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/conta';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}
