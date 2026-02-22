import { useState } from "react";
import { AdCreativeGallery } from "@/features/spy/components/AdCreativeGallery";
import { AdCreativeFormDialog } from "@/features/spy/components/AdCreativeFormDialog";
import { Button } from "@/shared/components/ui/button";
import { Plus } from "lucide-react";

interface SpyCreativesTabProps {
  offerId: string;
  offer: any;
}

export function SpyCreativesTab({ offerId, offer }: SpyCreativesTabProps) {
  const [showAdForm, setShowAdForm] = useState(false);

  // Use ad_creatives from either spied_offer or legacy competitor relationship
  const adCreatives = offer.ad_creatives || [];

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setShowAdForm(true)}>
          <Plus className="h-3.5 w-3.5 mr-1" /> Salvar Ad
        </Button>
      </div>

      <AdCreativeGallery adCreatives={adCreatives} />

      <AdCreativeFormDialog
        open={showAdForm}
        onClose={() => setShowAdForm(false)}
        competitorId={offerId}
      />
    </div>
  );
}
