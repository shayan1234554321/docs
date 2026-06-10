---
name: change-layout
description: Change how work is organized in the project—file structure, folder organization, module boundaries, or anything that affects CLAUDE.md. Use when the user wants to reorganize code, restructure folders, redefine boundaries, or update how work is divided.
user-invocable: true
argument-hint: "[current structure] [desired structure]"
---

Reorganize how work is organized in a project—file structure, folder organization, module boundaries, or architectural layers. This workflow affects CLAUDE.md since it changes the project layout conventions.

## MANDATORY PREPARATION

**STEP 0 — Read CLAUDE.md First**
Read the current CLAUDE.md to understand:
- Existing folder structure and organization
- Current architectural patterns
- Naming conventions in use
- Key directories and their responsibilities
- Any rules about where things should live

**STEP 1 — Understand the Current State**
Before changing anything, deeply understand what exists:
- Map out the current file/folder structure
- Identify all import/export relationships
- Understand what each directory is responsible for
- Identify the boundaries between modules/features
- Note any conventions (naming, organization) already in use

---

## STEP 2 — Plan the Reorganization

### Define the New Structure

**Option A: Flat to Nested**
```
Current:                       Target:
/src                          /src
  /components                   /src
  /utils                         /features
  /hooks                          /users
  /services                       /products
  /types                          /orders
  /api                            /shared
  /utils                            /components
  /hooks                            /hooks
  /types                            /utils
  /api                              /types
  ...                                /api
                                    /services
```

**Option B: Type-Based to Feature-Based**
```
Current:                       Target:
/src                          /src
  /components                   /features
  /hooks                        /users
  /services                      /components
  /types                         /hooks
  ...                            /api
                                  /products
                                    /components
                                    /hooks
                                    /api
                                  /orders
                                    ...
                                  /shared
                                    /components
                                    /hooks
                                    /utils
```

**Option C: Layer-Based to Hybrid**
```
Current:                       Target:
/src                          /src
  /ui (all components)          /apps
  /business-logic                /web
  /data-access                   /api
  /utils                       /packages
                                  /ui
                                  /auth
                                  /database
```

**Option D: Monorepo Restructuring**
```
Current:                       Target:
/project                        /monorepo
  /frontend                       /apps
  /backend                          /web
  /shared                            /api
                                    /packages
                                      /shared
                                      /ui
                                      /utils
```

### Migration Complexity Assessment

**Low Complexity** (< 10 files, no cross-imports):
- Rename folders
- Update imports in affected files
- Update CLAUDE.md

**Medium Complexity** (10-50 files, some cross-imports):
- Create new structure
- Move files in logical groups
- Update imports incrementally
- Update configuration
- Update CLAUDE.md
- Test thoroughly

**High Complexity** (50+ files, complex dependencies):
- Phase the migration
- Create new structure in parallel
- Move code incrementally (feature by feature)
- Run tests after each phase
- Update documentation throughout
- Coordinate with team if multi-developer

### Dependency Analysis

**For each file you plan to move, check**:
1. What imports this file?
2. What does this file import?
3. Are imports relative or absolute?
4. Do path aliases need updating?
5. Will git history be preserved? (Use `git mv`)

---

## STEP 3 — Execute the Reorganization

### Phase 1: Preparation

1. **Create backup/reference**:
   - Ensure all code is committed
   - Note current state in CLAUDE.md

2. **Set up new structure**:
   - Create new directories
   - Don't delete old directories yet (keep as reference)

3. **Plan the move order**:
   - Move files that have no dependencies first
   - Move leaf-node files before files that depend on them
   - Save shared utilities for last

### Phase 2: Systematic Migration

**For each logical group of files**:

1. **Copy files to new location**:
   ```
   cp /old/location/file.ts /new/location/file.ts
   ```

2. **Update imports in the moved file**:
   - Fix relative imports
   - Fix absolute imports (aliases)

3. **Update imports in dependent files**:
   - Find all files importing this file
   - Update their import paths

4. **Run tests/linter/type-check**:
   - Verify nothing is broken
   - Fix any issues before proceeding

