# Dev Start Guide - Brownfield Recovery Sprint 0

**Para: @dev**
**Prioridade: MAXIMA**
**Tempo Total: 5 horas**
**Semana de: 2026-02-20**

---

## O QUE VOCE PRECISA FAZER HOJE

3 coisas críticas que BLOQUEIAM tudo:

1. **Storage RLS Policies** - Users estão acessando arquivos de outros workspaces
2. **Database Indexes** - Dashboard é lento demais (87k+ registros sem indexes)
3. **Branching Strategy** - Evitar conflitos Lovable/Claude Code

**Tempo:** 5 horas (1 dia de trabalho)
**Depois:** System pronto para Sprint 1 visual fixes

---

## SETUP (15 min)

```bash
# 1. Puxar latest codigo
git pull origin main

# 2. Ler este arquivo ate o final
# (Voce ja está fazendo isso)

# 3. Ter a mão os arquivos criticos:
# - docs/brownfield/DB-AUDIT.md (SECTION: Storage Bucket Policies - Issues)
# - docs/brownfield/DB-AUDIT.md (SECTION: Missing Indexes (Performance Concerns))
# - docs/stories/BD-0.1.story.md
# - docs/stories/BD-0.2.story.md
# - docs/stories/BD-0.3.story.md
```

---

## TASK 1: Fix Storage RLS Policies (1h 30 min)

**CRITICIDADE:** MAXIMA - Security vulnerability

### O Problema

Migration `20260209004023` substituiu policies workspace-scoped por genéricas:

```sql
-- WRONG (atual) - qualquer usuario autenticado pode acessar tudo
CREATE POLICY "Authenticated users can upload spy assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'spy-assets');
```

Resultado: User A do Workspace X pode ler/escrever/deletar arquivos de User B do Workspace Y.

### A Solução

Restaurar policies com workspace isolation. Supabase Storage usa folder paths para isolar dados:

#### Passo 1: Backup (5 min)
```sql
-- No supabase dashboard, SQL editor:
-- Apenas para documentacao - as policies podem ser recriadas

SELECT * FROM storage.objects
WHERE bucket_id IN ('spy-assets', 'creatives', 'documents');

-- Count por workspace para validacao posterior
SELECT
  (storage.foldername(name))[1] as workspace_id,
  COUNT(*) as file_count
FROM storage.objects
WHERE bucket_id = 'spy-assets'
GROUP BY (storage.foldername(name))[1];
```

#### Passo 2: Criar Migration SQL (30 min)

**Arquivo:** `supabase/migrations/YYYYMMDD_restore_storage_rls_policies.sql`

```sql
-- Fix Storage RLS Policies - Restore Workspace Isolation
-- Migration: 2026-02-20 XXXXXXXX
-- This restores the workspace-scoped RLS policies that were accidentally
-- replaced by overly-permissive authenticated-user-only policies in
-- migration 20260209004023.

-- STEP 1: Drop overly permissive policies
DROP POLICY IF EXISTS "Authenticated users can upload spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read spy assets" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete spy assets" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload creatives" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read creatives" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete creatives" ON storage.objects;

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can read documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete documents" ON storage.objects;

-- STEP 2: Restore workspace-scoped RLS policies for SPY-ASSETS bucket
CREATE POLICY "Users can upload spy assets to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read spy assets from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete spy assets from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update spy assets in own workspace"
ON storage.objects FOR UPDATE TO authenticated
WITH CHECK (
  bucket_id = 'spy-assets' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- STEP 3: Restore workspace-scoped RLS policies for CREATIVES bucket
CREATE POLICY "Users can upload creatives to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read creatives from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete creatives from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update creatives in own workspace"
ON storage.objects FOR UPDATE TO authenticated
WITH CHECK (
  bucket_id = 'creatives' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- STEP 4: Restore workspace-scoped RLS policies for DOCUMENTS bucket
CREATE POLICY "Users can upload documents to own workspace"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can read documents from own workspace"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete documents from own workspace"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can update documents in own workspace"
ON storage.objects FOR UPDATE TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1]::uuid IN (
    SELECT workspace_id FROM public.workspace_members
    WHERE user_id = auth.uid()
  )
);

-- STEP 5: Validate policies restored
-- Before/after check:
-- SELECT * FROM pg_policies WHERE schemaname = 'storage';
```

