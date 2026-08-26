// src/components/layout/Sidebar.tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, DoorClosed, KeyRound, Clock, Users, LogOut, ShieldCheck, X } from 'lucide-react';
import { UserSession } from '@/types';
import { authService } from '@/services/auth.service';

interface SidebarProps {
  user: UserSession;
  onClose?: () => void; // Propriedade nova para o mobile
}

export function Sidebar({ user, onClose }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, allowedRoles: ['ADMIN', 'PORTEIRO', 'PROFESSOR'] },
    { title: 'Salas & Labs', href: '/salas', icon: DoorClosed, allowedRoles: ['ADMIN', 'PORTEIRO', 'PROFESSOR'] },
    { title: 'Alocações', href: '/alocacoes', icon: KeyRound, allowedRoles: ['ADMIN', 'PORTEIRO'] },
    { title: 'Bater Ponto', href: '/ponto', icon: Clock, allowedRoles: ['ADMIN', 'PORTEIRO', 'PROFESSOR'] },
    { title: 'Auditoria de Ponto', href: '/ponto/auditoria', icon: ShieldCheck, allowedRoles: ['ADMIN'] },
    { title: 'Gestão de Usuários', href: '/usuarios', icon: Users, allowedRoles: ['ADMIN'] },
  ];

  const filteredNavItems = navItems.filter((item) => item.allowedRoles.includes(user.role));

  return (
    <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col h-full min-h-screen border-r border-slate-800">
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <KeyRound className="h-6 w-6 text-emerald-500" />
          GestãoLab
        </h1>
        {/* Botão de fechar visível apenas no mobile */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>
      
      <div className="px-6 py-3 border-b border-slate-800 bg-slate-900/50">
        <span className="text-xs px-2.5 py-1 rounded-full font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          Perfil: {user.role || 'Indefinido'}
        </span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {filteredNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href} href={item.href} onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className="h-4 w-4" />
              {item.title}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between mb-3 px-2">
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user.nome || 'Usuário'}</p>
            <p className="text-xs text-slate-400 truncate">{user.email || 'Email não carregado'}</p>
          </div>
        </div>
        <button onClick={authService.logout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors">
          <LogOut className="h-4 w-4" /> Sair do Sistema
        </button>
      </div>
    </aside>
  );
}