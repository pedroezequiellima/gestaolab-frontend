// src/services/usuarios.service.ts
import { api } from '@/lib/api';
import { Usuario } from '@/types';

export const usuariosService = {
  // Lista todos os usuários do sistema
  async listarTodos(): Promise<Usuario[]> {
    const response = await api.get<Usuario[]>('/usuarios');
    return response.data;
  },

  // Busca um usuário específico
  async buscarPorId(id: string): Promise<Usuario> {
    const response = await api.get<Usuario>(`/usuarios/${id}`);
    return response.data;
  },

  // Atualiza dados permitidos de um usuário (Evita Mass Assignment)
  async atualizar(id: string, dados: Partial<Usuario>): Promise<Usuario> {
    const response = await api.patch<Usuario>(`/usuarios/${id}`, dados);
    return response.data;
  }
};