import { useState } from "react";
import { useOfferFunnelSteps, useCreateFunnelStep, useDeleteFunnelStep, useUpdateFunnelStep, useOfferDomains, useCreateOfferDomain } from "@/features/spy/hooks/useSpiedOffers";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
// Design system: uses inline token classes instead of Card
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Plus, Trash2, ExternalLink, ArrowDown, AlertTriangle, FileText, Loader2, Link2, Edit, Package, Banknote, MessageSquare } from "lucide-react";

const STEP_TYPES = [
  "AD", "CLOAKER", "PRELAND", "QUIZ", "VSL_PAGE", "CHECKOUT",
  "UPSELL_1", "UPSELL_2", "DOWNSELL", "ORDER_BUMP", "THANK_YOU", "EMAIL_SEQUENCE",
];

const STEP_TYPE_COLOR: Record<string, string> = {
  AD: "bg-[rgba(59,130,246,0.1)] text-[color:var(--accent-blue)] border-[rgba(59,130,246,0.2)]",
  CLOAKER: "bg-[rgba(239,68,68,0.1)] text-[color:var(--semantic-error)] border-[rgba(239,68,68,0.2)]",
  PRELAND: "bg-[rgba(124,58,237,0.1)] text-[color:var(--accent-primary)] border-[rgba(124,58,237,0.2)]",
  QUIZ: "bg-[rgba(234,179,8,0.1)] text-[color:var(--semantic-warning)] border-[rgba(234,179,8,0.2)]",
  VSL_PAGE: "bg-[rgba(124,58,237,0.1)] text-[color:var(--accent-primary)] border-[rgba(124,58,237,0.2)]",
  CHECKOUT: "bg-[rgba(34,197,94,0.1)] text-[color:var(--accent-green)] border-[rgba(34,197,94,0.2)]",
  UPSELL_1: "bg-[rgba(59,130,246,0.1)] text-[color:var(--accent-blue)] border-[rgba(59,130,246,0.2)]",
  UPSELL_2: "bg-[rgba(59,130,246,0.1)] text-[color:var(--accent-blue)] border-[rgba(59,130,246,0.2)]",
  DOWNSELL: "bg-[rgba(234,179,8,0.1)] text-[color:var(--semantic-warning)] border-[rgba(234,179,8,0.2)]",
  ORDER_BUMP: "bg-[rgba(34,197,94,0.1)] text-[color:var(--accent-green)] border-[rgba(34,197,94,0.2)]",
  THANK_YOU: "bg-[rgba(107,114,128,0.1)] text-[color:var(--text-muted)] border-[rgba(107,114,128,0.2)]",
  EMAIL_SEQUENCE: "bg-[rgba(124,58,237,0.1)] text-[color:var(--accent-primary)] border-[rgba(124,58,237,0.2)]",
};

const STEP_TYPE_TO_DOMAIN_TYPE: Record<string, string> = {
  CHECKOUT: "checkout", VSL_PAGE: "landing_page", QUIZ: "quiz",
  PRELAND: "preland", CLOAKER: "cloaker", THANK_YOU: "thank_you",
  UPSELL_1: "upsell", UPSELL_2: "upsell",
};

function extractDomain(url: string): string {
  return url.trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/:\d+$/, "");
}

interface SpyFunnelTabProps {
  offerId: string;
}

const emptyForm = {
  step_order: 1, step_type: "AD", page_url: "", page_title: "",
  product_name: "", product_promise: "", price: "",
  is_cloaker: false, cloaker_type: "", notas: "",
};

