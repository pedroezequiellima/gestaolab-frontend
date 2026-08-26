// src/app/(dashboard)/alocacoes/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { alocacoesService } from '@/services/alocacoes.service';
import { salasService } from '@/services/salas.service';
import { usuariosService } from '@/services/usuarios.service';
import { Alocacao, Sala, Usuario } from '@/types';
import { KeyRound, RefreshCw, AlertCircle, CheckCircle2, Search, X } from 'lucide-react';

export default function AlocacoesPage() {
  // Estados da Tabela Principal
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  // Estados do Modal de Nova Retirada
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loadingModalData, setLoadingModalData] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Dados para os selects do Modal
  const [salasDisponiveis, setSalasDisponiveis] = useState<Sala[]>([]);
  const [professores, setProfessores] = useState<Usuario[]>([]);

  // Campos do Formulário
  const [formData, setFormData] = useState({
    salaId: '',
    professorId: '',
    fimPrevisto: '',
    observacao: ''
  });

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

  // Abre o modal e busca dados frescos para evitar conflitos de reserva
  const handleAbrirModal = async () => {
    setIsModalOpen(true);
    setLoadingModalData(true);
    try {
      const [salasAll, usuariosAll] = await Promise.all([
        salasService.listarTodas(),
        usuariosService.listarTodos()
      ]);
      
      // Filtra apenas salas livres e usuários com perfil de professor ativos
      setSalasDisponiveis(salasAll.filter(s => s.status === 'DISPONIVEL'));
      setProfessores(usuariosAll.filter(u => u.role === 'PROFESSOR' && u.ativo));
    } catch (error) {
      alert('Erro ao buscar dados para o formulário.');
      setIsModalOpen(false);
    } finally {
      setLoadingModalData(false);
    }
  };

  const handleDevolucao = async (id: string) => {
    if (!window.confirm('Confirmar devolução desta chave?')) return;
    try {
      setActionLoading(id);
      await alocacoesService.registrarDevolucao(id);
      setMensagem({ tipo: 'sucesso', texto: 'Chave devolvida com sucesso!' });
      await carregarAlocacoes();
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.response?.data?.message || 'Erro ao registrar devolução.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleNovaRetirada = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      
      // Converte a data local do input HTML para o formato ISO 8601 exigido pela API
      const fimIso = new Date(formData.fimPrevisto).toISOString();
      
      await alocacoesService.registrarRetirada({
        salaId: formData.salaId,
        professorId: formData.professorId,
        fimPrevisto: fimIso,
        observacao: formData.observacao
      });

      setMensagem({ tipo: 'sucesso', texto: 'Chave liberada com sucesso!' });
      setIsModalOpen(false);
      setFormData({ salaId: '', professorId: '', fimPrevisto: '', observacao: '' });
      await carregarAlocacoes();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Falha ao liberar a chave. Verifique os dados.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatarHora = (dataString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dataString));
  };

  const alocacoesAtivas = alocacoes.filter(a => a.devolucao === null);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Cabeçalho */}
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
          <button 
            onClick={handleAbrirModal}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            + Nova Retirada
          </button>
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
          mensagem.tipo === 'sucesso' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
        }`}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {mensagem.texto}
        </div>
      )}

      {/* Tabela de Chaves */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
          <h3 className="text-base font-semibold text-white">Chaves em Posse ({alocacoesAtivas.length})</h3>
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
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Sincronizando...</td>
                </tr>
              ) : alocacoesAtivas.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">Todas as chaves estão na portaria.</td>
                </tr>
              ) : (
                alocacoesAtivas.map((aloc) => (
                  <tr key={aloc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{aloc.sala?.nome}</td>
                    <td className="px-6 py-4">{aloc.professor?.nome}</td>
                    <td className="px-6 py-4 text-slate-400">{formatarHora(aloc.inicio)}</td>
                    <td className="px-6 py-4 text-amber-400/90 font-medium">{formatarHora(aloc.fimPrevisto)}</td>
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

      {/* Modal de Nova Retirada */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Liberar Chave</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {loadingModalData ? (
              <div className="p-10 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            ) : (
              <form onSubmit={handleNovaRetirada} className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Laboratório Livre</label>
                  <select 
                    required
                    value={formData.salaId}
                    onChange={(e) => setFormData({...formData, salaId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione a sala...</option>
                    {salasDisponiveis.map(sala => (
                      <option key={sala.id} value={sala.id}>{sala.nome} (Bloco {sala.bloco})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Professor Responsável</label>
                  <select 
                    required
                    value={formData.professorId}
                    onChange={(e) => setFormData({...formData, professorId: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                  >
                    <option value="">Selecione o docente...</option>
                    {professores.map(prof => (
                      <option key={prof.id} value={prof.id}>{prof.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">Horário de Devolução Previsto</label>
                  <input 
                    type="datetime-local" 
                    required
                    value={formData.fimPrevisto}
                    onChange={(e) => setFormData({...formData, fimPrevisto: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:border-blue-500 focus:outline-none"
                    style={{ colorScheme: 'dark' }} // Força o calendário nativo a usar tema escuro
                  />
                </div>

                <div className="pt-4 mt-2 border-t border-slate-800">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    {isSubmitting ? 'Processando...' : 'Confirmar Retirada'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}