#### Passo 3: Deploy Migration (10 min)

```bash
# No terminal, no diretorio do projeto:

# 1. Copiar arquivo migration para supabase/migrations/
#    (Nome deve ser YYYYMMDDHHMMSS_restore_storage_rls_policies.sql)
#    Exemplo: 20260220143000_restore_storage_rls_policies.sql

# 2. Fazer push para Supabase
supabase db push

# 3. Verificar em Supabase dashboard → SQL Editor:
SELECT * FROM pg_policies
WHERE schemaname = 'storage' AND tablename = 'objects'
ORDER BY policyname;

# Resultado esperado:
# - 16 policies total (4 per bucket × 4 buckets, excluindo avatars que ficou public)
# - Nomes seguem padrão: "Users can [action] [bucket] from own workspace"
```

#### Passo 4: Test (10 min)

No app, testar upload em 2 workspaces diferentes:

```javascript
// Test 1: Upload na Workspace A
// 1. Login com user_a
// 2. Ir para Spy Radar → Upload screenshot
// 3. Deve fazer upload com sucesso

// Test 2: Validar isolamento
// 1. Copiar object_id do arquivo uploadado
// 2. Fazer logout
// 3. Login com user_b em Workspace B
// 4. Tentar acessar arquivo via URL direto:
//    https://xxxxx.supabase.co/storage/v1/object/public/spy-assets/{object_id}
// 5. Deve receber 403 Forbidden (Access Denied)
```

**Se funcionou:** Vai ver erro 403. Isso é CORRETO ✅
**Se nao funcionou:** Vai conseguir acessar arquivo de outro workspace. Isso é ERRADO ❌

---

## TASK 2: Fix .env in Git (5 min)

**CRITICIDADE:** MAXIMA - Security vulnerability

### O Problema
`.env` aparece no `git status` como modified. Credenciais possivelmente expostas.

### A Solução

```bash
# 1. Remover .env do git index (nao deleta arquivo local)
git rm --cached .env

# 2. Garantir .gitignore tem .env
echo ".env" >> .gitignore

# 3. Commitar mudanças
git add .gitignore
git commit -m "chore: remove .env from git tracking, add to .gitignore

.env was accidentally being tracked and contains secrets.
Restored proper .gitignore configuration.

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

# 4. Verificar
git status

# Resultado esperado:
# On branch main
# nothing to commit, working tree clean
```

---

## TASK 3: Add RLS to Legacy Tables (1h)

**CRITICIDADE:** ALTA - Data isolation vulnerability

### O Problema
6 tabelas têm `workspace_id` mas NÃO têm RLS policies:
- arsenal_dorks
- arsenal_footprints
- arsenal_keywords
- comparacao_batches
- import_batches
- trafego_historico

Users podem fazer: `SELECT * FROM arsenal_dorks` e ver dados de outros workspaces.

### A Solução

**Arquivo:** `supabase/migrations/YYYYMMDD_add_rls_legacy_tables.sql`

```sql
-- Add RLS to Legacy Tables
-- Migration: 2026-02-20

-- arsenal_dorks
ALTER TABLE arsenal_dorks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own workspace arsenal_dorks"
ON arsenal_dorks FOR SELECT
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can create arsenal_dorks in own workspace"
ON arsenal_dorks FOR INSERT
WITH CHECK (workspace_id IN (
  SELECT workspace_id FROM workspace_members
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can update arsenal_dorks in own workspace"
ON arsenal_dorks FOR UPDATE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members
  WHERE user_id = auth.uid()
));

CREATE POLICY "Users can delete arsenal_dorks in own workspace"
ON arsenal_dorks FOR DELETE
USING (workspace_id IN (
  SELECT workspace_id FROM workspace_members
  WHERE user_id = auth.uid()
));

-- Repeat for: arsenal_footprints, arsenal_keywords, comparacao_batches, import_batches, trafego_historico
-- (Same pattern, just change table name)
```

