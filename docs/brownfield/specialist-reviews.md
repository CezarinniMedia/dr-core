# Brownfield Discovery - Phases 5-6: Specialist Reviews
**Date:** 2026-02-19

---

## Phase 5: @data-engineer Review

### Concordancia com DB-AUDIT.md
Todos os 3 problemas criticos de seguranca, 10+ indexes faltando, e 7 tabelas redundantes sao CONFIRMADOS.

### Observacoes adicionais

**Sobre o modelo de trafego:**
- A decisao de ter `period_type = "monthly"` (Semrush) vs `"monthly_sw"` (SimilarWeb) e CORRETA. Permite queries separadas por fonte sem conflito.
- O UNIQUE constraint `(spied_offer_id, domain, period_type, period_date)` funciona para dedup entre fontes.
- **CUIDADO:** Se futuro SimilarWeb tiver dados diarios, `period_type` precisara suportar "daily_sw".

**Sobre escala para 500k+ registros:**
- Materialized view e ESSENCIAL para dashboard com 500k+ rows
- Particionar offer_traffic_data por `period_date` (range mensal) quando atingir 1M rows
- Considerar TimescaleDB extension se trafego virar time-series real

**Sobre RLS:**
- As policies atuais usam `is_workspace_member()` function - BOA pratica
- Mas Storage policies foram simplificadas demais na migration 7 - CRITICO
- Recomendacao: usar `storage.foldername(name)[1]` para workspace isolation

### Verdict: ALINHADO COM DRAFT

---

## Phase 6: @ux-design-expert Review

### Concordancia com frontend-spec.md
Todos os God Components, bugs visuais, e gaps de design system sao CONFIRMADOS.

### Observacoes adicionais

**Sobre "software caro":**
- O GAP mais impactante nao e tecnico, e **PERCEPTIVO**: emojis iOS + sizing inconsistente criam a impressao de "projeto pessoal", nao "software profissional"
- Quick win mais impactante: substituir emojis + fixar sizing = 6h para 70% de melhoria
- Nao e necessario redesign completo - a BASE (shadcn/ui + Tailwind dark) e SOLIDA

**Sobre o modulo SPY:**
- TrafficIntelligenceView e o DIFERENCIAL do sistema - graficos comparativos multi-dominio sao RAROS em ferramentas do mercado
- Porem, os badges de cor no grafico NAO correspondem a cor da linha - confuso
- Sparklines sao excelentes mas precisam respeitar o periodo filtrado
- O workflow QuickAdd → Import → Radar e BOM conceptualmente

**Sobre os outros modulos:**
- Dashboard (zeros), Ofertas (basico), Avatar (basico), Criativos (buggy) - todos precisam de trabalho MAS devem esperar o SPY estar polido
- Recomendacao: NAO tocar nos outros modulos ate SPY estar 100%

**Sobre fragmentacao:**
- O maior debito UX nao esta no codigo - esta na experiencia FRAGMENTADA entre Finder, Notion, Obsidian e webapp
- Objetivo final: webapp como SINGLE PANE OF GLASS para toda a operacao DR

### Verdict: ALINHADO COM DRAFT, com enfase em "quick wins visuais primeiro"

---

## Consolidacao: Ajustes ao DRAFT

### Sem mudancas na priorizacao
Os sprints propostos no DRAFT estao corretos. Ambos os especialistas concordam com a sequencia:
1. Stop the bleeding (seguranca)
2. Look professional (visual)
3. Scale & maintain (refactor)
4. Polish & ship (qualidade)
5. Expand (novos modulos)

### Adendum do @data-engineer
- Adicionar `period_type` extensivel para daily_sw futuro
- Planejar particionamento para 1M+ rows

### Adendum do @ux
- Enfase: **quick wins visuais PRIMEIRO** (6h para 70% melhoria)
- Badges de cor no grafico devem corresponder a linha
- NAO tocar outros modulos ate SPY polido
