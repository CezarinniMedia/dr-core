import { useParams, useNavigate } from "react-router-dom";
import { useOferta, useUpdateOferta, useDeleteOferta } from "@/features/offers/hooks/useOfertas";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Save, Trash2, Loader2, FlaskConical, Zap, Pause, Skull, Package } from "lucide-react";
import { useState, useEffect } from "react";
import { formatCurrency } from "@/shared/lib/utils";
import { PageBreadcrumb } from "@/shared/components/ui/PageBreadcrumb";

const statusOptions: { value: string; label: React.ReactNode }[] = [
  { value: "RESEARCH", label: <><FlaskConical className="h-4 w-4 inline mr-1" />Research</> },
  { value: "TEST", label: <><FlaskConical className="h-4 w-4 inline mr-1" />Testando</> },
  { value: "ATIVA", label: <><Zap className="h-4 w-4 inline mr-1" />Ativa</> },
  { value: "PAUSE", label: <><Pause className="h-4 w-4 inline mr-1" />Pausada</> },
  { value: "MORTA", label: <><Skull className="h-4 w-4 inline mr-1" />Morta</> },
];

const verticais = ["Saúde", "Finanças", "Relacionamento", "Educação", "Negócios", "Outro"];
const mercados = ["BR", "US", "EU", "LATAM", "Global"];

export default function OfertaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: oferta, isLoading } = useOferta(id);
  const updateMutation = useUpdateOferta();
  const deleteMutation = useDeleteOferta();

  const [form, setForm] = useState({
    nome: "",
    vertical: "",
    mercado: "",
    status: "RESEARCH",
    ticket_front: "",
    cpa_target: "",
    aov_target: "",
    roas_target: "",
    promessa_principal: "",
    mecanismo_unico: "",
  });

  useEffect(() => {
    if (oferta) {
      setForm({
        nome: oferta.nome,
        vertical: oferta.vertical || "",
        mercado: oferta.mercado || "",
        status: oferta.status,
        ticket_front: oferta.ticket_front?.toString() || "",
        cpa_target: oferta.cpa_target?.toString() || "",
        aov_target: oferta.aov_target?.toString() || "",
        roas_target: oferta.roas_target?.toString() || "",
        promessa_principal: oferta.promessa_principal || "",
        mecanismo_unico: oferta.mecanismo_unico || "",
      });
    }
  }, [oferta]);

  const handleSave = () => {
    if (!id) return;
    updateMutation.mutate({
      id,
      data: {
        nome: form.nome,
        slug: "",
        vertical: form.vertical || null,
        mercado: form.mercado || null,
        status: form.status,
        ticket_front: form.ticket_front ? Number(form.ticket_front) : null,
        cpa_target: form.cpa_target ? Number(form.cpa_target) : null,
        aov_target: form.aov_target ? Number(form.aov_target) : null,
        roas_target: form.roas_target ? Number(form.roas_target) : null,
        promessa_principal: form.promessa_principal || null,
        mecanismo_unico: form.mecanismo_unico || null,
        data_lancamento: null,
      },
    });
  };

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, { onSuccess: () => navigate("/ofertas") });
  };

  const update = (field: string, value: string) => setForm((f) => ({ ...f, [field]: value }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!oferta) {
    return (
      <div className="space-y-4 max-w-4xl">
        <PageBreadcrumb items={[
          { label: "Ofertas", href: "/ofertas", icon: Package },
          { label: "Oferta não encontrada" },
        ]} />
        <p className="text-muted-foreground">Oferta não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/ofertas")}>
          Voltar às Ofertas
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Breadcrumb */}
      <PageBreadcrumb items={[
        { label: "Ofertas", href: "/ofertas", icon: Package },
        { label: oferta.nome },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{oferta.nome}</h1>
          <p className="text-sm text-muted-foreground">
            Criada em {new Date(oferta.created_at).toLocaleDateString("pt-BR")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-1" /> Deletar
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações Básicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => update("nome", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={form.status} onValueChange={(v) => update("status", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {statusOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Vertical</Label>
                <Select value={form.vertical} onValueChange={(v) => update("vertical", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {verticais.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Mercado</Label>
                <Select value={form.mercado} onValueChange={(v) => update("mercado", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {mercados.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Métricas Target</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ticket Front (R$)</Label>
                <Input type="number" step="0.01" value={form.ticket_front} onChange={(e) => update("ticket_front", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>CPA Target (R$)</Label>
                <Input type="number" step="0.01" value={form.cpa_target} onChange={(e) => update("cpa_target", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>AOV Target (R$)</Label>
                <Input type="number" step="0.01" value={form.aov_target} onChange={(e) => update("aov_target", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>ROAS Target</Label>
                <Input type="number" step="0.01" value={form.roas_target} onChange={(e) => update("roas_target", e.target.value)} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Estratégia</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Promessa Principal</Label>
              <Textarea value={form.promessa_principal} onChange={(e) => update("promessa_principal", e.target.value)} rows={3} />
            </div>
            <div className="space-y-2">
              <Label>Mecanismo Único</Label>
              <Textarea value={form.mecanismo_unico} onChange={(e) => update("mecanismo_unico", e.target.value)} rows={3} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
