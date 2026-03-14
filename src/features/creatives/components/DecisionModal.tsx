import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Trophy, X, Zap, CheckCircle, XCircle, Loader2 } from "lucide-react";
import {
  useCreativeDecision,
  calculateRecommendation,
  getMetricStatus,
  getDaysInTest,
  DEFAULT_BENCHMARKS,
  type DecisionMetrics,
  type Recommendation,
} from "@/features/creatives/hooks/useCreativeDecision";
import type { Criativo } from "./KanbanBoard";

interface DecisionModalProps {
  open: boolean;
  onClose: () => void;
  criativo: Criativo | null;
}

export function DecisionModal({ open, onClose, criativo }: DecisionModalProps) {
  const { submitDecision, isSubmitting } = useCreativeDecision();

  const [ctr, setCtr] = useState("");
  const [cpa, setCpa] = useState("");
  const [roas, setRoas] = useState("");
  const [notes, setNotes] = useState("");
  const [notesError, setNotesError] = useState(false);

  // Reset form when criativo changes
  useEffect(() => {
    if (open && criativo) {
      const existing = criativo.decision_metrics as DecisionMetrics | null;
      setCtr(existing?.ctr !== null && existing?.ctr !== undefined ? String(existing.ctr) : "");
      setCpa(existing?.cpa !== null && existing?.cpa !== undefined ? String(existing.cpa) : "");
      setRoas(existing?.roas !== null && existing?.roas !== undefined ? String(existing.roas) : "");
      setNotes(criativo.decision_notes || "");
      setNotesError(false);
    }
  }, [open, criativo]);

  const metrics: DecisionMetrics = useMemo(() => ({
    ctr: ctr ? parseFloat(ctr) : null,
    cpa: cpa ? parseFloat(cpa) : null,
    roas: roas ? parseFloat(roas) : null,
  }), [ctr, cpa, roas]);

  const recommendation = useMemo(
    () => calculateRecommendation(metrics),
    [metrics]
  );

  const ctrStatus = getMetricStatus("ctr", metrics.ctr);
  const cpaStatus = getMetricStatus("cpa", metrics.cpa);
  const roasStatus = getMetricStatus("roas", metrics.roas);

  const handleSubmit = useCallback((verdict: "WINNER" | "KILLED") => {
    if (verdict === "KILLED" && !notes.trim()) {
      setNotesError(true);
      return;
    }
    setNotesError(false);

    if (!criativo) return;

    submitDecision(
      {
        id: criativo.id,
        verdict,
        metrics,
        notes: notes.trim(),
      },
      { onSuccess: () => onClose() }
    );
  }, [criativo, metrics, notes, submitDecision, onClose]);

  // Keyboard shortcuts
  useEffect(() => {
    if (!open) return;

    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSubmit("WINNER");
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Backspace") {
        e.preventDefault();
        handleSubmit("KILLED");
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, handleSubmit]);

  if (!criativo) return null;

  const days = getDaysInTest(criativo.test_started_at);

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        className="p-0 gap-0 border-0"
        style={{
          maxWidth: "min(520px, 90vw)",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border-default)",
          borderRadius: "var(--radius-xl, 16px)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 60px rgba(124,58,237,0.04)",
        }}
      >
        {/* Header */}
        <div className="p-6 pb-4">
          <DialogHeader className="space-y-1">
            <DialogTitle className="flex items-center gap-2 text-lg font-semibold" style={{ color: "var(--text-primary)" }}>
              <Zap className="h-5 w-5" style={{ color: "var(--accent-primary)" }} />
              Decisao: {criativo.nome}
            </DialogTitle>
            <DialogDescription style={{ color: "var(--text-secondary)" }}>
              Criativo em teste ha {days !== null ? `${days}d` : "?d"}.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Metrics inputs */}
        <div className="px-6 pb-4">
          <p className="text-xs uppercase font-semibold mb-3" style={{ color: "var(--text-muted)" }}>
            Metricas do teste
          </p>
          <div className="grid grid-cols-3 gap-4">
            <MetricInput
              label="CTR (%)"
              value={ctr}
              onChange={setCtr}
              benchmark="benchmark: 1.5%"
              status={ctrStatus}
              placeholder="0.0"
            />
            <MetricInput
              label="CPA (R$)"
              value={cpa}
              onChange={setCpa}
              benchmark="target: <R$25"
              status={cpaStatus}
              placeholder="0.00"
            />
            <MetricInput
              label="ROAS (x)"
              value={roas}
              onChange={setRoas}
              benchmark="min: 2.5x"
              status={roasStatus}
              placeholder="0.0"
            />
          </div>
        </div>

        {/* Recommendation card */}
        <div className="px-6 pb-4">
          <RecommendationCard recommendation={recommendation} metrics={metrics} />
        </div>

        {/* Decision notes */}
        <div className="px-6 pb-4">
          <Label
            className="text-xs mb-1.5 block"
            style={{ color: "var(--text-muted)" }}
          >
            Notas de decisao
            {notesError && (
              <span style={{ color: "var(--semantic-error)" }}> * Obrigatorio para KILL</span>
            )}
          </Label>
          <Textarea
            value={notes}
            onChange={(e) => {
              setNotes(e.target.value);
              if (notesError && e.target.value.trim()) setNotesError(false);
            }}
            placeholder="O que funcionou / O que aprendemos..."
            rows={3}
            className="resize-none text-sm"
            style={{
              background: "var(--bg-subtle)",
              border: `1px solid ${notesError ? "var(--semantic-error)" : "var(--border-interactive)"}`,
              color: "var(--text-primary)",
            }}
          />
        </div>

        {/* Footer buttons */}
        <div
          className="flex justify-end gap-3 px-6 py-4"
          style={{ borderTop: "1px solid var(--border-default)" }}
        >
          <Button
            variant="outline"
            disabled={isSubmitting}
            onClick={() => handleSubmit("KILLED")}
            className="gap-1.5"
            style={{
              border: "1px solid var(--semantic-error)",
              color: "var(--semantic-error)",
              background: "transparent",
            }}
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <X className="h-3.5 w-3.5" />}
            {isSubmitting ? "Salvando..." : "Matar"}
          </Button>
          <Button
            disabled={isSubmitting}
            onClick={() => handleSubmit("WINNER")}
            className="gap-1.5 font-semibold"
            style={{
              background: "linear-gradient(135deg, var(--accent-gold), var(--accent-amber))",
              color: "var(--bg-base)",
              border: "none",
            }}
          >
            {isSubmitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trophy className="h-3.5 w-3.5" />}
            {isSubmitting ? "Salvando..." : "WINNER!"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Sub-components ---

function MetricInput({ label, value, onChange, benchmark, status, placeholder }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  benchmark: string;
  status: "pass" | "fail" | "empty";
  placeholder: string;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs uppercase" style={{ color: "var(--text-muted)" }}>
        {label}
      </Label>
      <Input
        type="number"
        step="0.01"
        min="0"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="text-center text-2xl font-bold h-14"
        style={{
          background: "var(--bg-subtle)",
          border: "1px solid var(--border-interactive)",
          color: "var(--text-primary)",
        }}
      />
      <p className="text-[11px]" style={{ color: "var(--text-muted)" }}>
        {benchmark}
      </p>
      <div className="flex justify-center">
        {status === "pass" && <CheckCircle className="h-3.5 w-3.5" style={{ color: "var(--accent-green)" }} />}
        {status === "fail" && <XCircle className="h-3.5 w-3.5" style={{ color: "var(--semantic-error)" }} />}
      </div>
    </div>
  );
}

