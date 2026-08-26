// src/services/salas.service.ts
import { api } from '@/lib/api';
import { Sala, StatusSala } from '@/types';

export const salasService = {
  // Lista todas as salas. O interceptor do Axios garante o envio do JWT seguro.
  async listarTodas(): Promise<Sala[]> {
    const response = await api.get<Sala[]>('/salas');
    return response.data;
  },

  // Busca uma sala específica
  async buscarPorId(id: string): Promise<Sala> {
    const response = await api.get<Sala>(`/salas/${id}`);
    return response.data;
  },

  // Atualiza apenas o status (Patch é mais seguro que Put para evitar Mass Assignment no frontend)
  async atualizarStatus(id: string, status: StatusSala): Promise<Sala> {
    const response = await api.patch<Sala>(`/salas/${id}/status`, { status });
    return response.data;
  }
};