5. **Commit this group** (if large migration):
   ```
   git add -A
   git commit -m "refactor: move {feature} to new structure"
   ```

### Phase 3: Verification

After all files are moved:

1. **Search for old paths**:
   ```bash
   # Grep for any remaining references to old structure
   grep -r "old-folder-name" --include="*.ts" --include="*.tsx"
   ```

2. **Run full test suite**:
   ```bash
   pnpm test
   ```

3. **Run linter and type-check**:
   ```bash
   pnpm lint
   pnpm typecheck
   ```

4. **Verify build**:
   ```bash
   pnpm build
   ```

5. **Manual spot-check**:
   - Import key modules manually
   - Verify IDE can resolve all imports
   - Check that hot reload still works

### Phase 4: Cleanup

1. **Remove old directories**:
   ```bash
   git rm -r /old/location
   ```

2. **Update configuration files**:
   - `tsconfig.json` (path aliases)
   - `jest.config.js` (module paths)
   - `webpack.config.js` (aliases)
   - `.eslintrc` (rules)
   - `jest.setup.js` (paths)

3. **Update CI/CD**:
   - GitHub Actions / CI scripts
   - Deployment configurations
   - Docker files
   - Any build scripts

---

## STEP 4 — Update CLAUDE.md

After reorganization, update CLAUDE.md to reflect the new structure.

### Update Key Directories Section
```md
## Key Directories
- `src/features/` — Feature-based organization
  - `src/features/{feature}/components/` — Feature components
  - `src/features/{feature}/hooks/` — Feature hooks
  - `src/features/{feature}/api/` — Feature API calls
- `src/shared/` — Shared utilities and components
```

### Update Architecture Rules
```md
## Architecture Rules
- Feature files live in `src/features/{feature}/`
- Shared utilities live in `src/shared/`
- No cross-feature imports (features should not depend on each other)
- API access goes through `src/features/{feature}/api/`
```

### Update Commands if Needed
```md
## Commands
- `pnpm dev` — local development
- `pnpm build` — production build (new: outputs to `dist/`)
- `pnpm lint` — lint checks
- `pnpm test` — run tests
```

### Add Migration Notes
```md
## Recent Changes
- [date] Reorganized from type-based to feature-based structure
  - Old: `/src/components/`, `/src/hooks/`, `/src/services/`
  - New: `/src/features/{feature}/`
```

---

## STEP 5 — Coordinate with Team

For team projects:

1. **Communicate the change**:
   - Summary of what changed
   - Why it changed
   - How to update local environments

2. **Provide migration guide**:
   - Step-by-step instructions for teammates
   - Common issues and solutions
   - Who to contact for problems

3. **Set migration deadline**:
   - Give team time to update local branches
   - Set date when old structure will be removed
   - Coordinate with any open PRs

4. **Review open PRs**:
   - Update PRs to new structure before merging
   - Rebase or merge conflicts early

---

## Common Reorganization Patterns

### Type-Based to Feature-Based
**When**: Growing codebase with many types that change together

**Approach**: Group by feature (User, Product, Order) with shared subdirectories

### Flat to Nested
**When**: Root directory has too many files

**Approach**: Create logical groupings that reduce root file count

### Shared to Package-Based
**When**: Multiple apps/share code

**Approach**: Extract shared code to `packages/` or `libs/`

### Monorepo Conversion
**When**: Multiple related repos that should share code

**Approach**: Consolidate to single repo with app/package separation

---

## NEVER
- Reorganize without reading current CLAUDE.md first
- Move files without checking what imports them
- Skip updating configuration files (tsconfig, webpack, etc.)
- Forget to update CLAUDE.md after reorganization
- Delete old directories before verifying new structure works
- Reorganize without committing current state first
- Move files one at a time (batch logically related moves)
- Ignore team coordination (conflicting changes waste time)
- Leave broken imports (run linter/type-check after each group)

Remember: You're changing the project's foundation. Take it methodical, verify thoroughly, update documentation, and coordinate with the team. A well-executed reorganization makes everything easier afterward. A poorly executed one creates months of migration pain.
