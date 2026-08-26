// src/app/(dashboard)/alocacoes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { alocacoesService } from '@/services/alocacoes.service';
import { Alocacao } from '@/types';
import { KeyRound, RefreshCw, AlertCircle, CheckCircle2, Search } from 'lucide-react';

export default function AlocacoesPage() {
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarAlocacoes = async () => {
    try {
      setLoading(true);
      setMensagem(null);
      const dados = await alocacoesService.listarTodas();
      setAlocacoes(dados);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Falha ao carregar o quadro de chaves.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarAlocacoes();
  }, []);

  const handleDevolucao = async (id: string) => {
    if (!window.confirm('Confirmar devolução desta chave?')) return;
    
    try {
      setActionLoading(id); // Trava apenas o botão clicado
      await alocacoesService.registrarDevolucao(id);
      setMensagem({ tipo: 'sucesso', texto: 'Chave devolvida com sucesso!' });
      await carregarAlocacoes();
    } catch (error: any) {
      setMensagem({ 
        tipo: 'erro', 
        texto: error.response?.data?.message || 'Erro ao registrar devolução.' 
      });
    } finally {
      setActionLoading(null);
    }
  };

  const formatarHora = (dataString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dataString));
  };

  // Filtra apenas as alocações ativas (chaves que ainda não foram devolvidas)
  const alocacoesAtivas = alocacoes.filter(a => a.devolucao === null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <KeyRound className="h-6 w-6 text-blue-500" />
            Controle de Chaves
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Balcão de atendimento: registre retiradas e devoluções de laboratórios.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={carregarAlocacoes}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            + Nova Retirada
          </button>
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
          mensagem.tipo === 'sucesso' 
            ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
            : 'bg-red-500/10 border border-red-500/20 text-red-400'
        }`}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {mensagem.texto}
        </div>
      )}

      {/* Quadro de Chaves em Uso */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
          <h3 className="text-base font-semibold text-white">Chaves em Posse ({alocacoesAtivas.length})</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Buscar professor ou sala..." 
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Sala / Laboratório</th>
                <th className="px-6 py-4 font-medium">Professor Responsável</th>
                <th className="px-6 py-4 font-medium">Retirada</th>
                <th className="px-6 py-4 font-medium">Previsão</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && alocacoes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Sincronizando com o servidor...
                  </td>
                </tr>
              ) : alocacoesAtivas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Nenhuma chave em uso no momento. Todas as salas estão livres.
                  </td>
                </tr>
              ) : (
                alocacoesAtivas.map((aloc) => (
                  <tr key={aloc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {aloc.sala?.nome || 'Sala Desconhecida'}
                    </td>
                    <td className="px-6 py-4">
                      {aloc.professor?.nome || 'Professor Desconhecido'}
                    </td>
                    <td className="px-6 py-4 text-slate-400">
                      {formatarHora(aloc.inicio)}
                    </td>
                    <td className="px-6 py-4 text-amber-400/90 font-medium">
                      {formatarHora(aloc.fimPrevisto)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDevolucao(aloc.id)}
                        disabled={actionLoading === aloc.id}
                        className="px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 disabled:opacity-50 rounded-md text-xs font-semibold transition-colors"
                      >
                        {actionLoading === aloc.id ? 'Baixando...' : 'Receber Chave'}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}