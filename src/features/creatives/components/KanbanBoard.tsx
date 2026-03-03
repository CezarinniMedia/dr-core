import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useUpdateCriativoStatus, useDuplicateCriativo } from "@/features/creatives/hooks/useCriativos";
import { Copy, FileText, FlaskConical, Trophy, X, Zap, MoreHorizontal } from "lucide-react";
import { ReactNode, useCallback, useRef, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";
import type { DecisionMetrics } from "@/features/creatives/hooks/useCreativeDecision";

// --- Types ---

export interface Criativo {
  id: string;
  nome: string;
  hook_text: string;
  status: string | null;
  plataforma: string | null;
  tipo: string;
  thumbnail_url: string | null;
  oferta_id: string;
  copy_body?: string | null;
  copy_headline?: string | null;
  cta?: string | null;
  angulo?: string | null;
  tags?: string[] | null;
  decision_metrics?: DecisionMetrics | null;
  decision_notes?: string | null;
  decided_at?: string | null;
  test_started_at?: string | null;
}

interface KanbanBoardProps {
  criativos: Criativo[];
  onRequestDecision?: (criativo: Criativo) => void;
}

// --- Column config ---

type ColumnId = "DRAFT" | "TEST" | "WINNER" | "KILLED";

interface ColumnConfig {
  id: ColumnId;
  label: string;
  icon: ReactNode;
  color: string;
  borderColor: string;
  badgeBg: string;
  badgeText: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: "DRAFT",
    label: "Draft",
    icon: <FileText className="h-3.5 w-3.5" />,
    color: "#6B7280",
    borderColor: "border-[#6B7280]",
    badgeBg: "bg-[rgba(107,114,128,0.1)]",
    badgeText: "text-[#6B7280]",
  },
  {
    id: "TEST",
    label: "Test",
    icon: <FlaskConical className="h-3.5 w-3.5" />,
    color: "#7C3AED",
    borderColor: "border-[#7C3AED]",
    badgeBg: "bg-[rgba(124,58,237,0.1)]",
    badgeText: "text-[#7C3AED]",
  },
  {
    id: "WINNER",
    label: "Winner",
    icon: <Trophy className="h-3.5 w-3.5" />,
    color: "#C4954A",
    borderColor: "border-[#C4954A]",
    badgeBg: "bg-[rgba(196,149,74,0.1)]",
    badgeText: "text-[#C4954A]",
  },
  {
    id: "KILLED",
    label: "Killed",
    icon: <X className="h-3.5 w-3.5" />,
    color: "#EF4444",
    borderColor: "border-[#EF4444]",
    badgeBg: "bg-[rgba(239,68,68,0.1)]",
    badgeText: "text-[#EF4444]",
  },
];

// --- DnD rules ---

const ALLOWED_TRANSITIONS: Record<string, ColumnId[]> = {
  DRAFT: ["TEST"],
  TEST: ["DRAFT", "WINNER", "KILLED"],
  WINNER: ["TEST"],
  KILLED: ["TEST"],
};

const DECISION_REQUIRED: Array<[string, ColumnId]> = [
  ["TEST", "WINNER"],
  ["TEST", "KILLED"],
];

function isTransitionAllowed(from: string, to: ColumnId): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false;
}

function needsDecision(from: string, to: ColumnId): boolean {
  return DECISION_REQUIRED.some(([f, t]) => f === from && t === to);
}

// --- Helpers ---

