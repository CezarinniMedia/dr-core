# UX Design System — Guia de Execucao

## Estrutura

```
outputs/ux-design/dr-core/
├── PROMPTS-INDEX.md     ← VOCE ESTA AQUI
├── reports/             ← Analises e relatorios
├── wireframes/          ← 5 wireframes aprovados
├── prompts/             ← Prompts completos (referencia)
└── _archive/            ← Prompts antigos

run/                     ← Copias curtas para Ralph Loop (deletar ao final)
├── p5.md
├── p6.md
├── p6qa.md
├── p7.md
└── p8.md
```

## Progresso

- [x] Fase 0-4 concluidas
- [ ] Fase 5: Build 7 componentes
- [ ] Fase 6: a11y + QA gate
- [ ] Fase 7: Documentacao
- [ ] Fase 8: Handoff final

## Comandos Ralph Loop

### FASE 5
```
/ralph-loop:ralph-loop --max-iterations 12 --completion-promise 'DONE' Leia run/p5.md e execute
```

### FASE 6 — Terminal Uma
```
/ralph-loop:ralph-loop --max-iterations 6 --completion-promise 'DONE' Leia run/p6.md e execute
```

### FASE 6 — Terminal QA (sem Ralph)
```
Leia run/p6qa.md e execute o QA gate
```

### FASE 7
```
/ralph-loop:ralph-loop --max-iterations 5 --completion-promise 'DONE' Leia run/p7.md e execute
```

### FASE 8
```
/ralph-loop:ralph-loop --max-iterations 3 --completion-promise 'DONE' Leia run/p8.md e execute
```

## Ordem

1. Fase 5 → aguarde DONE
2. Fase 6 Uma + QA em paralelo → aguarde ambos
3. Fase 7 → aguarde DONE
4. Fase 8 → aguarde DONE
