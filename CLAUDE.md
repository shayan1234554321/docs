# Google Docs Clone
A multi-user document management application with sharing capabilities. Users can create, edit, and share documents.

## Structure
- `backend/` — Express.js API server
- `frontend/` — Next.js 15 web application

## Global Rules
- Ask before acting — clarify approach, design decisions, side effects first
- Get confirmation before non-trivial changes
- Research best practices if unsure
- Required Code Change only — keep changes focused; avoid scope creep

## Shared Validation
Frontend and backend share Zod schemas in `frontend/src/validators/sharedSchemas.ts` and `backend/src/validators/sharedSchemas.ts`. Keep them in sync when changing validation rules.