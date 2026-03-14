import { Card, CardContent } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import { Trash2, Heart, MessageCircle, Share2 } from "lucide-react";

interface AdCreativeGalleryProps {
  adCreatives: Array<{
    id: string;
    tipo: string;
    file_url: string;
    thumbnail_url?: string | null;
    platform: string;
    copy_headline?: string | null;
    copy_body?: string | null;
    cta_text?: string | null;
    status?: string | null;
    tags?: unknown;
    angulo?: string | null;
    likes?: number | null;
    comments?: number | null;
    shares?: number | null;
    first_seen: string;
  }>;
  onDelete?: (id: string) => void;
}

export function AdCreativeGallery({ adCreatives, onDelete }: AdCreativeGalleryProps) {
  if (!adCreatives || adCreatives.length === 0) {
    return (
      <div className="border border-dashed rounded-lg p-8 text-center">
        <p className="text-muted-foreground text-sm">Nenhum ad creative salvo ainda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {adCreatives.map((ad) => (
        <Card key={ad.id} className="overflow-hidden">
          {/* Preview */}
          <div className="aspect-video bg-muted relative">
            {ad.tipo === "VIDEO" ? (
              <video src={ad.file_url} className="w-full h-full object-cover" controls />
            ) : (
              <img
                src={ad.thumbnail_url || ad.file_url}
                alt={ad.copy_headline || "Ad creative"}
                className="w-full h-full object-cover"
              />
            )}
            {onDelete && (
              <Button
                size="icon"
                variant="destructive"
                className="absolute top-2 right-2 h-7 w-7"
                aria-label="Deletar criativo"
                onClick={() => onDelete(ad.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>

          <CardContent className="p-3 space-y-2">
            <div className="flex flex-wrap gap-1">
              <Badge variant="outline" className="text-xs">{ad.platform}</Badge>
              <Badge variant="secondary" className="text-xs">{ad.tipo}</Badge>
              {ad.status === "ATIVO" && <Badge className="text-xs">Ativo</Badge>}
            </div>

            {ad.copy_headline && (
              <p className="text-sm font-medium line-clamp-2">{ad.copy_headline}</p>
            )}

            {ad.copy_body && (
              <p className="text-xs text-muted-foreground line-clamp-3">{ad.copy_body}</p>
            )}

            {ad.cta_text && (
              <Badge variant="outline" className="text-xs">
                CTA: {ad.cta_text}
              </Badge>
            )}

            {(ad.likes || ad.comments || ad.shares) && (
              <div className="flex gap-3 text-xs text-muted-foreground">
                {ad.likes != null && (
                  <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {ad.likes}</span>
                )}
                {ad.comments != null && (
                  <span className="flex items-center gap-1"><MessageCircle className="h-3 w-3" /> {ad.comments}</span>
                )}
                {ad.shares != null && (
                  <span className="flex items-center gap-1"><Share2 className="h-3 w-3" /> {ad.shares}</span>
                )}
              </div>
            )}

            {ad.tags && (ad.tags as string[]).length > 0 && (
              <div className="flex flex-wrap gap-1">
                {(ad.tags as string[]).map((tag: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-[10px]">{tag}</Badge>
                ))}
              </div>
            )}

            <p className="text-[10px] text-muted-foreground flex items-center justify-between">
              <span>Visto: {new Date(ad.first_seen).toLocaleDateString("pt-BR")}</span>
              {ad.angulo && <Badge variant="outline" className="text-[10px]">{ad.angulo}</Badge>}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
