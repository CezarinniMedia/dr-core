import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é um especialista em criar hooks de Direct Response para ads em 2026.

REGRAS:
1. Hooks DEVEM ser viscerais, não lógicos
2. Use linguagem coloquial brasileira (não marketing corporativo)
3. Se angulo é DOR: comece pela dor PROFUNDA (nível 4-5 da Pain Matrix)
4. Se angulo é DESEJO: foque na transformação identitária
5. Se angulo é CURIOSIDADE: use pattern interrupt + gap de conhecimento
6. Se angulo é PROVA_SOCIAL: use números específicos + transformação
7. Hooks devem ter 80-150 caracteres (otimizado para Facebook/Instagram)
8. VARIE os formatos: pergunta, afirmação, negação, número, "você sabia"

RETORNE APENAS JSON válido no formato:
{
  "hooks": [
    {"texto": "...", "angulo": "DOR"},
    {"texto": "...", "angulo": "DOR"}
  ]
}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    const { ofertaId, angulo, quantidade, avatarContext } = await req.json();

    if (!ofertaId || !avatarContext) {
      return new Response(
        JSON.stringify({ error: "ofertaId and avatarContext are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const qty = Math.min(Math.max(quantidade || 10, 5), 50);

    const userPrompt = `ANGULO: ${angulo || "DOR"}
QUANTIDADE: ${qty} hooks
AVATAR CONTEXT: ${avatarContext}

Gere ${qty} hooks DIFERENTES e VARIADOS para ads DR. Retorne APENAS JSON válido.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 4096,
        temperature: 0.8,
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI Gateway error:", errText);
      throw new Error(`AI Gateway returned ${aiResponse.status}`);
    }

    const aiResult = await aiResponse.json();
    let text = aiResult.choices?.[0]?.message?.content || "";
    text = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let hooksData;
    try {
      hooksData = JSON.parse(text);
    } catch {
      console.error("Failed to parse AI response:", text);
      throw new Error("AI returned invalid JSON");
    }

    // Get workspace
    const { data: member } = await supabase
      .from("workspace_members")
      .select("workspace_id")
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (!member) throw new Error("User has no workspace");

    const { data: savedHooks, error: insertError } = await supabase
      .from("hooks")
      .insert(
        hooksData.hooks.map((h: any) => ({
          oferta_id: ofertaId,
          workspace_id: member.workspace_id,
          texto: h.texto,
          angulo: h.angulo || angulo || "DOR",
        }))
      )
      .select();

    if (insertError) throw insertError;

    return new Response(
      JSON.stringify({ success: true, hooks: savedHooks }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-hooks:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
