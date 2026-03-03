# UX Design System — Prompt Index (Fases 4-8)

## Estrutura de Arquivos

```
outputs/ux-design/dr-core/
├── PROMPTS-INDEX.md          ← VOCE ESTA AQUI
├── phase4-prompt.md          ← Ralph Loop (autonomo)
├── phase5-prompts/           ← Interativo (aprova cada componente)
│   ├── 5.1-led-glow-border.md
│   ├── 5.2-ambient-glow.md
│   ├── 5.3-glassmorphism-card.md
│   ├── 5.4-status-badge.md
│   ├── 5.5-sparkline-badge.md
│   ├── 5.6-commit-atoms.md
│   ├── 5.7-data-metric-card.md
│   ├── 5.8-spike-alert-card.md
│   └── 5.9-commit-molecules.md
├── phase6-uma-a11y-prompt.md ← Terminal 1 (Uma)
├── phase6-qa-prompt.md       ← Terminal 2 (QA) — paralelo
├── phase6-commit-prompt.md   ← Commit a11y fixes (se houver)
├── phase7-prompt.md          ← Ralph Loop (autonomo)
├── phase7-commit-prompt.md   ← Commit docs (manual)
├── phase8-prompt.md          ← Ralph Loop (autonomo)
```

---

## FASE 4 — Tokenize + Bridge (Ralph Loop)

**Tipo:** Autonomo | **Terminal:** Uma | **Ralph:** Sim

```
/ralph-loop Voce e Uma (@ux-design-expert). Leia o prompt completo em outputs/ux-design/dr-core/phase4-prompt.md e execute TODAS as 6 tarefas (4.1 a 4.6) em sequencia. Leia os docs de referencia listados no prompt. Ao terminar diga Fase 4 concluida. --max-iterations 5 --completion-promise "Fase 4 concluida"
```

---

## FASE 5 — Build Components (Interativo, SEM Ralph)

**Tipo:** Interativo | **Terminal:** Uma | **Ralph:** Nao

Cole cada prompt UM POR VEZ, aguardando aprovacao entre eles.

### Atoms (5.1 a 5.5)

**5.1** — LEDGlowBorder:
```
Voce e Uma (@ux-design-expert). Leia o prompt completo em outputs/ux-design/dr-core/phase5-prompts/5.1-led-glow-border.md e execute. Leia os docs de referencia listados no prompt.
```

**5.2** — AmbientGlow:
```
Leia outputs/ux-design/dr-core/phase5-prompts/5.2-ambient-glow.md e execute.
```

**5.3** — GlassmorphismCard:
```
Leia outputs/ux-design/dr-core/phase5-prompts/5.3-glassmorphism-card.md e execute.
```

**5.4** — StatusBadge:
```
Leia outputs/ux-design/dr-core/phase5-prompts/5.4-status-badge.md e execute.
```

**5.5** — SparklineBadge:
```
Leia outputs/ux-design/dr-core/phase5-prompts/5.5-sparkline-badge.md e execute.
```

### Commit Atoms (5.6)

```
Leia outputs/ux-design/dr-core/phase5-prompts/5.6-commit-atoms.md e execute o commit.
```

### Molecules (5.7 a 5.8)

**5.7** — DataMetricCard:
```
Leia outputs/ux-design/dr-core/phase5-prompts/5.7-data-metric-card.md e execute.
```

**5.8** — SpikeAlertCard:
```
Leia outputs/ux-design/dr-core/phase5-prompts/5.8-spike-alert-card.md e execute.
```

### Commit Molecules (5.9)

```
Leia outputs/ux-design/dr-core/phase5-prompts/5.9-commit-molecules.md e execute o commit.
```

---

## FASE 6 — Validacao (2 Terminais em Paralelo, SEM Ralph)

**Tipo:** Paralelo | **Ralph:** Nao

### Terminal 1 (Uma — a11y):
```
Voce e Uma (@ux-design-expert). Leia o prompt completo em outputs/ux-design/dr-core/phase6-uma-a11y-prompt.md e execute.
```

### Terminal 2 (QA — abrir novo terminal):
```
Leia outputs/ux-design/dr-core/phase6-qa-prompt.md e execute o QA gate.
```

### Commit a11y fixes (Terminal Uma, se QA ou a11y encontraram issues):
```
Leia outputs/ux-design/dr-core/phase6-commit-prompt.md e execute o commit.
```

---

## FASE 7 — Documentacao (Ralph Loop)

**Tipo:** Autonomo | **Terminal:** Uma | **Ralph:** Sim

```
/ralph-loop Voce e Uma (@ux-design-expert). Leia o prompt completo em outputs/ux-design/dr-core/phase7-prompt.md e execute TODAS as tarefas. Crie DESIGN-SYSTEM.md e atualize changelog.md. Ao terminar diga Fase 7 concluida. --max-iterations 3 --completion-promise "Fase 7 concluida"
```

### Commit docs (manual, apos ralph terminar):
```
Leia outputs/ux-design/dr-core/phase7-commit-prompt.md e execute o commit.
```

---

## FASE 8 — Handoff + Commit Final (Ralph Loop)

**Tipo:** Autonomo | **Terminal:** Uma | **Ralph:** Sim

```
/ralph-loop Voce e Uma (@ux-design-expert). Leia o prompt completo em outputs/ux-design/dr-core/phase8-prompt.md e execute. Crie o handoff e faca o commit final. Ao terminar diga Fase 8 concluida. --max-iterations 3 --completion-promise "Fase 8 concluida"
```

---

## CHECKLIST FINAL

- [ ] Fase 4: tokens.yaml + bridge + opacity + fonts + tailwind (COMMIT 1)
- [ ] Fase 5: 5 atoms aprovados (COMMIT 2)
- [ ] Fase 5: 2 molecules aprovadas (COMMIT 3)
- [ ] Fase 6: a11y + QA PASS (COMMIT 4 se fixes)
- [ ] Fase 7: DESIGN-SYSTEM.md + changelog (COMMIT 5)
- [ ] Fase 8: Handoff + outputs (COMMIT 6)
- [ ] Typecheck limpo (npx tsc --noEmit)
- [ ] Tests passando (npx vitest run)
- [ ] Build OK (npm run build)
