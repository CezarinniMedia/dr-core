import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useExtractAvatar } from "@/features/avatar/hooks/useAvatares";
import { useOfertas } from "@/features/offers/hooks/useOfertas";
import { Loader2, Sparkles } from "lucide-react";

interface AvatarExtractionModalProps {
  open: boolean;
  onClose: () => void;
  preselectedOfertaId?: string;
}

export function AvatarExtractionModal({ open, onClose, preselectedOfertaId }: AvatarExtractionModalProps) {
  const [researchNotes, setResearchNotes] = useState("");
  const [selectedOfertaId, setSelectedOfertaId] = useState(preselectedOfertaId || "");
  const { data: ofertas } = useOfertas();
  const extractMutation = useExtractAvatar();

  const selectedOferta = ofertas?.find((o) => o.id === selectedOfertaId);

  const handleExtract = () => {
    const notes = researchNotes
      .split("\n---\n")
      .map((n) => n.trim())
      .filter((n) => n.length > 0);

    if (notes.length === 0 || !selectedOfertaId) return;

    extractMutation.mutate(
      {
        ofertaId: selectedOfertaId,
        ofertaNome: selectedOferta?.nome || "",
        vertical: selectedOferta?.vertical || "geral",
        researchNotes: notes,
      },
      {
        onSuccess: () => {
          onClose();
          setResearchNotes("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Extrair Avatar com IA
          </DialogTitle>
          <DialogDescription>
            Cole posts, reviews, comentários do avatar. Separe cada nota com "---".
            A IA vai analisar e extrair Pain Matrix profunda, desejos, objeções e linguagem.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Oferta</Label>
            <Select value={selectedOfertaId} onValueChange={setSelectedOfertaId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a oferta..." />
              </SelectTrigger>
              <SelectContent>
                {ofertas?.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Research Data</Label>
            <Textarea
              value={researchNotes}
              onChange={(e) => setResearchNotes(e.target.value)}
              placeholder={`Post do Reddit sobre o problema...\n\n---\n\nReview negativo de produto concorrente...\n\n---\n\nComentário de Facebook group...`}
              rows={12}
              className="font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Quanto mais research data, melhor a extração. Mínimo: 3 fontes.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={extractMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleExtract}
            disabled={extractMutation.isPending || !selectedOfertaId || researchNotes.trim().length === 0}
          >
            {extractMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Extraindo... (30-60s)
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Extrair Avatar
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
