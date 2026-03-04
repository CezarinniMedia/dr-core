import { useState, useEffect } from "react";
import { useCreateOferta, useUpdateOferta, type Oferta, type OfertaInsert } from "@/features/offers/hooks/useOfertas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Slider } from "@/shared/components/ui/slider";
import { Switch } from "@/shared/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import { ChevronDown, Loader2, PlusCircle, Pencil, LayoutList, DollarSign, Target, ToggleLeft, FileText } from "lucide-react";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { VERTICAL_OPTIONS } from "@/features/spy/components/spy-radar/constants";

const OFERTA_STATUSES = [
  { value: "RESEARCH", label: "Research" },
  { value: "TEST", label: "Test" },
  { value: "ATIVA", label: "Ativa" },
  { value: "PAUSE", label: "Pause" },
  { value: "MORTA", label: "Morta" },
];

const CHECKOUT_PROVIDERS = ["hotmart", "kiwify", "perfectpay", "monetizze", "cakto", "ticto", "stripe", "cartpanda"];
const VSL_PLAYERS = ["vturb", "pandavideo", "smartplayer", "wistia", "youtube"];
const MERCADOS = ["BR", "US", "EU", "LATAM", "Global"];

interface OfertaFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editData?: Oferta;
}

const INITIAL: Record<string, any> = {
  nome: "",
  vertical: "",
  mercado: "BR",
  nicho: "",
  dominio_principal: "",
  status: "RESEARCH",
  prioridade: 0,
  ticket_front: "",
  cpa_target: "",
  aov_target: "",
  roas_target: "",
  promessa_principal: "",
  mecanismo_unico: "",
  checkout_provider: "",
  vsl_player: "",
  tem_quiz: false,
  tem_cloaker: false,
  notas: "",
};

