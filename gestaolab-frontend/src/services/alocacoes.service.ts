// src/services/alocacoes.service.ts
import { api } from '@/lib/api';
import { Alocacao } from '@/types';

export const alocacoesService = {
  // Busca o histórico e as alocações ativas
  async listarTodas(): Promise<Alocacao[]> {
    const response = await api.get<Alocacao[]>('/alocacoes');
    return response.data;
  },

  // Registra a retirada de uma chave
  async registrarRetirada(dados: { salaId: string; professorId: string; fimPrevisto: string; observacao?: string }): Promise<Alocacao> {
    const response = await api.post<Alocacao>('/alocacoes', dados);
    return response.data;
  },

  // Registra a devolução da chave (Patch é seguro pois altera apenas o campo específico)
  async registrarDevolucao(id: string): Promise<Alocacao> {
    const response = await api.patch<Alocacao>(`/alocacoes/${id}/devolucao`);
    return response.data;
  }
};