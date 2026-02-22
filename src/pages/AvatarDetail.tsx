import { useParams, useNavigate } from "react-router-dom";
import { useAvatar, useUpdateAvatar } from "@/features/avatar/hooks/useAvatares";
import { PainMatrixCanvas } from "@/features/avatar/components/PainMatrixCanvas";
import { DesireMatrixPanel } from "@/features/avatar/components/DesireMatrixPanel";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { Badge } from "@/shared/components/ui/badge";
import { Input } from "@/shared/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Save, Zap, Frown, Star, Target, Gem, Shield, MessageCircle,
  Search, Users, Download, Plus, X, Loader2,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { PageBreadcrumb } from "@/shared/components/ui/PageBreadcrumb";
import { useToast } from "@/shared/hooks/use-toast";

function generateAvatarMarkdown(avatar: any): string {
  const painMatrix = Array.isArray(avatar.pain_matrix) ? avatar.pain_matrix : [];
  const desireMatrix = Array.isArray(avatar.desire_matrix) ? avatar.desire_matrix : [];
  const objecoes = Array.isArray(avatar.objecoes) ? avatar.objecoes : [];
  const gatilhos = Array.isArray(avatar.gatilhos_emocionais) ? avatar.gatilhos_emocionais : [];
  const search1 = (avatar.search_1_framework as Record<string, string>) || {};

  const lines: string[] = [
    `# Avatar: ${avatar.nome}`,
    `**Oferta:** ${avatar.ofertas?.nome || "—"} | **Vertical:** ${avatar.ofertas?.vertical || "—"} | **Versão:** v${avatar.versao}`,
    "",
  ];

  if (avatar.demographics) {
    lines.push(`## Demographics`, avatar.demographics, "");
  }

  if (avatar.estado_atual || avatar.estado_desejado) {
    lines.push(`## Estado Atual → Desejado`);
    if (avatar.estado_atual) lines.push(`**Atual:** ${avatar.estado_atual}`);
    if (avatar.estado_desejado) lines.push(`**Desejado:** ${avatar.estado_desejado}`);
    lines.push("");
  }

  if (painMatrix.length > 0) {
    lines.push(`## Pain Matrix`);
    const levels = ["Superficial", "Causa Imediata", "Consequência", "Emocional", "Identidade"];
    painMatrix.forEach((p: { nivel: number; dor: string }) => {
      lines.push(`- **Nível ${p.nivel} (${levels[p.nivel - 1] || ""}):** ${p.dor}`);
    });
    lines.push("");
  }

  if (desireMatrix.length > 0) {
    lines.push(`## Desire Matrix`);
    const levels = ["Superficial", "Verdadeiro", "Transformação"];
    desireMatrix.forEach((d: { nivel: number; desejo: string }) => {
      lines.push(`- **Nível ${d.nivel} (${levels[d.nivel - 1] || ""}):** ${d.desejo}`);
    });
    lines.push("");
  }

  if (objecoes.length > 0) {
    lines.push(`## Objeções`);
    objecoes.forEach((o: { objecao: string; tipo: string }) => {
      lines.push(`- [${o.tipo}] ${o.objecao}`);
    });
    lines.push("");
  }

  if (gatilhos.length > 0) {
    lines.push(`## Gatilhos Emocionais`);
    gatilhos.forEach((g: string) => lines.push(`- ${g}`));
    lines.push("");
  }

  if (avatar.linguagem_avatar) {
    lines.push(`## Linguagem do Avatar`, "```", avatar.linguagem_avatar, "```", "");
  }

  if (Object.keys(search1).length > 0) {
    lines.push(`## SEARCH 1 Framework`);
    Object.entries(search1).forEach(([k, v]) => lines.push(`- **${k}:** ${v}`));
    lines.push("");
  }

  if (avatar.notas) {
    lines.push(`## Notas`, avatar.notas, "");
  }

  lines.push(`---`, `*Exportado em ${new Date().toLocaleDateString("pt-BR")} — DR Ops*`);
  return lines.join("\n");
}

