// src/app/(dashboard)/usuarios/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { getCookie } from 'cookies-next';
import { usuariosService } from '@/services/usuarios.service';
import { Usuario, UserRole, UserSession } from '@/types';
import { JSX } from 'react';
import { Users, Search, RefreshCw, AlertCircle, Shield, ShieldBan, UserCog, CheckCircle2 } from 'lucide-react';

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [mensagem, setMensagem] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);
  
  // Filtros
  const [termoBusca, setTermoBusca] = useState('');
  const [filtroRole, setFiltroRole] = useState<string>('TODOS');
  
  // Usuário Logado (para prevenir self-lockout)
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      setError('');
      const dados = await usuariosService.listarTodos();
      setUsuarios(dados);
    } catch (err: any) {
      setError('Falha ao carregar a lista de usuários. Acesso negado ou erro no servidor.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Identifica o usuário logado de forma segura no Client-Side
    const userCookie = getCookie('gestaolab_user');
    if (userCookie) {
      try {
        const session: UserSession = JSON.parse(userCookie as string);
        setCurrentUserId(session.id);
      } catch (e) {}
    }
    carregarUsuarios();
  }, []);

  // Prevenção de Mass Assignment: Enviamos APENAS o campo que queremos alterar
  const handleToggleStatus = async (id: string, statusAtual: boolean) => {
    if (id === currentUserId) {
      setMensagem({ tipo: 'erro', texto: 'Ação bloqueada de segurança: Você não pode alterar o próprio status.' });
      return;
    }
    
    if (!window.confirm(`Tem certeza que deseja ${statusAtual ? 'bloquear' : 'desbloquear'} este usuário?`)) return;

    try {
      setActionLoading(id);
      setMensagem(null);
      await usuariosService.atualizar(id, { ativo: !statusAtual });
      setMensagem({ tipo: 'sucesso', texto: `Usuário ${statusAtual ? 'bloqueado' : 'desbloqueado'} com sucesso.` });
      await carregarUsuarios();
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.response?.data?.message || 'Falha ao alterar o status do usuário.' });
    } finally {
      setActionLoading(null);
    }
  };

  const handleMudarCargo = async (id: string, novoCargo: UserRole) => {
    if (id === currentUserId) {
      setMensagem({ tipo: 'erro', texto: 'Ação bloqueada: Você não pode rebaixar seu próprio cargo.' });
      return;
    }

    if (!window.confirm(`Confirmar alteração de permissão para ${novoCargo}?`)) return;

    try {
      setActionLoading(id);
      setMensagem(null);
      await usuariosService.atualizar(id, { role: novoCargo });
      setMensagem({ tipo: 'sucesso', texto: 'Cargo atualizado com sucesso.' });
      await carregarUsuarios();
    } catch (error: any) {
      setMensagem({ tipo: 'erro', texto: error.response?.data?.message || 'Falha ao alterar o cargo do usuário.' });
    } finally {
      setActionLoading(null);
    }
  };

  const formatarRole = (role: UserRole) => {
    const badges: Record<UserRole, JSX.Element> = {
      ADMIN: <span className="px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded text-xs font-semibold">Administrador</span>,
      PORTEIRO: <span className="px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded text-xs font-semibold">Portaria</span>,
      PROFESSOR: <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-xs font-semibold">Docente</span>,
    };
    return badges[role];
  };

  const usuariosFiltrados = Array.isArray(usuarios) ? usuarios.filter(u => {
    const matchBusca = u.nome.toLowerCase().includes(termoBusca.toLowerCase()) || u.email.toLowerCase().includes(termoBusca.toLowerCase());
    const matchRole = filtroRole === 'TODOS' || u.role === filtroRole;
    return matchBusca && matchRole;
  }) : [];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Users className="h-6 w-6 text-blue-500" />
            Gestão de Usuários
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            Controle de acessos, cargos e bloqueio de funcionários.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={carregarUsuarios}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition-colors border border-slate-700"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Atualizar
          </button>
          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors">
            + Cadastrar Usuário
          </button>
        </div>
      </div>

      {mensagem && (
        <div className={`p-4 rounded-lg flex items-center gap-3 text-sm font-medium ${
          mensagem.tipo === 'sucesso' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
        }`}>
          {mensagem.tipo === 'sucesso' ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          {mensagem.texto}
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          {error}
        </div>
      )}

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/20">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Buscar por nome ou e-mail..." 
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-lg text-sm text-white focus:border-blue-500 focus:outline-none"
            />
          </div>
          <select 
            value={filtroRole}
            onChange={(e) => setFiltroRole(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-300 focus:border-blue-500 focus:outline-none"
          >
            <option value="TODOS">Todos os Cargos</option>
            <option value="ADMIN">Administradores</option>
            <option value="PORTEIRO">Porteiros</option>
            <option value="PROFESSOR">Professores</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-800/50 text-slate-400">
              <tr>
                <th className="px-6 py-4 font-medium">Usuário</th>
                <th className="px-6 py-4 font-medium">Cargo (Nível de Acesso)</th>
                <th className="px-6 py-4 font-medium">Status da Conta</th>
                <th className="px-6 py-4 font-medium text-right">Ações Administrativas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && usuarios.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Sincronizando usuários...</td>
                </tr>
              ) : usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">Nenhum usuário encontrado.</td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const isCurrent = u.id === currentUserId;
                  
                  return (
                    <tr key={u.id} className={`hover:bg-slate-800/30 transition-colors ${!u.ativo ? 'opacity-60' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300">
                            {u.nome.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-slate-200">
                              {u.nome} {isCurrent && <span className="text-xs text-blue-400 ml-1">(Você)</span>}
                            </p>
                            <p className="text-xs text-slate-500">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <select 
                          value={u.role}
                          disabled={isCurrent || actionLoading === u.id}
                          onChange={(e) => handleMudarCargo(u.id, e.target.value as UserRole)}
                          className={`bg-transparent border border-slate-700 rounded p-1 text-xs font-semibold focus:outline-none focus:border-blue-500 ${isCurrent ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                        >
                          <option value="ADMIN" className="bg-slate-900 text-purple-400">Administrador</option>
                          <option value="PORTEIRO" className="bg-slate-900 text-blue-400">Portaria</option>
                          <option value="PROFESSOR" className="bg-slate-900 text-emerald-400">Docente</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-md border flex items-center w-fit gap-1.5 ${
                          u.ativo ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        }`}>
                          {u.ativo ? <Shield className="h-3 w-3" /> : <ShieldBan className="h-3 w-3" />}
                          {u.ativo ? 'Autorizado' : 'Bloqueado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(u.id, u.ativo)}
                          disabled={isCurrent || actionLoading === u.id}
                          title={isCurrent ? 'Não é possível alterar o próprio status' : 'Alterar status de acesso'}
                          className={`flex items-center justify-center p-2 rounded-md transition-colors ml-auto ${
                            isCurrent 
                              ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                              : u.ativo 
                                ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                        >
                          <UserCog className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}