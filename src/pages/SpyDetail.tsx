import { useParams, useNavigate } from "react-router-dom";
import { useOfertaSpyDetail } from "@/hooks/useOfertas";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ExternalLink, Globe, TrendingUp } from "lucide-react";

const statusSpyConfig: Record<string, { label: string; icon: string }> = {
  RADAR: { label: 'Radar', icon: '🔍' },
  TRIAGEM: { label: 'Triagem', icon: '⚡' },
  DEEP_DIVE: { label: 'Deep Dive', icon: '🎯' },
  MONITORANDO: { label: 'Monitorando', icon: '👁️' },
  PRODUCAO: { label: 'Produção', icon: '🚀' },
  ARQUIVADA: { label: 'Arquivada', icon: '📦' },
};

const formatTraffic = (n?: number | null) => {
  if (!n) return '—';
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
  return n.toString();
};

export default function SpyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: oferta, isLoading } = useOfertaSpyDetail(id!);

  if (isLoading) return <p className="text-muted-foreground p-6">Carregando...</p>;
  if (!oferta) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Oferta não encontrada.</p>
        <Button variant="outline" onClick={() => navigate("/spy")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
      </div>
    );
  }

  const status = statusSpyConfig[oferta.status_spy || 'RADAR'] || statusSpyConfig.RADAR;

  return (
    <div className="max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => navigate("/spy")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight">{oferta.nome}</h1>
            <Badge variant="outline">{status.icon} {status.label}</Badge>
          </div>
          {oferta.dominio_principal && (
            <a
              href={`https://${oferta.dominio_principal}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center gap-1"
            >
              {oferta.dominio_principal} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Nicho</p>
            <p className="text-sm font-semibold">{oferta.nicho || "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Tráfego 30d</p>
            <p className="text-sm font-semibold">{formatTraffic(oferta.trafego_atual)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Tendência</p>
            <p className="text-sm font-semibold">
              {oferta.trafego_tendencia != null
                ? `${Number(oferta.trafego_tendencia) > 0 ? '+' : ''}${oferta.trafego_tendencia}%`
                : '—'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-xs text-muted-foreground">Domínios</p>
            <p className="text-sm font-semibold">{oferta.oferta_dominios?.length || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="dominios">
        <TabsList>
          <TabsTrigger value="dominios">🌐 Domínios</TabsTrigger>
          <TabsTrigger value="funil">🔄 Funil</TabsTrigger>
          <TabsTrigger value="fontes">📡 Fontes</TabsTrigger>
          <TabsTrigger value="info">ℹ️ Info</TabsTrigger>
        </TabsList>

        <TabsContent value="dominios" className="mt-4 space-y-2">
          {!oferta.oferta_dominios?.length ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhum domínio registrado.</p>
            </div>
          ) : (
            oferta.oferta_dominios.map((d) => (
              <Card key={d.id} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono text-sm">{d.dominio}</span>
                    {d.is_principal && <Badge variant="default" className="text-xs">Principal</Badge>}
                  </div>
                  {d.trafego_ultimo && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" /> {formatTraffic(d.trafego_ultimo)}
                    </span>
                  )}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="funil" className="mt-4 space-y-2">
          {!oferta.funil_paginas?.length ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhuma página de funil mapeada.</p>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {[...oferta.funil_paginas]
                .sort((a, b) => a.ordem - b.ordem)
                .map((pg) => (
                  <div key={pg.id} className="min-w-[160px] border rounded-lg p-3 text-center shrink-0">
                    <Badge variant="outline" className="text-xs mb-1">{pg.tipo_pagina}</Badge>
                    {pg.nome && <p className="text-sm font-medium">{pg.nome}</p>}
                    {pg.preco && <p className="text-xs text-muted-foreground">R$ {pg.preco}</p>}
                  </div>
                ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="fontes" className="mt-4 space-y-2">
          {!oferta.fontes_captura?.length ? (
            <div className="border border-dashed rounded-lg p-8 text-center">
              <p className="text-muted-foreground text-sm">Nenhuma fonte de captura registrada.</p>
            </div>
          ) : (
            oferta.fontes_captura.map((f) => (
              <Card key={f.id} className="p-3">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">{f.metodo}</Badge>
                  {f.query_usada && <code className="text-xs text-muted-foreground truncate">{f.query_usada}</code>}
                  {f.quantidade_resultados && <span className="text-xs text-muted-foreground ml-auto">{f.quantidade_resultados} resultados</span>}
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-3 gap-4 text-sm">
                {oferta.checkout_provider && (
                  <div>
                    <Label className="text-xs">Checkout</Label>
                    <p className="text-xs">{oferta.checkout_provider}</p>
                  </div>
                )}
                {oferta.vsl_player && (
                  <div>
                    <Label className="text-xs">VSL Player</Label>
                    <p className="text-xs">{oferta.vsl_player}</p>
                  </div>
                )}
                {oferta.ticket_front && (
                  <div>
                    <Label className="text-xs">Ticket Front</Label>
                    <p className="text-xs">R$ {oferta.ticket_front}</p>
                  </div>
                )}
              </div>
              {oferta.notas_spy && (
                <div>
                  <Label className="text-xs">Notas</Label>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap mt-1">{oferta.notas_spy}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
