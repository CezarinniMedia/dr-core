import { useState } from "react";
import { useAvatares, useDeleteAvatar } from "@/features/avatar/hooks/useAvatares";
import { AvatarCard } from "@/features/avatar/components/AvatarCard";
import { AvatarExtractionModal } from "@/features/avatar/components/AvatarExtractionModal";
import { AvatarCreateModal } from "@/features/avatar/components/AvatarCreateModal";
import { Button } from "@/shared/components/ui/button";
import { Sparkles, Brain, UserPlus } from "lucide-react";
import { EmptyState } from "@/shared/components/ui/EmptyState";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/shared/components/ui/alert-dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";

export default function AvatarList() {
  const { data: avatares, isLoading } = useAvatares();
  const deleteMutation = useDeleteAvatar();
  const [showExtract, setShowExtract] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Brain className="h-6 w-6" /> Avatar & Research
          </h1>
          <p className="text-muted-foreground text-sm">
            Crie avatares manualmente ou extraia com IA — Pain Matrix, desejos, objeções e linguagem
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCreate(true)}>
            <UserPlus className="h-4 w-4 mr-2" />
            Criar Manual
          </Button>
          <Button onClick={() => setShowExtract(true)}>
            <Sparkles className="h-4 w-4 mr-2" />
            Extrair com IA
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="border rounded-lg p-4 space-y-3">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-16 w-full" />
            </div>
          ))}
        </div>
      ) : !avatares || avatares.length === 0 ? (
        <EmptyState
          icon={Brain}
          title="Nenhum avatar ainda"
          description="Crie um avatar manualmente ou cole research data e deixe a IA extrair automaticamente."
          actionLabel="Extrair com IA"
          onAction={() => setShowExtract(true)}
          secondaryActionLabel="Criar Manual"
          onSecondaryAction={() => setShowCreate(true)}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {avatares.map((avatar: any) => (
            <AvatarCard key={avatar.id} avatar={avatar} onDelete={setDeleteId} />
          ))}
        </div>
      )}

      <AvatarExtractionModal open={showExtract} onClose={() => setShowExtract(false)} />
      <AvatarCreateModal open={showCreate} onClose={() => setShowCreate(false)} />

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
