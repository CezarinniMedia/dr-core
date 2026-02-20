# Story BD-0.1: Fix Storage RLS + .env Security
**Epic:** EPIC-BD (Brownfield Debt)
**Sprint:** 0 - Security Foundation
**Status:** Done
**Estimate:** 2h
**Priority:** BLOQUEANTE

---

## Descricao
O sistema tem 3 vulnerabilidades criticas de seguranca que precisam ser resolvidas IMEDIATAMENTE:
1. Storage RLS policies substituidas por policies genericas na migration 20260209004023
2. Arquivo .env aparece como modified no git (credenciais possivelmente expostas)
3. 6 tabelas legacy sem RLS policies (arsenal_*, import_batches, comparacao_batches, trafego_historico)

## Acceptance Criteria

### AC-1: Storage RLS Restaurado
- [ ] Given: buckets spy-assets, creatives, documents
- [ ] When: um usuario autenticado tenta acessar arquivo de outro workspace
- [ ] Then: acesso NEGADO (policy verifica workspace_id via folder path)

### AC-2: .env Protegido
- [ ] Given: .env existe no diretorio
- [ ] When: git status
- [ ] Then: .env NAO aparece como tracked/modified
- [ ] And: .env esta no .gitignore
- [ ] And: .env.example existe com placeholder values

### AC-3: RLS em Tabelas Legacy
- [ ] Given: tabelas arsenal_dorks, arsenal_footprints, arsenal_keywords, comparacao_batches, import_batches, trafego_historico
- [ ] When: query sem workspace_id filter
- [ ] Then: RLS policy restringe a registros do workspace do usuario

### AC-4: Upload Funcional (BUG-001)
- [ ] Given: usuario autenticado no workspace
- [ ] When: faz upload de imagem via drag-and-drop
- [ ] Then: upload completa sem erro de RLS
- [ ] And: arquivo fica acessivel na UI

## Tasks
- [ ] 1. Criar migration SQL para restaurar Storage RLS com workspace isolation
- [ ] 2. Adicionar .env ao .gitignore, git rm --cached .env
- [ ] 3. Criar .env.example com todas as variaveis necessarias (sem valores reais)
- [ ] 4. Criar RLS policies para 6 tabelas legacy
- [ ] 5. Testar upload de arquivo em spy-assets e creatives
- [ ] 6. Verificar que usuario A nao acessa arquivos do workspace B

## Scope
**IN:** RLS fix, .env protection, upload fix
**OUT:** Refactor de storage logic, novas features

## File List
- [ ] supabase/migrations/YYYYMMDD_fix_storage_rls.sql
- [ ] .gitignore
- [ ] .env.example

## Risks
- Migration pode quebrar acesso existente se folders nao seguem convention workspace_id/
- Backup de .env antes de remover do git

## Change Log
- 2026-02-19: Story criada (Brownfield Discovery Phase 10)
