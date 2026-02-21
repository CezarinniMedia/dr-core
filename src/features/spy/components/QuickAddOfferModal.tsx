import { useState, useEffect, useRef } from "react";
import { useCreateSpiedOffer } from "@/features/spy/hooks/useSpiedOffers";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
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
import { Loader2, Zap } from "lucide-react";

interface QuickAddOfferModalProps {
  open: boolean;
  onClose: () => void;
}

const INITIAL = {
  nome: "",
  main_domain: "",
  vertical: "",
  geo: "BR",
  product_ticket: "",
  discovery_source: "",
  discovery_query: "",
  checkout_provider: "",
  vsl_player: "",
  notas: "",
};

export function QuickAddOfferModal({ open, onClose }: QuickAddOfferModalProps) {
  const [form, setForm] = useState(INITIAL);
  const createMutation = useCreateSpiedOffer();
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => nameRef.current?.focus(), 100);
  }, [open]);

  const set = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSave = (keepOpen: boolean) => {
    if (!form.nome.trim()) return;

    const payload: Record<string, unknown> = {
      nome: form.nome.trim(),
      main_domain: form.main_domain || null,
      vertical: form.vertical || null,
      geo: form.geo,
      product_ticket: form.product_ticket ? parseFloat(form.product_ticket) : null,
      discovery_source: form.discovery_source || null,
      discovery_query: form.discovery_query || null,
      checkout_provider: form.checkout_provider || null,
      vsl_player: form.vsl_player || null,
      notas: form.notas || null,
      status: "RADAR",
    };

    createMutation.mutate(payload, {
      onSuccess: () => {
        if (keepOpen) {
          setForm({ ...INITIAL, vertical: form.vertical, geo: form.geo });
          setTimeout(() => nameRef.current?.focus(), 50);
        } else {
          setForm(INITIAL);
          onClose();
        }
      },
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
      e.preventDefault();
      handleSave(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" onKeyDown={handleKeyDown}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            Adicionar Oferta Rápida
          </DialogTitle>
          <DialogDescription>Preencha o mínimo. Complete depois.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Nome *</Label>
              <Input
                ref={nameRef}
                placeholder="Ex: Chá Bariátrico"
                value={form.nome}
                onChange={(e) => set("nome", e.target.value)}
              />
            </div>
            <div>
              <Label>Domínio principal</Label>
              <Input
                placeholder="Ex: chabariatrico.fun"
                value={form.main_domain}
                onChange={(e) => set("main_domain", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Vertical</Label>
              <Select value={form.vertical} onValueChange={(v) => set("vertical", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nutra">Nutra</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="tech">Tech</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Geo</Label>
              <Select value={form.geo} onValueChange={(v) => set("geo", v)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="BR">BR</SelectItem>
                  <SelectItem value="USA">USA</SelectItem>
                  <SelectItem value="EU">EU</SelectItem>
                  <SelectItem value="LATAM">LATAM</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Ticket</Label>
              <Input
                type="number"
                placeholder="R$ 97"
                value={form.product_ticket}
                onChange={(e) => set("product_ticket", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Fonte de descoberta</Label>
              <Select value={form.discovery_source} onValueChange={(v) => set("discovery_source", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="publicwww">PublicWWW</SelectItem>
                  <SelectItem value="fb_ads_library">FB Ads Library</SelectItem>
                  <SelectItem value="adheart">AdHeart</SelectItem>
                  <SelectItem value="semrush">Semrush</SelectItem>
                  <SelectItem value="reclameaqui">ReclameAqui</SelectItem>
                  <SelectItem value="google_dorks">Google Dorks</SelectItem>
                  <SelectItem value="manual">Manual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Query usada</Label>
              <Input
                placeholder="Ex: scripts.converti AND pay.hotmart.com"
                value={form.discovery_query}
                onChange={(e) => set("discovery_query", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Checkout</Label>
              <Select value={form.checkout_provider} onValueChange={(v) => set("checkout_provider", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="hotmart">Hotmart</SelectItem>
                  <SelectItem value="kiwify">Kiwify</SelectItem>
                  <SelectItem value="perfectpay">PerfectPay</SelectItem>
                  <SelectItem value="monetizze">Monetizze</SelectItem>
                  <SelectItem value="cakto">Cakto</SelectItem>
                  <SelectItem value="ticto">Ticto</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="cartpanda">CartPanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>VSL Player</Label>
              <Select value={form.vsl_player} onValueChange={(v) => set("vsl_player", v)}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="vturb">VTURB</SelectItem>
                  <SelectItem value="pandavideo">PandaVideo</SelectItem>
                  <SelectItem value="smartplayer">SmartPlayer</SelectItem>
                  <SelectItem value="wistia">Wistia</SelectItem>
                  <SelectItem value="youtube">YouTube</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Notas rápidas</Label>
            <Textarea
              rows={2}
              placeholder="Algo importante que notou..."
              value={form.notas}
              onChange={(e) => set("notas", e.target.value)}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} disabled={createMutation.isPending}>
            Cancelar
          </Button>
          <Button
            variant="outline"
            onClick={() => handleSave(true)}
            disabled={createMutation.isPending || !form.nome.trim()}
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Salvar e Adicionar Outra
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={createMutation.isPending || !form.nome.trim()}
          >
            {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : null}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
