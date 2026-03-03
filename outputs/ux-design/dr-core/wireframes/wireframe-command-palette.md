# Wireframe 3/5 — Command Palette Enhanced (Cmd+K)

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-03
> **Fase:** 3 (Wireframes) | **Fidelidade:** Mid-fi (estrutura + tokens + specs)
> **Refs Vision:** aesthetic-profile sec 6.9 (Command Palette), sec 6.7 (Floating Menu/Popover), sec 3.3 (Centered Modal)
> **Principios ADHD:** UX-13 (keyboard-first), UX-07 (sistema como organizador), UX-04 (flow ininterrupto), UX-09 (painel unico)
> **Componente existente:** `src/shared/components/layout/command-palette/CommandPalette.tsx` (cmdk instalado)
> **Status:** FINAL

---

## Conceito

O Command Palette e o **hub nervoso central** do operador keyboard-first. Cmd+K de qualquer tela abre acesso instantaneo a navegacao, acoes rapidas, busca global e historico recente. O objetivo e que **qualquer acao frequente esteja a max 1 keystroke + 2-3 caracteres de busca**.

O CommandPalette.tsx ja existe mas esta subutilizado — tem navegacao basica e poucos items. O redesign transforma ele em um **power tool** com 4 secoes, shortcuts visiveis, e busca que cobre todos os modulos.

---

## Layout ASCII

```
+------------------------------------------------------------------+
|                                                                    |
|            +------------------------------------------+            |
|            | [backdrop blur 8px, overlay-light]       |            |
|            |                                          |            |
|            |  +--------------------------------------+|            |
|            |  | [Search] Buscar ou executar...  Esc  ||            |
|            |  +--------------------------------------+|            |
|            |                                          |            |
|            |  RECENTES                                |            |
|            |  +--------------------------------------+|            |
|            |  | [Clock]  NutraVida Plus        Enter ||            |
|            |  | [Clock]  Import Semrush Bulk   Enter ||            |
|            |  | [Clock]  Dashboard             Enter ||            |
|            |  +--------------------------------------+|            |
|            |                                          |            |
|            |  NAVEGACAO                               |            |
|            |  +--------------------------------------+|            |
|            |  | [Radar]    Spy Radar           Alt+1 ||            |
|            |  | [Layout]   Dashboard           Alt+2 ||            |
|            |  | [Package]  Ofertas Proprias    Alt+3 ||            |
|            |  | [Palette]  Criativos           Alt+4 ||            |
|            |  | [Users]    Avatares            Alt+5 ||            |
|            |  | [Shield]   Arsenal             Alt+6 ||            |
|            |  +--------------------------------------+|            |
|            |                                          |            |
|            |  ACOES RAPIDAS                           |            |
|            |  +--------------------------------------+|            |
|            |  | [Upload]   Importar CSV        Ctrl+I||            |
|            |  | [Plus]     Quick Add Oferta    Ctrl+N||            |
|            |  | [Copy]     Clonar Oferta              ||            |
|            |  | [Filter]   Saved Views                ||            |
|            |  | [RefreshCw]Refresh Pipeline            ||            |
|            |  +--------------------------------------+|            |
|            |                                          |            |
|            |  BUSCA GLOBAL                            |            |
|            |  +--------------------------------------+|            |
|            |  | [Search]   Buscar ofertas...          ||            |
|            |  | [Search]   Buscar dominios...         ||            |
|            |  | [Search]   Buscar criativos...        ||            |
|            |  +--------------------------------------+|            |
|            |                                          |            |
|            +------------------------------------------+            |
+------------------------------------------------------------------+
```

---

## Specs Detalhadas

### 1. Container Principal

```css
.command-palette {
  /* Sizing */
  width: min(640px, 90vw);
  max-height: min(480px, 70vh);
  overflow: hidden;  /* scroll interno nos resultados */

  /* Position */
  position: fixed;
  top: 20vh;         /* nao centralizado — ligeiramente acima */
  left: 50%;
  transform: translateX(-50%);

  /* Glassmorphism — Vision sec 3.3 */
  background: var(--bg-elevated);           /* #1A1A1A */
  border: 1px solid var(--border-subtle);   /* #2D2D2D */
  border-radius: var(--radius-xl);          /* 16px */

  /* Shadow + glow */
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.05),
    0 16px 64px rgba(0, 0, 0, 0.6),
    0 0 48px rgba(124, 58, 237, 0.04);  /* sutil violet ambient */

  /* Animation */
  animation: fade-in 100ms ease-out;  /* rapido — ADHD nao espera */
}

.command-palette-backdrop {
  background: var(--overlay-light);          /* rgba(0,0,0,0.3) */
  backdrop-filter: blur(4px);                /* blur leve — manter contexto */
}
```

**ADHD-UX-04 (flow ininterrupto):** Backdrop leve (0.3 + blur 4px) — operador mantem nocao de onde esta. Abre rapido (100ms, nao 150ms).

