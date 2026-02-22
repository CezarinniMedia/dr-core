import { useState } from "react";
import { useOfferDomains, useCreateOfferDomain, useDeleteOfferDomain, useUpdateOfferDomain } from "@/features/spy/hooks/useSpiedOffers";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Badge } from "@/shared/components/ui/badge";
import { Checkbox } from "@/shared/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/shared/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/shared/components/ui/table";
import { Plus, Trash2, Star, ExternalLink, Loader2, Edit } from "lucide-react";
import { format } from "date-fns";

const TYPE_BADGE: Record<string, string> = {
  landing_page: "bg-[rgba(59,130,246,0.1)] text-[color:var(--accent-blue)] border-[rgba(59,130,246,0.2)]",
  cloaker: "bg-[rgba(239,68,68,0.1)] text-[color:var(--semantic-error)] border-[rgba(239,68,68,0.2)]",
  checkout: "bg-[rgba(34,197,94,0.1)] text-[color:var(--accent-green)] border-[rgba(34,197,94,0.2)]",
  quiz: "bg-[rgba(234,179,8,0.1)] text-[color:var(--semantic-warning)] border-[rgba(234,179,8,0.2)]",
  preland: "bg-[rgba(124,58,237,0.1)] text-[color:var(--accent-primary)] border-[rgba(124,58,237,0.2)]",
  advertorial: "bg-[rgba(124,58,237,0.1)] text-[color:var(--accent-primary)] border-[rgba(124,58,237,0.2)]",
  redirect: "bg-[rgba(107,114,128,0.1)] text-[color:var(--text-muted)] border-[rgba(107,114,128,0.2)]",
  other: "bg-[rgba(107,114,128,0.1)] text-[color:var(--text-muted)] border-[rgba(107,114,128,0.2)]",
  thank_you: "bg-[rgba(34,197,94,0.1)] text-[color:var(--accent-green)] border-[rgba(34,197,94,0.2)]",
  upsell: "bg-[rgba(59,130,246,0.1)] text-[color:var(--accent-blue)] border-[rgba(59,130,246,0.2)]",
};

const DOMAIN_TYPES = ["landing_page", "cloaker", "checkout", "quiz", "preland", "advertorial", "redirect", "thank_you", "upsell", "other"];

interface SpyDomainsTabProps {
  offerId: string;
}

const emptyForm = {
  domain: "", domain_type: "landing_page", url: "", is_main: false,
  tech_stack: "", notas: "", first_seen: "", discovery_query: "",
};

export function SpyDomainsTab({ offerId }: SpyDomainsTabProps) {
  const { data: domains, isLoading } = useOfferDomains(offerId);
  const createMutation = useCreateOfferDomain();
  const updateMutation = useUpdateOfferDomain();
  const deleteMutation = useDeleteOfferDomain();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ ...emptyForm });

  const openAdd = () => {
    setEditingId(null);
    setForm({ ...emptyForm });
    setShowForm(true);
  };

  const openEdit = (d: any) => {
    setEditingId(d.id);
    setForm({
      domain: d.domain || "",
      domain_type: d.domain_type || "landing_page",
      url: d.url || "",
      is_main: d.is_main || false,
      tech_stack: d.tech_stack?.raw || (typeof d.tech_stack === "string" ? d.tech_stack : ""),
      notas: d.notas || "",
      first_seen: d.first_seen || "",
      discovery_query: d.discovery_query || "",
    });
    setShowForm(true);
  };

  const handleSave = () => {
    if (!form.domain.trim()) return;
    const payload: Record<string, any> = {
      domain: form.domain,
      domain_type: form.domain_type,
      url: form.url || null,
      is_main: form.is_main,
      tech_stack: form.tech_stack ? { raw: form.tech_stack } : null,
      notas: form.notas || null,
      first_seen: form.first_seen || null,
      discovery_query: form.discovery_query || null,
    };

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, offerId, data: payload },
        { onSuccess: () => { setShowForm(false); setEditingId(null); } }
      );
    } else {
      createMutation.mutate(
        { ...payload, spied_offer_id: offerId },
        { onSuccess: () => { setShowForm(false); setForm({ ...emptyForm }); } }
      );
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={openAdd}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Domínio
        </Button>
      </div>

      {!domains || domains.length === 0 ? (
        <div className="border border-dashed border-[var(--border-default)] rounded-[var(--radius-lg)] p-8 text-center bg-[var(--bg-surface)]">
          <p className="text-[color:var(--text-muted)] text-sm">Nenhum domínio cadastrado.</p>
        </div>
      ) : (
        <div className="border border-[var(--border-default)] rounded-[var(--radius-lg)] overflow-x-auto bg-[var(--bg-surface)]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domínio</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="w-[50px]">Main</TableHead>
                <TableHead>Detectado em</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Query/Script</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead className="w-[80px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {domains.map((d: any) => (
                <TableRow key={d.id}>
                  <TableCell className="font-medium text-sm">{d.domain}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={TYPE_BADGE[d.domain_type] || ""}>{d.domain_type}</Badge>
                  </TableCell>
                  <TableCell>
                    {d.url ? (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-[color:var(--accent-teal)] hover:underline text-xs flex items-center gap-1">
                        Link <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell>{d.is_main && <Star className="h-4 w-4 text-warning" />}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {d.first_seen ? format(new Date(d.first_seen), "dd/MM/yyyy") : "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{d.discovery_source || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate" title={d.discovery_query || ""}>
                    {d.discovery_query || "—"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{d.notas || "—"}</TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7" aria-label="Editar dominio" onClick={() => openEdit(d)}>
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" aria-label="Deletar dominio" onClick={() => deleteMutation.mutate({ id: d.id, offerId })}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar Domínio" : "Adicionar Domínio"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Domínio *</Label>
              <Input placeholder="chabariatrico.fun" value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Tipo</Label>
              <Select value={form.domain_type} onValueChange={(v) => setForm({ ...form, domain_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DOMAIN_TYPES.map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">URL completa</Label>
              <Input value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} placeholder="https://..." />
            </div>
            <div>
              <Label className="text-xs">Detectado em</Label>
              <Input type="date" value={form.first_seen} onChange={(e) => setForm({ ...form, first_seen: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox checked={form.is_main} onCheckedChange={(v) => setForm({ ...form, is_main: !!v })} />
              <Label className="text-xs">Domínio principal</Label>
            </div>
            <div>
              <Label className="text-xs">Query/Script src usado</Label>
              <Input value={form.discovery_query} onChange={(e) => setForm({ ...form, discovery_query: e.target.value })} placeholder="cdn.utmify.com.br" />
            </div>
            <div>
              <Label className="text-xs">Tech Stack</Label>
              <Input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="vturb, hotmart, fb pixel" />
            </div>
            <div>
              <Label className="text-xs">Notas</Label>
              <Input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancelar</Button>
            <Button onClick={handleSave} disabled={isPending || !form.domain.trim()}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin mr-1" />}
              {editingId ? "Atualizar" : "Salvar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
