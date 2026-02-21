import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SpyDeleteDialogProps {
  deleteTarget: "single" | "bulk" | null;
  selectedCount: number;
  onClose: () => void;
  onConfirm: () => void;
}

export function SpyDeleteDialog({ deleteTarget, selectedCount, onClose, onConfirm }: SpyDeleteDialogProps) {
  return (
    <AlertDialog open={deleteTarget !== null} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {deleteTarget === "bulk" ? `Deletar ${selectedCount} ofertas?` : "Deletar oferta?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {deleteTarget === "bulk"
              ? "Todos os dominios, bibliotecas, funil e ads associados a essas ofertas serao removidos."
              : "Todos os dominios, bibliotecas, funil e ads associados serao removidos."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Deletar</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
