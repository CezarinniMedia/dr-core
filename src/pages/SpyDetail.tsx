import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCompetitor, useUpdateCompetitor } from "@/features/spy/hooks/useCompetitors";
import { AdCreativeGallery } from "@/features/spy/components/AdCreativeGallery";
import { AdCreativeFormDialog } from "@/features/spy/components/AdCreativeFormDialog";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ArrowLeft, Plus, Save, ExternalLink, Flame, Zap, Snowflake, Camera, RotateCw, Info } from "lucide-react";
import { formatCurrency } from "@/shared/lib/utils";

export default function SpyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: competitor, isLoading } = useCompetitor(id!);
  const updateMutation = useUpdateCompetitor();
  const [showAdForm, setShowAdForm] = useState(false);

  if (isLoading) return <p className="text-muted-foreground p-6">Carregando...</p>;
  if (!competitor) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Competitor não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/spy")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const statusConfig: Record<string, { label: string; variant: "default" | "destructive" | "secondary" }> = {
    HOT: { label: "HOT", variant: "destructive" },
    WARM: { label: "WARM", variant: "default" },
    COLD: { label: "COLD", variant: "secondary" },
  };
  const status = statusConfig[competitor.status_tracking || "WARM"] || statusConfig.WARM;

  const handleStatusChange = (newStatus: string) => {
    updateMutation.mutate({ id: id!, data: { status_tracking: newStatus } });
  };

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/spy")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">{competitor.nome}</h1>
              <Badge variant={status.variant}>{status.label}</Badge>
            </div>
            {competitor.dominio && (
              <a
                href={`https://${competitor.dominio}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                {competitor.dominio} <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </div>

        <Select value={competitor.status_tracking || "WARM"} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-36">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="HOT"><span className="flex items-center gap-1.5"><Flame className="h-3.5 w-3.5" /> HOT</span></SelectItem>
            <SelectItem value="WARM"><span className="flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> WARM</span></SelectItem>
            <SelectItem value="COLD"><span className="flex items-center gap-1.5"><Snowflake className="h-3.5 w-3.5" /> COLD</span></SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Vertical</p>
            <p className="text-sm font-semibold">{competitor.vertical || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Traffic Score</p>
            <p className="text-sm font-semibold">{competitor.traffic_score ? `${competitor.traffic_score}/10` : "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Revenue Est.</p>
            <p className="text-sm font-semibold">
              {competitor.estimated_monthly_revenue
                ? formatCurrency(Number(competitor.estimated_monthly_revenue))
                : "—"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Ads Salvos</p>
            <p className="text-sm font-semibold">{competitor.ad_creatives?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="ads">
        <TabsList>
          <TabsTrigger value="ads" className="flex items-center gap-1.5"><Camera className="h-4 w-4" /> Ad Creatives</TabsTrigger>
          <TabsTrigger value="funnels" className="flex items-center gap-1.5"><RotateCw className="h-4 w-4" /> Funnel Maps</TabsTrigger>
          <TabsTrigger value="info" className="flex items-center gap-1.5"><Info className="h-4 w-4" /> Info</TabsTrigger>
        </TabsList>

        <TabsContent value="ads" className="mt-4 space-y-4">
          <div className="flex justify-end">
            <Button size="sm" onClick={() => setShowAdForm(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Salvar Ad
            </Button>
          </div>
          <AdCreativeGallery adCreatives={competitor.ad_creatives || []} />
        </TabsContent>

        <TabsContent value="funnels" className="mt-4">
          {!competitor.funnel_maps || competitor.funnel_maps.length === 0 ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhum funnel map criado.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {competitor.funnel_maps.map((fm: any) => (
                <Card key={fm.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base">{fm.nome}</CardTitle>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      {fm.aov_estimate && <span>AOV: {formatCurrency(Number(fm.aov_estimate))}</span>}
                      {fm.checkout_provider && <span>Checkout: {fm.checkout_provider}</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {(fm.steps as any[])?.map((step: any, i: number) => (
                        <div
                          key={i}
                          className="min-w-[140px] border rounded-lg p-3 text-center shrink-0"
                        >
                          <Badge variant="outline" className="text-xs mb-1">
                            {step.type}
                          </Badge>
                          {step.price && (
                            <p className="text-sm font-semibold">{formatCurrency(step.price)}</p>
                          )}
                          {step.notes && (
                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                              {step.notes}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                {competitor.fb_page_url && (
                  <div>
                    <Label className="text-xs">Facebook</Label>
                    <a href={competitor.fb_page_url} target="_blank" rel="noopener noreferrer" className="text-primary text-xs hover:underline block truncate">
                      {competitor.fb_page_url}
                    </a>
                  </div>
                )}
                {competitor.ig_handle && (
                  <div>
                    <Label className="text-xs">Instagram</Label>
                    <p className="text-xs">{competitor.ig_handle}</p>
                  </div>
                )}
                {competitor.tiktok_handle && (
                  <div>
                    <Label className="text-xs">TikTok</Label>
                    <p className="text-xs">{competitor.tiktok_handle}</p>
                  </div>
                )}
              </div>
              {competitor.notas && (
                <div>
                  <Label className="text-xs">Notas</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{competitor.notas}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AdCreativeFormDialog
        open={showAdForm}
        onClose={() => setShowAdForm(false)}
        competitorId={id!}
      />
    </div>
  );
}
