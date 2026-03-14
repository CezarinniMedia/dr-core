import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Edit2, Check, X } from "lucide-react";

const PAIN_LEVELS = [
  {
    nivel: 1,
    label: "Superficial",
    description: "Sintoma visível",
    colorClass: "border-l-4 border-l-[hsl(var(--info))]",
    example: 'Ex: "Estou acima do peso"',
  },
  {
    nivel: 2,
    label: "Causa Imediata",
    description: "O que gera o sintoma",
    colorClass: "border-l-4 border-l-[hsl(var(--success))]",
    example: 'Ex: "Como muito à noite"',
  },
  {
    nivel: 3,
    label: "Consequência",
    description: "Impacto na vida",
    colorClass: "border-l-4 border-l-[hsl(var(--warning))]",
    example: 'Ex: "Não consigo usar as roupas que quero"',
  },
  {
    nivel: 4,
    label: "Emocional",
    description: "Como se sente",
    colorClass: "border-l-4 border-l-[hsl(var(--accent))]",
    example: 'Ex: "Me sinto envergonhada"',
  },
  {
    nivel: 5,
    label: "Identidade",
    description: "Quem acha que é",
    colorClass: "border-l-4 border-l-[hsl(var(--destructive))]",
    example: 'Ex: "Sou uma pessoa sem controle"',
  },
];

interface PainMatrixCanvasProps {
  painMatrix: Array<{ nivel: number; dor: string }>;
  onChange: (matrix: Array<{ nivel: number; dor: string }>) => void;
  readonly?: boolean;
}

export function PainMatrixCanvas({ painMatrix, onChange, readonly }: PainMatrixCanvasProps) {
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (nivel: number) => {
    const pain = painMatrix.find((p) => p.nivel === nivel);
    setEditValue(pain?.dor || "");
    setEditingLevel(nivel);
  };

  const handleSave = (nivel: number) => {
    const updated = painMatrix.filter((p) => p.nivel !== nivel);
    if (editValue.trim()) {
      updated.push({ nivel, dor: editValue.trim() });
    }
    onChange(updated.sort((a, b) => a.nivel - b.nivel));
    setEditingLevel(null);
    setEditValue("");
  };

  const handleCancel = () => {
    setEditingLevel(null);
    setEditValue("");
  };

  return (
    <div className="space-y-3">
      {PAIN_LEVELS.map(({ nivel, label, description, colorClass, example }) => {
        const pain = painMatrix.find((p) => p.nivel === nivel);
        const isEditing = editingLevel === nivel;

        return (
          <Card key={nivel} className={`p-4 ${colorClass}`}>
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground">
                  Nível {nivel}: {label}
                </span>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              {!readonly && !isEditing && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => handleEdit(nivel)}
                >
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-3 space-y-2">
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  placeholder={example}
                  rows={2}
                  className="text-sm"
                />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave(nivel)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={handleCancel}>
                    <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-2">
                {pain?.dor || (
                  <span className="text-muted-foreground italic">{example}</span>
                )}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
