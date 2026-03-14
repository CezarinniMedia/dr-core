import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Gem, Target, Trash2, Eye, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AvatarCardProps {
  avatar: {
    id: string;
    nome: string;
    versao: number;
    pain_matrix: Array<{ nivel: number; dor: string }>;
    desire_matrix: Array<{ nivel: number; desejo: string }>;
    gatilhos_emocionais: string[] | null;
    ofertas?: { nome: string; vertical: string | null } | null;
    created_at: string | null;
  };
  onDelete: (id: string) => void;
}

export function AvatarCard({ avatar, onDelete }: AvatarCardProps) {
  const navigate = useNavigate();
  const painCount = Array.isArray(avatar.pain_matrix) ? avatar.pain_matrix.length : 0;
  const desireCount = Array.isArray(avatar.desire_matrix) ? avatar.desire_matrix.length : 0;

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{avatar.nome}</CardTitle>
            {avatar.ofertas && (
              <p className="text-xs text-muted-foreground mt-1">
                {avatar.ofertas.nome} · {avatar.ofertas.vertical || "—"}
              </p>
            )}
          </div>
          <Badge variant="secondary" className="text-xs">
            v{avatar.versao}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Target className="h-3 w-3" /> {painCount}/5 dores</span>
          <span className="flex items-center gap-1"><Gem className="h-3 w-3" /> {desireCount}/3 desejos</span>
          {avatar.gatilhos_emocionais && (
            <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> {avatar.gatilhos_emocionais.length} gatilhos</span>
          )}
        </div>

        {painCount > 0 && (
          <p className="text-sm text-foreground line-clamp-2">
            <span className="font-medium">Dor principal:</span> {avatar.pain_matrix[0]?.dor}
          </p>
        )}

        <div className="flex gap-2 pt-1">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => navigate(`/avatar/${avatar.id}`)}
          >
            <Eye className="h-3.5 w-3.5 mr-1" /> Ver Detalhes
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-destructive hover:text-destructive"
            aria-label="Deletar avatar"
            onClick={() => onDelete(avatar.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
