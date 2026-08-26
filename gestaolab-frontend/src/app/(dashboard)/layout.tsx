// src/app/(dashboard)/layout.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { Sidebar } from '@/components/layout/Sidebar';
import { UserSession } from '@/types';
import { Menu } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Estado para o Mobile

  useEffect(() => {
    const userCookie = getCookie('gestaolab_user');
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie as string));
      } catch (error) {}
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 overflow-hidden relative">
      
      {/* Overlay escuro para mobile (quando menu está aberto) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Desliza no Mobile, Fixa no Desktop */}
      <div className={`fixed inset-y-0 left-0 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:relative lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
        <Sidebar user={user} onClose={() => setIsSidebarOpen(false)} />
      </div>

      {/* Conteúdo Principal */}
      <div className="flex-1 flex flex-col h-screen w-full overflow-hidden">
        
        {/* Cabeçalho Responsivo */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 px-4 sm:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400 hidden sm:inline">Ambiente:</span>
              <span className="text-sm font-semibold text-slate-200 truncate">
                {user.role === 'ADMIN' ? 'Painel Administrativo' : 'Área Operacional'}
              </span>
            </div>
          </div>
        </header>
        
        {/* Área rolável das páginas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          {children}
        </main>
      </div>
    </div>
  );
}