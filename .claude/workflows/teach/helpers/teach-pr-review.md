---
name: teach-pr-review
description: Create a reusable AI PR review workflow customized to the project stack, conventions, and actual changed files.
---

Generate a stack-aware PR review workflow that helps AI review **git diffs intelligently instead of mechanically**.

The workflow must prioritize:
- correctness
- regressions
- security
- performance
- stack-specific best practices
- only checks relevant to changed files

---

## PHASE 1 — Detect Project Context

Before asking the user, inspect available project context.

### Check Existing Context
Read if present:
- `CLAUDE.md`
- nested `CLAUDE.md`
- `README.md`
- `.github/pull_request_template.md`
- CI workflows
- lint/test configs

Extract:
- stack
- architecture rules
- protected areas
- conventions
- commands

### Detect Stack
Inspect:
- `package.json`
- `pyproject.toml`
- `Cargo.toml`
- `go.mod`
- ORM configs
- test configs

Capture:
- framework
- language
- package manager
- database/ORM
- testing stack
- infra/deployment hints

---

## PHASE 2 — Ask Only Missing Human Context

### 1) Review Priorities
“What kinds of issues matter most in PRs here?”
Examples:
- regressions
- performance
- accessibility
- DB safety
- security
- backward compatibility

### 2) Historic Failure Modes
“What bugs or mistakes keep recurring in past PRs?”

Examples:
- forgotten loading states
- N+1 queries
- missing auth checks
- hydration mismatches
- skipped tests
- API response shape drift

### 3) Protected Areas
“Are there fragile modules or contracts PR reviews should treat as high risk?”

Examples:
- billing
- auth
- migrations
- public APIs
- generated SDKs

---

## PHASE 3 — Build Review Lenses

Create reusable review lenses.

### Universal Lenses
Always include:
- correctness
- edge cases
- regression risk
- security
- performance
- test coverage
- readability
- backward compatibility

### Stack Lenses (conditional)
Only activate when changed files touch relevant layers.

Examples:
- React/Next → hooks, hydration, server/client boundaries
- Express/Nest → middleware order, auth, response contracts
- Prisma → query efficiency, migration safety
- Tailwind → token consistency, responsive safety
- Testing → flaky selectors, missing assertions

---

## PHASE 4 — Generate Review Workflow

Create `.claude/workflows/pr-review.md`

```md
---
name: pr-review
description: Review changed files from git diff using stack-aware correctness, regression, and best-practice checks.
---
```

### Review Execution Rules
```md
## Workflow
1. Read `git diff`
2. Identify changed files and affected layers
3. Activate only relevant review lenses
4. Prioritize correctness and regressions first
5. Report only actionable findings
```

### Scope Rule
```md
IMPORTANT:
Not every check applies to every PR.
Only review concerns related to modified files and affected behavior.
Skip untouched layers.
```

---

## REQUIRED REVIEW CATEGORIES

### 1) Critical Correctness
- broken logic
- incorrect conditions
- async race conditions
- missing error states
- invalid assumptions
- state synchronization bugs

### 2) Regression Risk
- breaks existing routes
- changes response contracts
- component prop/API drift
- migration incompatibility
- old data shape assumptions
- backward compatibility risks

### 3) Security
- auth bypass
- missing validation
- injection risks
- secrets exposure
- unsafe redirects
- missing permission checks

### 4) Performance
- N+1 queries
- unnecessary rerenders
- bundle growth
- blocking synchronous work
- missing pagination
- heavy imports

### 5) Type / Contract Safety
- `any` leaks
- unsafe casts
- null issues
- broken DTO contracts
- invalid generics
- runtime type mismatch

### 6) Testing
- missing tests for changed behavior
- edge case coverage
- regression tests for bug fixes
- skipped tests
- flaky async assertions

### 7) Stack-Specific
Apply only if touched by changed files.

Examples:
- React hooks dependency correctness
- Next.js SSR boundaries
- Prisma transaction safety
- Playwright selector stability

---

## SEVERITY FORMAT
Every finding must be tagged:

- **Critical** — security, crashes, data corruption
- **High** — user-facing bug, regression, broken flow
- **Medium** — maintainability/perf issue
- **Low** — readability, cleanup, naming
- **Nit** — optional polish

---

## OUTPUT FORMAT
For each finding use:

- **Severity**
- **File**
- **Issue**
- **Why it matters**
- **Suggested fix**
- **Whether blocking or non-blocking**

---

## NEVER
- apply all checks blindly
- mention untouched layers
- nitpick style already covered by linting
- invent risks without evidence from diff
- over-focus on syntax while missing regressions