// src/types/index.ts

export type UserRole = 'ADMIN' | 'PORTEIRO' | 'PROFESSOR';

// O que vem dentro do token decodificado
export interface JWTPayload {
  sub: string;
  email: string;
  nome: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// O que salvamos no cookie para o frontend usar
export interface UserSession {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
}

export type StatusSala = 'DISPONIVEL' | 'OCUPADA' | 'MANUTENCAO';

export interface Sala {
  id: string;
  nome: string;
  bloco: string;
  capacidade: number;
  recursos: string[];
  status: StatusSala;
}

export type TipoPonto = 'ENTRADA' | 'SAIDA_INTERVALO' | 'RETORNO_INTERVALO' | 'SAIDA';

export interface RegistroPonto {
  id: string;
  usuarioId: string;
  tipo: TipoPonto;
  timestamp: string;
  usuario?: {
    nome: string;
    email: string;
  };
}

export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
}

export interface Alocacao {
  id: string;
  salaId: string;
  professorId: string;
  inicio: string;
  fimPrevisto: string;
  devolucao: string | null;
  observacao?: string;
  sala?: Sala;
  professor?: Usuario;
}