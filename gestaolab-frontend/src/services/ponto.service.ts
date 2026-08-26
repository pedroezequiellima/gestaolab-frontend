// src/services/ponto.service.ts
import { api } from '@/lib/api';
import { RegistroPonto, TipoPonto } from '@/types';

export const pontoService = {
  // O backend extrai a identidade do JWT (Mitigação de IDOR e Privilege Escalation)
  async registrar(tipo: TipoPonto): Promise<RegistroPonto> {
    const response = await api.post<RegistroPonto>('/ponto', { tipo });
    return response.data;
  },

  // Busca apenas os registros atrelados à sessão atual
  async listarMeusRegistros(): Promise<RegistroPonto[]> {
    const response = await api.get<RegistroPonto[]>('/ponto/meus-registros');
    return response.data;
  }
};