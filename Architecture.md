# Architecture

A short overview of how this Google Docs clone is built.

## High Level

The app is split into two services that talk to each other over a JSON REST API:

```text
┌────────────────────┐         HTTP (Axios)         ┌────────────────────┐
│  Frontend          │  ───────────────────────▶   │  Backend           │
│  Next.js 15 (App   │  ◀───────────────────────    │  Express.js + TS   │
│  Router) + React   │     JWT in Authorization     │  + Mongoose        │
│  19 + Tailwind 4   │     header                   │                    │
└────────────────────┘                              └─────────┬──────────┘
                                                              │ Mongoose
                                                              ▼
                                                     ┌────────────────┐
                                                     │   MongoDB      │
                                                     └────────────────┘
```

## Frontend (`frontend/`)

- **Framework:** Next.js 15 (App Router) + React 19
- **Styling:** Tailwind CSS 4
- **Editor:** `@eigenpal/docx-editor-react` (a ProseMirror-based rich-text editor)
- **HTTP:** Axios instance in `src/utils/api.ts` (auth token injected automatically)
- **State:** React `AuthContext` for the current user
- **Validation:** Zod schemas shared with the backend

Pages are organised by domain: `app/dashboard`, `app/share/[docId]`, plus component folders for `auth`, `dashboard`, `editor`, and shared `ui` primitives.

## Backend (`backend/`)

- **Runtime:** Node.js + Express.js + TypeScript
- **Database:** MongoDB via Mongoose
- **Auth:** JWT (`jsonwebtoken`) + `bcryptjs` password hashing, verified by an `authMiddleware`
- **Validation:** Zod schemas against every request body / params
- **Security:** `helmet`, `express-rate-limit`, `cors`

Layout follows a classic controller / route / model split:

```text
src/
  app.ts            # Express app wiring
  server.ts         # Entry point
  config/           # Mongo connection
  controllers/      # auth, doc business logic
  routes/           # Route definitions
  models/           # Mongoose User, Document
  middleware/       # auth, error handling, validation
  validators/       # Zod schemas (mirrored on the frontend)
  helpers/          # JWT, password, response helpers
```

## Data Model (sketch)

- **User** — `email`, `passwordHash`, …
- **Document** — `title`, `content` (ProseMirror JSON), `owner`, `sharedWith: [{ userId, role }]`
  - `sharedWith.role` is one of `viewer` / `editor`, controlling per-document access.

## Request Flow

1. The Next.js client calls the API via the shared Axios instance.
2. The request passes through `helmet`, `cors`, rate limiting, and Zod validation.
3. `authMiddleware` verifies the JWT and attaches the user.
4. A controller runs the business logic against Mongoose.
5. A response is returned through a standard `responseHelper` envelope.

## Shared Contracts

`frontend/src/validators/sharedSchemas.ts` and `backend/src/validators/sharedSchemas.ts` are kept in sync so request shapes match on both ends — change a schema in one place and mirror it in the other.

## Save Model

Documents are saved on **blur / explicit change**, not via real-time sync. Collaboration is share-link based: an owner shares a document with another user and grants `viewer` or `editor` access.