---

### 2. Search Input

```
Container:
  position: sticky top (nao scrolla)
  border-bottom: 1px solid var(--border-default)
  padding: 12px 16px

Input:
  background: transparent
  border: none
  font: var(--text-body-size) = 14px
  weight: 400
  color: var(--text-primary)
  placeholder: "Buscar ou executar..."
  placeholder-color: var(--text-muted)
  width: 100%
  outline: none

  Left icon: Search (Lucide, 16px, var(--text-muted))
  Right hint: "Esc" badge

  Focus:
    Accent underline animada (border-bottom glow):
    border-bottom: 2px solid var(--accent-primary)
    box-shadow: 0 1px 8px rgba(124, 58, 237, 0.15)

"Esc" badge:
  font: var(--text-caption) = 11px
  font-family: var(--font-mono)
  background: var(--bg-subtle)
  border: 1px solid var(--border-default)
  border-radius: var(--radius-sm) = 6px
  padding: 2px 6px
  color: var(--text-muted)
```

**LED strip:** Border-bottom com glow violet no focus = LED strip horizontal (aesthetic-profile sec 7.3).

---

### 3. Sections & Items

```
Section header:
  font: var(--text-caption) = 11px
  weight: 600
  color: var(--text-muted)
  text-transform: uppercase
  letter-spacing: 0.05em
  padding: 8px 16px 4px
  margin-top: 4px

Results area:
  overflow-y: auto
  max-height: calc(max-height - input height)
  padding-bottom: 8px

Cada item:
  display: flex
  align-items: center
  gap: 12px
  padding: 8px 16px
  cursor: pointer
  border-radius: 0 (full-width highlight)

  Icon:
    Lucide, 16px
    color: var(--text-secondary)

  Label:
    font: var(--text-body-size) = 14px
    weight: 400
    color: var(--text-primary)
    flex: 1

  Shortcut badge (quando aplicavel):
    font: var(--text-caption) = 11px
    font-family: var(--font-mono)
    background: var(--bg-subtle)
    border: 1px solid var(--border-default)
    border-radius: var(--radius-sm)
    padding: 2px 6px
    color: var(--text-muted)

  Hover / Active (keyboard selection):
    background: var(--bg-raised) = #1E1E2E
    .icon { color: var(--accent-primary) }

  Transition: background 100ms ease
```

**ADHD-UX-13:** Shortcuts visiveis a direita de cada item = operador aprende atalhos organicamente.

---

### 4. Secoes e Conteudo

#### 4.1 RECENTES (sempre visivel no topo, max 5 items)

```
Logica: Ultimas 5 navegacoes/acoes do usuario (localStorage)

Items de exemplo:
  [Clock] NutraVida Plus          → navega para /spy/offer/{id}
  [Clock] Import Semrush Bulk     → abre ImportModal com tipo pre-selecionado
  [Clock] Dashboard               → navega para /dashboard

Icon: Clock (Lucide) para todos os recentes
Shortcut: Enter (executa item selecionado)
```

**ADHD-UX-07 (sistema como organizador):** O sistema lembra o que o operador fez recentemente — zero esforco de memoria.

#### 4.2 NAVEGACAO (paginas principais)

```
Items fixos:

| Icon (Lucide) | Label | Rota | Shortcut |
|---------------|-------|------|----------|
| Radar | Spy Radar | /spy | Alt+1 |
| LayoutDashboard | Dashboard | /dashboard | Alt+2 |
| Package | Ofertas Proprias | /ofertas | Alt+3 |
| Palette | Criativos | /criativos | Alt+4 |
| Users | Avatares | /avatares | Alt+5 |
| Shield | Arsenal | /arsenal | Alt+6 |
| Briefcase | Daily Briefing | /briefing | Alt+0 |
| Settings | Configuracoes | /settings | Alt+, |
```

#### 4.3 ACOES RAPIDAS

```
Items fixos:

| Icon (Lucide) | Label | Acao | Shortcut |
|---------------|-------|------|----------|
| Upload | Importar CSV | Abre UniversalImportModal | Ctrl+I |
| Plus | Quick Add Oferta | Abre QuickAddOfferModal | Ctrl+N |
| Copy | Clonar Oferta | Abre CloneToOwnOfferModal (se em SpyOfferDetail) | - |
| Bookmark | Saved Views | Abre dropdown de views salvos | - |
| RefreshCw | Refresh Pipeline | Executa refresh_pipeline RPC | - |
| Download | Exportar Radar CSV | Exporta ofertas filtradas | Ctrl+E |
```

**Condicional:** "Clonar Oferta" so aparece quando estamos em SpyOfferDetail. Acoes contextuais baseadas na rota atual.

#### 4.4 BUSCA GLOBAL

