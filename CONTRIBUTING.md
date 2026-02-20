# Contributing to DR OPS

## Branching Strategy

This project uses a structured branching strategy to prevent conflicts between multiple development tools (Lovable, Claude Code, GitHub Actions) and maintain code quality on the main branch.

### Branch Hierarchy

```
main                          (production, always stable)
  ├── dev                     (development baseline)
  │   ├── feature/            (feature development)
  │   ├── bugfix/             (bug fixes)
  │   ├── refactor/           (refactoring)
  │   └── docs/               (documentation)
  │
  └── lovable/*               (Lovable.dev exclusive)
      └── lovable/feature-*   (isolated Lovable work)
```

### Workflow Rules

#### 1. Local Development (Claude Code, Manual Changes)

**Starting new work:**
```bash
# Always pull latest dev
git checkout dev
git pull origin dev

# Create feature branch from dev
git checkout -b feature/BD-1.1-remove-emojis
# or
git checkout -b bugfix/BUG-003-fix-sidebar
```

**Naming convention:**
- Feature: `feature/[STORY-ID]-[short-description]`
- Bugfix: `bugfix/[BUG-ID]-[short-description]`
- Refactor: `refactor/[scope]-[description]`
- Docs: `docs/[what]`

**Examples:**
- `feature/BD-1.1-remove-emojis`
- `bugfix/BUG-004-sidebar-layout-gap`
- `refactor/decompose-spyradar`
- `docs/contributing-guide`

**Committing:**
```bash
# Make changes, test locally
git add [specific files - avoid git add .]
git commit -m "feat: remove iOS emojis, use Lucide icons [BD-1.1]"

# Push to feature branch
git push origin feature/BD-1.1-remove-emojis
```

**Creating PR:**
```bash
# Create PR from feature branch → dev (NOT main)
gh pr create --base dev --title "Remove iOS emojis, use Lucide icons" \
  --body "Resolves BD-1.1. Replaces all emoji in headers/tabs with Lucide React icons."
```

**Merging:**
1. Wait for code review
2. Ensure all tests pass
3. Squash merge into dev: `git merge --squash feature/BD-1.1-remove-emojis`
4. Delete feature branch: `git branch -D feature/BD-1.1-remove-emojis`

#### 2. Lovable.dev Workflow (ISOLATED)

**Lovable MUST NOT commit to main or dev.**

**Process:**
1. Configure Lovable to work on a dedicated branch: `lovable/[date-feature]`
   - Example: `lovable/2026-02-20-add-tooltips`
2. Lovable makes changes ONLY on this branch
3. When complete, create PR: `lovable/[branch]` → `dev`
4. Review changes carefully (Lovable may introduce regressions)
5. Squash merge into dev
6. Delete Lovable branch

**Lovable Configuration** (if supported):
- Set default branch to `lovable/current-work` instead of `main`
- Never allow direct commits to `main` or `dev`

#### 3. Main Branch (Production)

**Main ONLY receives merges from dev.**

**Schedule:**
- Merge `dev` → `main` after sprint completion
- Tag release: `git tag -a v0.1.0 -m "Sprint 0 release"`
- Triggers auto-deploy to Hostinger

**Process:**
```bash
git checkout main
git pull origin main
git merge --no-ff dev -m "Merge Sprint 0: Security foundation [EPIC-BD-S0]"
git tag -a v0.1.0 -m "Sprint 0 release: Security + Performance"
git push origin main --tags
```

### Protection Rules for Main

✅ **Enforced on `main` branch:**
- Require 1 pull request review (before merge)
- Require status checks to pass (tests, lint, type-check)
- Require branches to be up to date before merging
- Dismiss stale PR approvals when new commits are pushed
- Require code review from @architect before security changes

✅ **Enforced on `dev` branch:**
- Require status checks to pass

### Conflict Resolution

If you encounter conflicts:

```bash
# Update your feature branch with latest dev
git fetch origin
git rebase origin/dev

# Fix conflicts in editor
# Then:
git add [conflicted files]
git rebase --continue

# Force push to your feature branch (safe because it's your own)
git push origin feature/[name] --force-with-lease
```

**Never merge main into dev or feature branches.** Always rebase from dev.

### Tools Coordination

| Tool | Branch | Frequency | Review |
|------|--------|-----------|--------|
| Claude Code (CLI) | feature/* | Ad-hoc | Required |
| Lovable.dev | lovable/* | As needed | Required |
| GitHub Actions | N/A | Per push | Automatic |

### Sprint Workflow

**Start of Sprint:**
```bash
git checkout dev
git pull origin dev
git checkout -b feature/sprint-X-consolidation

# Create one feature branch per major story group
```

**During Sprint:**
- Multiple feature branches work in parallel
- Each PR merges into dev
- Keep dev stable for other developers

**End of Sprint:**
```bash
git checkout main
git pull origin main
git merge --no-ff dev -m "Merge Sprint X: [summary] [EPIC-BD-SX]"
git tag v0.X.0
git push origin main --tags
```

### Checklist Before Merging

- [ ] Feature branch is up-to-date with dev (`git rebase origin/dev`)
- [ ] All tests pass: `npm run test`
- [ ] Lint passes: `npm run lint`
- [ ] Type check passes: `npm run typecheck`
- [ ] Commit message references story ID (e.g., `[BD-1.1]`)
- [ ] No console.log, console.error, or debug code left
- [ ] No .env or credentials committed
- [ ] PR description explains the change

### Emergency Hotfixes

**If critical bug found in production (main):**

```bash
# Create hotfix branch from main
git checkout -b hotfix/critical-security-issue main

# Make and commit fix
git commit -m "fix: critical security issue [HOTFIX]"

# Merge to both main and dev
git push origin hotfix/critical-security-issue
# Create PR: hotfix/* → main
# After merge to main, also merge to dev
```

### Questions?

See story acceptance criteria for detailed requirements, or ask @architect for architecture decisions.

---

**Last Updated:** 2026-02-20
**Version:** 1.0 (Sprint 0 Foundation)
