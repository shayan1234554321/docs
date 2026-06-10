---
name: teach-context
description: Generate a concise, high-signal CLAUDE.md file that gives AI coding agents persistent project context, architecture rules, commands, and non-obvious conventions.
---

Create a `CLAUDE.md` file that captures only the **non-obvious, project-specific knowledge** an AI needs to work effectively.

## Core Goal
The file should help AI:
- understand project purpose
- follow architecture boundaries
- use the correct commands
- avoid known mistakes
- respect module conventions

Keep the **root CLAUDE.md under 120 lines**.
For large repos, recommend **nested CLAUDE.md files** inside subprojects.

---

## STEP 1 — Auto Detect First
Before asking the user anything, inspect the repo.

### Detect Tech Stack
Read:
- `package.json`
- `pyproject.toml`
- `Cargo.toml`
- `go.mod`
- lockfiles

Capture:
- framework
- package manager
- UI library
- ORM / DB
- state management
- testing stack

### Detect Project Shape
Scan:
- top-level folders
- monorepo apps/packages
- frontend/backend separation
- infra folders
- test directories
- docs

### Detect Commands
Extract common scripts:
- dev
- build
- lint
- test
- typecheck
- db migration

---

## STEP 2 — Ask 3 Smart Questions
Only ask what cannot be inferred.

### 1) Purpose
“What does this project do in 1–2 sentences?”

### 2) Critical Concepts
“What are 2–3 non-obvious things someone must understand before editing this codebase?”

### 3) Common Mistakes
“What should the AI avoid doing in this project?”

Examples:
- bypassing service layer
- direct DB access
- editing generated files
- breaking public API contracts
- skipping optimistic updates

---

## STEP 3 — Generate CLAUDE.md

Example CLAUDE.md but should be according to the user's context:

### Header
```md
# Project Context
One-line purpose
```

### Stack
```md
## Stack 
- **Next.js 15** (App Router) + React 19 + Tailwind CSS 4 
- **UI**: HeroUI (@heroui/react), Phosphor Icons, Framer Motion 
- **Forms**: Yup validation schemas in services/validations/ 
- **HTTP**: Axios for API calls
```

### Commands
```md
## Commands
- `pnpm dev` — local development
- `pnpm build` — production build
- `pnpm lint` — lint checks
- `pnpm test` — run tests
```

### Key Directories
Only include high-signal folders.
Describe **responsibility**, not file names.

```md
## Key Directories
- `src/services/` — API access by domain
- `src/store/` — global app state
- `src/features/chatbot/` — chatbot workflows
```

### Architecture Rules
```md
## Architecture Rules
- API access must go through `src/services/`
- UI components must not fetch directly
- State mutations happen only in stores/actions
```

### Key Concepts
Use user-provided project intelligence.

### Gotchas
Only include real mistakes the team wants avoided.

### Nested Context (if large repo)
```md
## Nested Context
Use additional CLAUDE.md files if needed in:
- `apps/web/`
- `apps/api/`
- `packages/ui/`
```

---

## NEVER
- document obvious framework defaults
- list every file
- duplicate README
- include generated files
- add generic best practices
- exceed 120 lines in root file
- invent rules not confirmed by repo or user