import { useParams, useNavigate } from "react-router-dom";
import { useOferta, useUpdateOferta, useDeleteOferta } from "@/features/offers/hooks/useOfertas";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { Switch } from "@/shared/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Save, Trash2, Loader2, FlaskConical, Zap, Pause, Skull, Package } from "lucide-react";
import { useState, useEffect } from "react";
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
const checkoutProviders = ["Hotmart", "Kiwify", "Eduzz", "Monetizze", "ClickBank", "Digistore24", "Outro"];
const vslPlayers = ["Vturb", "Wistia", "YouTube", "Vimeo", "Custom", "Outro"];

export default function OfertaDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: oferta, isLoading } = useOferta(id);
  const updateMutation = useUpdateOferta();
  const deleteMutation = useDeleteOferta();

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [form, setForm] = useState({
    nome: "",
    vertical: "",
    mercado: "",
    nicho: "",
    status: "RESEARCH",
    ticket_front: "",
    cpa_target: "",
    aov_target: "",
    roas_target: "",
    promessa_principal: "",
    mecanismo_unico: "",
    dominio_principal: "",
    checkout_provider: "",
    vsl_player: "",
    plataforma_quiz: "",
    tem_cloaker: false,
    tem_quiz: false,
    data_lancamento: "",
    notas: "",
  });

  useEffect(() => {
    if (oferta) {
      setForm({
        nome: oferta.nome,
        vertical: oferta.vertical || "",
        mercado: oferta.mercado || "",
        nicho: oferta.nicho || "",
        status: oferta.status,
        ticket_front: oferta.ticket_front?.toString() || "",
        cpa_target: oferta.cpa_target?.toString() || "",
        aov_target: oferta.aov_target?.toString() || "",
        roas_target: oferta.roas_target?.toString() || "",
        promessa_principal: oferta.promessa_principal || "",
        mecanismo_unico: oferta.mecanismo_unico || "",
        dominio_principal: oferta.dominio_principal || "",
        checkout_provider: oferta.checkout_provider || "",
        vsl_player: oferta.vsl_player || "",
        plataforma_quiz: oferta.plataforma_quiz || "",
        tem_cloaker: oferta.tem_cloaker || false,
        tem_quiz: oferta.tem_quiz || false,
        data_lancamento: oferta.data_lancamento || "",
        notas: oferta.notas || "",
      });
    }
  }, [oferta]);

  const handleSave = () => {
    if (!id) return;
    updateMutation.mutate({
      id,
      data: {
        nome: form.nome,
        vertical: form.vertical || null,
        mercado: form.mercado || null,
        nicho: form.nicho || null,
        status: form.status,
        ticket_front: form.ticket_front ? Number(form.ticket_front) : null,
        cpa_target: form.cpa_target ? Number(form.cpa_target) : null,
        aov_target: form.aov_target ? Number(form.aov_target) : null,
        roas_target: form.roas_target ? Number(form.roas_target) : null,
        promessa_principal: form.promessa_principal || null,
        mecanismo_unico: form.mecanismo_unico || null,
        dominio_principal: form.dominio_principal || null,
        checkout_provider: form.checkout_provider || null,
        vsl_player: form.vsl_player || null,
        plataforma_quiz: form.plataforma_quiz || null,
        tem_cloaker: form.tem_cloaker,
        tem_quiz: form.tem_quiz,
        data_lancamento: form.data_lancamento || null,
        notas: form.notas || null,
      },
    });
  };

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id, { onSuccess: () => navigate("/ofertas") });
  };

  const update = (field: string, value: string | boolean) =>
    setForm((f) => ({ ...f, [field]: value }));

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
          <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)} disabled={deleteMutation.isPending}>
            <Trash2 className="h-4 w-4 mr-1" /> Deletar
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Form sections */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic info */}
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
            <div className="space-y-2">
              <Label>Nicho</Label>
              <Input value={form.nicho} onChange={(e) => update("nicho", e.target.value)} placeholder="Ex: Emagrecimento 40+" />
            </div>
            <div className="space-y-2">
              <Label>Data de Lançamento</Label>
              <Input type="date" value={form.data_lancamento} onChange={(e) => update("data_lancamento", e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* Metrics */}
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

        {/* Tech stack */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Stack Técnica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Dominio Principal</Label>
              <Input value={form.dominio_principal} onChange={(e) => update("dominio_principal", e.target.value)} placeholder="exemplo.com" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Checkout</Label>
                <Select value={form.checkout_provider} onValueChange={(v) => update("checkout_provider", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {checkoutProviders.map((c) => (
                      <SelectItem key={c} value={c}>{c}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>VSL Player</Label>
                <Select value={form.vsl_player} onValueChange={(v) => update("vsl_player", v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {vslPlayers.map((v) => (
                      <SelectItem key={v} value={v}>{v}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Plataforma Quiz</Label>
              <Input value={form.plataforma_quiz} onChange={(e) => update("plataforma_quiz", e.target.value)} placeholder="Ex: Typeform, Nativoo" />
            </div>
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Switch checked={form.tem_cloaker} onCheckedChange={(v) => update("tem_cloaker", v)} />
                <Label className="cursor-pointer">Usa Cloaker</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={form.tem_quiz} onCheckedChange={(v) => update("tem_quiz", v)} />
                <Label className="cursor-pointer">Tem Quiz</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy */}
        <Card>
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

        {/* Notes */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Notas</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={form.notas}
              onChange={(e) => update("notas", e.target.value)}
              rows={5}
              placeholder="Notas livres sobre a oferta... (suporta Markdown)"
              className="font-mono text-sm"
            />
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar oferta?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os dados da oferta serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
