import { useState } from "react";
import { useOfferFunnelSteps, useCreateFunnelStep, useDeleteFunnelStep } from "@/hooks/useSpiedOffers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2, ExternalLink, ArrowDown, AlertTriangle, FileText, Loader2 } from "lucide-react";

const STEP_TYPES = [
  "AD", "CLOAKER", "PRELAND", "QUIZ", "VSL_PAGE", "CHECKOUT",
  "UPSELL_1", "UPSELL_2", "DOWNSELL", "ORDER_BUMP", "THANK_YOU", "EMAIL_SEQUENCE",
];

const STEP_TYPE_COLOR: Record<string, string> = {
  AD: "bg-info/20 text-info",
  CLOAKER: "bg-destructive/20 text-destructive",
  PRELAND: "bg-accent/20 text-accent",
  QUIZ: "bg-warning/20 text-warning",
  VSL_PAGE: "bg-primary/20 text-primary",
  CHECKOUT: "bg-success/20 text-success",
  UPSELL_1: "bg-info/20 text-info",
  UPSELL_2: "bg-info/20 text-info",
  DOWNSELL: "bg-warning/20 text-warning",
  ORDER_BUMP: "bg-success/20 text-success",
  THANK_YOU: "bg-muted text-muted-foreground",
  EMAIL_SEQUENCE: "bg-primary/20 text-primary",
};

interface SpyFunnelTabProps {
  offerId: string;
}

export function SpyFunnelTab({ offerId }: SpyFunnelTabProps) {
  const { data: steps, isLoading } = useOfferFunnelSteps(offerId);
  const createMutation = useCreateFunnelStep();
  const deleteMutation = useDeleteFunnelStep();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    step_order: 1,
    step_type: "AD",
    page_url: "",
    page_title: "",
    product_name: "",
    product_promise: "",
    price: "",
    is_cloaker: false,
    cloaker_type: "",
    notas: "",
  });

  const handleSave = () => {
    createMutation.mutate(
      {
        spied_offer_id: offerId,
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
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({
            step_order: (steps?.length || 0) + 2,
            step_type: "AD",
            page_url: "",
            page_title: "",
            product_name: "",
            product_promise: "",
            price: "",
            is_cloaker: false,
            cloaker_type: "",
            notas: "",
          });
        },
      }
    );
  };

  const openAddForm = () => {
    setForm((f) => ({ ...f, step_order: (steps?.length || 0) + 1 }));
    setShowForm(true);
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-4">
      {!steps || steps.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center space-y-3">
          <p className="text-muted-foreground text-sm">Nenhum step do funil mapeado.</p>
          <Button size="sm" onClick={openAddForm}>
            <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Step
          </Button>
        </div>
      ) : (
        <div className="space-y-1">
          {steps.map((step: any, idx: number) => (
            <div key={step.id}>
              <Card className="relative">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Step number */}
                    <div className="flex flex-col items-center shrink-0">
                      <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-bold">
                        {step.step_order}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className={STEP_TYPE_COLOR[step.step_type] || ""}>
                          {step.step_type}
                        </Badge>
                        {step.page_title && (
                          <span className="text-sm font-medium">{step.page_title}</span>
                        )}
                        {step.is_cloaker && (
                          <Badge variant="outline" className="bg-destructive/20 text-destructive">
                            <AlertTriangle className="h-3 w-3 mr-1" /> Cloaker
                          </Badge>
                        )}
                        {step.html_source && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="h-3 w-3 mr-1" /> HTML salvo
                          </Badge>
                        )}
                      </div>

                      {step.page_url && (
                        <a
                          href={step.page_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline flex items-center gap-1"
                        >
                          {step.page_url} <ExternalLink className="h-3 w-3" />
                        </a>
                      )}

                      <div className="flex gap-4 text-xs text-muted-foreground">
                        {step.product_name && <span>📦 {step.product_name}</span>}
                        {step.price && <span>💰 R$ {Number(step.price).toFixed(2)}</span>}
                        {step.product_promise && <span className="truncate max-w-[200px]">💬 {step.product_promise}</span>}
                      </div>

                      {step.notas && (
                        <p className="text-xs text-muted-foreground mt-1">{step.notas}</p>
                      )}
                    </div>

                    {/* Delete */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive shrink-0"
                      onClick={() => deleteMutation.mutate({ id: step.id, offerId })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {idx < steps.length - 1 && (
                <div className="flex justify-center py-1">
                  <ArrowDown className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-center pt-2">
            <Button size="sm" variant="outline" onClick={openAddForm}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Step
            </Button>
          </div>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Step do Funil</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Ordem</Label>
                <Input
                  type="number"
                  value={form.step_order}
                  onChange={(e) => setForm({ ...form, step_order: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div>
                <Label className="text-xs">Tipo *</Label>
                <Select value={form.step_type} onValueChange={(v) => setForm({ ...form, step_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STEP_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">URL da página</Label>
              <Input value={form.page_url} onChange={(e) => setForm({ ...form, page_url: e.target.value })} />
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
            <Button onClick={handleSave} disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
