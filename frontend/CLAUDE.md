# Frontend Context

## Stack
- **Framework**: Next.js 15 (App Router) + React 19
- **Styling**: Tailwind CSS 4
- **Editor**: @eigenpal/docx-editor-react (ProseMirror-based)
- **HTTP**: Axios for API calls
- **Validation**: Zod v4 (shared schemas with backend)
- **State**: React Context (AuthContext for auth state)

## Commands
- `npm run dev` — Next.js development server
- `npm run build` — production build
- `npm run lint` — ESLint checks

## Key Directories
- `src/app/` — Next.js pages (dashboard, share/[docId])
- `src/components/auth/` — Login/register modals
- `src/components/dashboard/` — Document list, create doc modal
- `src/components/editor/` — DocxEditorWrapper, ShareAccessModal
- `src/components/ui/` — Reusable UI components (Modal)
- `src/contexts/` — AuthContext for authentication state
- `src/utils/` — Axios API client
- `src/validators/` — Zod schemas (shared with backend)

## Key Concepts
- Editor uses @eigenpal/docx-editor-react wrapping ProseMirror
- Documents saved on blur/change (not real-time sync)
- Share modal manages document access permissions

## Architecture Rules
- API calls via `src/utils/api.ts` (Axios instance)
- Auth state managed through AuthContext
- Zod validation schemas must match backend validators
- Components organized by domain, not type