# Wireframe 2/5 — Clone Spied Offer → Own Offer

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-03
> **Fase:** 3 (Wireframes) | **Fidelidade:** Mid-fi (estrutura + tokens + specs)
> **Refs Vision:** aesthetic-profile sec 3.3 (Centered Modal/Component), sec 9.5 (Warm Glow), sec 7.4 (Stealth Wealth)
> **Principios ADHD:** UX-04 (flow ininterrupto), UX-05 (feedback instantaneo), UX-07 (sistema como organizador), UX-03 (acao unica por contexto)
> **Status:** FINAL

---

## Conceito

Hoje, spy (spied_offers) e ofertas proprias (offers) sao mundos desconectados. O operador ve uma oferta promissora no Radar, decide clonar, e precisa recriar tudo manualmente na secao de Ofertas Proprias.

O modal de Clone resolve isso com **1 click**: dados da spied_offer pre-populam uma nova oferta propria. O operador revisa, ajusta o que quiser, e cria. A oferta propria mantem link para a spied_offer original (rastreabilidade).

---

## Trigger

**Localizacao:** SpyOfferDetail → Overview tab → botao no header ou action bar

```
+------------------------------------------------------------------+
|  < Voltar ao Radar    NutraVida Plus               [Clone] [...] |
|                                                                    |
|  [Overview] [Dominios] [Bibliotecas] [Criativos] [Funil] ...     |
+------------------------------------------------------------------+

Botao "Clone":
  icon: Copy (Lucide, 16px)
  label: "Clonar para Oferta Propria"
  variant: outline
  border: 1px solid var(--border-interactive) = #3D3D3D
  hover: border-color var(--accent-amber), box-shadow var(--glow-amber)
  tooltip: "Criar oferta propria a partir desta oferta espionada"
```

**ADHD-UX-03:** Botao visivel mas nao dominante (outline) — a acao primaria da pagina e a navegacao entre tabs, nao o clone.

---

## Layout ASCII — Modal de Clone

```
+------------------------------------------------------------------+
|                                                                    |
|     +----------------------------------------------------+        |
|     |  [backdrop blur 8px, overlay-dark]                 |        |
|     |                                                    |        |
|     |  +----------------------------------------------+  |        |
|     |  |                                          [X] |  |        |
|     |  |  [Copy icon]  Clonar para Oferta Propria     |  |        |
|     |  |  Dados pre-preenchidos da oferta espionada.  |  |        |
|     |  |  Edite o que precisar.                       |  |        |
|     |  |                                              |  |        |
|     |  |  ORIGEM                                      |  |        |
|     |  |  +------------------------------------------+|  |        |
|     |  |  | [ExternalLink] NutraVida Plus            ||  |        |
|     |  |  | nutravida.com | Health | BR | Scaling    ||  |        |
|     |  |  | SimilarWeb: 54,800 visits/mo             ||  |        |
|     |  |  +------------------------------------------+|  |        |
|     |  |                                              |  |        |
|     |  |  DADOS DA NOVA OFERTA                        |  |        |
|     |  |                                              |  |        |
|     |  |  Nome *                                      |  |        |
|     |  |  +------------------------------------------+|  |        |
|     |  |  | NutraVida Plus (clone)                   ||  |        |
|     |  |  +------------------------------------------+|  |        |
|     |  |                                              |  |        |
|     |  |  Vertical              Geo                   |  |        |
|     |  |  +------------------+  +--------------------+|  |        |
|     |  |  | Health         v|  | BR               v ||  |        |
|     |  |  +------------------+  +--------------------+|  |        |
|     |  |                                              |  |        |
|     |  |  Ticket (R$)          Promessa Principal      |  |        |
|     |  |  +------------------+  +--------------------+|  |        |
|     |  |  | 197,00           |  | Emagreca 10kg em  ||  |        |
|     |  |  +------------------+  | 30 dias            ||  |        |
|     |  |                        +--------------------+|  |        |
|     |  |                                              |  |        |
|     |  |  Mecanismo Unico                             |  |        |
|     |  |  +------------------------------------------+|  |        |
|     |  |  | Formula exclusiva com 12 ingredientes... ||  |        |
|     |  |  +------------------------------------------+|  |        |
|     |  |                                              |  |        |
|     |  |  Notas (opcional)                            |  |        |
|     |  |  +------------------------------------------+|  |        |
|     |  |  | Oferta em scaling forte. SimilarWeb      ||  |        |
|     |  |  | mostra 54,800 visits/mo. Spike de        ||  |        |
|     |  |  | +342% em 7d. Prioridade alta.            ||  |        |
|     |  |  +------------------------------------------+|  |        |
|     |  |                                              |  |        |
|     |  |  +--------+  +-----------------------------+|  |        |
|     |  |  |Cancelar|  |  [Sparkles] Criar Oferta    ||  |        |
|     |  |  +--------+  +-----------------------------+|  |        |
|     |  |                                              |  |        |
|     |  +----------------------------------------------+  |        |
|     +----------------------------------------------------+        |
+------------------------------------------------------------------+
```

