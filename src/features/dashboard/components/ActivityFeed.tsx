import { Upload, RefreshCw, Eye, Flame, Archive, Plus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Json } from "@/integrations/supabase/types";

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  metadata: Json | null;
  created_at: string | null;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
}

const actionConfig: Record<string, { icon: typeof Upload; color: string }> = {
  import: { icon: Upload, color: "var(--accent-teal)" },
  status_change: { icon: RefreshCw, color: "var(--accent-amber)" },
  create: { icon: Plus, color: "var(--semantic-success)" },
  view: { icon: Eye, color: "var(--accent-blue)" },
  spike_detected: { icon: Flame, color: "var(--semantic-spike)" },
  archive: { icon: Archive, color: "var(--text-muted)" },
};

function getActionLabel(action: string, entityType: string | null): string {
  const labels: Record<string, string> = {
    import: `Import de ${entityType ?? "dados"}`,
    status_change: `Status alterado em ${entityType ?? "oferta"}`,
    create: `${entityType ?? "Item"} criado`,
    spike_detected: "Spike detectado",
    archive: `${entityType ?? "Item"} arquivado`,
  };
  return labels[action] ?? action;
}

export function ActivityFeed({ activities, isLoading }: ActivityFeedProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 animate-shimmer rounded-lg p-2 h-10" />
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex items-center justify-center h-[120px] text-[color:var(--text-muted)] text-[length:var(--text-label)]">
        Nenhuma atividade recente
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map((item) => {
        const config = actionConfig[item.action] ?? actionConfig.create;
        const Icon = config.icon;

        return (
          <div
            key={item.id}
            className="flex items-center gap-3 rounded-[var(--radius-md)] px-2 py-2 hover:bg-[var(--bg-raised)] transition-colors"
          >
            <div
              className="rounded-md p-1"
              style={{ backgroundColor: `color-mix(in srgb, ${config.color} 12%, transparent)` }}
            >
              <Icon className="w-3.5 h-3.5" style={{ color: config.color }} />
            </div>

            <span className="flex-1 text-[length:var(--text-label)] text-[color:var(--text-body)] truncate">
              {getActionLabel(item.action, item.entity_type)}
            </span>

            <span className="text-[length:var(--text-caption)] text-[color:var(--text-muted)] flex-shrink-0">
              {item.created_at
                ? formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })
                : "—"}
            </span>
          </div>
        );
      })}
    </div>
  );
}