function getDaysInTest(testStartedAt: string | null | undefined): number | null {
  if (!testStartedAt) return null;
  const start = new Date(testStartedAt);
  const now = new Date();
  return Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

// --- Component ---

export function KanbanBoard({ criativos, onRequestDecision }: KanbanBoardProps) {
  const updateStatus = useUpdateCriativoStatus();
  const duplicateMutation = useDuplicateCriativo();
  const [draggingOver, setDraggingOver] = useState<ColumnId | null>(null);
  const [draggingFrom, setDraggingFrom] = useState<string | null>(null);
  const dragCriativoRef = useRef<Criativo | null>(null);

  const handleDragStart = useCallback((e: React.DragEvent, criativo: Criativo) => {
    e.dataTransfer.setData("criativoId", criativo.id);
    e.dataTransfer.effectAllowed = "move";
    setDraggingFrom(criativo.status || "DRAFT");
    dragCriativoRef.current = criativo;
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, targetColumn: ColumnId) => {
    e.preventDefault();
    setDraggingOver(null);
    setDraggingFrom(null);

    const criativo = dragCriativoRef.current;
    dragCriativoRef.current = null;
    if (!criativo) return;

    const fromStatus = criativo.status || "DRAFT";
    if (fromStatus === targetColumn) return;

    if (!isTransitionAllowed(fromStatus, targetColumn)) return;

    if (needsDecision(fromStatus, targetColumn) && onRequestDecision) {
      onRequestDecision(criativo);
      return;
    }

    updateStatus.mutate({ id: criativo.id, status: targetColumn });
  }, [updateStatus, onRequestDecision]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent, colId: ColumnId) => {
    e.preventDefault();
    setDraggingOver(colId);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent, colId: ColumnId) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggingOver(prev => prev === colId ? null : prev);
    }
  }, []);

  const handleDuplicate = useCallback((e: React.MouseEvent, criativo: Criativo) => {
    e.stopPropagation();
    duplicateMutation.mutate({
      id: criativo.id,
      oferta_id: criativo.oferta_id,
      nome: criativo.nome,
      tipo: criativo.tipo,
      hook_text: criativo.hook_text,
      copy_body: criativo.copy_body,
      copy_headline: criativo.copy_headline,
      cta: criativo.cta,
      plataforma: criativo.plataforma,
      angulo: criativo.angulo,
      tags: criativo.tags,
    });
  }, [duplicateMutation]);

  const getDropZoneStyle = (colId: ColumnId): string => {
    if (!draggingOver || draggingOver !== colId || !draggingFrom) {
      return "border-transparent";
    }
    const allowed = isTransitionAllowed(draggingFrom, colId);
    if (allowed) return "border-[var(--accent-green)] bg-[rgba(34,197,94,0.05)]";
    return "border-[var(--semantic-error)] bg-[rgba(239,68,68,0.05)]";
  };

  return (
    <div
      className="grid gap-4 overflow-x-auto"
      style={{ gridTemplateColumns: "repeat(4, minmax(240px, 1fr))" }}
    >
      {COLUMNS.map((col) => {
        const items = criativos?.filter(
          (c) => (c.status || "DRAFT") === col.id
        ) || [];

        return (
          <div
            key={col.id}
            className={`rounded-lg min-h-[300px] transition-all duration-200 border-2 border-dashed ${getDropZoneStyle(col.id)}`}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
          >
            {/* Column header with LED strip */}
            <div
              className="flex items-center justify-between pb-3 mb-3"
              style={{ borderBottom: `2px solid ${col.color}` }}
            >
              <div className="flex items-center gap-1.5" style={{ color: "var(--text-primary)" }}>
                <span style={{ color: col.color }}>{col.icon}</span>
                <span className="text-base font-semibold">{col.label}</span>
              </div>
              <span
                className={`text-[11px] px-2 py-0.5 rounded ${col.badgeBg} ${col.badgeText}`}
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="space-y-3 px-1">
              {items.map((criativo) => (
                <CreativeCard
                  key={criativo.id}
                  criativo={criativo}
                  columnId={col.id}
                  onDragStart={handleDragStart}
                  onDuplicate={handleDuplicate}
                  onRequestDecision={onRequestDecision}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// --- Card components by state ---

interface CreativeCardProps {
  criativo: Criativo;
  columnId: ColumnId;
  onDragStart: (e: React.DragEvent, criativo: Criativo) => void;
  onDuplicate: (e: React.MouseEvent, criativo: Criativo) => void;
  onRequestDecision?: (criativo: Criativo) => void;
}

function CreativeCard({ criativo, columnId, onDragStart, onDuplicate, onRequestDecision }: CreativeCardProps) {
  if (columnId === "WINNER") return <WinnerCard criativo={criativo} onDragStart={onDragStart} onDuplicate={onDuplicate} />;
  if (columnId === "KILLED") return <KilledCard criativo={criativo} onDragStart={onDragStart} />;
  if (columnId === "TEST") return <TestCard criativo={criativo} onDragStart={onDragStart} onDuplicate={onDuplicate} onRequestDecision={onRequestDecision} />;
  return <BaseCard criativo={criativo} onDragStart={onDragStart} onDuplicate={onDuplicate} />;
}

// --- Base Card (DRAFT) ---

function BaseCard({ criativo, onDragStart, onDuplicate }: {
  criativo: Criativo;
  onDragStart: (e: React.DragEvent, criativo: Criativo) => void;
  onDuplicate: (e: React.MouseEvent, criativo: Criativo) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, criativo)}
      className="group rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      <CardThumbnail criativo={criativo} />
      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {criativo.nome}
          </p>
          <CardActions criativo={criativo} onDuplicate={onDuplicate} />
        </div>
        {criativo.angulo && <AnguloBadge angulo={criativo.angulo} />}
        <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
          {criativo.hook_text}
        </p>
        <CardBadges criativo={criativo} />
      </div>
    </div>
  );
}

// --- Test Card ---

function TestCard({ criativo, onDragStart, onDuplicate, onRequestDecision }: {
  criativo: Criativo;
  onDragStart: (e: React.DragEvent, criativo: Criativo) => void;
  onDuplicate: (e: React.MouseEvent, criativo: Criativo) => void;
  onRequestDecision?: (criativo: Criativo) => void;
}) {
  const days = getDaysInTest(criativo.test_started_at);
  const isOverdue = days !== null && days > 3;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, criativo)}
      className="group rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5 relative"
      style={{
        background: "var(--bg-surface)",
        border: isOverdue
          ? "1px solid var(--semantic-warning)"
          : "1px solid var(--border-default)",
        boxShadow: isOverdue
          ? "0 0 8px rgba(234, 179, 8, 0.1)"
          : undefined,
      }}
    >
      {/* Thumbnail with overdue badge */}
      <div className="relative">
        <CardThumbnail criativo={criativo} />
        {isOverdue && (
          <div
            className="absolute top-0 right-0 text-[11px] font-semibold px-2 py-1"
            style={{
              background: "var(--semantic-warning)",
              color: "var(--bg-base)",
              borderRadius: "0 12px 0 6px",
            }}
          >
            ! &gt;72h
          </div>
        )}
      </div>

      <div className="p-3 space-y-1.5">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {criativo.nome}
          </p>
          <CardActions criativo={criativo} onDuplicate={onDuplicate} />
        </div>
        {criativo.angulo && <AnguloBadge angulo={criativo.angulo} />}

        {/* Days in test */}
        {days !== null && (
          <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
            {days}d em teste
          </p>
        )}

        <CardBadges criativo={criativo} />
      </div>

      {/* Footer with Decide button for overdue */}
      {isOverdue && onRequestDecision && (
        <div
          className="px-3 py-2 flex justify-end"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <Button
            variant="outline"
            size="sm"
            className="text-xs gap-1"
            style={{ borderColor: "var(--semantic-warning)", color: "var(--semantic-warning)" }}
            onClick={(e) => {
              e.stopPropagation();
              onRequestDecision(criativo);
            }}
          >
            <Zap className="h-3 w-3" />
            Decidir
          </Button>
        </div>
      )}
    </div>
  );
}

// --- Winner Card ---

function WinnerCard({ criativo, onDragStart, onDuplicate }: {
  criativo: Criativo;
  onDragStart: (e: React.DragEvent, criativo: Criativo) => void;
  onDuplicate: (e: React.MouseEvent, criativo: Criativo) => void;
}) {
  const metrics = criativo.decision_metrics as DecisionMetrics | null;

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, criativo)}
      className="group rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 hover:-translate-y-0.5"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--accent-gold)",
        borderBottom: "3px solid var(--accent-gold)",
        boxShadow: "0 0 0 1px rgba(196,149,74,0.2), 0 0 20px rgba(196,149,74,0.08)",
      }}
    >
      {/* Thumbnail with trophy badge */}
      <div className="relative">
        <CardThumbnail criativo={criativo} />
        <div
          className="absolute top-0 right-0 flex items-center gap-1 text-[11px] font-bold uppercase px-2.5 py-1"
          style={{
            background: "linear-gradient(135deg, var(--accent-gold), var(--accent-amber))",
            color: "var(--bg-base)",
            borderRadius: "0 12px 0 6px",
          }}
        >
          <Trophy className="h-3 w-3" />
          WINNER
        </div>
      </div>

      <div className="p-3 space-y-2">
        <div className="flex items-start justify-between gap-1">
          <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
            {criativo.nome}
          </p>
          <CardActions criativo={criativo} onDuplicate={onDuplicate} />
        </div>
        {criativo.angulo && <AnguloBadge angulo={criativo.angulo} />}

        {/* Metrics grid */}
        {metrics && (
          <div className="grid grid-cols-3 gap-1 mt-2">
            <MetricCell label="CTR" value={metrics.ctr !== null ? `${metrics.ctr}%` : "—"} highlight={false} />
            <MetricCell label="CPA" value={metrics.cpa !== null ? `R$${metrics.cpa}` : "—"} highlight={false} />
            <MetricCell label="ROAS" value={metrics.roas !== null ? `${metrics.roas}x` : "—"} highlight />
          </div>
        )}
      </div>
    </div>
  );
}