export default function AvatarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: avatar, isLoading } = useAvatar(id!);
  const updateMutation = useUpdateAvatar();
  const { toast } = useToast();

  const [linguagem, setLinguagem] = useState("");
  const [estadoAtual, setEstadoAtual] = useState("");
  const [estadoDesejado, setEstadoDesejado] = useState("");
  const [demographics, setDemographics] = useState("");
  const [objecoes, setObjecoes] = useState<Array<{ objecao: string; tipo: string }>>([]);
  const [gatilhos, setGatilhos] = useState<string[]>([]);
  const [newObjecao, setNewObjecao] = useState("");
  const [newObjecaoTipo, setNewObjecaoTipo] = useState<"emocional" | "tecnica">("emocional");
  const [newGatilho, setNewGatilho] = useState("");

  useEffect(() => {
    if (avatar) {
      setLinguagem(avatar.linguagem_avatar || "");
      setEstadoAtual(avatar.estado_atual || "");
      setEstadoDesejado(avatar.estado_desejado || "");
      setDemographics((avatar as any).demographics || "");
      setObjecoes(Array.isArray(avatar.objecoes) ? avatar.objecoes as Array<{ objecao: string; tipo: string }> : []);
      setGatilhos(Array.isArray(avatar.gatilhos_emocionais) ? avatar.gatilhos_emocionais as string[] : []);
    }
  }, [avatar]);

  const handleSaveText = () => {
    updateMutation.mutate({
      id: id!,
      data: {
        linguagem_avatar: linguagem,
        estado_atual: estadoAtual,
        estado_desejado: estadoDesejado,
        demographics,
      },
    });
  };

  const handleSaveObjecoes = (updated: Array<{ objecao: string; tipo: string }>) => {
    setObjecoes(updated);
    updateMutation.mutate({ id: id!, data: { objecoes: updated } });
  };

  const handleAddObjecao = () => {
    if (!newObjecao.trim()) return;
    const updated = [...objecoes, { objecao: newObjecao.trim(), tipo: newObjecaoTipo }];
    handleSaveObjecoes(updated);
    setNewObjecao("");
  };

  const handleRemoveObjecao = (index: number) => {
    handleSaveObjecoes(objecoes.filter((_, i) => i !== index));
  };

  const handleSaveGatilhos = (updated: string[]) => {
    setGatilhos(updated);
    updateMutation.mutate({ id: id!, data: { gatilhos_emocionais: updated } });
  };

  const handleAddGatilho = () => {
    if (!newGatilho.trim()) return;
    handleSaveGatilhos([...gatilhos, newGatilho.trim()]);
    setNewGatilho("");
  };

  const handleRemoveGatilho = (index: number) => {
    handleSaveGatilhos(gatilhos.filter((_, i) => i !== index));
  };

  const handleExportMD = useCallback(() => {
    if (!avatar) return;
    const md = generateAvatarMarkdown({ ...avatar, objecoes, gatilhos_emocionais: gatilhos });
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `avatar-${avatar.nome.toLowerCase().replace(/\s+/g, "-")}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Avatar exportado como Markdown!" });
  }, [avatar, objecoes, gatilhos, toast]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!avatar) {
    return (
      <div className="p-6 space-y-4">
        <PageBreadcrumb items={[
          { label: "Avatares", href: "/avatar", icon: Users },
          { label: "Avatar não encontrado" },
        ]} />
        <p className="text-muted-foreground">Avatar não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/avatar")}>
          Voltar aos Avatares
        </Button>
      </div>
    );
  }

  const painMatrix = Array.isArray(avatar.pain_matrix)
    ? (avatar.pain_matrix as Array<{ nivel: number; dor: string }>)
    : [];
  const desireMatrix = Array.isArray(avatar.desire_matrix)
    ? (avatar.desire_matrix as Array<{ nivel: number; desejo: string }>)
    : [];
  const search1 = (avatar.search_1_framework as Record<string, string>) || {};

  return (
    <div className="max-w-4xl space-y-6">
      <PageBreadcrumb items={[
        { label: "Avatares", href: "/avatar", icon: Users },
        { label: avatar.nome },
      ]} />

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{avatar.nome}</h1>
          <p className="text-sm text-muted-foreground">
            {(avatar as any).ofertas?.nome || "—"} · v{avatar.versao}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleExportMD}>
            <Download className="h-4 w-4 mr-1" /> Export MD
          </Button>
          <Button onClick={handleSaveText} disabled={updateMutation.isPending}>
            {updateMutation.isPending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Gatilhos editable */}
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {gatilhos.map((g, i) => (
            <Badge key={i} variant="outline" className="flex items-center gap-1 group">
              <Zap className="h-3 w-3" />{g}
              <button
                onClick={() => handleRemoveGatilho(i)}
                className="ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newGatilho}
            onChange={(e) => setNewGatilho(e.target.value)}
            placeholder="Adicionar gatilho emocional..."
            className="max-w-xs text-sm"
            onKeyDown={(e) => e.key === "Enter" && handleAddGatilho()}
          />
          <Button variant="outline" size="sm" onClick={handleAddGatilho} disabled={!newGatilho.trim()}>
            <Plus className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Demographics */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Demographics</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={demographics}
            onChange={(e) => setDemographics(e.target.value)}
            rows={2}
            className="text-sm"
            placeholder="Idade, genero, renda, localizacao, profissao..."
          />
        </CardContent>
      </Card>

      {/* Estado Atual → Desejado */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5"><Frown className="h-4 w-4 text-muted-foreground" /> Estado Atual</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={estadoAtual}
              onChange={(e) => setEstadoAtual(e.target.value)}
              rows={3}
              className="text-sm"
              placeholder="Onde o avatar está agora..."
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-1.5"><Star className="h-4 w-4 text-yellow-500" /> Estado Desejado</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={estadoDesejado}
              onChange={(e) => setEstadoDesejado(e.target.value)}
              rows={3}
              className="text-sm"
              placeholder="Onde o avatar quer estar..."
            />
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="pain">
        <TabsList className="w-full justify-start">
          <TabsTrigger value="pain" className="flex items-center gap-1.5"><Target className="h-4 w-4" /> Pain Matrix</TabsTrigger>
          <TabsTrigger value="desire" className="flex items-center gap-1.5"><Gem className="h-4 w-4" /> Desire Matrix</TabsTrigger>
          <TabsTrigger value="objecoes" className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Objeções</TabsTrigger>
          <TabsTrigger value="linguagem" className="flex items-center gap-1.5"><MessageCircle className="h-4 w-4" /> Linguagem</TabsTrigger>
          <TabsTrigger value="search1" className="flex items-center gap-1.5"><Search className="h-4 w-4" /> SEARCH 1</TabsTrigger>
        </TabsList>

        <TabsContent value="pain">
          <PainMatrixCanvas
            painMatrix={painMatrix}
            onChange={(matrix) => updateMutation.mutate({ id: id!, data: { pain_matrix: matrix } })}
          />
        </TabsContent>

        <TabsContent value="desire">
          <DesireMatrixPanel
            desireMatrix={desireMatrix}
            onChange={(matrix) =>
              updateMutation.mutate({ id: id!, data: { desire_matrix: matrix } })
            }
          />
        </TabsContent>

        <TabsContent value="objecoes">
          <div className="space-y-3">
            {objecoes.map((obj, i) => (
              <Card key={i} className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    <Badge variant={obj.tipo === "emocional" ? "default" : "secondary"} className="text-xs shrink-0">
                      {obj.tipo}
                    </Badge>
                    <p className="text-sm">{obj.objecao}</p>
                  </div>
                  <button onClick={() => handleRemoveObjecao(i)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </Card>
            ))}
            <div className="flex gap-2 items-end">
              <div className="flex-1 space-y-1">
                <Input
                  value={newObjecao}
                  onChange={(e) => setNewObjecao(e.target.value)}
                  placeholder="Nova objeção..."
                  className="text-sm"
                  onKeyDown={(e) => e.key === "Enter" && handleAddObjecao()}
                />
              </div>
              <select
                value={newObjecaoTipo}
                onChange={(e) => setNewObjecaoTipo(e.target.value as "emocional" | "tecnica")}
                className="h-9 rounded-md border bg-background px-2 text-sm"
              >
                <option value="emocional">Emocional</option>
                <option value="tecnica">Técnica</option>
              </select>
              <Button variant="outline" size="sm" onClick={handleAddObjecao} disabled={!newObjecao.trim()}>
                <Plus className="h-3.5 w-3.5 mr-1" /> Adicionar
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="linguagem">
          <Card className="p-4">
            <Textarea
              value={linguagem}
              onChange={(e) => setLinguagem(e.target.value)}
              rows={6}
              className="text-sm font-mono"
              placeholder="Palavras, gírias e expressões exatas que o avatar usa..."
            />
          </Card>
        </TabsContent>

        <TabsContent value="search1">
          <div className="space-y-3">
            {Object.entries(search1).length === 0 ? (
              <p className="text-muted-foreground italic text-sm">SEARCH 1 não preenchido.</p>
            ) : (
              Object.entries(search1).map(([key, value]) => (
                <Card key={key} className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase mb-1">
                    {key}
                  </p>
                  <p className="text-sm">{value}</p>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
