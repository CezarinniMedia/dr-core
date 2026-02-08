import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  ExternalLink, TrendingUp, TrendingDown, Minus,
  Globe, ShoppingCart, Video, HelpCircle, MoreHorizontal
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { TrafficMiniChart } from '@/components/traffic/TrafficMiniChart';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';

const statusSpyConfig: Record<string, { label: string; color: string; icon: string }> = {
  RADAR: { label: 'Radar', color: 'bg-gray-500', icon: '🔍' },
  TRIAGEM: { label: 'Triagem', color: 'bg-yellow-500', icon: '⚡' },
  DEEP_DIVE: { label: 'Deep Dive', color: 'bg-blue-500', icon: '🎯' },
  MONITORANDO: { label: 'Monitorando', color: 'bg-purple-500', icon: '👁️' },
  PRODUCAO: { label: 'Produção', color: 'bg-green-500', icon: '🚀' },
  ARQUIVADA: { label: 'Arquivada', color: 'bg-gray-700', icon: '📦' },
};

const prioridadeConfig: Record<string, { label: string; color: string }> = {
  URGENTE: { label: '🔴 Urgente', color: 'text-red-400' },
  ALTA: { label: '🟠 Alta', color: 'text-orange-400' },
  MEDIA: { label: '🟡 Média', color: 'text-yellow-400' },
  BAIXA: { label: '🟢 Baixa', color: 'text-green-400' },
};

interface OfertaSpyCardProps {
  oferta: {
    id: string;
    nome: string;
    dominio_principal?: string;
    nicho?: string;
    status_spy: string;
    prioridade: string;
    trafego_atual?: number;
    trafego_tendencia?: number;
    checkout_provider?: string;
    vsl_player?: string;
    tem_quiz?: boolean;
    score_potencial?: number;
    tags?: string[];
    created_at: string;
    _count_dominios?: number;
    _count_fontes?: number;
  };
  onStatusChange: (id: string, newStatus: string) => void;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export function OfertaSpyCard({ oferta, onStatusChange, onDelete, compact = false }: OfertaSpyCardProps) {
  const navigate = useNavigate();
  const status = statusSpyConfig[oferta.status_spy] || statusSpyConfig.RADAR;
  const prio = prioridadeConfig[oferta.prioridade] || prioridadeConfig.MEDIA;

  const TrendIcon = oferta.trafego_tendencia && oferta.trafego_tendencia > 5
    ? TrendingUp
    : oferta.trafego_tendencia && oferta.trafego_tendencia < -5
    ? TrendingDown
    : Minus;

  const trendColor = oferta.trafego_tendencia && oferta.trafego_tendencia > 5
    ? 'text-green-400'
    : oferta.trafego_tendencia && oferta.trafego_tendencia < -5
    ? 'text-red-400'
    : 'text-muted-foreground';

  const formatTraffic = (n?: number) => {
    if (!n) return '—';
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <Card className="p-3 space-y-2 hover:shadow-md transition-shadow cursor-pointer">
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1" onClick={() => navigate(`/ofertas/${oferta.id}`)}>
          <p className="font-semibold text-sm truncate">{oferta.nome}</p>
          {oferta.dominio_principal && (
            <a
              href={`https://${oferta.dominio_principal}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline flex items-center gap-1"
              onClick={(e) => e.stopPropagation()}
            >
              <ExternalLink className="h-3 w-3" />
              {oferta.dominio_principal}
            </a>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {Object.entries(statusSpyConfig).map(([key, cfg]) => (
              <DropdownMenuItem key={key} onClick={() => onStatusChange(oferta.id, key)}>
                {cfg.icon} Mover para {cfg.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onDelete(oferta.id)}>
              Arquivar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Nicho + Prioridade */}
      <div className="flex items-center gap-2 flex-wrap">
        {oferta.nicho && (
          <Badge variant="outline" className="text-[10px]">{oferta.nicho}</Badge>
        )}
        <span className={cn('text-[10px] font-medium', prio.color)}>{prio.label}</span>
      </div>

      {/* Métricas */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1">
          <Globe className="h-3 w-3 text-muted-foreground" />
          <span className="font-medium">{formatTraffic(oferta.trafego_atual)}</span>
          {oferta.trafego_tendencia !== undefined && oferta.trafego_tendencia !== null && (
            <span className={cn('flex items-center gap-0.5', trendColor)}>
              <TrendIcon className="h-3 w-3" />
              {oferta.trafego_tendencia > 0 ? '+' : ''}{oferta.trafego_tendencia?.toFixed(0)}%
            </span>
          )}
        </div>
        {oferta.score_potencial && (
          <span className="text-[10px]">⭐ {oferta.score_potencial}/10</span>
        )}
      </div>

      {/* Sparkline */}
      {oferta.dominio_principal && (
        <TrafficMiniChart dominio={oferta.dominio_principal} />
      )}

      {/* Stack Icons */}
      {!compact && (
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          {oferta.checkout_provider && (
            <span className="flex items-center gap-0.5">
              <ShoppingCart className="h-3 w-3" /> {oferta.checkout_provider}
            </span>
          )}
          {oferta.vsl_player && (
            <span className="flex items-center gap-0.5">
              <Video className="h-3 w-3" /> {oferta.vsl_player}
            </span>
          )}
          {oferta.tem_quiz && (
            <span className="flex items-center gap-0.5">
              <HelpCircle className="h-3 w-3" /> Quiz
            </span>
          )}
        </div>
      )}

      {/* Tags */}
      {!compact && oferta.tags && (oferta.tags as string[]).length > 0 && (
        <div className="flex flex-wrap gap-1">
          {(oferta.tags as string[]).slice(0, 3).map((tag, i) => (
            <span key={i} className="bg-muted text-muted-foreground text-[9px] px-1.5 py-0.5 rounded">
              {tag}
            </span>
          ))}
          {(oferta.tags as string[]).length > 3 && (
            <span className="text-[9px] text-muted-foreground">
              +{(oferta.tags as string[]).length - 3}
            </span>
          )}
        </div>
      )}
    </Card>
  );
}
