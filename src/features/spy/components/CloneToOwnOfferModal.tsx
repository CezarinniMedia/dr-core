import { useState, useRef, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useCreateOferta, type OfertaInsert } from "@/features/offers/hooks/useOfertas";
import type { SpiedOffer } from "@/shared/services/offerService";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useToast } from "@/shared/hooks/use-toast";
import { Copy, ExternalLink, Sparkles, Loader2 } from "lucide-react";

interface CloneToOwnOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  offer: SpiedOffer;
}

const VERTICALS = ["Health", "Finance", "Relationship", "Education", "Business", "Nutra", "Crypto", "Betting", "Outro"];
const GEOS = ["BR", "US", "EU", "LATAM", "Global"];

function buildAutoNotes(offer: SpiedOffer): string {
  const lines: string[] = [];
  lines.push(`Clonado de: ${offer.nome}`);
  if (offer.main_domain) lines.push(`Dominio original: ${offer.main_domain}`);
  if (offer.estimated_monthly_traffic) {
    lines.push(`SimilarWeb: ${Number(offer.estimated_monthly_traffic).toLocaleString("pt-BR")} visits/mo (fonte principal de trafego)`);
  }
  lines.push(`SEMrush organic: ver tab Trafego na oferta espionada`);
  if (offer.status) lines.push(`Status na origem: ${offer.status}`);
  lines.push(`Data do clone: ${new Date().toLocaleDateString("pt-BR")}`);
  return lines.join("\n");
}