export function OfertaFormDialog({ open, onOpenChange, editData }: OfertaFormDialogProps) {
  const isEdit = !!editData;
  const createMutation = useCreateOferta();
  const updateMutation = useUpdateOferta();
  const [form, setForm] = useState<Record<string, any>>(INITIAL);

  useEffect(() => {
    if (open) {
      if (editData) {
        setForm({
          nome: editData.nome || "",
          vertical: editData.vertical || "",
          mercado: editData.mercado || "BR",
          nicho: editData.nicho || "",
          dominio_principal: editData.dominio_principal || "",
          status: editData.status || "RESEARCH",
          prioridade: editData.prioridade || 0,
          ticket_front: editData.ticket_front ?? "",
          cpa_target: editData.cpa_target ?? "",
          aov_target: editData.aov_target ?? "",
          roas_target: editData.roas_target ?? "",
          promessa_principal: editData.promessa_principal || "",
          mecanismo_unico: editData.mecanismo_unico || "",
          checkout_provider: editData.checkout_provider || "",
          vsl_player: editData.vsl_player || "",
          tem_quiz: editData.tem_quiz || false,
          tem_cloaker: editData.tem_cloaker || false,
          notas: editData.notas || "",
        });
      } else {
        setForm({ ...INITIAL });
      }
    }
  }, [open, editData]);

  const set = (key: string, value: any) => setForm((f) => ({ ...f, [key]: value }));
  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSave = () => {
    if (!form.nome?.trim()) return;

    const payload: Partial<OfertaInsert> & { nome: string } = {
      nome: form.nome.trim(),
      vertical: form.vertical || null,
      mercado: form.mercado || null,
      nicho: form.nicho || null,
      dominio_principal: form.dominio_principal || null,
      status: form.status || "RESEARCH",
      prioridade: form.prioridade || null,
      ticket_front: form.ticket_front ? Number(form.ticket_front) : null,
      cpa_target: form.cpa_target ? Number(form.cpa_target) : null,
      aov_target: form.aov_target ? Number(form.aov_target) : null,
      roas_target: form.roas_target ? Number(form.roas_target) : null,
      promessa_principal: form.promessa_principal || null,
      mecanismo_unico: form.mecanismo_unico || null,
      checkout_provider: form.checkout_provider || null,
      vsl_player: form.vsl_player || null,
      tem_quiz: form.tem_quiz || false,
      tem_cloaker: form.tem_cloaker || false,
      notas: form.notas || null,
    };

    if (isEdit && editData) {
      updateMutation.mutate({ id: editData.id, data: payload }, {
        onSuccess: () => onOpenChange(false),
      });
    } else {
      createMutation.mutate(payload, {
        onSuccess: () => {
          onOpenChange(false);
          setForm({ ...INITIAL });
        },
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-2">
          <DialogTitle className="flex items-center gap-2">
            {isEdit ? <><Pencil className="h-4 w-4" /> Editar Oferta</> : <><PlusCircle className="h-4 w-4" /> Nova Oferta</>}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          <div className="space-y-4 pb-4">
            {/* Section 1: Dados Basicos */}
            <Section title={<span className="flex items-center gap-1.5"><LayoutList className="h-4 w-4" /> Dados Basicos</span>} defaultOpen>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Nome *">
                  <Input value={form.nome || ""} onChange={(e) => set("nome", e.target.value)} placeholder="Ex: Metodo Emagrecer 2.0" />
                </Field>
                <Field label="Dominio principal">
                  <Input value={form.dominio_principal || ""} onChange={(e) => set("dominio_principal", e.target.value)} placeholder="exemplo.com" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Vertical">
                  <Select value={form.vertical || ""} onValueChange={(v) => set("vertical", v)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {VERTICAL_OPTIONS.map((v) => (
                        <SelectItem key={v.value} value={v.value}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Mercado">
                  <Select value={form.mercado || "BR"} onValueChange={(v) => set("mercado", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MERCADOS.map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label="Nicho">
                  <Input value={form.nicho || ""} onChange={(e) => set("nicho", e.target.value)} placeholder="Emagrecimento 40+" />
                </Field>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Status">
                  <Select value={form.status || "RESEARCH"} onValueChange={(v) => set("status", v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {OFERTA_STATUSES.map((s) => (
                        <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field label={`Prioridade: ${form.prioridade || 0}/10`}>
                  <Slider
                    value={[form.prioridade || 0]}
                    onValueChange={([v]) => set("prioridade", v)}
                    min={0}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                </Field>
                <Field label="Checkout">
                  <Select value={form.checkout_provider || ""} onValueChange={(v) => set("checkout_provider", v)}>
                    <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                    <SelectContent>
                      {CHECKOUT_PROVIDERS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </Section>

            {/* Section 2: Financeiro */}
            <Section title={<span className="flex items-center gap-1.5"><DollarSign className="h-4 w-4" /> Financeiro</span>}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Ticket Front (R$)">
                  <Input type="number" step="0.01" value={form.ticket_front} onChange={(e) => set("ticket_front", e.target.value)} placeholder="97.00" />
                </Field>
                <Field label="CPA Target (R$)">
                  <Input type="number" step="0.01" value={form.cpa_target} onChange={(e) => set("cpa_target", e.target.value)} placeholder="30.00" />
                </Field>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <Field label="AOV Target (R$)">
                  <Input type="number" step="0.01" value={form.aov_target} onChange={(e) => set("aov_target", e.target.value)} placeholder="150.00" />
                </Field>
                <Field label="ROAS Target">
                  <Input type="number" step="0.01" value={form.roas_target} onChange={(e) => set("roas_target", e.target.value)} placeholder="3.00" />
                </Field>
              </div>
            </Section>

            {/* Section 3: Estrategia */}
            <Section title={<span className="flex items-center gap-1.5"><Target className="h-4 w-4" /> Estrategia</span>}>
              <Field label="Promessa principal">
                <Textarea value={form.promessa_principal || ""} onChange={(e) => set("promessa_principal", e.target.value)} rows={2} placeholder="A grande promessa da oferta..." />
              </Field>
              <Field label="Mecanismo unico">
                <Textarea value={form.mecanismo_unico || ""} onChange={(e) => set("mecanismo_unico", e.target.value)} rows={2} placeholder="O que torna esta oferta unica..." />
              </Field>
              <Field label="VSL Player">
                <Select value={form.vsl_player || ""} onValueChange={(v) => set("vsl_player", v)}>
                  <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                  <SelectContent>
                    {VSL_PLAYERS.map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </Field>
            </Section>

            {/* Section 4: Flags */}
            <Section title={<span className="flex items-center gap-1.5"><ToggleLeft className="h-4 w-4" /> Flags</span>}>
              <div className="flex flex-wrap gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={!!form.tem_quiz} onCheckedChange={(v) => set("tem_quiz", v)} />
                  <span className="text-xs">Tem Quiz</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Switch checked={!!form.tem_cloaker} onCheckedChange={(v) => set("tem_cloaker", v)} />
                  <span className="text-xs">Tem Cloaker</span>
                </label>
              </div>
            </Section>

            {/* Section 5: Notas */}
            <Section title={<span className="flex items-center gap-1.5"><FileText className="h-4 w-4" /> Notas</span>}>
              <Textarea
                value={form.notas || ""}
                onChange={(e) => set("notas", e.target.value)}
                rows={4}
                placeholder="Use # para titulos, ** para negrito, - para listas..."
              />
              <p className="text-xs text-muted-foreground">Suporta markdown</p>
            </Section>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 pb-6 pt-2 border-t">
          <Button variant="ghost" onClick={() => onOpenChange(false)} disabled={isPending}>Cancelar</Button>
          <Button onClick={handleSave} disabled={isPending || !form.nome?.trim()}>
            {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
            {isEdit ? "Salvar" : "Criar Oferta"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({ title, children, defaultOpen = false }: { title: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }) {
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
