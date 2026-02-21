import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { useUpdateCriativoStatus } from "@/features/creatives/hooks/useCriativos";
import { useNavigate } from "react-router-dom";
import { FileText, Film, Skull, Zap } from "lucide-react";
import { ReactNode, useState } from "react";

const COLUMNS: { id: string; label: string; icon: ReactNode }[] = [
  { id: "DRAFT", label: "Draft", icon: <FileText className="h-3.5 w-3.5 inline-block mr-1" /> },
  { id: "PRODUCAO", label: "Produção", icon: <Film className="h-3.5 w-3.5 inline-block mr-1" /> },
  { id: "ATIVO", label: "Ativo", icon: <Zap className="h-3.5 w-3.5 inline-block mr-1" /> },
  { id: "MORTO", label: "Morto", icon: <Skull className="h-3.5 w-3.5 inline-block mr-1" /> },
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
  const [draggingOver, setDraggingOver] = useState<string | null>(null);

  const handleDragStart = (e: React.DragEvent, criativoId: string) => {
    e.dataTransfer.setData("criativoId", criativoId);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    setDraggingOver(null);
    const criativoId = e.dataTransfer.getData("criativoId");
    if (!criativoId) return;
    const criativo = criativos.find(c => c.id === criativoId);
    if (criativo && criativo.status !== newStatus) {
      updateStatus.mutate({ id: criativoId, status: newStatus });
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDragEnter = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    setDraggingOver(colId);
  };

  const handleDragLeave = (e: React.DragEvent, colId: string) => {
    // Only clear if leaving the column container itself (not a child)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggingOver(prev => prev === colId ? null : prev);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {COLUMNS.map((col) => {
        const items = criativos?.filter((c) => c.status === col.id) || [];
        const isOver = draggingOver === col.id;
        return (
          <div
            key={col.id}
            className={`rounded-lg p-3 min-h-[300px] transition-colors ${isOver ? "bg-primary/10 border-2 border-primary/40 border-dashed" : "bg-muted/30 border-2 border-transparent"}`}
            onDrop={(e) => handleDrop(e, col.id)}
            onDragOver={handleDragOver}
            onDragEnter={(e) => handleDragEnter(e, col.id)}
            onDragLeave={(e) => handleDragLeave(e, col.id)}
          >
            <p className="text-sm font-semibold mb-3 flex items-center">
              {col.icon}{col.label}{" "}
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