export function SpyFunnelTab({ offerId }: SpyFunnelTabProps) {
  const { data: steps, isLoading } = useOfferFunnelSteps(offerId);
  const { data: domains } = useOfferDomains(offerId);
  const createMutation = useCreateFunnelStep();
  const updateMutation = useUpdateFunnelStep();
  const createDomainMutation = useCreateOfferDomain();
  const deleteMutation = useDeleteFunnelStep();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputMode, setInputMode] = useState<"manual" | "domain">("manual");
  const [selectedDomainId, setSelectedDomainId] = useState("");
  const [form, setForm] = useState({ ...emptyForm });

  const handleSelectDomain = (domainId: string) => {
    setSelectedDomainId(domainId);
    const domain = domains?.find((d: any) => d.id === domainId);
    if (domain) {
      setForm(f => ({ ...f, page_url: (domain as any).url || `https://${(domain as any).domain}` }));
    }
  };

  const openAdd = () => {
    setEditingId(null);
    setInputMode("manual");
    setSelectedDomainId("");
    setForm({ ...emptyForm, step_order: (steps?.length || 0) + 1 });
    setShowForm(true);
  };

  const openEdit = (step: any) => {
    setEditingId(step.id);
    setInputMode(step.domain_id ? "domain" : "manual");
    setSelectedDomainId(step.domain_id || "");
    setForm({
      step_order: step.step_order,
      step_type: step.step_type,
      page_url: step.page_url || "",
      page_title: step.page_title || "",
      product_name: step.product_name || "",
      product_promise: step.product_promise || "",
      price: step.price?.toString() || "",
      is_cloaker: step.is_cloaker || false,
      cloaker_type: step.cloaker_type || "",
      notas: step.notas || "",
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    const stepData: Record<string, unknown> = {
      step_order: form.step_order,
      step_type: form.step_type,
      page_url: form.page_url || null,
      page_title: form.page_title || null,
      product_name: form.product_name || null,
      product_promise: form.product_promise || null,
      price: form.price ? parseFloat(form.price) : null,
      is_cloaker: form.is_cloaker,
      cloaker_type: form.is_cloaker ? form.cloaker_type || null : null,
      notas: form.notas || null,
      domain_id: inputMode === "domain" && selectedDomainId ? selectedDomainId : null,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, data: stepData },
        { onSuccess: () => { setShowForm(false); setEditingId(null); } }
      );
    } else {
      stepData.spied_offer_id = offerId;
      createMutation.mutate(stepData, {
        onSuccess: () => {
          if (inputMode === "manual" && form.page_url) {
            const domainStr = extractDomain(form.page_url);
            const exists = domains?.some((d: any) => d.domain === domainStr);
            if (!exists && domainStr.includes(".")) {
              createDomainMutation.mutate({
                spied_offer_id: offerId,
                domain: domainStr,
                domain_type: STEP_TYPE_TO_DOMAIN_TYPE[form.step_type] || "landing_page",
                url: form.page_url,
              });
            }
          }
          setShowForm(false);
          setForm({ ...emptyForm, step_order: (steps?.length || 0) + 2 });
        },
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-4">
      {!steps || steps.length === 0 ? (
        <div className="border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] p-8 text-center space-y-3 bg-[var(--bg-surface)]">
          <p className="text-[color:var(--text-muted)] text-sm">Nenhum step do funil mapeado.</p>
          <Button size="sm" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Step</Button>
        </div>
      ) : (
        <div className="space-y-1">
          {steps.map((step: any, idx: number) => (
            <div key={step.id}>
              <div className="relative rounded-[var(--radius-lg)] border border-[var(--border-default)] bg-[var(--bg-surface)]">
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-[rgba(124,58,237,0.15)] text-[color:var(--accent-primary)] flex items-center justify-center text-sm font-bold">
                        {step.step_order}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={STEP_TYPE_COLOR[step.step_type] || ""}>{step.step_type}</Badge>
                        {step.page_title && <span className="text-sm font-medium">{step.page_title}</span>}
                        {step.is_cloaker && <Badge variant="outline" className="bg-destructive/20 text-destructive"><AlertTriangle className="h-3 w-3 mr-1" /> Cloaker</Badge>}
                        {step.domain_id && <Badge variant="outline" className="text-xs"><Link2 className="h-3 w-3 mr-1" /> Domínio vinculado</Badge>}
                        {step.html_source && <Badge variant="outline" className="text-xs"><FileText className="h-3 w-3 mr-1" /> HTML salvo</Badge>}
                      </div>
                      {step.page_url && (
                        <a href={step.page_url} target="_blank" rel="noopener noreferrer" className="text-xs text-[color:var(--accent-teal)] hover:underline flex items-center gap-1">
                          {step.page_url} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                      <div className="flex gap-4 text-xs text-[color:var(--text-muted)]">
                        {step.product_name && <span className="inline-flex items-center gap-1"><Package className="h-3 w-3" /> {step.product_name}</span>}
                        {step.price && <span className="inline-flex items-center gap-1"><Banknote className="h-3 w-3" /> R$ {Number(step.price).toFixed(2)}</span>}
                        {step.product_promise && <span className="truncate max-w-[200px] inline-flex items-center gap-1"><MessageSquare className="h-3 w-3 shrink-0" /> {step.product_promise}</span>}
                      </div>
                      {step.notas && <p className="text-xs text-[color:var(--text-muted)] mt-1">{step.notas}</p>}
                    </div>
                    <div className="flex gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar etapa" onClick={() => openEdit(step)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label="Deletar etapa" onClick={() => deleteMutation.mutate({ id: step.id, offerId })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
              {idx < steps.length - 1 && (
                <div className="flex justify-center py-1"><ArrowDown className="h-4 w-4 text-muted-foreground" /></div>
              )}
            </div>
          ))}
          <div className="flex justify-center pt-2">
            <Button size="sm" variant="outline" onClick={openAdd}><Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Step</Button>
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Step do Funil" : "Adicionar Step do Funil"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <Tabs value={inputMode} onValueChange={(v) => setInputMode(v as "manual" | "domain")}>
              <TabsList className="w-full">
                <TabsTrigger value="manual" className="flex-1">Preencher manualmente</TabsTrigger>
                <TabsTrigger value="domain" className="flex-1" disabled={!domains || domains.length === 0}>Selecionar domínio</TabsTrigger>
              </TabsList>
            </Tabs>
            {inputMode === "domain" && domains && domains.length > 0 && (
              <div>
                <Label className="text-xs">Domínio existente</Label>
                <Select value={selectedDomainId} onValueChange={handleSelectDomain}>
                  <SelectTrigger><SelectValue placeholder="Selecione um domínio..." /></SelectTrigger>
                  <SelectContent>
                    {domains.map((d: any) => (
                      <SelectItem key={d.id} value={d.id}>{d.domain} ({d.domain_type})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Ordem</Label>
                <Input type="number" value={form.step_order} onChange={(e) => setForm({ ...form, step_order: parseInt(e.target.value) || 1 })} />
              </div>
              <div>
                <Label className="text-xs">Tipo *</Label>
                <Select value={form.step_type} onValueChange={(v) => setForm({ ...form, step_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STEP_TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">URL da página</Label>
              <Input value={form.page_url} onChange={(e) => setForm({ ...form, page_url: e.target.value })} disabled={inputMode === "domain"} />
            </div>
            <div>
              <Label className="text-xs">Título da página</Label>
              <Input value={form.page_title} onChange={(e) => setForm({ ...form, page_title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Produto</Label>
                <Input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Preço</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="R$" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Promessa</Label>
              <Input value={form.product_promise} onChange={(e) => setForm({ ...form, product_promise: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_cloaker} onCheckedChange={(v) => setForm({ ...form, is_cloaker: v })} />
              <Label className="text-xs">É cloaker?</Label>
            </div>
            {form.is_cloaker && (
              <div>
                <Label className="text-xs">Tipo de cloaker</Label>
                <Input value={form.cloaker_type} onChange={(e) => setForm({ ...form, cloaker_type: e.target.value })} placeholder="redirect, js_detect, ip_filter" />
              </div>
            )}
            <div>
              <Label className="text-xs">Notas</Label>
              <Textarea rows={2} value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {editingId ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
