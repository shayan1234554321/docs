---
name: adapt-file
description: Adapt a file to match project layout, naming conventions, folder structure, and patterns defined in CLAUDE.md. Use when the user wants to reorganize code, rename files, move code between locations, or align with project standards.
---

Adapt an existing file or code pattern to match your project's established layout, naming conventions, folder structure, and architectural patterns.

## MANDATORY PREPARATION

**STEP 0 — Read CLAUDE.md first**
Read the project's CLAUDE.md (root and nested) to understand:
- Target folder structure and organization
- Naming conventions (file names, function names, component names, CSS class names)
- Architectural patterns (where logic should live, how layers connect)
- Import/export conventions
- Any project-specific rules

If CLAUDE.md doesn't exist or is incomplete, STOP and run `/teach-context` first.

If CLAUDE.md exists but you're unsure about specific conventions, invoke `/teach-context` workflow to clarify before proceeding. Don't guess at naming or structural patterns.

---

## STEP 1 — Analyze Source and Target

### Analyze the Source File
Understand what you're adapting:
- **File type**: Component, utility, hook, service, style, test, config, type?
- **Current location**: Why is it where it is? Is it wrong or right?
- **Current naming**: Does it follow conventions or deviate?
- **Dependencies**: What does it import? What imports it?
- **Content scope**: Single responsibility or does it do multiple things?
- **Code ownership**: Is it shared across features or isolated?

**CRITICAL**: Before moving any code, identify all consumers — files that import it, external references, API contracts, database schemas, or documentation. Moving code with external consumers without coordination causes broken builds.

### Analyze the Target Convention
From CLAUDE.md and existing patterns:
- **Expected location**: Where should this type of file live?
- **Expected naming**: What naming pattern is used for this type?
- **Expected structure**: How should code be organized inside?
- **Export pattern**: Default export? Named exports? Barrel files?

### Determine Adaptation Scope
Choose the right scope — don't over-engineer:
- **Rename only**: File name doesn't match convention, location is correct
- **Move only**: Right name, wrong location
- **Move + rename**: Wrong name and wrong location
- **Refactor**: Needs structural changes beyond naming/location
- **Split**: Too much in one file, needs separation into layers (hooks, utils, types, styles)

**CRITICAL**: Don't move code that has external references (imports in other projects, API contracts, database schemas) without understanding the full impact.

---

## STEP 2 — Plan the Adaptation

Create a clear adaptation plan before touching anything:

### Dependency Impact Assessment
For each file you plan to move/rename:
1. Find all files that import this file (`grep -r "from.*fileName"` or equivalent)
2. Find all files this file imports (ensure paths still work after move)
3. Check configuration files (webpack, tsconfig, jest, etc.)
4. Check for external references (documentation, other repos, API specs)
5. Consider git history implications (`git mv` preserves history)

### Adaptation Scope Planning
```
Simple Rename:
  Current:  userProfileCard.tsx
  Target:   UserProfileCard.tsx
  Pattern:  PascalCase for components

Simple Move:
  Current:  /utils/helpers/formatDate.js
  Target:   /lib/dates/format.ts
  Pattern:  /lib/{domain}/ for utilities

Move + Rename:
  Current:  /components/cmp_usr_dp.jsx
  Target:   /components/UserDropdown.tsx
  Pattern:  PascalCase components, /components/ for UI components

Structural Refactoring:
  Current:  UserProfile.tsx (state + API calls + rendering + styles)
  Target:   /features/users/components/UserProfile.tsx
            /features/users/hooks/useUserProfile.ts
            /features/users/api/getUser.ts
            /features/users/styles/UserProfile.module.css
  Pattern:  Feature-based structure with hooks/api/styles separated

Large Feature Reorganization:
  1. Create new feature directory structure
  2. Move and refactor files one logical group at a time
  3. Update imports incrementally
  4. Update CLAUDE.md if structure changes significantly
  5. Verify after each logical group
```

**IMPORTANT**: Match the scope to the actual need. A simple rename shouldn't become a refactor. But when refactoring is needed, do it thoroughly — half-measures create technical debt.

---

## STEP 3 — Execute the Adaptation

### Option A: Simple Rename
1. Use `git mv` to rename the file (preserves git history)
2. Update all imports referencing the file throughout the project
3. Update any configuration referencing the file
4. Verify no broken references

### Option B: Simple Move
1. Use `git mv` to move the file (preserves git history)
2. Update imports in all files that import this one
3. Update relative imports inside the moved file
4. Update configuration if needed

