---
name: optimize
description: Check and improve code quality, linting, formatting, best practices, and suggest file splitting when needed. Use when the user wants cleaner code, fewer linting errors, better patterns, or architectural improvements.
user-invocable: true
argument-hint: "[target (file, folder, feature...)]"
---

Improve code quality through linting, formatting, pattern analysis, best practice enforcement, and architectural improvements.

## MANDATORY PREPARATION

**STEP 0 — Read CLAUDE.md** to understand project conventions, tech stack, and existing linting/formatter config.

---

## STEP 1 — Code Quality Analysis

**Read the target code thoroughly**—understand what it does, how it's structured, what patterns it uses, and which conventions it follows or breaks.

**Identify issues across dimensions**:

### Structure
- Long functions (doing too many things) and deep nesting
- Large files with too many exports (god objects)
- Feature envy (code interacting more with other classes than its own)

### Naming
- Poor/unclear names, inconsistent conventions (camelCase vs snake_case)
- Abbreviations (`usr`, `cfg`), magic names only understandable in context
- Functions named for one thing that do multiple things

### Complexity
- Long switch statements, complex conditionals (chained || and &&)
- Dead code (unused functions, variables, imports)
- Commented code that should be deleted

### Patterns
- Inconsistent patterns (same thing done different ways)
- Anti-patterns for the language/framework
- Over/under-engineering (unnecessary abstraction or missing abstraction)

---

## STEP 2 — Performance Optimization

**Measure before and after. Optimize what actually matters.**

### Loading Performance
- Modern image formats (WebP, AVIF), proper sizing, lazy loading, `srcset`
- Code splitting (route/component-based), tree shaking, remove unused deps
- Fonts: `font-display: swap`, subset, preload critical

### Rendering Performance
- **Avoid layout thrashing**: batch reads, then batch writes
- Minimize DOM depth, use `content-visibility: auto` for long lists
- Use `transform`/`opacity` for animations (GPU-accelerated), not layout properties

### Core Web Vitals
- **LCP < 2.5s**: Optimize hero images, inline critical CSS, use CDN
- **FID/INP < 200ms**: Break up long tasks, defer non-critical JS
- **CLS < 0.1**: Set dimensions on images/videos, reserve space with `aspect-ratio`

**Tools**: Chrome DevTools (Lighthouse), WebPageTest, bundle analyzers

---

## STEP 3 — Linting & Formatting

**Run linter** (`pnpm lint` / `npm run lint`) and **formatter** (`pnpm format`)

**Categorize and fix issues**:
1. Errors first (syntax, type, missing imports—block the build)
2. Warnings that could cause bugs
3. Complexity warnings
4. Info/style suggestions

For each fix: understand why the rule exists, apply correct pattern, verify no new issues.

---

## STEP 4 — Best Practices

### Language Patterns
- **JS/TS**: `const` by default, arrow functions for callbacks, template literals, destructuring, async/await, no `any`, strict equality
- **React**: Pure components, immutable state, proper effect cleanup, memoization, composition over prop drilling
- **Python**: PEP 8, list comprehensions, type hints, context managers

### Code Organization
- **SRP**: Each function/module does one thing
- **DRY**: Extract repeated logic, centralize config
- **YAGNI**: Don't add functionality speculatively

---

## STEP 5 — File Splitting

**Split when**: File has multiple distinct sections, exports many unrelated things, is a god object, or changes for multiple reasons.

**Keep together when**: Code is truly related, splitting would create excessive indirection.

**How**: Identify logical boundaries → extract utilities/types first → create focused files → re-export from barrel if needed → update imports.

---

## STEP 6 — Pattern Consistency

Scan for inconsistencies in import organization, component structure, error handling, async patterns, state management.

**If conventions exist**: Ensure all code follows them.
**If not**: Document current patterns, propose improvements to user, get alignment before sweeping changes.

---

## STEP 7 — Generate Report

| Dimension | Status | Issues |
|-----------|--------|--------|
| Structure | Good / Needs Work | [summary] |
| Naming | Good / Needs Work | [summary] |
| Complexity | Good / Needs Work | [summary] |
| Linting | Pass / Warnings / Errors | [count] |
| Formatting | Pass / Issues | [count] |

**Prioritize**: High (lint errors, type errors) → Medium (split files, extract utilities) → Low (JSDoc, minor improvements)

---

## NEVER
- Fix lint without understanding why the rule exists
- Split files just because they're long (ensure logical reason)
- Change naming conventions without checking project style
- Refactor code you don't fully understand
- Remove "unused" code without verifying it's truly dead
- Introduce patterns conflicting with project conventions
- Make sweeping changes without running tests
- Prioritize style over functionality
