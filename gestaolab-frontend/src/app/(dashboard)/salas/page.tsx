// src/app/(dashboard)/salas/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { salasService } from '@/services/salas.service';
import { Sala, StatusSala, UserSession } from '@/types';
import { StatusBadge } from '@/components/ui/Badge';
import { DoorClosed, Settings2, RefreshCw, AlertCircle } from 'lucide-react';

export default function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState<'ADMIN' | 'PORTEIRO' | 'PROFESSOR' | null>(null);

  const carregarSalas = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await salasService.listarTodas();
      setSalas(dados);
    } catch (err) {
      setError('Não foi possível carregar a lista de salas. Tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Busca a role de forma segura para aplicar o RBAC Visual
    const userCookie = getCookie('gestaolab_user');
    if (userCookie) {
      try {
        const user: UserSession = JSON.parse(userCookie as string);
        setUserRole(user.role);
      } catch (e) {
        // Ignora erros de parse
      }
    }
    carregarSalas();
  }, []);

  const handleMudarStatus = async (id: string, novoStatus: StatusSala) => {
    try {
      // Chamada à API protegida
      await salasService.atualizarStatus(id, novoStatus);
      // Atualiza o estado local para evitar recarregar a página inteira
      setSalas((prev) => 
        prev.map((sala) => (sala.id === id ? { ...sala, status: novoStatus } : sala))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || 'Ação não autorizada ou falha no servidor.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <DoorClosed className="h-6 w-6 text-emerald-500" />
            Salas e Laboratórios
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Consulte a disponibilidade da infraestrutura do SENAI.
          </p>
        </div>
        <button 
          onClick={carregarSalas}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      {loading && salas.length === 0 ? (
        <div className="flex justify-center p-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {salas.map((sala) => (
            <div key={sala.id} className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-full">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">{sala.nome}</h3>
                  <p className="text-sm text-slate-400">Bloco {sala.bloco}</p>
                </div>
                <StatusBadge status={sala.status} />
              </div>
              
              <div className="flex-1">
                <p className="text-sm text-slate-300">
                  <span className="font-semibold text-slate-500">Capacidade:</span> {sala.capacidade} alunos
                </p>
                {sala.recursos.length > 0 && (
                  <p className="text-sm text-slate-300 mt-2 line-clamp-2">
                    <span className="font-semibold text-slate-500">Recursos:</span> {sala.recursos.join(', ')}
                  </p>
                )}
              </div>

              {/* RBAC Visual: Oculta controles de gestão para Professores */}
              {(userRole === 'ADMIN' || userRole === 'PORTEIRO') && (
                <div className="mt-6 pt-4 border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4 text-slate-500" />
                    <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Ações Rápidas</span>
                  </div>
                  <div className="flex gap-2 mt-3">
                    {sala.status !== 'DISPONIVEL' && (
                      <button 
                        onClick={() => handleMudarStatus(sala.id, 'DISPONIVEL')}
                        className="flex-1 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 rounded-md text-xs font-medium transition-colors"
                      >
                        Marcar Livre
                      </button>
                    )}
                    {sala.status !== 'MANUTENCAO' && (
                      <button 
                        onClick={() => handleMudarStatus(sala.id, 'MANUTENCAO')}
                        className="flex-1 py-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-md text-xs font-medium transition-colors"
                      >
                        Pausar
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}