# Consolidation Report — Pattern Clustering & Reduction Plan

> **Autor:** Uma (@ux-design-expert) | **Data:** 2026-03-02
> **Input:** `outputs/ux-design/dr-core/audit-report.md` (Fase 1)
> **Target:** `docs/vision/aesthetic-profile.md` (Vision)
> **Status:** FINAL

---

## 1. Resumo de Reducao

| Area | Antes | Depois | Reducao |
|------|-------|--------|---------|
| Variantes RGBA hardcoded | 37 | 0 (tokenizadas) | **100%** |
| Form modals duplicados | 11 componentes / ~1,700 LOC | 1 hook + 1 base / ~300 LOC | **82%** |
| God tables | 2 componentes / ~1,000 LOC | 1 VirtualizedTable / ~450 LOC | **55%** |
| Entity cards duplicados | 4 componentes / ~340 LOC | 1 EntityCard / ~120 LOC | **65%** |
| Color systems paralelos | 2 (tokens.css + index.css HSL) | 1 (tokens.css como fonte unica) | **50%** |
| Font fallbacks | 100% system-ui | 100% Inter/JetBrains Mono | **N/A** |
| Total LOC economizado | — | — | **~2,200 LOC** |

---

## 2. Cluster Analysis

### CLUSTER A: Cores e Opacidades (37 variantes → ~15 tokens)

**Pattern detectado:** Componentes usam `rgba(R, G, B, opacity)` inline com os mesmos 8 cores base em 3-7 niveis de opacidade.

**Cluster:**

