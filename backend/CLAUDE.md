# Backend Context

## Stack
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: MongoDB with Mongoose ODM
- **Auth**: JWT with bcryptjs password hashing
- **Validation**: Zod schemas
- **Security**: helmet, express-rate-limit, cors

## Commands
- `npm run dev` — development with ts-node-dev (auto-restart on changes)
- `npm run build` — compile TypeScript to `dist/`
- `npm start` — run production server from `dist/`

## Key Directories
- `src/controllers/` — Business logic (authController, docController)
- `src/routes/` — Express route definitions
- `src/models/` — Mongoose schemas (User, Document)
- `src/middleware/` — Auth verification, error handling, request validation
- `src/validators/` — Zod validation schemas (shared with frontend)
- `src/helpers/` — JWT token, password hashing, API response helpers
- `src/config/` — Database connection configuration

## Architecture Rules
- All API access goes through controllers
- Passwords hashed with bcryptjs before storage
- JWT token validation via `authMiddleware`
- Zod schemas validate all request bodies/params
- API responses standardized via `responseHelper`

## Environment
- `.env` contains MongoDB connection string and JWT secret
- `PORT` defaults to 5000 if not set