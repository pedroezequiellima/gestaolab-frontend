// src/types/index.ts

// 1. Enums e Tipos Literais (Garante que só aceitaremos esses valores exatos)
export type UserRole = 'ADMIN' | 'PORTEIRO' | 'PROFESSOR';
export type StatusSala = 'DISPONIVEL' | 'OCUPADA' | 'MANUTENCAO';
export type TipoPonto = 'ENTRADA' | 'SAIDA_INTERVALO' | 'RETORNO_INTERVALO' | 'SAIDA';

// 2. Interface de Sessão (Usada nos Cookies e Contextos)
export interface UserSession {
  id: string;
  email: string;
  nome: string;
  role: UserRole;
}

// 3. Entidades Espelhadas do Backend
export interface Usuario {
  id: string;
  nome: string;
  email: string;
  role: UserRole;
  ativo: boolean;
  criadoEm: string;
}

export interface Sala {
  id: string;
  nome: string;
  bloco: string;
  capacidade: number;
  recursos: string[];
  status: StatusSala;
}

export interface Alocacao {
  id: string;
  salaId: string;
  professorId: string;
  inicio: string;
  fimPrevisto: string;
  devolucao: string | null;
  observacao?: string;
  sala?: Sala; // Trazido pelo Prisma Include
  professor?: Usuario; // Trazido pelo Prisma Include
}

export interface RegistroPonto {
  id: string;
  usuarioId: string;
  tipo: TipoPonto;
  criadoEm: string;
  usuario?: {
    nome: string;
    email: string;
  };
}