**Deploy:**
```bash
# Arquivo: supabase/migrations/YYYYMMDD_add_rls_legacy_tables.sql
supabase db push

# Verificar:
SELECT tablename, (polcount > 0) as has_rls
FROM (
  SELECT tablename, COUNT(*) as polcount
  FROM pg_policies
  WHERE tablename IN ('arsenal_dorks', 'arsenal_footprints', 'arsenal_keywords',
                      'comparacao_batches', 'import_batches', 'trafego_historico')
  GROUP BY tablename
) sub
ORDER BY tablename;

# Resultado esperado: all 6 tables = true
```

---

## TASK 4: Add Critical Database Indexes (30 min)

**CRITICIDADE:** ALTA - Performance vulnerability

### O Problema
87k+ traffic records, mas indexes faltam. Dashboard pode ser lento.

### A Solução

**Arquivo:** `supabase/migrations/YYYYMMDD_add_critical_indexes.sql`

```sql
-- Add Critical Performance Indexes
-- Migration: 2026-02-20

-- CRITICAL 1: offer_traffic_data FK index (missing!)
CREATE INDEX idx_offer_traffic_spied_offer
ON offer_traffic_data(spied_offer_id);

-- CRITICAL 2: Composite for dashboard queries
CREATE INDEX idx_offer_traffic_composite
ON offer_traffic_data(spied_offer_id, period_date DESC, source);

-- CRITICAL 3: Status + vertical filter combination
CREATE INDEX idx_spied_offers_status_vertical
ON spied_offers(status, vertical, workspace_id);

-- CRITICAL 4: Workspace isolation on offer_domains
CREATE INDEX idx_offer_domains_workspace
ON offer_domains(workspace_id);
```

**Deploy:**
```bash
# Arquivo: supabase/migrations/YYYYMMDD_add_critical_indexes.sql
supabase db push

# Verificar:
SELECT schemaname, tablename, indexname
FROM pg_indexes
WHERE tablename IN ('offer_traffic_data', 'spied_offers', 'offer_domains')
ORDER BY tablename, indexname;

# Resultado esperado: 4 novo indexes aparecem
```

---

## TASK 5: Setup Branching Strategy (1h)

**CRITICIDADE:** ALTA - Prevent conflicts + regressions

### O Problema
Lovable + Claude Code ambos commitam em `main`. Causa conflitos. Sem staging environment.

### A Solução - Git Workflow

```
main (production - protected)
  ↑
  ├─ Merge somente com PR reviews
  ├─ Auto-deploy para Hostinger
  └─ Tag releases

dev (staging)
  ↑
  ├─ Base para feature branches
  ├─ Precisa passar testes antes de merge em main
  └─ Para testing antes de production

feature/* (development)
  ├─ dev → feature/sprint-0-security
  ├─ dev → feature/sprint-1-visual
  └─ dev → feature/sprint-2-architecture

lovable/* (Lovable only)
  ├─ Nunca commita em main ou dev
  ├─ lovable/feature-name apenas
  └─ PR review antes de merge em dev
```

#### Passo 1: Create Dev Branch (5 min)

```bash
# Criar dev a partir de main
git checkout main
git pull origin main
git checkout -b dev
git push -u origin dev
```

#### Passo 2: Configure Branch Protection (10 min)

No GitHub:
1. Go to Settings → Branches
2. Add rule for `main`
   - Require pull request reviews before merging (1 review)
   - Require status checks to pass (if CI exists)
   - Include administrators
3. Add rule for `dev`
   - Require pull request reviews (1 review)
   - Require up-to-date branches

#### Passo 3: Update CLAUDE.md (30 min)

Add to CLAUDE.md:

```markdown
## Git Branching Strategy

### Branch Structure
- **main** - Production. Auto-deploys to Hostinger. Protected.
- **dev** - Staging. Base for feature branches. Requires PR.
- **feature/*** - Development branches from dev
- **lovable/*** - Lovable.dev only. Never commit to main.

### Workflow

#### Starting a Feature (Sprint 0, 1, 2, etc)
```bash
git checkout dev
git pull origin dev
git checkout -b feature/sprint-0-security
# OR
git checkout -b feature/bd-0-1-storage-rls
```

#### Finishing a Feature
```bash
git add .
git commit -m "feat: [description]

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

git push -u origin feature/sprint-0-security

