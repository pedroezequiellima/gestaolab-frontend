// src/services/ponto.service.ts
import { api } from '@/lib/api';
import { RegistroPonto, TipoPonto } from '@/types';

export const pontoService = {
  async registrar(tipo: TipoPonto): Promise<RegistroPonto> {
    const response = await api.post<RegistroPonto>('/ponto', { tipo });
    return response.data;
  },

  async listarMeusRegistros(): Promise<RegistroPonto[]> {
    const response = await api.get<RegistroPonto[]>('/ponto/meus-registros');
    return response.data;
  },

  // NOVO: Endpoint restrito a administradores (O backend valida a Role via JWT)
  async listarTodos(): Promise<RegistroPonto[]> {
    const response = await api.get<RegistroPonto[]>('/ponto/todos');
    return response.data;
  }
};