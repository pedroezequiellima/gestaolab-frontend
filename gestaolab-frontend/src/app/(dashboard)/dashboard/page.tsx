// src/app/(dashboard)/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { UserSession } from '@/types';
import { Clock, DoorClosed, KeyRound, ShieldCheck } from 'lucide-react';

export default function DashboardPage() {
  const [user, setUser] = useState<UserSession | null>(null);

  useEffect(() => {
    // Leitura segura do cookie armazenado pelo auth.service.ts
    const userCookie = getCookie('gestaolab_user');
    if (userCookie) {
      try {
        setUser(JSON.parse(userCookie as string));
      } catch (error) {
        console.error('Falha ao processar sessão local');
      }
    }
  }, []);

  if (!user) return null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        {/* O React escapa automaticamente a variável user.nome (Mitigação de XSS) */}
        <h2 className="text-2xl font-bold text-white tracking-tight">
          Olá, {user.nome} 👋
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          {user.role === 'ADMIN' 
            ? 'Visão geral operacional e administrativa.' 
            : 'Controle de suas aulas e registro de frequência.'}
        </p>
      </div>

      {user.role === 'ADMIN' ? <AdminView /> : <ProfessorView />}
    </div>
  );
}

// Subcomponente de Visão do Administrador
function AdminView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm font-medium">Gestão de Salas</span>
          <DoorClosed className="h-5 w-5 text-emerald-400" />
        </div>
        <p className="text-sm text-slate-500 mt-2">Acesse para cadastrar ou bloquear laboratórios.</p>
      </div>

      <div className="bg-slate-900 border border-slate-800 p-5 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-slate-400 text-sm font-medium">Auditoria Geral</span>
          <ShieldCheck className="h-5 w-5 text-purple-400" />
        </div>
        <p className="text-sm text-slate-500 mt-2">Relatórios completos de frequência e logs do sistema.</p>
      </div>
    </div>
  );
}

// Subcomponente de Visão Operacional (Professor)
function ProfessorView() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl space-y-4 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-white flex items-center gap-2">
            <Clock className="h-5 w-5 text-emerald-500" />
            Ponto Eletrônico Rápido
          </h3>
        </div>
        <p className="text-sm text-slate-400">Registre sua entrada ou saída das atividades do laboratório.</p>
        <button className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-100 rounded-lg text-sm font-medium transition-colors mt-2">
          Acessar Terminal de Ponto
        </button>
      </div>
    </div>
  );
}