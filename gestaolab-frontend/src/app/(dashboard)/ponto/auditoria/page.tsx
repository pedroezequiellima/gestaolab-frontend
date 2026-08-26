// src/app/(dashboard)/ponto/auditoria/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { pontoService } from '@/services/ponto.service';
import { RegistroPonto, TipoPonto } from '@/types';
import { ShieldCheck, RefreshCw, AlertCircle, Download, Search } from 'lucide-react';

export default function AuditoriaPontoPage() {
  const [registros, setRegistros] = useState<RegistroPonto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [termoBusca, setTermoBusca] = useState('');

  const carregarRegistros = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await pontoService.listarTodos();
      setRegistros(dados);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Falha ao carregar a auditoria. Acesso negado ou erro no servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarRegistros();
  }, []);

  // Formatação segura de dados para interface
  const formatarDataHora = (dataString: string) => {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }).format(dataString ? new Date(dataString) : new Date());
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

  // Filtro puramente no Client-Side (O React gerencia o estado sanitizado)
  const registrosFiltrados = registros.filter((reg) => 
    reg.usuario?.nome.toLowerCase().includes(termoBusca.toLowerCase()) ||
    reg.usuario?.email.toLowerCase().includes(termoBusca.toLowerCase())
  );

  // Geração de CSV 100% no navegador (Prevenção de ataques de SSRF/File Generation)
  const exportarCSV = () => {
    if (registrosFiltrados.length === 0) return;

    const cabecalho = 'Nome,Email,Acao,DataHora\n';
    const linhas = registrosFiltrados.map(reg => {
      // Escapa vírgulas nos dados para não quebrar o CSV
      const nome = `"${reg.usuario?.nome || 'Desconhecido'}"`;
      const email = `"${reg.usuario?.email || 'N/A'}"`;
      const acao = `"${formatarTipo(reg.tipo)}"`;
      const dataHora = `"${formatarDataHora(reg.timestamp)}"`;
      return `${nome},${email},${acao},${dataHora}`;
    }).join('\n');

    const csvContent = "data:text/csv;charset=utf-8," + encodeURIComponent(cabecalho + linhas);
    
    // Simula um clique em um link para forçar o download seguro
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `auditoria_ponto_${new Date().getTime()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-purple-500" />
            Auditoria de Ponto
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Visualização e exportação de registros de frequência (Acesso Restrito).
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={carregarRegistros}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button 
            onClick={exportarCSV}
            disabled={registrosFiltrados.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/20">
          <h3 className="text-base font-semibold text-white">Todos os Registros</h3>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Filtrar por nome ou e-mail..." 
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-purple-500 focus:outline-none w-72"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Funcionário</th>
                <th className="px-6 py-4 font-medium">E-mail Corporativo</th>
                <th className="px-6 py-4 font-medium">Ação Registrada</th>
                <th className="px-6 py-4 font-medium text-right">Data e Hora (Servidor)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && registros.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Sincronizando logs de auditoria...</td>
                </tr>
              ) : registrosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum registro encontrado para o filtro atual.</td>
                </tr>
              ) : (
                registrosFiltrados.map((registro) => (
                  <tr key={registro.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{registro.usuario?.nome}</td>
                    <td className="px-6 py-4 text-slate-400">{registro.usuario?.email}</td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 text-xs font-semibold rounded-md border bg-slate-800 text-slate-300 border-slate-700">
                        {formatarTipo(registro.tipo)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-400">
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