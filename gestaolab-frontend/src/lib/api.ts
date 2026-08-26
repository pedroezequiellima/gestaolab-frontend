// src/lib/api.ts
import axios from 'axios';
import { getCookie, deleteCookie } from 'cookies-next';

// 1. Instância Base
export const api = axios.create({
  // Em produção, isso garante que não apontemos pro localhost por engano
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // Segurança: Previne que requisições presas congelem o navegador
});

// 2. Interceptor de Requisição (O Injetor de Chave)
api.interceptors.request.use(
  (config) => {
    // Busca o token do cookie de forma segura no Client-Side
    const token = getCookie('gestaolab_token');

    // Se o token existe, injeta no cabeçalho de Autorização
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 3. Interceptor de Resposta (O Escudo de Autenticação)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Se o backend nos retornar 401 (Não Autorizado) e estivermos no navegador...
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      
      // Exclui imediatamente as credenciais vazadas ou expiradas
      deleteCookie('gestaolab_token');
      deleteCookie('gestaolab_user');

      // Redirecionamento forçado limpando a memória do React (hard reload)
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);