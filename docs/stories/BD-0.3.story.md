# Story BD-0.3: Setup Branching Strategy
**Epic:** EPIC-BD (Brownfield Debt)
**Sprint:** 0 - Security Foundation
**Status:** InProgress
**Estimate:** 2h
**Priority:** BLOQUEANTE

---

## Descricao
Lovable e Claude Code commitam no mesmo branch (main), causando conflitos e regressoes. Precisa de branching strategy para isolar changes.

## Acceptance Criteria

### AC-1: Branch de Desenvolvimento
- [ ] Given: developer quer fazer changes
- [ ] When: inicia trabalho
- [ ] Then: trabalha em branch `dev` ou feature branch
- [ ] And: main recebe apenas merges testados

### AC-2: Lovable Isolado
- [ ] Given: Lovable precisa commitar
- [ ] When: faz changes
- [ ] Then: commita em branch `lovable/feature-name`
- [ ] And: NAO commita direto em main

### AC-3: Documentacao
- [ ] Given: novo workflow de branching
- [ ] When: developer consulta
- [ ] Then: README ou CONTRIBUTING.md explica o processo

## Tasks
- [ ] 1. Criar branch `dev` a partir de main
- [ ] 2. Configurar Lovable para usar branch separada (se possivel)
- [x] 3. Atualizar CLAUDE.md com instrucoes de branching
- [x] 4. Documentar workflow: feature branch → dev → main

## Scope
**IN:** Branching strategy, documentacao
**OUT:** CI/CD pipeline, automated testing (Sprint 2+)

## File List
- [x] CLAUDE.md (MODIFIED - added Git Branching Strategy section)

## Dev Agent Record

### Debug Log
- Tasks 3-4 implementadas (CLAUDE.md atualizado com branching strategy completa)
- Tasks 1-2 requerem operacoes git (criar branch dev, configurar Lovable)
- Criacao de branch `dev` e push sao operacoes de @devops

### Completion Notes
- Branching strategy documentada em CLAUDE.md
- Tasks 1-2 pendentes: criacao do branch dev e configuracao do Lovable requerem acoes de git push (@devops)

### Agent Model Used
claude-opus-4-6

## Change Log
- 2026-02-19: Story criada (Brownfield Discovery Phase 10)
- 2026-02-20: @dev - CLAUDE.md atualizado com branching strategy