| Cor base | Variantes inline | Usos | Proposta de tokens |
|----------|-----------------|------|--------------------|
| Teal (#00D4AA) | 0.05, 0.1, 0.2, 0.3, 0.4, 0.6, 0.85 | HeatmapCalendar, TrafficChart, SparklineBadge | `--accent-teal-5`, `--accent-teal-10`, `--accent-teal-20` |
| Violet (#7C3AED) | 0.05, 0.1, 0.15, 0.2, 0.3 | SpyOffersTable, StatusBadge, sidebar | `--accent-primary-5`, `--accent-primary-10`, `--accent-primary-20` |
| Gray (#6B7280) | 0.05, 0.1, 0.15, 0.2 | SpyOverviewTab, backgrounds | `--text-muted-5`, `--text-muted-10`, `--text-muted-20` |
| Amber (#D4A574) | 0.05, 0.1, 0.2, 0.3 | SpikeAlertCard, LED effects | `--accent-amber-10`, `--accent-amber-20` |
| Error (#EF4444) | 0.08, 0.1, 0.2, 0.3 | SpyFunnelTab, alerts | `--semantic-error-10`, `--semantic-error-20` |
| Warning (#EAB308) | 0.1, 0.2 | StatusBadge | `--semantic-warning-10`, `--semantic-warning-20` |
| Blue (#3B82F6) | 0.1, 0.2 | SpyDomainsTab | `--accent-blue-10`, `--accent-blue-20` |
| Green (#22C55E) | 0.1, 0.2, 0.3 | SpyOverviewTab | `--accent-green-10`, `--accent-green-20` |

**Regra de consolidacao:** Padronizar em 3 niveis de opacidade por cor:
- `-10` = 10% (backgrounds sutis, hover states)
- `-20` = 20% (borders, badges, active states)
- `-40` = 40% (fills mais densos, heatmap levels)

**Adicionais:**

| Atual | Token proposto |
|-------|---------------|
| `rgba(20, 20, 20, 0.92)` | `--glass-solid` |
| `rgba(20, 20, 20, 0.8)` | `--glass-interactive` |
| `rgba(0, 0, 0, 0.5)` | `--overlay-dark` |
| `rgba(0, 0, 0, 0.3)` | `--overlay-light` |
| `rgba(255, 255, 255, 0.05)` | `--border-glass` |

**Tokens a adicionar em `tokens.css`:**

```css
/* Opacity scale (3 levels per accent color) */
--accent-primary-10: rgba(124, 58, 237, 0.1);
--accent-primary-20: rgba(124, 58, 237, 0.2);
--accent-primary-40: rgba(124, 58, 237, 0.4);

--accent-teal-10: rgba(0, 212, 170, 0.1);
--accent-teal-20: rgba(0, 212, 170, 0.2);
--accent-teal-40: rgba(0, 212, 170, 0.4);

--accent-amber-10: rgba(212, 165, 116, 0.1);
--accent-amber-20: rgba(212, 165, 116, 0.2);

--accent-blue-10: rgba(59, 130, 246, 0.1);
--accent-blue-20: rgba(59, 130, 246, 0.2);

--accent-green-10: rgba(34, 197, 94, 0.1);
--accent-green-20: rgba(34, 197, 94, 0.2);

--semantic-error-10: rgba(239, 68, 68, 0.1);
--semantic-error-20: rgba(239, 68, 68, 0.2);

--semantic-warning-10: rgba(234, 179, 8, 0.1);
--semantic-warning-20: rgba(234, 179, 8, 0.2);

--text-muted-10: rgba(107, 114, 128, 0.1);
--text-muted-20: rgba(107, 114, 128, 0.2);

/* Glass & Overlay */
--glass-solid: rgba(20, 20, 20, 0.92);
--glass-interactive: rgba(20, 20, 20, 0.8);
--overlay-dark: rgba(0, 0, 0, 0.5);
--overlay-light: rgba(0, 0, 0, 0.3);
--border-glass: rgba(255, 255, 255, 0.05);
```

**Impacto:** 37 variantes inline → 21 tokens. Cada componente referencia token ao inves de RGBA.

---

### CLUSTER B: Form Modals (11 componentes → 1 hook + 1 base)

**Pattern identico em 11 arquivos:**

```typescript
// PATTERN: Aparece em TODOS os 11 modais
const [form, setForm] = useState<FormType>(INITIAL_STATE);
const set = (key: string, value: any) => setForm(f => ({ ...f, [key]: value }));
const mutation = useCreateX(); // ou useUpdateX()

const handleSave = () => {
  if (!form.requiredField) { toast.error("..."); return; }
  mutation.mutate(payload, {
    onSuccess: () => { toast.success("..."); onClose(); },
    onError: (err) => { toast.error(err.message); }
  });
};

return (
  <Dialog open={open} onOpenChange={onClose}>
    <DialogContent>
      <DialogHeader><DialogTitle>...</DialogTitle></DialogHeader>
      {/* N campos Label + Input/Select/Textarea */}
      <DialogFooter>
        <Button variant="ghost" onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave} disabled={mutation.isPending}>Salvar</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
);
```

**Componentes afetados:**

| Componente | LOC | Campos | Mutation |
|-----------|-----|--------|----------|
| QuickAddOfferModal | 77 | 6 | useCreateSpiedOffer |
| FullOfferFormModal | 307 | 21+ | useCreate/UpdateSpiedOffer |
| SemrushImportModal | 319 | 8+ | useImportHistory |
| OfertaFormDialog | ~150 | 10 | useCreateOferta |
| CriativoFormDialog | ~200 | 12 | useCreateCriativo |
| AdCreativeFormDialog | ~150 | 10 | useCreateAdCreative |
| CompetitorFormDialog | ~100 | 6 | useCreateCompetitor |
| AvatarCreateModal | ~150 | 8 | useCreateAvatar |
| AvatarExtractionModal | ~100 | 4 | useExtractAvatar |
| HookGeneratorModal | ~100 | 5 | useGenerateHooks |
| SpyDeleteDialog | ~50 | 0 (confirm) | useDeleteSpiedOffer |

**Proposta de consolidacao:**

**1. `useFormDialog<T>()` hook:**

```typescript
interface UseFormDialogOptions<T> {
  initialValues: T;
  mutation: UseMutationResult;
  validate?: (form: T) => string | null;
  onSuccess?: () => void;
  successMessage?: string;
}

function useFormDialog<T extends Record<string, any>>(opts: UseFormDialogOptions<T>) {
  const [form, setForm] = useState<T>(opts.initialValues);
  const set = <K extends keyof T>(key: K, value: T[K]) =>
    setForm(f => ({ ...f, [key]: value }));
  const reset = () => setForm(opts.initialValues);

  const handleSave = () => {
    const error = opts.validate?.(form);
    if (error) { toast.error(error); return; }
    opts.mutation.mutate(form, {
      onSuccess: () => {
        toast.success(opts.successMessage || "Salvo");
        opts.onSuccess?.();
        reset();
      },
    });
  };

  return { form, set, reset, handleSave, isPending: opts.mutation.isPending };
}
```

**2. `<FormDialog>` wrapper component:**

```typescript
interface FormDialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  onSave: () => void;
  isPending: boolean;
  saveLabel?: string;
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}
```

**Reducao estimada:** ~1,700 LOC → ~300 LOC (hook + base + configs). **82% de reducao.**

**Vision component:** Alinha com aesthetic-profile sec 9.8 (Modais e Dialogs):
- Glassmorphism card sobre backdrop blur
- Ambient glow por tipo (purple=criar, amber=confirmar, red=destruir)
- Pill-shaped buttons
- Close X no canto superior direito

---

### CLUSTER C: Tables Virtualizadas (2 god tables → 1 VirtualizedTable)

**Overlap entre SpyOffersTable (577 LOC) e TrafficTable (427 LOC):**

| Feature | SpyOffersTable | TrafficTable | Shared? |
|---------|---------------|--------------|---------|
| TanStack Virtual | Sim | Sim | **100%** |
| Row selection (checkbox) | Sim | Sim | **100%** |
| Pagination (top+bottom) | Sim | Sim | **100%** |
| Column sorting | Sim | Sim | **100%** |
| Sticky header | Sim | Sim | **100%** |
| Column visibility toggle | Sim | Nao | 50% |
| Inline status edit | Sim | Sim | **100%** |
| Sparklines inline | Sim | Sim | **100%** |
| Bulk actions bar | Sim | Nao | 50% |
| Row height fixed | 40px | 40px | **100%** |

**Proposta de consolidacao:**

```typescript
interface VirtualizedTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  rowHeight?: number;                    // default 40px
  enableSelection?: boolean;             // checkbox column
  enablePagination?: boolean;            // top + bottom
  enableColumnVisibility?: boolean;      // column toggle
  enableBulkActions?: boolean;           // action bar on selection
  onRowClick?: (row: T) => void;
  renderBulkActions?: (selectedIds: string[]) => ReactNode;
  emptyState?: ReactNode;               // ADHD-UX-10
  stickyHeader?: boolean;               // default true
}
```

**Reducao estimada:** ~1,000 LOC → ~450 LOC. **55% de reducao.**

**Vision component:** Alinha com aesthetic-profile sec 6.4 (Data Table):
- Hover row highlight com border-glow sutil
- Status badges coloridos inline
- Search bar integrado
- Skeleton shimmer durante loading (ADHD-UX-01)

---

### CLUSTER D: Entity Cards (4 cards → 1 EntityCard)

**Pattern identico:**

```tsx
// SpikeAlertCard, AvatarCard, CompetitorCard, OfertaCard
<div className="flex gap-3 p-3 rounded-lg border bg-[var(--bg-surface)] ...">
  <div className="icon-area">
    <LucideIcon className="w-4 h-4" />
  </div>
  <div className="content flex-1">
    <h3 className="text-sm font-medium">Title</h3>
    <p className="text-xs text-muted">Description</p>
  </div>
  <div className="badge-area">
    <Badge>Status</Badge>
  </div>
</div>
```

**Proposta:**

```typescript
interface EntityCardProps {
  icon: LucideIcon;
  iconColor?: string;         // CSS var token
  title: string;
  subtitle?: string;
  badge?: ReactNode;
  actions?: ReactNode;        // three-dot menu
  glow?: 'warm' | 'primary' | 'teal' | 'none';  // Vision LED glow
  onClick?: () => void;
  className?: string;
}
```

**Reducao estimada:** ~340 LOC → ~120 LOC. **65% de reducao.**

---

### CLUSTER E: Tab + CRUD Components (10 tabs → pattern extraction)

**Pattern em 7 Spy tabs + 3 Arsenal tabs:**

```tsx
// Pattern: fetch → filter → render table/grid → CRUD actions
const { data, isLoading } = useQuery(...);
const createMutation = useMutation(...);
const deleteMutation = useMutation(...);

return (
  <div className="space-y-4">
    {/* Header com titulo + botao Add */}
    {/* Filter bar (opcional) */}
    {/* Table ou Grid com dados */}
    {/* Empty state quando vazio */}
    {/* Modal de criacao/edicao */}
  </div>
);
```

**Proposta: `CRUDTabLayout` wrapper (nao component — pattern):**

Nao extrair componente aqui (cada tab tem dominio diferente). Mas padronizar:
1. Usar `EmptyState` component reusavel (ADHD-UX-10)
2. Usar `FormDialog` do Cluster B para modais
3. Usar skeleton loading padronizado (ADHD-UX-01)
4. Usar `EntityCard` do Cluster D para grids

**Reducao estimada:** ~500 LOC via reuso de EmptyState + FormDialog + EntityCard.

---

## 3. Gap Critico #1: Dual Color System — Estrategia de Bridge

### Problema

Dois sistemas de cores coexistem sem conexao:

| Sistema | Onde | Formato | Quem usa |
|---------|------|---------|----------|
| `tokens.css` | Vision design tokens | `--bg-base: #0A0A0A` | Design system components (DataMetricCard, StatusBadge, etc.) |
| `index.css` | shadcn/ui theme | `--background: 222 30% 6%` (HSL) | shadcn components (Button, Input, Card, Dialog, etc.) |

Devs ficam confusos: usar `bg-background` (shadcn) ou `bg-[var(--bg-base)]` (Vision)?

### Estrategia: Bridge Unidirecional (tokens.css → index.css)

**Principio:** `tokens.css` e a fonte unica de verdade. `index.css` HSL vars sao DERIVADAS dos tokens.

**Plano de execucao:**

**Passo 1:** Mapear tokens Vision → HSL equivalentes

| Token Vision | Hex | HSL equivalente | Variavel shadcn |
|-------------|-----|-----------------|-----------------|
| `--bg-base` | #0A0A0A | 0 0% 4% | `--background` |
| `--bg-surface` | #141414 | 0 0% 8% | `--card` |
| `--bg-elevated` | #1A1A1A | 0 0% 10% | `--popover` |
| `--bg-subtle` | #252830 | 220 11% 17% | `--muted` |
| `--accent-primary` | #7C3AED | 263 84% 58% | `--primary` |
| `--semantic-error` | #EF4444 | 0 84% 60% | `--destructive` |
| `--border-default` | #1F1F1F | 0 0% 12% | `--border` |
| `--border-interactive` | #3D3D3D | 0 0% 24% | `--input` |
| `--accent-primary` | #7C3AED | 263 84% 58% | `--ring` |
| `--text-primary` | #FFFFFF | 0 0% 100% | `--foreground` |
| `--text-secondary` | #949494 | 0 0% 58% | `--muted-foreground` |

**Passo 2:** Reescrever `index.css` dark mode block

```css
.dark {
  /* Bridge: derived from tokens.css Vision values */
  --background: 0 0% 4%;           /* --bg-base: #0A0A0A */
  --foreground: 0 0% 100%;         /* --text-primary: #FFFFFF */
  --card: 0 0% 8%;                 /* --bg-surface: #141414 */
  --card-foreground: 0 0% 100%;    /* --text-primary */
  --popover: 0 0% 10%;             /* --bg-elevated: #1A1A1A */
  --popover-foreground: 0 0% 100%; /* --text-primary */
  --primary: 263 84% 58%;          /* --accent-primary: #7C3AED */
  --primary-foreground: 0 0% 100%; /* white on violet */
  --secondary: 220 11% 17%;        /* --bg-subtle: #252830 */
  --secondary-foreground: 0 0% 96%;/* --text-body: #F5F0EB */
  --muted: 220 11% 17%;            /* --bg-subtle */
  --muted-foreground: 0 0% 58%;    /* --text-secondary: #949494 */
  --accent: 24 40% 64%;            /* --accent-amber: #D4A574 */
  --accent-foreground: 0 0% 100%;  /* white */
  --destructive: 0 84% 60%;        /* --semantic-error: #EF4444 */
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 12%;              /* --border-default: #1F1F1F */
  --input: 0 0% 24%;               /* --border-interactive: #3D3D3D */
  --ring: 263 84% 58%;             /* --accent-primary */
}
```

**Passo 3:** Extender `tailwind.config.ts` com tokens Vision

```typescript
extend: {
  colors: {
    // Vision tokens como Tailwind utilities
    'vision': {
      'void': 'var(--bg-void)',
      'base': 'var(--bg-base)',
      'deep': 'var(--bg-deep)',
      'surface': 'var(--bg-surface)',
      'elevated': 'var(--bg-elevated)',
      'raised': 'var(--bg-raised)',
      'subtle': 'var(--bg-subtle)',
    },
    'accent': {
      'primary': 'var(--accent-primary)',
      'teal': 'var(--accent-teal)',
      'cyan': 'var(--accent-cyan)',
      'green': 'var(--accent-green)',
      'blue': 'var(--accent-blue)',
      'amber': 'var(--accent-amber)',
      'gold': 'var(--accent-gold)',
      'orange': 'var(--accent-orange)',
    },
  },
  boxShadow: {
    'glow-primary': 'var(--glow-primary)',
    'glow-amber': 'var(--glow-amber)',
    'glow-teal': 'var(--glow-teal)',
    'glow-success': 'var(--glow-success)',
    'glow-error': 'var(--glow-error)',
  },
  animation: {
    'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
    'shimmer': 'shimmer 1.5s linear infinite',
    'fade-in': 'fade-in 150ms ease-out',
    'slide-in': 'slide-in-right 200ms ease',
  },
}
```

**Resultado:** Devs podem usar AMBOS:
- `bg-background` (shadcn — agora alinhado com Vision)
- `bg-vision-surface` (Vision direto — para componentes custom)

**Esforco:** ~4h para bridge + ~2h para extender Tailwind = **6h total**

---

## 4. Gap Critico #2: Fonts Nao Importadas

### Problema

`tokens.css` declara Inter e JetBrains Mono, mas nenhuma fonte e carregada. Browser usa `system-ui` (SF Pro no Mac, Segoe UI no Windows).

### Plano de Importacao

**Opcao recomendada: Google Fonts via `<link>` no `index.html`**

```html
<!-- index.html <head> -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```

**Pesos necessarios (da Vision):**

| Fonte | Pesos | Uso |
|-------|-------|-----|
| Inter 300 | Light | Nao usado atualmente, mas Vision menciona |
| Inter 400 | Regular | Body text, labels |
| Inter 500 | Medium | Card titles, badges (87 usos `font-medium`) |
| Inter 600 | Semi-bold | Section heads (49 usos `font-semibold`) |
| Inter 700 | Bold | KPIs, page titles (19 usos `font-bold`) |
| JetBrains Mono 400 | Regular | URLs, dominios, IDs tecnicos |
| JetBrains Mono 500 | Medium | Code blocks, monospace emphasis |
| JetBrains Mono 600 | Semi-bold | Keyboard shortcuts |

**Impacto no bundle:** ~100KB (Inter subset latin) + ~50KB (JetBrains Mono subset latin) = ~150KB (com font-display: swap, nao bloqueia render).

**Feature ADHD-UX-02:** Inter tem excelentes tabular figures (numeros alinhados em colunas de dados), essencial para o SpyRadar com 12k+ rows.

**Esforco:** ~1h

---

## 5. Gap Critico #3: 11 Form Modals → Componente Consolidado

### Pattern Comum Extraido

```
TRIGGER: Botao abre modal
STATE: useState<FormType>(initialValues)
HELPER: set(key, value) wrapper
VALIDATE: if (!required) toast.error()
SUBMIT: mutation.mutate(payload, { onSuccess: close + toast })
UI: Dialog > DialogContent > DialogHeader > Fields > DialogFooter > [Cancel, Save]
```

### Componente Consolidado: `FormDialog` + `useFormDialog`

**Arquivos a criar:**

| Arquivo | Responsabilidade |
|---------|-----------------|
| `src/shared/components/form-dialog/useFormDialog.ts` | Hook: state, set, validate, submit |
| `src/shared/components/form-dialog/FormDialog.tsx` | UI: Dialog wrapper com Vision styling |
| `src/shared/components/form-dialog/FormField.tsx` | UI: Label + Input/Select/Textarea composicao |
| `src/shared/components/form-dialog/index.ts` | Barrel export |

**Exemplo de uso (antes vs depois):**

**ANTES (QuickAddOfferModal — 77 LOC):**
```tsx
export function QuickAddOfferModal({ open, onClose }) {
  const [form, setForm] = useState({ nome: '', main_domain: '', ... });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const mutation = useCreateSpiedOffer();
  const handleSave = () => {
    if (!form.nome) { toast.error("Nome obrigatorio"); return; }
    mutation.mutate(form, { onSuccess: () => { toast.success("Criado"); onClose(); } });
  };
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova Oferta</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div><Label>Nome</Label><Input value={form.nome} onChange={e => set('nome', e.target.value)} /></div>
          <div><Label>Dominio</Label><Input value={form.main_domain} onChange={...} /></div>
          {/* ...mais 4 campos */}
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button onClick={handleSave} disabled={mutation.isPending}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

**DEPOIS (~25 LOC):**
```tsx
export function QuickAddOfferModal({ open, onClose }) {
  const mutation = useCreateSpiedOffer();
  const { form, set, handleSave, isPending } = useFormDialog({
    initialValues: { nome: '', main_domain: '', vertical: '', geo: '' },
    mutation,
    validate: (f) => !f.nome ? "Nome obrigatorio" : null,
    onSuccess: onClose,
  });

  return (
    <FormDialog open={open} onClose={onClose} title="Nova Oferta"
                onSave={handleSave} isPending={isPending}>
      <FormField label="Nome" required>
        <Input value={form.nome} onChange={e => set('nome', e.target.value)} />
      </FormField>
      <FormField label="Dominio">
        <Input value={form.main_domain} onChange={e => set('main_domain', e.target.value)} />
      </FormField>
    </FormDialog>
  );
}
```

**Reducao por modal:** 40-70% menos LOC. Total estimado: **~1,400 LOC economizados.**

**Vision styling no FormDialog:**
- Background: `--bg-elevated`
- Border: `--border-default` com glow contextual
- Glow: `--glow-primary` para criar, `--glow-amber` para confirmar, `--glow-error` para deletar
- Buttons: pill-shaped, accent color no primario
- Backdrop blur: 8px (ADHD-UX-04: nao totalmente opaco, mantem contexto visual)

**Esforco:** ~8h (hook 3h + FormDialog 3h + FormField 2h)

---

## 6. Plano de Migracao por Cluster

### Fase 1: Foundation (semana 1) — 11h

| Acao | Cluster | Esforco | Dependencia |
|------|---------|---------|-------------|
| Adicionar opacity tokens a tokens.css | A | 2h | Nenhuma |
| Bridge index.css HSL → Vision tokens | #1 | 4h | Opacity tokens |
| Extender tailwind.config.ts com Vision utilities | #1 | 2h | Bridge |
| Importar Inter + JetBrains Mono | #2 | 1h | Nenhuma |
| Registrar animations no Tailwind | A | 1h | Nenhuma |
| Remover src/App.css (boilerplate) | Cleanup | 0.5h | Nenhuma |

### Fase 2: Components (semana 2) — 13h

| Acao | Cluster | Esforco | Dependencia |
|------|---------|---------|-------------|
| Criar useFormDialog + FormDialog + FormField | B | 8h | Foundation |
| Criar EntityCard | D | 3h | Foundation |
| Criar EmptyState component (ADHD-UX-10) | E | 2h | Foundation |

### Fase 3: Refactoring (semana 3-4) — 16h

| Acao | Cluster | Esforco | Dependencia |
|------|---------|---------|-------------|
| Migrar 11 form modals para useFormDialog | B | 8h | FormDialog |
| Extrair VirtualizedTable de SpyOffers + Traffic | C | 8h | Foundation |

### Fase 4: Polish (semana 4) — 6h

| Acao | Cluster | Esforco | Dependencia |
|------|---------|---------|-------------|
| Migrar 4 entity cards para EntityCard | D | 2h | EntityCard |
| Substituir RGBA inline por opacity tokens | A | 3h | Opacity tokens |
| Remover #EC4899 (pink orphan) do CHART_LINE_COLORS | A | 0.5h | Nenhuma |
| Adicionar SkeletonLoader reusavel (ADHD-UX-01) | E | 0.5h | Foundation |

**Total: ~46h across 4 semanas**

---

## 7. Metricas de Sucesso Pos-Consolidacao

| Metrica | Antes | Depois | Target |
|---------|-------|--------|--------|
| Score de aderencia Vision | 59% | 82% | 85%+ |
| RGBA inline hardcoded | 37 | 0 | 0 |
| Form modal LOC total | ~1,700 | ~300 | <400 |
| God table LOC total | ~1,000 | ~450 | <500 |
| Color systems paralelos | 2 | 1 (bridged) | 1 |
| Fonts carregadas | 0 | 2 (Inter + JBMono) | 2 |
| Design system components | 6 (Tier 1) | 6 + 4 novos | 10+ |
| ADHD compliance score | 39% | 55% | 60%+ |

---

*Uma — consolidando com empatia, reduzindo com precisao*
