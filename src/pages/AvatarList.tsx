import { useState } from "react";
import { useAvatares, useDeleteAvatar } from "@/hooks/useAvatares";
import { AvatarCard } from "@/components/avatar/AvatarCard";
import { AvatarExtractionModal } from "@/components/avatar/AvatarExtractionModal";
import { Button } from "@/components/ui/button";
import { Sparkles, Brain } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function AvatarList() {
  const { data: avatares, isLoading } = useAvatares();
  const deleteMutation = useDeleteAvatar();
  const [showExtract, setShowExtract] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Brain className="h-6 w-6" /> Avatar & Research</h1>
          <p className="text-muted-foreground text-sm">
            Extraia avatares profundos com IA — Pain Matrix, desejos, objeções e linguagem
          </p>
        </div>
        <Button onClick={() => setShowExtract(true)}>
          <Sparkles className="h-4 w-4 mr-2" />
          Extrair Novo Avatar
        </Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Carregando...</p>
      ) : !avatares || avatares.length === 0 ? (
        <div className="border border-dashed rounded-lg p-12 text-center space-y-4">
          <p className="text-muted-foreground">
            Nenhum avatar extraído ainda. Cole research data (posts, reviews, comentários) e deixe a IA extrair o avatar profundo.
          </p>
          <Button onClick={() => setShowExtract(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Começar Extração
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {avatares.map((avatar: any) => (
            <AvatarCard key={avatar.id} avatar={avatar} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <AvatarExtractionModal open={showExtract} onClose={() => setShowExtract(false)} />

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Deletar avatar?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O avatar e todos os dados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (deleteId) deleteMutation.mutate(deleteId);
                setDeleteId(null);
              }}
            >
              Deletar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
