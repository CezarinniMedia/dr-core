# QA Fix Request — VISION-4 (FASE 4: Modules)

**De:** Quinn (@qa)
**Para:** Dex (@dev)
**Data:** 2026-02-21
**Branch:** `feature/vision-1-foundation`
**Commits:** `8602d55` → `666b454`
**Verdict:** CONCERNS — fixes obrigatórios antes de merge

---

## BLOQUEIA MERGE (5 fixes)

### FIX-1: SQL Injection nos `.or()` do Arsenal [CRITICAL]

**Arquivo:** `src/features/arsenal/hooks/useArsenal.ts`
**Linhas:** 49, 147, 241

**Problema:** Input do usuário interpolado direto na query string do Supabase `.or()`.
```typescript
// VULNERAVEL:
query = query.or(`dork_query.ilike.%${search}%,nome.ilike.%${search}%`);
```

**Fix:** Substituir `.or()` por `.ilike()` encadeado com filtros individuais, ou sanitizar o input:
```typescript
// OPCAO 1: Filtros individuais (mais seguro)
if (search) {
  const sanitized = search.replace(/[%_\\]/g, '\\$&');
  query = query.or(
    `dork_query.ilike.%${sanitized}%,nome.ilike.%${sanitized}%,objetivo.ilike.%${sanitized}%`
  );
}

// OPCAO 2: Client-side filter (zero risco SQL)
// Trazer todos os dados e filtrar no JS (ok para <1000 registros)
```

**Locais a corrigir:**
1. `useArsenalDorks` (linha ~49)
2. `useArsenalFootprints` (linha ~147)
3. `useArsenalKeywords` (linha ~241)

---

### FIX-2: Delete sem confirmação — Arsenal (3 tabs) [CRITICAL]

**Arquivos:**
- `src/features/arsenal/components/DorksTab.tsx` (linha 165)
- `src/features/arsenal/components/FootprintsTab.tsx` (linha 174)
- `src/features/arsenal/components/KeywordsTab.tsx` (linha 172)

**Problema:** Botão trash executa `deleteMutation.mutate()` direto sem confirmação.

**Fix:** Adicionar state `deleteId` + `AlertDialog` (padrão já usado em `Ofertas.tsx:117-133` e `AvatarList.tsx:61-81`).

```typescript
// Adicionar state:
const [deleteId, setDeleteId] = useState<string | null>(null);

// Trocar onClick do trash:
onClick={() => setDeleteId(item.id)}  // ao invés de deleteMutation.mutate(item.id)

// Adicionar AlertDialog no final do componente:
<AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
  <AlertDialogContent>
    <AlertDialogHeader>
      <AlertDialogTitle>Confirmar exclusão?</AlertDialogTitle>
      <AlertDialogDescription>
        Esta ação não pode ser desfeita.
      </AlertDialogDescription>
    </AlertDialogHeader>
    <AlertDialogFooter>
      <AlertDialogCancel>Cancelar</AlertDialogCancel>
      <AlertDialogAction onClick={() => {
        if (deleteId) deleteMutation.mutate(deleteId);
        setDeleteId(null);
      }}>
        Deletar
      </AlertDialogAction>
    </AlertDialogFooter>
  </AlertDialogContent>
</AlertDialog>
```

Aplicar nos 3 arquivos.

---

### FIX-3: Delete sem confirmação — OfertaDetail [CRITICAL]

**Arquivo:** `src/pages/OfertaDetail.tsx` (linha ~118)

**Problema:** `handleDelete` executa direto sem AlertDialog.

**Fix:** Adicionar state `showDeleteConfirm` + AlertDialog (mesmo padrão do FIX-2).

---

### FIX-4: Double query na Ofertas page [HIGH]

**Arquivo:** `src/pages/Ofertas.tsx` (linhas 210, 223)

**Problema:** Duas chamadas `useOfertas()` — uma filtrada e uma sem filtro — rodam simultaneamente.

**Fix:** Manter apenas `useOfertas()` (sem filtro) e filtrar client-side:
```typescript
const { data: allOfertas, isLoading } = useOfertas();

// Filtrar client-side para cards/table:
const filteredOfertas = statusFilter === "ALL"
  ? allOfertas
  : allOfertas?.filter(o => o.status === statusFilter);

// Kanban usa allOfertas direto (já precisa de todos)
```

Remover a linha `const allOfertas = useOfertas();` duplicada.

---

### FIX-5: Kanban loading state [HIGH]

**Arquivo:** `src/pages/Ofertas.tsx` (linha ~299)

**Problema:** Kanban renderiza sem checar `isLoading` do query.

**Fix:** Com o FIX-4 aplicado, o `isLoading` único já cobre o kanban. Apenas garantir que o skeleton aparece antes do kanban:

```typescript
{isLoading ? (
  <SkeletonGrid />  // já existe
) : viewMode === "kanban" ? (
  <OfertaKanbanView ofertas={allOfertas || []} ... />
) : ...}
```

---

## RECOMENDADO (não bloqueia, mas fix desejável)

### REC-1: useEffect dependency — CriativoFormDialog

**Arquivo:** `src/features/creatives/components/CriativoFormDialog.tsx`

**Problema:** `form.nome` falta no dep array do useEffect que auto-gera nome.

**Fix:** Adicionar `form.nome` ao array ou usar `useRef` para tracking.

---

### REC-2: Form reset on cancel — OfertaFormDialog

**Arquivo:** `src/features/offers/components/OfertaFormDialog.tsx`

**Fix:** Reset form quando dialog fecha:
```typescript
<Dialog open={open} onOpenChange={(v) => {
  onOpenChange(v);
  if (!v) setForm(defaultForm);
}}>
```

---

### REC-3: AvatarCreateModal pending state

**Arquivo:** `src/features/avatar/components/AvatarCreateModal.tsx`

**Verificar:** O botão já tem `disabled={createMutation.isPending}` e Loader2 — confirmar que está funcionando.

---

## Checklist de Validação

Após os fixes, verificar:

- [ ] Arsenal search com caracteres especiais (`%`, `_`, `'`, `"`) não quebra
- [ ] Delete em todos os 4 locais mostra confirmação antes de executar
- [ ] Ofertas page faz apenas 1 query (não 2)
- [ ] Kanban mostra skeleton durante loading
- [ ] Build + typecheck passam limpos
- [ ] Nenhum `console.log` ou debug code remanescente

---

*— Quinn, guardião da qualidade*