### Option C: Move + Rename
1. Use `git mv old_path new_location/new_name`
2. Update all imports throughout the project
3. Update relative imports inside
4. Verify everything compiles

### Option D: Structural Refactoring
1. Create new directory structure
2. Extract code into appropriate new files (hooks, utils, types, styles)
3. Create barrel export files if project uses them
4. Update imports in all consuming files
5. Remove old file
6. Verify compilation and tests

### Option E: Full Feature Reorganization
1. Create new feature directory structure
2. Move and refactor files one logical group at a time
3. Update imports incrementally (don't break everything at once)
4. Update CLAUDE.md if directory structure changes significantly
5. Verify after each logical group

**CRITICAL**: Always use `git mv` — it preserves file history. Using regular `mv` loses git blame and history for the file.

---

## STEP 4 — Update References

### Import Updates
For each file that imported the adapted file:
- Update the import path to new location
- Update import naming if renamed
- Verify import still works

### Configuration Updates
Check and update:
- `tsconfig.json` / `jsconfig.json` (path aliases)
- `jest.config.js` (module name mappings)
- `webpack.config.js` (aliases)
- `vite.config.ts` (aliases)
- `.eslintrc` (rules about file naming)
- Any other build/runtime configuration

### Documentation Updates
- Update README if it references old paths
- Update inline documentation
- Update any external documentation
- Update API documentation if public API changed

---

## STEP 5 — Verify

After adaptation, verify thoroughly:

1. **Run linter**: `pnpm lint` or equivalent
2. **Run type checker**: `pnpm typecheck` or `tsc --noEmit`
3. **Run tests**: `pnpm test` to ensure nothing broke
4. **Search for old name**: Grep for old file name to catch any missed references
5. **Search for old path**: Grep for old path patterns
6. **Verify consumers**: Open files that consumed the old file, confirm they import correctly
7. **Manual verification**: Open the file and ensure it looks correct in its new home

---

## Conventions Reference

Use patterns from CLAUDE.md:

### Common Naming Conventions
- **Components**: PascalCase (`UserCard.tsx`)
- **Utilities/Hooks**: camelCase (`useAuth.ts`, `formatDate.ts`)
- **Constants**: SCREAMING_SNAKE_CASE (`MAX_RETRIES.ts`)
- **Types/Interfaces**: PascalCase with prefix (`UserType`, `ApiResponse`)
- **CSS Modules**: Match component name (`.button.module.css`)

### Common Folder Structures
- **By type**: `/components`, `/utils`, `/hooks`, `/services`
- **By feature**: `/features/{feature}/components`, `/features/{feature}/hooks`
- **By domain**: `/lib/users`, `/lib/billing`, `/lib/analytics`
- **Monorepo**: `/apps/{app}/`, `/packages/{pkg}/`

### Import Patterns
- Absolute imports via aliases (`@/components/...`)
- Relative imports for sibling/colocated files
- Barrel exports (`index.ts`) for public module APIs

---

## NEVER
- Move files without first identifying all consumers and dependencies
- Use `mv` instead of `git mv` (loses git history and blame)
- Break public API contracts without coordinating with consumers first
- Move files that are part of a published package's API
- Forget to update path aliases in configuration
- Rename files that are referenced in database schemas or migration files without updating those references
- Move configuration files without understanding full impact on the build system
- Skip updating CLAUDE.md if the project structure changed
- Perform a full refactor when a simple rename would suffice (don't over-engineer)
- Leave broken imports in place (even temporarily) during adaptation
- Adapt without a clear plan — random file shuffling creates technical debt

Remember: You're maintaining project consistency. Every adaptation should feel like the file was always in its new location — no orphans, no broken imports, no surprises. The goal is a clean, discoverable structure where every file has a clear home.

---

## Clean Up

After adaptation, ensure code quality:

- **Consolidate orphaned references**: Search for any imports or references that still point to old paths — don't leave dangling pointers
- **Remove dead imports**: After moving/renaming, check if the moved file accumulated unnecessary imports
- **Verify barrel exports**: If your project uses barrel exports (`index.ts`), ensure the moved file is properly exported
- **Check for duplication**: Look for files that may now overlap in responsibility after the move
- **Ensure DRYness**: Refactoring may have introduced duplicated logic — consolidate if so
- **Update CLAUDE.md**: If the adaptation changed project structure, update CLAUDE.md to reflect the new conventions
- **Run final verification**: Lint, type-check, and test to ensure nothing regressed