# Go to GitHub → Create Pull Request
# - Base: dev
# - Compare: feature/sprint-0-security
# - Request review
# - Wait for approval + CI checks
# - Merge to dev
```

#### Merging dev → main (Release)
```bash
# After multiple features complete:
git checkout dev
git pull origin dev

# Create release PR
git checkout -b release/2026-02-20
git push -u origin release/2026-02-20

# On GitHub:
# - Create PR: release/2026-02-20 → main
# - Tag version (v0.3.0)
# - Merge
# - Hostinger auto-deploys
```

#### Lovable Workflow
Lovable must create branch:
```
lovable/[feature-name]
```

Then create PR → dev for review before merging.

### Rules (CRITICAL)
1. ✅ DO commit to feature/* and lovable/* branches
2. ❌ DO NOT commit directly to main or dev
3. ✅ DO create PRs for all feature work
4. ❌ DO NOT force-push to main, dev, or protected branches
5. ✅ DO include "Co-Authored-By" footer in commits
6. ✅ DO run tests/lint locally before pushing
```

#### Passo 4: Update README (5 min)

Add to README.md:

```markdown
## Development Workflow

See CLAUDE.md for Git branching strategy and workflow.

### Quick Start
```bash
git checkout dev
git pull
git checkout -b feature/my-feature
# ... make changes ...
git commit -m "feat: description

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"
git push
# Create PR on GitHub
```

### CI/CD
- GitHub branch protection requires PR reviews
- Hostinger auto-deploys main on push
```

#### Passo 5: Initial Commit (10 min)

```bash
git add CLAUDE.md README.md
git commit -m "chore: add git branching strategy and workflow

Define development workflow:
- main (production, protected)
- dev (staging)
- feature/* branches from dev
- lovable/* branches (never in main)

Co-Authored-By: Claude Haiku 4.5 <noreply@anthropic.com>"

git push origin dev
```

---

## AFTER COMPLETING ALL 5 TASKS

### Checklist
- [ ] Storage RLS policies restored (test: 403 on other workspace files)
- [ ] .env removed from git (git status clean)
- [ ] RLS added to 6 legacy tables (validate pg_policies)
- [ ] 4 critical indexes created (validate pg_indexes)
- [ ] dev branch created (git branch -a shows dev)
- [ ] Branch protection configured (GitHub settings)
- [ ] CLAUDE.md updated with branching strategy
- [ ] README.md updated with dev instructions

### Verification

```bash
# 1. Verify no security issues remain
git status  # Should be clean
supabase db push  # No migration errors

# 2. Verify indexes work
# In Supabase dashboard → SQL:
EXPLAIN ANALYZE
SELECT so.id, so.nome, SUM(otd.visits)
FROM spied_offers so
LEFT JOIN offer_traffic_data otd ON so.id = otd.spied_offer_id
WHERE so.workspace_id = '[test-workspace-id]'
GROUP BY so.id;

# Should show: "Seq Scan on offer_traffic_data" → "Index Scan on idx_offer_traffic_composite"

# 3. Test branch protection
git push origin main  # Should be blocked locally (or by GitHub if you try)
```

### Next
After Sprint 0 ✅, start **Sprint 1** (20h of visual fixes):
1. BD-1.1: Remove emojis (2h)
2. BD-1.2: Fix table sizing (4h)
3. BD-1.3: Sidebar + Dashboard + Charts (6h)
4. BD-1.4: Popups + Tooltips (8h)

---

## HELP / QUESTIONS

- **DB questions:** See `docs/brownfield/DB-AUDIT.md`
- **What to fix first:** This document (BD-0.1 → BD-0.2 → BD-0.3)
- **Tracking progress:** Update `docs/sessions/2026-02-20/PROGRESS.md` daily
- **Blockers:** Document in `docs/sessions/2026-02-20/PROGRESS.md` → BLOCKERS section

---

## ESTIMATED TIME

- Task 1 (Storage RLS): 1h 30min ✓
- Task 2 (.env): 5 min ✓
- Task 3 (Legacy RLS): 1h ✓
- Task 4 (Indexes): 30 min ✓
- Task 5 (Branching): 1h ✓

**Total: ~5 hours** (can be done in 1 day)

**Start:** 2026-02-20
**Target:** 2026-02-21 EOD

---

**Go get 'em! 🚀**

— Aria
