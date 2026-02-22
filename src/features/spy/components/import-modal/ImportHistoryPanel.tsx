import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Clock, CheckCircle, XCircle, Loader2, RotateCw,
  FileSpreadsheet, ChevronDown, ChevronUp, AlertTriangle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Collapsible, CollapsibleContent, CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { useImportHistory, type ImportJob } from "@/features/spy/hooks/useImportHistory";

interface ImportHistoryPanelProps {
  onReImport?: (job: ImportJob) => void;
}

const STATUS_CONFIG: Record<string, { icon: React.ElementType; label: string; className: string }> = {
  completed: { icon: CheckCircle, label: "Concluido", className: "text-[var(--accent-green)] bg-[rgba(34,197,94,0.1)]" },
  processing: { icon: Loader2, label: "Processando", className: "text-[var(--accent-blue)] bg-[rgba(59,130,246,0.1)]" },
  failed: { icon: XCircle, label: "Falhou", className: "text-[var(--semantic-error)] bg-[rgba(239,68,68,0.1)]" },
  partial: { icon: AlertTriangle, label: "Parcial", className: "text-[var(--semantic-warning)] bg-[rgba(234,179,8,0.1)]" },
  pending: { icon: Clock, label: "Pendente", className: "text-[var(--text-muted)] bg-[rgba(107,114,128,0.1)]" },
};

function JobStatusBadge({ status }: { status: string | null }) {
  const config = STATUS_CONFIG[status ?? "pending"] ?? STATUS_CONFIG.pending;
  const Icon = config.icon;
  return (
    <Badge variant="outline" className={`gap-1 text-xs border-0 ${config.className}`}>
      <Icon className={`h-3 w-3 ${status === "processing" ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}

function formatNumber(n: number | null) {
  if (n == null) return "—";
  return n.toLocaleString("pt-BR");
}

function JobCard({ job, onReImport }: { job: ImportJob; onReImport?: (job: ImportJob) => void }) {
  const [open, setOpen] = useState(false);
  const errorMsg = job.erro_mensagem || job.erro_msg;
  const hasConfig = job.config && Object.keys(job.config).length > 0;

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="border border-[var(--border-default)] rounded-[var(--radius-md)] bg-[var(--bg-surface)] overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[var(--bg-subtle)] transition-colors duration-[var(--duration-fast)] text-left">
            <FileSpreadsheet className="h-4 w-4 text-[var(--text-muted)] shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-body)] truncate">
                  {job.arquivo_nome || job.tipo}
                </span>
                <JobStatusBadge status={job.status} />
              </div>
              <div className="flex items-center gap-3 text-xs text-[var(--text-muted)] mt-0.5">
                <span>{job.tipo}</span>
                {job.created_at && (
                  <span>
                    {formatDistanceToNow(new Date(job.created_at), { addSuffix: true, locale: ptBR })}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {job.status === "failed" && onReImport && hasConfig && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1 text-[var(--accent-primary)]"
                  onClick={(e) => { e.stopPropagation(); onReImport(job); }}
                  title="Re-executar esta importacao"
                >
                  <RotateCw className="h-3 w-3" /> Retry
                </Button>
              )}
              {open ? <ChevronUp className="h-4 w-4 text-[var(--text-muted)]" /> : <ChevronDown className="h-4 w-4 text-[var(--text-muted)]" />}
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-3 pt-1 border-t border-[var(--border-default)]">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <Stat label="Total linhas" value={formatNumber(job.total_linhas)} />
              <Stat label="Processadas" value={formatNumber(job.linhas_processadas)} />
              <Stat label="Importadas" value={formatNumber(job.linhas_importadas)} />
              <Stat label="Erros" value={formatNumber(job.linhas_erro)} error={!!job.linhas_erro && job.linhas_erro > 0} />
              <Stat label="Ofertas criadas" value={formatNumber(job.ofertas_novas_criadas ?? job.ofertas_criadas)} />
              <Stat label="Ofertas atualizadas" value={formatNumber(job.ofertas_existentes_atualizadas ?? job.ofertas_atualizadas)} />
              <Stat label="Dominios novos" value={formatNumber(job.dominios_novos)} />
              <Stat label="Ignoradas" value={formatNumber(job.linhas_ignoradas)} />
            </div>

            {errorMsg && (
              <div className="mt-2 p-2 rounded bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.2)] text-xs text-[var(--semantic-error)]">
                {errorMsg}
              </div>
            )}

            {job.completed_at && (
              <div className="mt-2 text-xs text-[var(--text-muted)]">
                Concluido: {new Date(job.completed_at).toLocaleString("pt-BR")}
              </div>
            )}
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

function Stat({ label, value, error }: { label: string; value: string; error?: boolean }) {
  return (
    <div>
      <div className="text-[var(--text-muted)]">{label}</div>
      <div className={`font-medium ${error ? "text-[var(--semantic-error)]" : "text-[var(--text-body)]"}`}>{value}</div>
    </div>
  );
}

export function ImportHistoryPanel({ onReImport }: ImportHistoryPanelProps) {
  const { data: jobs, isLoading, isError, refetch } = useImportHistory();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-[var(--text-muted)]">
        <Loader2 className="h-5 w-5 animate-spin mr-2" />
        Carregando historico...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center py-8 space-y-2">
        <p className="text-sm text-[var(--semantic-error)]">Erro ao carregar historico</p>
        <Button variant="outline" size="sm" onClick={() => refetch()}>
          <RotateCw className="h-3.5 w-3.5 mr-1" /> Tentar novamente
        </Button>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-[var(--text-muted)]">
        <FileSpreadsheet className="h-8 w-8 mx-auto mb-2 opacity-40" />
        Nenhuma importacao registrada ainda.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-[var(--text-body)]">
          Historico de Importacoes ({jobs.length})
        </h3>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => refetch()}>
          <RotateCw className="h-3 w-3 mr-1" /> Atualizar
        </Button>
      </div>
      {jobs.map((job) => (
        <JobCard key={job.id} job={job} onReImport={onReImport} />
      ))}
    </div>
  );
}
