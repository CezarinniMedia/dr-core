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
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Slider } from "@/shared/components/ui/slider";
import { Textarea } from "@/shared/components/ui/textarea";
import { useGenerateHooks } from "@/features/creatives/hooks/useCriativos";
import { Crown, Gem, HelpCircle, Loader2, Sparkles, Target, Users } from "lucide-react";

interface HookGeneratorModalProps {
  open: boolean;
  onClose: () => void;
  ofertaId: string;
}

export function HookGeneratorModal({ open, onClose, ofertaId }: HookGeneratorModalProps) {
  const [angulo, setAngulo] = useState("DOR");
  const [quantidade, setQuantidade] = useState(10);
  const [avatarContext, setAvatarContext] = useState("");
  const generateMutation = useGenerateHooks();

  const handleGenerate = () => {
    if (!avatarContext.trim()) return;

    generateMutation.mutate(
      { ofertaId, angulo, quantidade, avatarContext },
      {
        onSuccess: () => {
          onClose();
          setAvatarContext("");
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Gerar Hooks com IA
          </DialogTitle>
          <DialogDescription>
            A IA vai criar múltiplos hooks variados baseados no avatar e ângulo escolhido.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Ângulo</Label>
            <Select value={angulo} onValueChange={setAngulo}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DOR" className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5 inline-block mr-1" /> DOR (Pain-driven)</SelectItem>
                <SelectItem value="DESEJO" className="flex items-center gap-1.5"><Gem className="h-3.5 w-3.5 inline-block mr-1" /> DESEJO (Desire-driven)</SelectItem>
                <SelectItem value="CURIOSIDADE" className="flex items-center gap-1.5"><HelpCircle className="h-3.5 w-3.5 inline-block mr-1" /> CURIOSIDADE (Curiosity gap)</SelectItem>
                <SelectItem value="PROVA_SOCIAL" className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5 inline-block mr-1" /> PROVA SOCIAL</SelectItem>
                <SelectItem value="AUTORIDADE" className="flex items-center gap-1.5"><Crown className="h-3.5 w-3.5 inline-block mr-1" /> AUTORIDADE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Quantidade: {quantidade} hooks</Label>
            <Slider
              value={[quantidade]}
              onValueChange={(v) => setQuantidade(v[0])}
              min={5}
              max={50}
              step={5}
            />
            <p className="text-xs text-muted-foreground">
              Recomendado: 10-20 para testar. 50 para scaling.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Contexto do Avatar</Label>
            <Textarea
              value={avatarContext}
              onChange={(e) => setAvatarContext(e.target.value)}
              placeholder="Resumo das dores e desejos do avatar (copie da Pain Matrix)..."
              rows={6}
            />
            <p className="text-xs text-muted-foreground">
              Quanto mais contexto, melhores os hooks. Cole dores + desejos + linguagem do avatar.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={generateMutation.isPending}>
            Cancelar
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending || !avatarContext.trim()}
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Gerar {quantidade} Hooks
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
