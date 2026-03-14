import { useState } from "react";
import { useUpdateSpiedOffer } from "@/hooks/useSpiedOffers";
import ReactMarkdown from "react-markdown";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Edit, Eye, Save, Loader2 } from "lucide-react";

interface SpyNotesTabProps {
  offerId: string;
  currentNotes: string | null;
}

export function SpyNotesTab({ offerId, currentNotes }: SpyNotesTabProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [notes, setNotes] = useState(currentNotes || "");
  const updateMutation = useUpdateSpiedOffer();

  const handleSave = () => {
    updateMutation.mutate(
      { id: offerId, data: { notas: notes } },
      { onSuccess: () => setIsEditing(false) }
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex justify-end gap-2">
        {isEditing ? (
          <>
            <Button variant="outline" size="sm" onClick={() => setIsEditing(false)}>
              <Eye className="h-3.5 w-3.5 mr-1" /> Preview
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
              ) : (
                <Save className="h-3.5 w-3.5 mr-1" />
              )}
              Salvar
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="h-3.5 w-3.5 mr-1" /> Editar
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <Textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={20}
            className="min-h-[400px] font-mono text-sm"
            placeholder="Use # para títulos, ** para negrito, - para listas, > para citações..."
          />
          <p className="text-xs text-muted-foreground">
            Suporta markdown: # títulos, **negrito**, *itálico*, - listas, &gt; citações, `código`
          </p>
        </div>
      ) : (
        <Card>
          <CardContent className="p-6">
            {notes ? (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>{notes}</ReactMarkdown>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm text-center py-8">
                Nenhuma nota ainda. Clique em "Editar" para começar.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