---

## Specs Detalhadas

### 1. Modal Container (Glassmorphism)

```css
.clone-modal {
  /* Sizing */
  width: min(560px, 90vw);
  max-height: 85vh;
  overflow-y: auto;

  /* Glassmorphism — Vision sec 3.3 */
  background: var(--bg-elevated);           /* #1A1A1A */
  border: 1px solid var(--border-default);  /* #1F1F1F */
  border-radius: var(--radius-xl);          /* 16px */

  /* Ambient glow amber — LED signature */
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),   /* glass edge */
    0 24px 80px rgba(0, 0, 0, 0.5),         /* depth */
    0 0 80px rgba(212, 165, 116, 0.06);      /* warm ambient glow */

  /* Animation */
  animation: fade-in 150ms ease-out;
}

.clone-modal-backdrop {
  background: var(--overlay-dark);           /* rgba(0,0,0,0.5) */
  backdrop-filter: blur(8px);
}
```

**ADHD-UX-04 (flow ininterrupto):** Backdrop blur mantem contexto visual — operador ve a oferta "atras" do modal. Nao perde senso de onde esta.

---

### 2. Header do Modal

```
Icon: Copy (Lucide, 20px, var(--accent-amber))
Titulo: "Clonar para Oferta Propria"
  font: var(--text-section-head) = 18px
  weight: 600
  color: var(--text-primary)

Subtitulo: "Dados pre-preenchidos da oferta espionada. Edite o que precisar."
  font: var(--text-body-size) = 14px
  weight: 400
  color: var(--text-secondary)

Close button [X]:
  position: top-right
  icon: X (Lucide, 16px)
  color: var(--text-muted)
  hover: var(--text-primary)
```

---

### 3. Card de Origem (Read-Only)

```
Container:
  background: var(--bg-subtle) = #252830
  border: 1px solid var(--border-subtle) = #2D2D2D
  border-left: 3px solid var(--accent-amber) = #D4A574  /* LED strip */
  border-radius: var(--radius-md) = 8px
  padding: 12px 16px

Section label "ORIGEM":
  font: var(--text-caption) = 11px
  weight: 600
  color: var(--text-muted)
  text-transform: uppercase
  letter-spacing: 0.05em
  margin-bottom: 8px

Row 1:
  [ExternalLink icon, 14px, var(--accent-amber)]
  Nome da oferta: 14px, medium, var(--text-primary)
  Click: abre SpyOfferDetail em nova tab

Row 2:
  Dominio (mono, 12px, var(--text-secondary))
  | Vertical badge | Geo badge | Status badge
  Badges: StatusBadge component existente

Row 3:
  "SimilarWeb: 54,800 visits/mo" (12px, var(--text-muted))
  — SimilarWeb como fonte principal de trafego total
```

**Proposito:** Referencia visual da oferta original. Read-only. Link clicavel para voltar a oferta espionada (abre em nova tab).

**ADHD-UX-14 (memoria contextual):** A oferta propria criada MANTEM vinculo com a spied_offer. Nunca orfao.

---

### 4. Campos do Formulario

```
Cada campo:
  Label:
    font: var(--text-label) = 12px
    weight: 500
    color: var(--text-secondary)
    margin-bottom: 4px

  Input/Select/Textarea:
    background: var(--bg-subtle) = #252830
    border: 1px solid var(--border-interactive) = #3D3D3D
    border-radius: var(--radius-md) = 8px
    padding: 8px 12px
    font: var(--text-body-size) = 14px
    color: var(--text-primary)

    Focus:
      border-color: var(--accent-primary) = #7C3AED
      box-shadow: 0 0 0 2px var(--accent-primary-10)
      outline: none

    Placeholder:
      color: var(--text-muted) = #6B7280

  Required indicator (*):
    color: var(--semantic-error) = #EF4444
    margin-left: 2px

Spacing entre campos: 16px (var(--space-card-gap))
```

**Campos e pre-populacao:**

| Campo | Tipo | Pre-populado de | Editavel | Obrigatorio |
|-------|------|-----------------|----------|-------------|
| Nome | Input text | `spied_offer.nome` + " (clone)" | Sim | Sim* |
| Vertical | Select | `spied_offer.vertical` | Sim | Nao |
| Geo | Select | `spied_offer.geo` | Sim | Nao |
| Ticket (R$) | Input number | Vazio (nao existe em spied_offers) | Sim | Nao |
| Promessa Principal | Textarea (2 rows) | Vazio | Sim | Nao |
| Mecanismo Unico | Textarea (2 rows) | Vazio | Sim | Nao |
| Notas | Textarea (3 rows) | Auto-gerado (ver abaixo) | Sim | Nao |

**Auto-preenchimento do campo Notas:**
```
Clonado de: [nome da spied_offer]
Dominio original: [main_domain]
SimilarWeb: [visits] visits/mo (fonte principal de trafego)
SEMrush organic: [organic_visits] visits/mo
Status na origem: [status]
Data do clone: [data atual]
```

