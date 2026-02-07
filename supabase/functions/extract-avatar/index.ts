import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um especialista em extração de avatar para Direct Response Marketing.

Sua tarefa é analisar research data (posts, reviews, comentários, entrevistas) e extrair o avatar PROFUNDO usando o framework SEARCH 1.

INSTRUÇÕES:
1. Pain Matrix (5 níveis de profundidade):
   - Nível 1: Dor superficial (sintoma visível)
   - Nível 2: Causa imediata (o que gera o sintoma)
   - Nível 3: Consequência (impacto na vida)
   - Nível 4: Dor emocional (como se SENTE)
   - Nível 5: Identidade (quem ela ACHA que é por causa disso)

2. Desire Matrix (3 níveis):
   - Nível 1: Desejo superficial (o que diz que quer)
   - Nível 2: Desejo verdadeiro (o que realmente quer)
   - Nível 3: Transformação (quem quer SE TORNAR)

3. Objeções (emocionais e lógicas)
4. Linguagem exata do avatar (palavras, gírias, expressões)
5. Gatilhos emocionais (medo, raiva, inveja, orgulho, etc)
6. SEARCH 1 Framework completo

RETORNE APENAS JSON válido no formato:
{
  "pain_matrix": [
    {"nivel": 1, "dor": "..."},
    {"nivel": 2, "dor": "..."},
    {"nivel": 3, "dor": "..."},
    {"nivel": 4, "dor": "..."},
    {"nivel": 5, "dor": "..."}
  ],
  "desire_matrix": [
    {"nivel": 1, "desejo": "..."},
    {"nivel": 2, "desejo": "..."},
    {"nivel": 3, "desejo": "..."}
  ],
  "objecoes": [
    {"objecao": "...", "tipo": "emocional"},
    {"objecao": "...", "tipo": "logica"}
  ],
  "linguagem_avatar": "Palavras exatas que o avatar usa: ...",
  "gatilhos_emocionais": ["medo", "raiva", etc],
  "estado_atual": "Onde o avatar está AGORA",
  "estado_desejado": "Onde o avatar QUER estar",
  "search_1_framework": {
    "search": "O que o avatar busca no Google",
    "experience": "Experiência que teve antes",
    "action": "Ações que tomou",
    "result": "Resultado que obteve",
    "consequence": "Consequência desse resultado",
    "habit": "Hábito que formou"
  }
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Auth check
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub;

    const { ofertaNome, vertical, researchNotes, ofertaId } = await req.json();

    if (!ofertaId || !researchNotes || researchNotes.length === 0) {
      return new Response(
        JSON.stringify({ error: "ofertaId and researchNotes are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const userPrompt = `OFERTA: ${ofertaNome || "N/A"}
VERTICAL: ${vertical || "geral"}

RESEARCH DATA (posts/reviews/comentários do avatar):
${researchNotes.join("\n\n---\n\n")}

Execute extração PROFUNDA do avatar. Retorne APENAS JSON válido.`;

    // Call Lovable AI Gateway
    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.3,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", errText);
      throw new Error(`AI Gateway returned ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    let text = aiResult.choices?.[0]?.message?.content || "";

    // Clean markdown code blocks
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let avatarData;
    try {
      avatarData = JSON.parse(text);
    } catch {
      console.error("Failed to parse AI response:", text);
      throw new Error("AI returned invalid JSON");
    }

    // Get workspace_id
    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (!member) {
      throw new Error("User has no workspace");
    }

    // Insert avatar
    const { data: savedAvatar, error: insertError } = await supabase
      .from("avatares")
      .insert({
        oferta_id: ofertaId,
        workspace_id: member.workspace_id,
        nome: `Avatar ${ofertaNome || ""}`.trim(),
        pain_matrix: avatarData.pain_matrix || [],
        desire_matrix: avatarData.desire_matrix || [],
        objecoes: avatarData.objecoes || [],
        linguagem_avatar: avatarData.linguagem_avatar || "",
        gatilhos_emocionais: avatarData.gatilhos_emocionais || [],
        estado_atual: avatarData.estado_atual || "",
        estado_desejado: avatarData.estado_desejado || "",
        search_1_framework: avatarData.search_1_framework || {},
      })
      .select()
      .single();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, avatar: savedAvatar }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in extract-avatar:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
