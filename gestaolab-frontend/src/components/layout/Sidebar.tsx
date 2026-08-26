// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  DoorClosed, 
  KeyRound, 
  Clock, 
  Users, 
  LogOut,
  ShieldCheck
} from 'lucide-react';
import { UserSession } from '@/types';
import { authService } from '@/services/auth.service';

interface SidebarProps {
  user: UserSession;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();

  const handleLogout = () => {
    authService.logout();
  };

  // Matriz de Controle de Acesso da Interface (RBAC Visual)
  const navItems = [
    {
      title: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      allowedRoles: ['ADMIN', 'PORTEIRO', 'PROFESSOR'],
    },
    {
      title: 'Salas & Labs',
      href: '/salas',
      icon: DoorClosed,
      allowedRoles: ['ADMIN', 'PORTEIRO', 'PROFESSOR'],
    },
    {
      title: 'Alocações',
      href: '/alocacoes',
      icon: KeyRound,
      allowedRoles: ['ADMIN', 'PORTEIRO'], // Professor acessa alocação apenas via dashboard
    },
    {
      title: 'Bater Ponto',
      href: '/ponto',
      icon: Clock,
      allowedRoles: ['ADMIN', 'PORTEIRO', 'PROFESSOR'],
    },
    {
      title: 'Auditoria de Ponto',
      href: '/ponto/auditoria',
      icon: ShieldCheck,
      allowedRoles: ['ADMIN'], // Funcionalidade estrita
    },
    {
      title: 'Gestão de Usuários',
      href: '/usuarios',
      icon: Users,
      allowedRoles: ['ADMIN'], // Funcionalidade estrita
    },
  ];

  // Filtra o menu com base no cargo do usuário (Princípio do Menor Privilégio na UI)
  const filteredNavItems = navItems.filter((item) =>
    item.allowedRoles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col min-h-screen border-r border-slate-800">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <KeyRound className="h-6 w-6 text-emerald-500" />
          GestãoLab
        </h1>
        <div className="mt-2 flex items-center gap-2">
          <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            {user.role}
          </span>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.nome}</p>
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
        >
          <LogOut className="h-4 w-4" />
          Sair do Sistema
        </button>
      </div>
    </aside>
  );
}