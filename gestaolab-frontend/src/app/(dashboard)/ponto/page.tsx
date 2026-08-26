// src/app/(dashboard)/ponto/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { pontoService } from '@/services/ponto.service';
import { RegistroPonto, TipoPonto } from '@/types';
import { Clock, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function PontoPage() {
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const carregarRegistros = async () => {
    try {
      setLoading(true);
      const dados = await pontoService.listarMeusRegistros();
      setRegistros(dados);
    } catch (error) {
      setMensagem({ tipo: 'erro', texto: 'Não foi possível carregar o histórico de ponto.' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRegistros();
  }, []);

  const handleBaterPonto = async (tipo: TipoPonto) => {
    try {
      setActionLoading(true);
      setMensagem(null);
      
      // Comunicação segura: o backend pega o ID do usuário diretamente do JWT
      await pontoService.registrar(tipo);
      
      setMensagem({ tipo: 'sucesso', texto: `Ponto de ${tipo.replace('_', ' ')} registrado com sucesso!` });
      await carregarRegistros(); // Atualiza a tabela com o novo registro
    } catch (error: any) {
      // Oculta detalhes técnicos do erro, mostrando apenas a mensagem de negócio
      setMensagem({ 
        tipo: 'erro', 
        texto: error.response?.data?.message || 'Erro ao registrar o ponto. Tente novamente.' 
      });
    } finally {
      setActionLoading(false);
    }
  };

const formatarDataHora = (dataString: string) => {
    // 1. Se não vier data, retorna um traço para não quebrar a tela
    if (!dataString) return '--/--/---- --:--';

    const data = new Date(dataString);
    
    // 2. Verifica se o valor gerou uma Data Inválida no JavaScript
    if (isNaN(data.getTime())) return 'Data inválida';

    // 3. Se estiver tudo certo, formata bonitinho
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(data);
  };

  const formatarTipo = (tipo: TipoPonto) => {
    const labels: Record<TipoPonto, string> = {
      ENTRADA: 'Entrada',
      SAIDA_INTERVALO: 'Saída Intervalo',
      RETORNO_INTERVALO: 'Retorno Intervalo',
      SAIDA: 'Saída Final'
    };
    return labels[tipo];
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          <Clock className="h-6 w-6 text-emerald-500" />
          Terminal de Ponto Eletrônico
        </h2>
        <p className="text-slate-400 text-sm mt-1">
          Registre seus horários de entrada e saída. O servidor registrará o horário exato da transação.
        </p>
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

      {/* Painel de Ações (Batida de Ponto) */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Registrar Ação</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <button
            onClick={() => handleBaterPonto('ENTRADA')}
            disabled={actionLoading}
            className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Entrada
          </button>
          <button
            onClick={() => handleBaterPonto('SAIDA_INTERVALO')}
            disabled={actionLoading}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Saída Intervalo
          </button>
          <button
            onClick={() => handleBaterPonto('RETORNO_INTERVALO')}
            disabled={actionLoading}
            className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 disabled:opacity-50 text-slate-200 rounded-lg text-sm font-medium transition-colors"
          >
            Retorno Intervalo
          </button>
          <button
            onClick={() => handleBaterPonto('SAIDA')}
            disabled={actionLoading}
            className="px-4 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            Saída Final
          </button>
        </div>
      </div>

      {/* Histórico Recente */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Meus Registros</h3>
          <button 
            onClick={carregarRegistros} 
            disabled={loading}
            className="text-slate-400 hover:text-emerald-400 transition-colors"
            title="Atualizar lista"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Ação Registrada</th>
                <th className="px-6 py-4 font-medium">Data e Hora (Servidor)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && registros.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                    Carregando registros...
                  </td>
                </tr>
              ) : registros.length === 0 ? (
                <tr>
                  <td colSpan={2} className="px-6 py-8 text-center text-slate-500">
                    Nenhum registro de ponto encontrado.
                  </td>
                </tr>
              ) : (
                registros.map((registro) => (
                  <tr key={registro.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {formatarTipo(registro.tipo)}
                    </td>
                    <td className="px-6 py-4">
                      {formatarDataHora(registro.timestamp)}
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