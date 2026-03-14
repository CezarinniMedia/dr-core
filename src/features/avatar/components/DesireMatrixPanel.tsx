import { useState } from "react";
import { Card } from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Edit2, Check, X } from "lucide-react";

const DESIRE_LEVELS = [
  { nivel: 1, label: "Superficial", description: "O que diz que quer", example: 'Ex: "Quero emagrecer"' },
  { nivel: 2, label: "Verdadeiro", description: "O que realmente quer", example: 'Ex: "Quero me sentir atraente"' },
  { nivel: 3, label: "Transformação", description: "Quem quer se tornar", example: 'Ex: "Quero ser uma pessoa confiante"' },
];

interface DesireMatrixPanelProps {
  desireMatrix: Array<{ nivel: number; desejo: string }>;
  onChange: (matrix: Array<{ nivel: number; desejo: string }>) => void;
  readonly?: boolean;
}

export function DesireMatrixPanel({ desireMatrix, onChange, readonly }: DesireMatrixPanelProps) {
  const [editingLevel, setEditingLevel] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");

  const handleEdit = (nivel: number) => {
    setEditValue(desireMatrix.find((d) => d.nivel === nivel)?.desejo || "");
    setEditingLevel(nivel);
  };

  const handleSave = (nivel: number) => {
    const updated = desireMatrix.filter((d) => d.nivel !== nivel);
    if (editValue.trim()) updated.push({ nivel, desejo: editValue.trim() });
    onChange(updated.sort((a, b) => a.nivel - b.nivel));
    setEditingLevel(null);
    setEditValue("");
  };

  return (
    <div className="space-y-3">
      {DESIRE_LEVELS.map(({ nivel, label, description, example }) => {
        const desire = desireMatrix.find((d) => d.nivel === nivel);
        const isEditing = editingLevel === nivel;

        return (
          <Card key={nivel} className="p-4 border-l-4 border-l-[hsl(var(--success))]">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-sm font-semibold text-foreground">
                  Nível {nivel}: {label}
                </span>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              {!readonly && !isEditing && (
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEdit(nivel)}>
                  <Edit2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>

            {isEditing ? (
              <div className="mt-3 space-y-2">
                <Textarea value={editValue} onChange={(e) => setEditValue(e.target.value)} placeholder={example} rows={2} className="text-sm" />
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleSave(nivel)}>
                    <Check className="h-3.5 w-3.5 mr-1" /> Salvar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => { setEditingLevel(null); setEditValue(""); }}>
                    <X className="h-3.5 w-3.5 mr-1" /> Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm mt-2">
                {desire?.desejo || <span className="text-muted-foreground italic">{example}</span>}
              </p>
            )}
          </Card>
        );
      })}
    </div>
  );
}
