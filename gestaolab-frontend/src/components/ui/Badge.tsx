// src/components/ui/Badge.tsx
import { StatusSala } from '@/types';

interface BadgeProps {
  status: StatusSala;
}

export function StatusBadge({ status }: BadgeProps) {
  const styles: Record<StatusSala, string> = {
    DISPONIVEL: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    OCUPADA: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
    MANUTENCAO: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  };

  const labels: Record<StatusSala, string> = {
    DISPONIVEL: 'Disponível',
    OCUPADA: 'Em Uso',
    MANUTENCAO: 'Em Manutenção',
  };

  return (
    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  );
}