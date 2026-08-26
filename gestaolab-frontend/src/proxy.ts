// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  // 1. Extrai os cookies de segurança da requisição
  const token = request.cookies.get('gestaolab_token')?.value;
  const userCookie = request.cookies.get('gestaolab_user')?.value;
  const pathname = request.nextUrl.pathname;

  const isAuthPage = pathname.startsWith('/login');

  // 2. Prevenção de Broken Authentication: Sem token, sem acesso.
  if (!token || !userCookie) {
    if (!isAuthPage) {
      // Evita Open Redirect garantindo que a URL base é a nossa própria
      return NextResponse.redirect(new URL('/login', request.url));
    }
    return NextResponse.next();
  }

  // 3. Se estiver logado e tentar ir para o login, joga pro dashboard
  if (isAuthPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // 4. Prevenção de Privilege Escalation (RBAC na Borda)
  try {
    const user = JSON.parse(userCookie);

    // Regra: Somente ADMIN pode acessar a gestão de usuários
    if (pathname.startsWith('/usuarios') && user.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Regra: Apenas ADMIN e PORTEIRO podem ver todas as alocações gerais
    if (pathname.startsWith('/alocacoes') && user.role === 'PROFESSOR') {
       // Professor tem a própria visão no dashboard, não acessa o módulo geral
       return NextResponse.redirect(new URL('/dashboard', request.url));
    }

  } catch (error) {
    // Se o cookie foi adulterado manualmente (Client-Side Manipulation)
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('gestaolab_token');
    response.cookies.delete('gestaolab_user');
    return response;
  }

  return NextResponse.next();
}

// 5. Otimização: Define quais rotas o middleware deve vigiar
export const config = {
  // Ignora rotas de API, arquivos estáticos e imagens para não perder performance (DoS prevention)
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};