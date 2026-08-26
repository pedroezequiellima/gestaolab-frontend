// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserSession } from '@/types';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca o usuário de forma segura no client-side
    const userCookie = getCookie('gestaolab_user');

    if (userCookie) {
      try {
        // Previne injeções caso o cookie tenha sido adulterado manualmente no DevTools
        const parsedUser = JSON.parse(userCookie as string) as UserSession;
        setUser(parsedUser);
      } catch (error) {
        console.error('Falha ao decodificar sessão.');
      }
    }
    setLoading(false);
  }, []);

  // Exibe um estado de carregamento seguro enquanto valida a sessão
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Se não houver usuário (ex: token expirou e middleware não pegou por algum edge case)
  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <Sidebar user={user} />
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Cabeçalho de Contexto */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-slate-400">Ambiente:</span>
            <span className="text-sm font-semibold text-slate-200">
              {user.role === 'ADMIN' ? 'Painel Administrativo' : 'Área Operacional'}
            </span>
          </div>
        </header>
        
        {/* Área principal rolável onde as páginas filhas serão renderizadas */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}