```
Aparece quando usuario digita >= 2 caracteres no search input.
Substitui as secoes estaticas por resultados de busca.

Search targets (em paralelo):
  1. spied_offers: nome, main_domain, notas
  2. offers: nome, vertical
  3. offer_domains: domain
  4. ad_creatives: nome, angulo
  5. avatars: nome

Resultado:
  Icon indica tipo: Radar (spy), Package (oferta), Globe (dominio), Image (criativo), User (avatar)
  Subtitulo: contexto ("Oferta espionada | Health | BR")

  +--------------------------------------+
  | [Radar] NutraVida Plus               |
  |         Oferta espionada | Health     |
  +--------------------------------------+
  | [Globe] nutravida.com                 |
  |         Dominio de NutraVida Plus     |
  +--------------------------------------+
  | [Image] NutraVida - Angulo Saude      |
  |         Criativo | Draft              |
  +--------------------------------------+

Busca: Supabase full-text search ou ILIKE com debounce 200ms
Limite: 10 resultados totais (max 3 por tipo)
```

**ADHD-UX-09 (painel unico):** Busca cruza TODOS os modulos — operador nao precisa lembrar onde salvou algo.

---

### 5. Comportamento de Busca

```
Estado vazio (search input vazio):
  Mostra: RECENTES → NAVEGACAO → ACOES RAPIDAS (secoes estaticas)

Digitando (>= 2 chars):
  Mostra: Resultados filtrados (busca fuzzy)
  Secoes estaticas SOMEM — resultados de busca ocupam o espaco

Zero resultados:
  +--------------------------------------+
  | [SearchX icon, 32px, --text-muted]   |
  |                                      |
  | Nenhum resultado para "xyz"          |
  | Tente termos diferentes ou           |
  | [Quick Add Oferta] com esse nome     |
  +--------------------------------------+
```

**ADHD-UX-10:** Zero results NUNCA e dead end — oferece acao alternativa.

---

### 6. Navegacao por Teclado

```
| Tecla | Acao |
|-------|------|
| Cmd+K | Abre/fecha palette |
| Escape | Fecha palette |
| Arrow Up/Down | Navega entre items |
| Enter | Executa item selecionado |
| Backspace (input vazio) | Fecha palette |
| Tab | Move para proximo grupo |

Item selecionado (via keyboard):
  background: var(--bg-raised)
  border-left: 2px solid var(--accent-primary) /* LED strip */
  padding-left: 14px (compensar border)

Scroll automatico: item selecionado sempre visivel (scrollIntoView)
```

**ADHD-UX-13:** 100% navegavel por teclado. Mouse e opcional, nao necessario.
**LED strip:** Item ativo tem border-left violet = LED lateral (aesthetic-profile sec 7.3).

---

### 7. Contexto Adaptativo (por rota)

```
Dependendo da rota atual, acoes contextuais adicionais:

Em /spy (Radar):
  + [Filter] Filtrar por status...
  + [ArrowUpDown] Ordenar por trafego
  + [CheckSquare] Selecionar tudo

Em /spy/offer/{id} (Detalhe):
  + [Copy] Clonar para Oferta Propria
  + [ArrowLeft] [ArrowRight] Oferta anterior/proxima
  + [Star] Marcar como Hot

Em /criativos (Kanban):
  + [Plus] Novo Criativo
  + [Trophy] Marcar WINNER
  + [X] Marcar KILLED

Em /arsenal:
  + [Plus] Nova Footprint
  + [Plus] Nova Dork
```

---

## Responsive Behavior

```
>= 640px: width 640px, centered
< 640px:  width 100%, full-screen overlay, border-radius 0
          Search input maior (touch target 48px height)
```

---

## Data Sources

| Funcionalidade | Storage/Query |
|----------------|---------------|
| Recentes | localStorage `drops_cmd_palette_recents` (max 10) |
| Busca ofertas | `spied_offers` ILIKE `%term%` on (nome, main_domain) |
| Busca dominios | `offer_domains` ILIKE `%term%` on (domain) |
| Busca criativos | `ad_creatives` ILIKE `%term%` on (nome) |
| Busca avatares | `avatars` ILIKE `%term%` on (nome) |

**Debounce:** 200ms entre keystrokes antes de disparar busca.
**Cache:** React Query com staleTime de 30s para resultados de busca.

---

## Notas de Implementacao

1. **Componente:** Reescrever `src/shared/components/layout/command-palette/CommandPalette.tsx`
2. **Lib:** cmdk ja instalado — usar `<Command>`, `<Command.Input>`, `<Command.List>`, `<Command.Group>`, `<Command.Item>`
3. **Hook:** `useCommandPalette()` — gerencia recentes (localStorage), busca (debounced), contexto (rota)
4. **Global:** Registrar Cmd+K em `useKeyboardShortcuts` (hook existente mas nao implementado)
5. **Performance:** Busca limitada a 10 resultados, debounce 200ms, prefetch recentes
6. **A11y:** role="dialog", aria-label="Command palette", items com role="option"

---

*Uma — um keystroke para dominar todos*