**Layout 2 colunas para campos curtos:**
```
[Vertical ][Geo       ]   — 2 cols, gap 16px
[Ticket   ][Promessa  ]   — 2 cols, gap 16px
[Mecanismo           ]    — full width
[Notas               ]    — full width
```

**ADHD-UX-07 (sistema como organizador):** Campos pre-populados = operador DECIDE, nao preenche. Notas auto-geradas com contexto da origem.

---

### 5. Footer / CTA

```
Layout: flex, justify-between, align-center
Padding-top: 16px
Border-top: 1px solid var(--border-default)

Botao Cancelar:
  variant: ghost
  font: 14px, var(--text-secondary)
  hover: var(--text-primary)
  padding: 8px 16px

Botao "Criar Oferta" (CTA primario):
  icon: Sparkles (Lucide, 16px) — a esquerda do texto
  background: var(--accent-amber) = #D4A574  /* Amber, nao violet — denota "clone/criar a partir de" */
  color: var(--bg-base) = #0A0A0A (texto escuro sobre amber)
  font: 14px, weight 600
  border-radius: var(--radius-md) = 8px
  padding: 10px 24px

  Hover:
    background: var(--accent-gold) = #C4954A
    box-shadow: 0 0 16px rgba(212, 165, 116, 0.25)

  Disabled (durante submit):
    opacity: 0.6
    cursor: not-allowed

  Loading state:
    icon troca para Loader2 com spin animation
    texto: "Criando..."
```

**ADHD-UX-03 (acao unica):** Um unico CTA primario (amber). Cancel e ghost — nao compete.
**LED signature:** CTA amber = warm glow, denota "criar algo valioso a partir de inteligencia".

---

### 6. Success State

```
Apos criar com sucesso:

1. Modal fecha com fade-out (150ms)
2. Toast no canto inferior direito:
   +------------------------------------------+
   | [CheckCircle green] Oferta criada!       |
   | NutraVida Plus (clone) adicionada        |
   | [Ver Oferta] link                        |
   +------------------------------------------+

   background: var(--bg-elevated)
   border: 1px solid var(--accent-green-20)
   border-left: 3px solid var(--accent-green) /* LED strip */
   auto-dismiss: 6s (mais longo que padrao por ter link de acao)

3. Se usuario clica "Ver Oferta": navega para /ofertas/{new_id}
4. Se nao clica: permanece no SpyOfferDetail (flow nao interrompido)
```

**ADHD-UX-04:** Nao redireciona automaticamente — operador pode estar no meio de analise de outra oferta. Toast com link e suficiente.
**ADHD-UX-05 (feedback instantaneo):** Toast aparece imediatamente com confirmacao visual (green LED strip).
**ADHD-UX-15 (celebracao):** Checkmark verde + "Oferta criada!" = micro-celebracao.

---

## Data Flow

```
1. Operador clica "Clone" no SpyOfferDetail
2. Modal abre, carrega dados da spied_offer atual
3. Pre-popula campos (nome + " (clone)", vertical, geo, notas auto-geradas)
4. Operador edita campos se quiser
5. Click "Criar Oferta"
6. INSERT em tabela `offers`:
   - nome, vertical, geo, ticket, promessa, mecanismo_unico, notas
   - spied_offer_id = id da oferta espionada (FK para rastreabilidade)
   - source = 'clone'
   - workspace_id = workspace atual
7. Toast de sucesso com link para nova oferta
```

**Novo campo necessario na tabela `offers`:**
```sql
ALTER TABLE offers ADD COLUMN spied_offer_id UUID REFERENCES spied_offers(id);
ALTER TABLE offers ADD COLUMN source TEXT DEFAULT 'manual'; -- 'manual' | 'clone'
```

---

## Keyboard Shortcuts

| Acao | Shortcut |
|------|----------|
| Fechar modal | Escape |
| Submit (criar) | Cmd+Enter |
| Focar proximo campo | Tab |
| Focar campo anterior | Shift+Tab |

**ADHD-UX-13:** Cmd+Enter para submit rapido sem mover mao para mouse.

---

## Error States

```
Validacao (client-side):
  Nome vazio: borda vermelha no input + "Nome e obrigatorio" abaixo

Server error:
  Toast error: "Erro ao criar oferta. Tente novamente."
  Modal permanece aberta com dados preenchidos (nao perde dados)
```

**ADHD-UX-08 (impulsividade protegida):** Erro nao descarta dados. Modal fica aberta para retry.

---

## Notas de Implementacao

1. **Componente:** `src/features/spy/components/CloneToOwnOfferModal.tsx`
2. **Hook:** Usar `useFormDialog` do consolidation plan (Cluster B)
3. **Mutation:** `useCreateOferta` (existente em `useOfertas`)
4. **Trigger:** Botao no `SpyOfferDetail.tsx` header
5. **DB:** Requer migration para `spied_offer_id` e `source` em `offers`
6. **SimilarWeb vs SEMrush:** Mostrar SimilarWeb como fonte principal de trafego total. SEMrush = organico apenas. Ambos na nota auto-gerada.

---

*Uma — conectando mundos que deveriam sempre ter sido um so*