function MetricCell({ label, value, highlight }: { label: string; value: string; highlight: boolean }) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase" style={{ color: "var(--text-muted)" }}>{label}</p>
      <p
        className="text-sm font-semibold"
        style={{ color: highlight ? "var(--accent-gold)" : "var(--accent-green)" }}
      >
        {value}
      </p>
    </div>
  );
}

// --- Killed Card ---

function KilledCard({ criativo, onDragStart }: {
  criativo: Criativo;
  onDragStart: (e: React.DragEvent, criativo: Criativo) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, criativo)}
      className="group rounded-xl cursor-grab active:cursor-grabbing transition-all duration-200 opacity-65 hover:opacity-85"
      style={{
        background: "var(--bg-surface)",
        border: "1px solid var(--border-default)",
      }}
    >
      {/* Thumbnail desaturated */}
      <div className="relative">
        <CardThumbnail criativo={criativo} grayscale />
        <div
          className="absolute top-0 right-0 flex items-center gap-1 text-[11px] font-semibold px-2 py-1"
          style={{
            background: "rgba(239,68,68,0.2)",
            color: "var(--semantic-error)",
            borderRadius: "0 12px 0 6px",
          }}
        >
          <X className="h-3 w-3" />
          KILLED
        </div>
      </div>

      <div className="p-3 space-y-1.5">
        <p className="text-sm font-medium truncate" style={{ color: "var(--text-primary)" }}>
          {criativo.nome}
        </p>
        {criativo.angulo && <AnguloBadge angulo={criativo.angulo} />}

        {/* Learning snippet */}
        {criativo.decision_notes && (
          <div
            className="mt-2 p-1.5 rounded"
            style={{
              background: "var(--bg-subtle)",
              borderLeft: "2px solid var(--semantic-error)",
            }}
          >
            <p className="text-[10px] uppercase mb-0.5" style={{ color: "var(--text-muted)" }}>
              Learning:
            </p>
            <p className="text-xs line-clamp-2" style={{ color: "var(--text-secondary)" }}>
              {criativo.decision_notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Shared sub-components ---

function CardThumbnail({ criativo, grayscale }: { criativo: Criativo; grayscale?: boolean }) {
  if (!criativo.thumbnail_url) {
    return (
      <div
        className="w-full h-[120px] flex items-center justify-center"
        style={{
          background: "var(--bg-subtle)",
          borderRadius: "12px 12px 0 0",
          filter: grayscale ? "grayscale(60%)" : undefined,
        }}
      >
        <FileText className="h-8 w-8" style={{ color: "var(--text-muted)" }} />
      </div>
    );
  }

  return (
    <img
      src={criativo.thumbnail_url}
      alt={criativo.nome}
      className="w-full h-[120px] object-cover"
      style={{
        borderRadius: "12px 12px 0 0",
        filter: grayscale ? "grayscale(60%)" : undefined,
      }}
    />
  );
}

function AnguloBadge({ angulo }: { angulo: string }) {
  return (
    <span
      className="inline-block text-[11px] px-2 py-0.5 rounded mt-1"
      style={{
        background: "var(--accent-primary-10, rgba(124,58,237,0.1))",
        color: "var(--accent-primary-light)",
      }}
    >
      {angulo}
    </span>
  );
}

function CardBadges({ criativo }: { criativo: Criativo }) {
  return (
    <div className="flex gap-1 flex-wrap mt-1">
      {criativo.plataforma && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0">
          {criativo.plataforma}
        </Badge>
      )}
      <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
        {criativo.tipo}
      </Badge>
    </div>
  );
}

function CardActions({ criativo, onDuplicate }: {
  criativo: Criativo;
  onDuplicate: (e: React.MouseEvent, criativo: Criativo) => void;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={(e) => onDuplicate(e, criativo)}
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-0.5 rounded hover:bg-[var(--bg-subtle)]"
        >
          <Copy className="h-3.5 w-3.5" style={{ color: "var(--text-muted)" }} />
        </button>
      </TooltipTrigger>
      <TooltipContent>Duplicar criativo</TooltipContent>
    </Tooltip>
  );
}
