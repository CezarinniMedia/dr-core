import { useParams, useNavigate } from "react-router-dom";
import { useAvatar, useUpdateAvatar } from "@/hooks/useAvatares";
import { PainMatrixCanvas } from "@/components/avatar/PainMatrixCanvas";
import { DesireMatrixPanel } from "@/components/avatar/DesireMatrixPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Zap, Frown, Star, Target, Gem, Shield, MessageCircle, Search } from "lucide-react";
import { useState, useEffect } from "react";

export default function AvatarDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: avatar, isLoading } = useAvatar(id!);
  const updateMutation = useUpdateAvatar();

  const [linguagem, setLinguagem] = useState("");
  const [estadoAtual, setEstadoAtual] = useState("");
  const [estadoDesejado, setEstadoDesejado] = useState("");

  useEffect(() => {
    if (avatar) {
      setLinguagem(avatar.linguagem_avatar || "");
      setEstadoAtual(avatar.estado_atual || "");
      setEstadoDesejado(avatar.estado_desejado || "");
    }
  }, [avatar]);

  if (isLoading) {
    return <p className="text-muted-foreground p-6">Carregando avatar...</p>;
  }

  if (!avatar) {
    return (
      <div className="p-6 space-y-4">
        <p className="text-muted-foreground">Avatar não encontrado.</p>
        <Button variant="outline" onClick={() => navigate("/avatar")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
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
  const objecoes = Array.isArray(avatar.objecoes)
    ? (avatar.objecoes as Array<{ objecao: string; tipo: string }>)
    : [];
  const gatilhos = Array.isArray(avatar.gatilhos_emocionais)
    ? (avatar.gatilhos_emocionais as string[])
    : [];
  const search1 = (avatar.search_1_framework as Record<string, string>) || {};

  const handleSaveText = () => {
    updateMutation.mutate({
      id: id!,
      data: {
        linguagem_avatar: linguagem,
        estado_atual: estadoAtual,
        estado_desejado: estadoDesejado,
      },
    });
  };

  return (
    <div className="max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/avatar")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{avatar.nome}</h1>
            <p className="text-sm text-muted-foreground">
              {(avatar as any).ofertas?.nome || "—"} · v{avatar.versao}
            </p>
          </div>
        </div>
        <Button onClick={handleSaveText} disabled={updateMutation.isPending}>
          <Save className="h-4 w-4 mr-2" /> Salvar
        </Button>
      </div>

      {/* Gatilhos */}
      {gatilhos.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {gatilhos.map((g: string) => (
            <Badge key={g} variant="outline">
              <Zap className="h-3 w-3 inline mr-1" />{g}
            </Badge>
          ))}
        </div>
      )}

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
          <TabsTrigger value="objecoes" className="flex items-center gap-1.5"><Shield className="h-4 w-4" /> Objecoes</TabsTrigger>
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
            {objecoes.length === 0 ? (
              <p className="text-muted-foreground italic text-sm">Nenhuma objeção extraída.</p>
            ) : (
              objecoes.map((obj, i) => (
                <Card key={i} className="p-4">
                  <div className="flex items-start gap-3">
                    <Badge variant={obj.tipo === "emocional" ? "default" : "secondary"} className="text-xs shrink-0">
                      {obj.tipo}
                    </Badge>
                    <p className="text-sm">{obj.objecao}</p>
                  </div>
                </Card>
              ))
            )}
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
