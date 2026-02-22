import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { useUpdateCriativoStatus, useDuplicateCriativo } from "@/features/creatives/hooks/useCriativos";
import { Copy, FileText, Film, Skull, Zap } from "lucide-react";
import { ReactNode, useState } from "react";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/shared/components/ui/tooltip";

const COLUMNS: { id: string; label: string; icon: ReactNode }[] = [
  { id: "DRAFT", label: "Draft", icon: <FileText className="h-3.5 w-3.5 inline-block mr-1" /> },
  { id: "PRODUCAO", label: "Produção", icon: <Film className="h-3.5 w-3.5 inline-block mr-1" /> },
  { id: "ATIVO", label: "Ativo", icon: <Zap className="h-3.5 w-3.5 inline-block mr-1" /> },
  { id: "MORTO", label: "Morto", icon: <Skull className="h-3.5 w-3.5 inline-block mr-1" /> },
];

interface Criativo {
  id: string;
  nome: string;
  hook_text: string;
  status: string | null;
  plataforma: string | null;
  tipo: string;
  thumbnail_url: string | null;
  oferta_id: string;
  copy_body?: string | null;
  copy_headline?: string | null;
  cta?: string | null;
  angulo?: string | null;
  tags?: string[] | null;
}

interface KanbanBoardProps {
  criativos: Criativo[];
}

export function KanbanBoard({ criativos }: KanbanBoardProps) {
  const updateStatus = useUpdateCriativoStatus();
  const duplicateMutation = useDuplicateCriativo();
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
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDraggingOver(prev => prev === colId ? null : prev);
    }
  };

  const handleDuplicate = (e: React.MouseEvent, criativo: Criativo) => {
    e.stopPropagation();
    duplicateMutation.mutate({
      id: criativo.id,
      oferta_id: criativo.oferta_id,
      nome: criativo.nome,
      tipo: criativo.tipo,
      hook_text: criativo.hook_text,
      copy_body: criativo.copy_body,
      copy_headline: criativo.copy_headline,
      cta: criativo.cta,
      plataforma: criativo.plataforma,
      angulo: criativo.angulo,
      tags: criativo.tags,
    });
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
                  className="cursor-move hover:border-primary/40 transition-colors group"
                >
                  <CardContent className="p-3 space-y-2">
                    {criativo.thumbnail_url && (
                      <img
                        src={criativo.thumbnail_url}
                        alt={criativo.nome}
                        className="w-full h-20 object-cover rounded"
                      />
                    )}
                    <div className="flex items-start justify-between gap-1">
                      <p className="text-sm font-medium line-clamp-1">{criativo.nome}</p>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button
                            onClick={(e) => handleDuplicate(e, criativo)}
                            className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0 p-0.5 rounded hover:bg-muted"
                          >
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>Duplicar criativo</TooltipContent>
                      </Tooltip>
                    </div>
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
                      {criativo.angulo && (
                        <Badge variant="secondary" className="text-[10px]">
                          {criativo.angulo}
                        </Badge>
                      )}
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
