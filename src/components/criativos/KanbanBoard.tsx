import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUpdateCriativoStatus } from "@/hooks/useCriativos";
import { useNavigate } from "react-router-dom";

const COLUMNS = [
  { id: "DRAFT", label: "📝 Draft" },
  { id: "PRODUCAO", label: "🎬 Produção" },
  { id: "ATIVO", label: "⚡ Ativo" },
  { id: "MORTO", label: "☠️ Morto" },
];

interface KanbanBoardProps {
  criativos: Array<{
    id: string;
    nome: string;
    hook_text: string;
    status: string | null;
    plataforma: string | null;
    tipo: string;
    thumbnail_url: string | null;
  }>;
}

export function KanbanBoard({ criativos }: KanbanBoardProps) {
  const updateStatus = useUpdateCriativoStatus();
  const navigate = useNavigate();

  const handleDragStart = (e: React.DragEvent, criativoId: string) => {
    e.dataTransfer.setData("criativoId", criativoId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const criativoId = e.dataTransfer.getData("criativoId");
    if (criativoId) {
      updateStatus.mutate({ id: criativoId, status: newStatus });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = criativos?.filter((c) => c.status === col.id) || [];
        return (
          <div
            key={col.id}
            className="bg-muted/30 rounded-lg p-3 min-h-[300px]"
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
          >
            <p className="text-sm font-semibold mb-3">
              {col.label}{" "}
              <span className="text-muted-foreground">({items.length})</span>
            </p>

            <div className="space-y-2">
              {items.map((criativo) => (
                <Card
                  key={criativo.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, criativo.id)}
                  className="cursor-move hover:border-primary/40 transition-colors"
                >
                  <CardContent className="p-3 space-y-2">
                    {criativo.thumbnail_url && (
                      <img
                        src={criativo.thumbnail_url}
                        alt={criativo.nome}
                        className="w-full h-20 object-cover rounded"
                      />
                    )}
                    <p className="text-sm font-medium line-clamp-1">{criativo.nome}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {criativo.hook_text}
                    </p>
                    <div className="flex gap-1">
                      {criativo.plataforma && (
                        <Badge variant="outline" className="text-[10px]">
                          {criativo.plataforma}
                        </Badge>
                      )}
                      <Badge variant="secondary" className="text-[10px]">
                        {criativo.tipo}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
