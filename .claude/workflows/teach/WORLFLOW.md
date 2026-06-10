---
name: teach
description: Set up AI context and workflows for a new project. Run this first when starting work with a new codebase to establish design guidelines, project context, PR review process, and common workflows.
---

Set up AI context and workflows for a project so it understands your codebase, design system, and coding standards. I want you to run these tasks with context cleared between each one

For each task:
1. Complete the task fully
2. Save progress to memory before context clears
3. Wait for me to send the next "continue" message before starting the next task

After all tasks are done, report the consolidated results from all of them.

## Task 1: Assess Current Design

**Ask the user:**
> "Do you have an existing design system/design guidelines you want to preserve, or should we establish new ones?"

- **If YES, design is good** → Run the `extract` workflow to analyze and document current design patterns
- **If NO, design needs work** → Run the `teach-impeccable` workflow to establish new design language

**CRITICAL**: Don't skip this step. Starting without design context leads to inconsistent AI-generated code.

---

## Task 2: Analyze Project Structure

**Determine repository type:**

1. **Check if mono-repo** (frontend + backend in same folder):
   - Look for indicators: multiple `package.json`, `apps/` or `packages/` directories, separate frontend/backend folders at root

2. **Ask the user if unclear:**
   > "Is this a mono-repo (frontend + backend together) or multi-repo (separate frontend/backend directories)?"

**For mono-repo:**
- Run `teach-context` workflow from root
- The workflow will create `.CLAUDE.md` files in each sub-project

**For multi-repo:**
- For each directory (frontend, backend, etc.):
  - `cd` into the directory
  - Run `teach-context` workflow
- Each sub-project gets its own `.CLAUDE.md` context file

---

## Task 3: Merge Context Files

**If mono-repo:**
- You now have TWO `.CLAUDE.md` files:
  1. Pre-existing root `CLAUDE.md` (project-wide context)
  2. Newly created sub-project context(s) from `teach-context`
- **Merge them** into a single comprehensive root `CLAUDE.md`
- Delete the redundant sub-project context files

**If multi-repo:**
- No merging needed — each sub-project has its own `.CLAUDE.md`
- These remain self-contained

---

## Task 4: Prepare PR Review Workflow

**Run the `teach-pr-review` workflow**

This creates a `pr-review` skill in `.claude/workflow/` customized for your tech stack. The workflow researches:
- Best practices for your specific language/framework
- Security considerations
- Common pitfalls
- Testing requirements

**CRITICAL**: PR review must be tailored to your stack. A generic review misses stack-specific issues.

---

## Task 5: Set Up Common Workflows

May be no change is needed here if the files are already pasted in the correct place. 
The following workflows are now available for recurring tasks. Place them in `.claude/workflow/`:

### Design Workflows
| Workflow | When to Use |
|----------|-------------|
| `adapt-ui` | Make UI responsive to different screen sizes and devices |
| `animate` | Add animations to UI elements |
| `arrange` | Fix spacing or layout issues |
| `audit-ui` | Check UI for accessibility issues and improvements |
| `bolder` | Add visual impact when design looks bland or generic |
| `clarify` | Improve unclear labels, error messages, or UX writing |
| `colorize` | Add warmth/vibrancy when design looks gray or dull |
| `critique` | Get feedback on UI design |
| `delight` | Add moments of joy, personality, unexpected touches |
| `normalize` | Make UI consistent with brand guidelines |
| `onboard` | First-time users, empty states, getting started flows |

### Code Workflows
| Workflow | When to Use |
|----------|-------------|
| `optimize` | Check code quality, linting, formatting, best practices |
| `overdrive` | Full optimization pass (combine with `optimize`) |
| `adapt` | Adapt a file to project layout, naming, folder structure |
| `audit` | Check accessibility, performance, and security |
| `change-layout` | Change how work is organized in the project |

### Review Workflows
| Workflow | When to Use |
|----------|-------------|
| `pr-review` | Review PR for bugs, code quality, security |

---

## Final File Structure

After running `teach`, your project should have:

```
.claude
├── workflow
│   ├── WORKFLOW.md          # Reference guide: when to use each workflow
│   ├── adapt-ui
│   │   └── WORKFLOW.md
│   ├── adapt
│   │   └── WORKFLOW.md
│   ├── animate
│   │   └── WORKFLOW.md
│   ├── arrange
│   │   └── WORKFLOW.md
│   ├── audit
│   │   └── WORKFLOW.md
│   ├── bolder
│   │   └── WORKFLOW.md
│   ├── clarify
│   │   └── WORKFLOW.md
│   ├── colorize
│   │   └── WORKFLOW.md
│   ├── critique
│   │   └── WORKFLOW.md
│   ├── delight
│   │   └── WORKFLOW.md
│   ├── normalize
│   │   └── WORKFLOW.md
│   ├── onboard
│   │   └── WORKFLOW.md
│   ├── optimize
│   │   └── WORKFLOW.md
│   ├── overdrive
│   │   └── WORKFLOW.md
│   ├── change-layout
│   │   └── WORKFLOW.md
│   ├── pr-review
│   │   └── WORKFLOW.md
│   └── extract
│       ├── WORKFLOW.md       # Analyze existing design
│       ├── teach-impeccable.md  # Establish new design language
│       ├── teach-context.md # Create project context
│       └── teach-pr-review.md   # Prepare PR review workflow
└── skills
    └── frontend-design
        ├── SKILL.md
        └── reference
            ├── typography.md
            ├── color-and-contrast.md
            ├── spatial-design.md
            ├── motion-design.md
            ├── interaction-design.md
            ├── responsive-design.md
            └── ux-writing.md

# Context files (location depends on repo type)
# Mono-repo: Single merged CLAUDE.md at root
# Multi-repo: CLAUDE.md in each sub-project directory
```

---

## Workflows Used

| Workflow | Purpose |
|----------|---------|
| `teach` | This workflow — set up AI context for a project |
| `teach-context` | Create `.CLAUDE.md` context file for a project/directory |
| `teach-pr-review` | Prepare PR review workflow for your tech stack |
| `extract` | Analyze and document existing design patterns |
| `teach-impeccable` | Establish new design language from scratch |

---

## NEVER

- Run coding tasks before running `teach` on a new project
- Skip the design assessment phase — AI will generate inconsistent code
- Use generic PR review without customizing for your tech stack
- Create `.CLAUDE.md` files without merging duplicates in mono-repos