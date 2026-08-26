// src/services/auth.service.ts
import { api } from '@/lib/api';
import { setCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, UserSession } from '@/types';

export const authService = {
  async login(email: string, senha: string): Promise<UserSession> {
    const response = await api.post('/auth/login', { email, password: senha });
    
    // 🛡️ BLINDAGEM: Procura o token em várias camadas possíveis do JSON
    const accessToken = response.data?.tokens?.accessToken || response.data?.accessToken || response.data?.tokens;
    
    if (!accessToken) {
      throw new Error("Falha na comunicação: Token não encontrado na resposta da API.");
    }

    // Agora o Token JWT contém toda a verdade
    const decoded = jwtDecode<JWTPayload>(accessToken);
    
    const userData: UserSession = {
      id: decoded.sub,
      email: decoded.email,
      nome: decoded.nome || 'Usuário', 
      role: decoded.role || 'Indefinido', 
    };

    const cookieOptions = {
      maxAge: 60 * 60 * 24, // 1 dia
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax' as const,
    };

    setCookie('gestaolab_token', accessToken, cookieOptions);
    setCookie('gestaolab_user', JSON.stringify(userData), cookieOptions);

    return userData;
  },

  logout() {
    deleteCookie('gestaolab_token');
    deleteCookie('gestaolab_user');
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};