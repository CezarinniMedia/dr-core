import { useState } from "react";
import { useOfferAdLibraries, useCreateOfferAdLibrary, useDeleteOfferAdLibrary } from "@/hooks/useSpiedOffers";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Trash2, ExternalLink, Loader2 } from "lucide-react";

interface SpyLibrariesTabProps {
  offerId: string;
}

export function SpyLibrariesTab({ offerId }: SpyLibrariesTabProps) {
  const { data: libraries, isLoading } = useOfferAdLibraries(offerId);
  const createMutation = useCreateOfferAdLibrary();
  const deleteMutation = useDeleteOfferAdLibrary();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    platform: "facebook",
    page_name: "",
    page_id: "",
    library_url: "",
    ad_count: "",
    is_scaled: false,
    sites_found: "",
    notas: "",
  });

  const handleSave = () => {
    createMutation.mutate(
      {
        spied_offer_id: offerId,
        platform: form.platform,
        page_name: form.page_name || null,
        page_id: form.page_id || null,
        library_url: form.library_url || null,
        ad_count: form.ad_count ? parseInt(form.ad_count) : null,
        is_scaled: form.is_scaled,
        sites_found: form.sites_found
          ? form.sites_found.split("\n").filter(Boolean)
          : null,
        notas: form.notas || null,
      },
      {
        onSuccess: () => {
          setShowForm(false);
          setForm({ platform: "facebook", page_name: "", page_id: "", library_url: "", ad_count: "", is_scaled: false, sites_found: "", notas: "" });
        },
      }
    );
  };

  if (isLoading) return <p className="text-muted-foreground text-sm">Carregando...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar Biblioteca
        </Button>
      </div>

      {!libraries || libraries.length === 0 ? (
        <div className="border border-dashed rounded-lg p-8 text-center">
          <p className="text-muted-foreground text-sm">Nenhuma biblioteca cadastrada.</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plataforma</TableHead>
                <TableHead>Página</TableHead>
                <TableHead>Page ID</TableHead>
                <TableHead className="text-center">Anúncios</TableHead>
                <TableHead className="text-center">Escalado?</TableHead>
                <TableHead>Link</TableHead>
                <TableHead>Sites</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {libraries.map((lib: any) => (
                <TableRow key={lib.id}>
                  <TableCell>
                    <Badge variant="outline">{lib.platform}</Badge>
                  </TableCell>
                  <TableCell className="text-sm">{lib.page_name || "—"}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{lib.page_id || "—"}</TableCell>
                  <TableCell className="text-center text-sm">{lib.ad_count ?? "—"}</TableCell>
                  <TableCell className="text-center">
                    {lib.is_scaled ? (
                      <Badge className="bg-success/20 text-success">🚀 Sim</Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground">Não</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {lib.library_url ? (
                      <a href={lib.library_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline text-xs flex items-center gap-1">
                        Abrir <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : "—"}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {(lib.sites_found as string[] | null)?.slice(0, 3).map((s, i) => (
                        <Badge key={i} variant="outline" className="text-[10px]">{s}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive"
                      onClick={() => deleteMutation.mutate({ id: lib.id, offerId })}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
            <DialogTitle>Adicionar Biblioteca</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Plataforma</Label>
              <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Nome da página</Label>
                <Input value={form.page_name} onChange={(e) => setForm({ ...form, page_name: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Page ID</Label>
                <Input value={form.page_id} onChange={(e) => setForm({ ...form, page_id: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Link da biblioteca</Label>
              <Input value={form.library_url} onChange={(e) => setForm({ ...form, library_url: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Qtd de anúncios</Label>
                <Input type="number" value={form.ad_count} onChange={(e) => setForm({ ...form, ad_count: e.target.value })} />
              </div>
              <div className="flex items-center gap-2 pt-5">
                <Switch checked={form.is_scaled} onCheckedChange={(v) => setForm({ ...form, is_scaled: v })} />
                <Label className="text-xs">Está escalado?</Label>
              </div>
            </div>
            <div>
              <Label className="text-xs">Sites encontrados (um por linha)</Label>
              <Textarea rows={3} value={form.sites_found} onChange={(e) => setForm({ ...form, sites_found: e.target.value })} placeholder="chabariatrico.fun&#10;emagrecerja.com" />
            </div>
            <div>
              <Label className="text-xs">Notas</Label>
              <Input value={form.notas} onChange={(e) => setForm({ ...form, notas: e.target.value })} />
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