export function CloneToOwnOfferModal({ open, onOpenChange, offer }: CloneToOwnOfferModalProps) {
  const navigate = useNavigate();
  const createMutation = useCreateOferta();
  const { toast } = useToast();
  const nameRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nome: "",
    vertical: "",
    mercado: "",
    ticket_front: "",
    promessa_principal: "",
    mecanismo_unico: "",
    notas: "",
  });

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  // Pre-populate on open
  useEffect(() => {
    if (open && offer) {
      setForm({
        nome: `${offer.nome} (clone)`,
        vertical: offer.vertical || "",
        mercado: offer.geo || "",
        ticket_front: "",
        promessa_principal: "",
        mecanismo_unico: "",
        notas: buildAutoNotes(offer),
      });
      setTimeout(() => nameRef.current?.focus(), 100);
    }
  }, [open, offer]);

  const handleSubmit = useCallback(() => {
    if (!form.nome.trim()) return;

    const payload: OfertaInsert = {
      nome: form.nome.trim(),
      status: "RESEARCH",
      spied_offer_id: offer.id,
      source: "clone",
      vertical: form.vertical || null,
      mercado: form.mercado || null,
      ticket_front: form.ticket_front ? parseFloat(form.ticket_front) : null,
      promessa_principal: form.promessa_principal.trim() || null,
      mecanismo_unico: form.mecanismo_unico.trim() || null,
      notas: form.notas.trim() || null,
    };

    createMutation.mutate(payload, {
      onSuccess: (data) => {
        onOpenChange(false);
        toast({
          title: "Oferta criada!",
          description: (
            <span>
              {form.nome} adicionada.{" "}
              <button
                className="underline text-[color:var(--accent-teal)] hover:text-[color:var(--text-primary)]"
                onClick={() => navigate(`/ofertas/${data.id}`)}
              >
                Ver Oferta
              </button>
            </span>
          ),
        });
      },
    });
  }, [form, offer.id, createMutation, onOpenChange, toast, navigate]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  const statusBadge = offer.status || "RADAR";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="p-0 border-[var(--border-default)] bg-[var(--bg-elevated)] max-w-[560px] max-h-[85vh] overflow-hidden"
        style={{
          boxShadow:
            "0 0 0 1px rgba(255,255,255,0.05), 0 24px 80px rgba(0,0,0,0.5), 0 0 80px rgba(212,165,116,0.06)",
        }}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle className="flex items-center gap-2 text-[length:var(--text-section-head)] font-semibold text-[color:var(--text-primary)]">
            <Copy className="h-5 w-5 text-[color:var(--accent-amber)]" />
            Clonar para Oferta Propria
          </DialogTitle>
          <DialogDescription className="text-[length:var(--text-body-size)] text-[color:var(--text-secondary)]">
            Dados pre-preenchidos da oferta espionada. Edite o que precisar.
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable content */}
        <div className="px-6 py-4 overflow-y-auto max-h-[calc(85vh-180px)] space-y-4">
          {/* Origin card */}
          <div>
            <span className="text-[length:var(--text-caption)] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider">
              Origem
            </span>
            <div
              className="mt-2 rounded-[var(--radius-md)] border border-[var(--border-subtle)] bg-[var(--bg-subtle)] p-3"
              style={{ borderLeft: "3px solid var(--accent-amber)" }}
            >
              <div className="flex items-center gap-2">
                <ExternalLink className="h-3.5 w-3.5 text-[color:var(--accent-amber)] flex-shrink-0" />
                <a
                  href={`/spy/${offer.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-[color:var(--text-primary)] hover:underline truncate"
                >
                  {offer.nome}
                </a>
              </div>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                {offer.main_domain && (
                  <span className="font-mono text-xs text-[color:var(--text-secondary)]">
                    {offer.main_domain}
                  </span>
                )}
                {offer.vertical && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(124,58,237,0.1)] text-[color:var(--accent-primary)] border border-[rgba(124,58,237,0.2)]">
                    {offer.vertical}
                  </span>
                )}
                {offer.geo && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(59,130,246,0.1)] text-[color:var(--accent-blue)] border border-[rgba(59,130,246,0.2)]">
                    {offer.geo}
                  </span>
                )}
                <span className="text-xs px-1.5 py-0.5 rounded bg-[rgba(107,114,128,0.1)] text-[color:var(--text-muted)] border border-[rgba(107,114,128,0.2)]">
                  {statusBadge}
                </span>
              </div>
              {offer.estimated_monthly_traffic && (
                <p className="text-xs text-[color:var(--text-muted)] mt-1.5">
                  SimilarWeb: {Number(offer.estimated_monthly_traffic).toLocaleString("pt-BR")} visits/mo
                </p>
              )}
            </div>
          </div>

          {/* Form */}
          <div>
            <span className="text-[length:var(--text-caption)] font-semibold text-[color:var(--text-muted)] uppercase tracking-wider">
              Dados da Nova Oferta
            </span>

            <div className="mt-3 space-y-4">
              {/* Nome */}
              <div>
                <Label className="text-xs font-medium text-[color:var(--text-secondary)]">
                  Nome <span className="text-[color:var(--semantic-error)]">*</span>
                </Label>
                <Input
                  ref={nameRef}
                  value={form.nome}
                  onChange={(e) => set("nome", e.target.value)}
                  className="mt-1 bg-[var(--bg-subtle)] border-[var(--border-interactive)]"
                  placeholder="Nome da oferta"
                />
              </div>

              {/* Vertical + Geo (2 cols) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-[color:var(--text-secondary)]">Vertical</Label>
                  <Select value={form.vertical} onValueChange={(v) => set("vertical", v)}>
                    <SelectTrigger className="mt-1 bg-[var(--bg-subtle)] border-[var(--border-interactive)]">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {VERTICALS.map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs font-medium text-[color:var(--text-secondary)]">Geo</Label>
                  <Select value={form.mercado} onValueChange={(v) => set("mercado", v)}>
                    <SelectTrigger className="mt-1 bg-[var(--bg-subtle)] border-[var(--border-interactive)]">
                      <SelectValue placeholder="Selecionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {GEOS.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Ticket + Promessa (2 cols) */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-medium text-[color:var(--text-secondary)]">Ticket (R$)</Label>
                  <Input
                    type="number"
                    value={form.ticket_front}
                    onChange={(e) => set("ticket_front", e.target.value)}
                    className="mt-1 bg-[var(--bg-subtle)] border-[var(--border-interactive)]"
                    placeholder="197,00"
                  />
                </div>
                <div>
                  <Label className="text-xs font-medium text-[color:var(--text-secondary)]">Promessa Principal</Label>
                  <Textarea
                    value={form.promessa_principal}
                    onChange={(e) => set("promessa_principal", e.target.value)}
                    className="mt-1 bg-[var(--bg-subtle)] border-[var(--border-interactive)] min-h-[68px]"
                    rows={2}
                    placeholder="A promessa principal da oferta"
                  />
                </div>
              </div>

              {/* Mecanismo Unico */}
              <div>
                <Label className="text-xs font-medium text-[color:var(--text-secondary)]">Mecanismo Unico</Label>
                <Textarea
                  value={form.mecanismo_unico}
                  onChange={(e) => set("mecanismo_unico", e.target.value)}
                  className="mt-1 bg-[var(--bg-subtle)] border-[var(--border-interactive)]"
                  rows={2}
                  placeholder="O mecanismo unico da oferta"
                />
              </div>

              {/* Notas */}
              <div>
                <Label className="text-xs font-medium text-[color:var(--text-secondary)]">Notas (opcional)</Label>
                <Textarea
                  value={form.notas}
                  onChange={(e) => set("notas", e.target.value)}
                  className="mt-1 bg-[var(--bg-subtle)] border-[var(--border-interactive)]"
                  rows={3}
                  placeholder="Notas sobre a oferta"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t border-[var(--border-default)] flex justify-between sm:justify-between">
          <Button
            variant="ghost"
            onClick={() => onOpenChange(false)}
            className="text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)]"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || !form.nome.trim()}
            className="text-[color:var(--bg-base)] font-semibold"
            style={{
              background: "var(--accent-amber)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--accent-gold)";
              e.currentTarget.style.boxShadow = "0 0 16px rgba(212,165,116,0.25)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "var(--accent-amber)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Sparkles className="h-4 w-4 mr-2" />
            )}
            {createMutation.isPending ? "Criando..." : "Criar Oferta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