function RecommendationCard({ recommendation, metrics }: {
  recommendation: Recommendation;
  metrics: DecisionMetrics;
}) {
  if (metrics.ctr === null && metrics.cpa === null && metrics.roas === null) {
    return (
      <div
        className="rounded-lg p-4"
        style={{
          background: "var(--bg-subtle)",
          borderLeft: "3px solid var(--border-interactive)",
        }}
      >
        <p className="text-sm" style={{ color: "var(--text-muted)" }}>
          Preencha as metricas para ver a recomendacao do sistema.
        </p>
      </div>
    );
  }

  if (recommendation === "WINNER") {
    return (
      <div
        className="rounded-lg p-4"
        style={{
          background: "var(--bg-subtle)",
          borderLeft: "3px solid var(--accent-gold)",
        }}
      >
        <div className="flex items-start gap-2">
          <Trophy className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--accent-gold)" }} />
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            <strong>WINNER</strong> — Todas as metricas acima dos benchmarks. Recomendado escalar.
          </p>
        </div>
      </div>
    );
  }

  if (recommendation === "KILL") {
    return (
      <div
        className="rounded-lg p-4"
        style={{
          background: "var(--bg-subtle)",
          borderLeft: "3px solid var(--semantic-error)",
        }}
      >
        <div className="flex items-start gap-2">
          <X className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--semantic-error)" }} />
          <p className="text-sm" style={{ color: "var(--text-primary)" }}>
            <strong>KILL</strong> — Metricas abaixo dos benchmarks. Considere ajustar hook ou angulo.
          </p>
        </div>
      </div>
    );
  }

  // MIXED
  const failedMetrics: string[] = [];
  if (getMetricStatus("ctr", metrics.ctr) === "fail") failedMetrics.push("CTR");
  if (getMetricStatus("cpa", metrics.cpa) === "fail") failedMetrics.push("CPA");
  if (getMetricStatus("roas", metrics.roas) === "fail") failedMetrics.push("ROAS");

  return (
    <div
      className="rounded-lg p-4"
      style={{
        background: "var(--bg-subtle)",
        borderLeft: "3px solid var(--semantic-warning)",
      }}
    >
      <div className="flex items-start gap-2">
        <Zap className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "var(--semantic-warning)" }} />
        <p className="text-sm" style={{ color: "var(--text-primary)" }}>
          <strong>Misto</strong> — {failedMetrics.join(", ")} abaixo do benchmark. Voce decide.
        </p>
      </div>
    </div>
  );
}
