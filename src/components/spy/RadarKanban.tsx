import { OfertaSpyCard } from './OfertaSpyCard';
import { useOfertasSpy, useUpdateOferta } from '@/hooks/useOfertas';
import { cn } from '@/lib/utils';

const COLUMNS = [
  { key: 'RADAR', label: '🔍 Radar', color: 'border-t-gray-500' },
  { key: 'TRIAGEM', label: '⚡ Triagem', color: 'border-t-yellow-500' },
  { key: 'DEEP_DIVE', label: '🎯 Deep Dive', color: 'border-t-blue-500' },
  { key: 'MONITORANDO', label: '👁️ Monitorando', color: 'border-t-purple-500' },
  { key: 'PRODUCAO', label: '🚀 Produção', color: 'border-t-green-500' },
];

export function RadarKanban() {
  const { data: ofertas, isLoading } = useOfertasSpy();
  const updateMutation = useUpdateOferta();

  const handleStatusChange = (id: string, newStatus: string) => {
    updateMutation.mutate({ id, data: { status_spy: newStatus } as any });
  };

  const handleDelete = (id: string) => {
    updateMutation.mutate({ id, data: { status_spy: 'ARQUIVADA' } as any });
  };

  const grouped = COLUMNS.map(col => ({
    ...col,
    items: (ofertas || []).filter((o: any) => (o.status_spy || 'RADAR') === col.key)
      .sort((a: any, b: any) => {
        const prioOrder: Record<string, number> = { URGENTE: 0, ALTA: 1, MEDIA: 2, BAIXA: 3 };
        return (prioOrder[a.prioridade] || 2) - (prioOrder[b.prioridade] || 2);
      }),
  }));

  if (isLoading) return <p className="text-muted-foreground">Carregando radar...</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {grouped.map(col => (
        <div key={col.key} className={cn('rounded-lg border border-t-4 p-3 space-y-3', col.color)}>
          {/* Column Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">{col.label}</h3>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {col.items.length}
            </span>
          </div>

          {/* Cards */}
          <div className="space-y-2">
            {col.items.map((oferta: any) => (
              <OfertaSpyCard
                key={oferta.id}
                oferta={oferta}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
                compact
              />
            ))}
            {col.items.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4">
                Nenhuma oferta
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
