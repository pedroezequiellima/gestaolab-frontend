// src/services/auth.service.ts
import { api } from '@/lib/api';
import { setCookie, deleteCookie } from 'cookies-next';
import { jwtDecode } from 'jwt-decode';
import { JWTPayload, UserSession } from '@/types';

export const authService = {
  async login(email: string, senha: string): Promise<UserSession> {
    // Comunicação com a API - O Axios já intercepta e trata erros globais
    const response = await api.post('/auth/login', { email, password: senha });
    const { accessToken } = response.data;

    // Decodifica o payload do JWT para pegar a Role e os dados do usuário
    const decoded = jwtDecode<JWTPayload>(accessToken);
    
    const userData: UserSession = {
      id: decoded.sub,
      email: decoded.email,
      nome: decoded.nome,
      role: decoded.role,
    };

    // Configurações de Segurança de Produção para os Cookies
    const cookieOptions = {
      maxAge: 60 * 60 * 24, // 1 dia de duração
      path: '/',
      secure: process.env.NODE_ENV === 'production', // true em produção (exige HTTPS)
      sameSite: 'lax' as const, // Mitigação primária contra CSRF
    };

    // Armazena o Token e os Dados
    setCookie('gestaolab_token', accessToken, cookieOptions);
    setCookie('gestaolab_user', JSON.stringify(userData), cookieOptions);

    return userData;
  },

  logout() {
    deleteCookie('gestaolab_token');
    deleteCookie('gestaolab_user');
    // Força o reload da página para limpar qualquer estado na memória do React
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
};