import { useState, useEffect } from "react";
import { useCreateSpiedOffer, useUpdateSpiedOffer } from "@/hooks/useSpiedOffers";
import { useOfertas } from "@/hooks/useOfertas";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FullOfferFormModalProps {
  open: boolean;
  onClose: () => void;
  editData?: any;
}

export function FullOfferFormModal({ open, onClose, editData }: FullOfferFormModalProps) {
  const isEdit = !!editData;
  const createMutation = useCreateSpiedOffer();
  const updateMutation = useUpdateSpiedOffer();
  const { data: ofertas } = useOfertas();

  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (open) {
      setForm(editData || { geo: "BR", status: "RADAR", priority: 0, product_currency: "BRL" });
    }
  }, [open, editData]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!form.nome?.trim()) return;
    const payload = { ...form };
    if (payload.product_ticket) payload.product_ticket = parseFloat(payload.product_ticket);
    if (payload.estimated_monthly_traffic) payload.estimated_monthly_traffic = parseInt(payload.estimated_monthly_traffic);
    if (payload.estimated_monthly_revenue) payload.estimated_monthly_revenue = parseFloat(payload.estimated_monthly_revenue);

    if (isEdit) {
      updateMutation.mutate({ id: editData.id, data: payload }, { onSuccess: onClose });
    } else {
      createMutation.mutate(payload, { onSuccess: onClose });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle>{isEdit ? "✏️ Editar Oferta" : "➕ Nova Oferta Completa"}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          <div className="space-y-4 pb-4">
            {/* Section 1: Dados Básicos */}
            <Section title="📋 Dados Básicos" defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome *">
                  <Input value={form.nome || ""} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Chá Bariátrico" />
                </Field>
                <Field label="Domínio principal">
                  <Input value={form.main_domain || ""} onChange={(e) => set("main_domain", e.target.value)} placeholder="chabariatrico.fun" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Vertical">
                  <Select value={form.vertical || ""} onValueChange={(v) => set("vertical", v)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="nutra">Nutra</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="tech">Tech</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Subnicho">
                  <Input value={form.subnicho || ""} onChange={(e) => set("subnicho", e.target.value)} placeholder="emagrecimento" />
                </Field>
                <Field label="Geo">
                  <Select value={form.geo || "BR"} onValueChange={(v) => set("geo", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BR">BR</SelectItem>
                      <SelectItem value="USA">USA</SelectItem>
                      <SelectItem value="EU">EU</SelectItem>
                      <SelectItem value="LATAM">LATAM</SelectItem>
                    </SelectContent>
                  </Select>
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Status">
                  <Select value={form.status || "RADAR"} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["RADAR", "ANALYZING", "HOT", "SCALING", "DYING", "DEAD", "CLONED"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={`Prioridade: ${form.priority || 0}/10`}>
                  <Slider
                    value={[form.priority || 0]}
                    onValueChange={([v]) => set("priority", v)}
                    min={0}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </Field>
              </div>
            </Section>

            {/* Section 2: Descoberta */}
            <Section title="🔍 Descoberta">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Fonte">
                  <Select value={form.discovery_source || ""} onValueChange={(v) => set("discovery_source", v)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {["publicwww", "fb_ads_library", "adheart", "semrush", "reclameaqui", "google_dorks", "manual"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Query">
                  <Input value={form.discovery_query || ""} onChange={(e) => set("discovery_query", e.target.value)} />
                </Field>
              </div>
              <Field label="Detalhe da ferramenta">
                <Input value={form.discovery_tool_detail || ""} onChange={(e) => set("discovery_tool_detail", e.target.value)} placeholder="Combo: VTURB + Hotmart no PublicWWW" />
              </Field>
            </Section>

            {/* Section 3: Produto */}
            <Section title="💰 Produto & Oferta">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome do produto">
                  <Input value={form.product_name || ""} onChange={(e) => set("product_name", e.target.value)} />
                </Field>
                <Field label="Ticket front-end">
                  <Input type="number" value={form.product_ticket || ""} onChange={(e) => set("product_ticket", e.target.value)} placeholder="97" />
                </Field>
              </div>
              <Field label="Promessa principal">
                <Textarea value={form.product_promise || ""} onChange={(e) => set("product_promise", e.target.value)} rows={2} />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Checkout">
                  <Select value={form.checkout_provider || ""} onValueChange={(v) => set("checkout_provider", v)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {["hotmart", "kiwify", "perfectpay", "monetizze", "cakto", "ticto", "stripe", "cartpanda"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Checkout URL">
                  <Input value={form.checkout_url || ""} onChange={(e) => set("checkout_url", e.target.value)} />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="VSL URL">
                  <Input value={form.vsl_url || ""} onChange={(e) => set("vsl_url", e.target.value)} />
                </Field>
                <Field label="VSL Player">
                  <Select value={form.vsl_player || ""} onValueChange={(v) => set("vsl_player", v)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {["vturb", "pandavideo", "smartplayer", "wistia", "youtube"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Duração VSL">
                  <Input value={form.vsl_duration || ""} onChange={(e) => set("vsl_duration", e.target.value)} placeholder="22min" />
                </Field>
              </div>
            </Section>

            {/* Section 4: Estimativas */}
            <Section title="📊 Estimativas">
              <div className="grid grid-cols-3 gap-3">
                <Field label="Tráfego mensal">
                  <Input type="number" value={form.estimated_monthly_traffic || ""} onChange={(e) => set("estimated_monthly_traffic", e.target.value)} />
                </Field>
                <Field label="Revenue mensal">
                  <Input type="number" value={form.estimated_monthly_revenue || ""} onChange={(e) => set("estimated_monthly_revenue", e.target.value)} />
                </Field>
                <Field label="Tendência">
                  <Select value={form.traffic_trend || ""} onValueChange={(v) => set("traffic_trend", v)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {["UP", "STABLE", "DOWN", "SPIKE", "NEW"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            {/* Section 5: Operador */}
            <Section title="🕸️ Operador">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome do operador">
                  <Input value={form.operator_name || ""} onChange={(e) => set("operator_name", e.target.value)} />
                </Field>
                <Field label="Rede/Network">
                  <Input value={form.operator_network || ""} onChange={(e) => set("operator_network", e.target.value)} />
                </Field>
              </div>
            </Section>

            {/* Section 6: Notas */}
            <Section title="📝 Notas">
              <Textarea
                value={form.notas || ""}
                onChange={(e) => set("notas", e.target.value)}
                rows={6}
                placeholder="Use # para títulos, ** para negrito, - para listas..."
              />
              <p className="text-xs text-muted-foreground">Suporta markdown</p>
            </Section>

            {/* Section 7: Vincular */}
            <Section title="🔗 Vincular à sua oferta">
              <Field label="Oferta vinculada">
                <Select value={form.oferta_id || ""} onValueChange={(v) => set("oferta_id", v === "none" ? null : v)}>
                  <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhuma</SelectItem>
                    {ofertas?.map((o: any) => (
                      <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2 border-t">
          <Button variant="ghost" onClick={onClose} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isPending || !form.nome?.trim()}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  return (
    <Collapsible defaultOpen={defaultOpen}>
      <CollapsibleTrigger className="flex items-center justify-between w-full py-2 text-sm font-semibold hover:text-primary transition-colors">
        {title}
        <ChevronDown className="h-4 w-4" />
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-1">{children}</CollapsibleContent>
    </Collapsible>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}
