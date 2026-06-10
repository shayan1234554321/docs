# Google Docs Clone

A multi-user document management application with sharing capabilities. Users can create, edit, and share documents.

## Tech Stack

- **Backend**: Node.js + Express.js + TypeScript, MongoDB with Mongoose, JWT auth
- **Frontend**: Next.js 15 (App Router) + React 19, Tailwind CSS 4, ProseMirror-based editor

## Prerequisites

- Node.js 20+
- MongoDB (local or cloud instance)

## Local Setup

### 1. Backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/googledocs
JWT_SECRET=your-secret-key
```

Run the development server:

```bash
npm run dev
```

The backend starts on `http://localhost:5000`.

### 2. Frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

Run the development server:

```bash
npm run dev
```

The frontend starts on `http://localhost:3000`.

## Docker Setup

### Backend

```bash
cd backend
docker build -t google-docs-backend .
docker run -p 5000:5000 --env-file .env google-docs-backend
```

### Frontend

```bash
cd frontend
docker build -t google-docs-frontend .
docker run -p 3000:3000 google-docs-frontend
```

## Available Scripts

### Backend Scripts

- `npm run dev` — Development server with auto-restart
- `npm run build` — Compile TypeScript to `dist/`
- `npm start` — Run production server

### Frontend Scripts

- `npm run dev` — Next.js development server
- `npm run build` — Production build
- `npm run lint` — ESLint checks

## Project Structure

```text
backend/
  src/
    controllers/    # Auth and document business logic
    routes/         # Express route definitions
    models/         # Mongoose schemas (User, Document)
    middleware/     # Auth verification, error handling
    validators/     # Zod validation schemas
    helpers/        # JWT, password, response helpers
    config/         # Database configuration
  Dockerfile
  package.json

frontend/
  src/
    app/            # Next.js pages
    components/     # UI components by domain
    contexts/       # AuthContext for auth state
    utils/          # Axios API client
    validators/     # Shared Zod schemas
  Dockerfile
  package.json
```