# Google Docs Clone - Project Plan

## Overview
A collaborative document editing application inspired by Google Docs. Users can create, edit, and share documents with granular access control (view/edit permissions) and public/private visibility settings.

---

## Tech Stack

### Frontend
- **Framework**: Next.js (TypeScript)
- **UI Library**: Shadcn
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Validation**: Zod
- **Document Editor**: @eigenpal/docx-editor-react
- **State Management**: React Context / Hooks

### Backend
- **Framework**: Express.js (TypeScript)
- **Database**: MongoDB (Mongoose ODM)
- **Validation**: Zod
- **Authentication**: bcrypt (password hashing), JWT (bearer tokens)
- **Security**: Helmet (security headers), Rate Limiter
- **Folder Structure**: `routes/`, `controllers/`, `middleware/`, `helpers/`

---

## Project Structure

### Frontend (`/frontend`)
```
frontend/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, signup)
│   │   │   ├── login/
│   │   │   └── signup/
│   │   ├── (dashboard)/      # Protected dashboard
│   │   │   └── dashboard/
│   │   ├── (share)/           # Public share pages
│   │   │   └── share/[docId]/
│   │   ├── layout.tsx
│   │   └── page.tsx           # Landing page
│   ├── components/
│   │   ├── ui/               # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Card.tsx
│   │   │   └── ...
│   │   ├── auth/
│   │   │   ├── LoginForm.tsx
│   │   │   └── SignupForm.tsx
│   │   ├── dashboard/
│   │   │   ├── DocumentList.tsx
│   │   │   ├── CreateDocModal.tsx
│   │   │   └── DocumentCard.tsx
│   │   ├── editor/
│   │   │   ├── DocxEditorWrapper.tsx
│   │   │   └── EditorToolbar.tsx
│   │   └── layout/
│   │       ├── Header.tsx
│   │       └── Footer.tsx
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useDocument.ts
│   │   └── useAxios.ts
│   ├── contexts/
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── services/
│   │   ├── authService.ts
│   │   └── documentService.ts
│   ├── types/
│   │   ├── auth.ts
│   │   └── document.ts
│   ├── utils/
│   │   ├── api.ts           # Axios instance
│   │   └── validation.ts    # Zod schemas
│   └── styles/
│       └── globals.css      # CSS variables & global styles
├── tailwind.config.ts
├── next.config.js
└── package.json
```

### Backend (`/backend`)
```
backend/
├── src/
│   ├── routes/
│   │   ├── authRoutes.ts
│   │   └── docRoutes.ts
│   ├── controllers/
│   │   ├── authController.ts
│   │   └── docController.ts
│   ├── middleware/
│   │   ├── authMiddleware.ts
│   │   ├── validateRequest.ts
│   │   └── errorHandler.ts
│   ├── helpers/
│   │   ├── jwtHelper.ts
│   │   ├── passwordHelper.ts
│   │   └── responseHelper.ts
│   ├── models/
│   │   ├── User.ts
│   │   └── Document.ts
│   ├── validators/
│   │   ├── authValidator.ts
│   │   └── docValidator.ts
│   ├── config/
│   │   └── database.ts
│   ├── types/
│   │   └── index.ts
│   ├── app.ts
│   └── server.ts
├── package.json
└── tsconfig.json
```

---

## Database Schema

### User Collection
```typescript
{
  _id: ObjectId,
  email: string,           // Unique, required
  password: string,        // bcrypt hashed
  createdAt: Date,
  updatedAt: Date
}
```

### Document Collection
```typescript
{
  _id: ObjectId,
  user: ObjectId,          // Creator's user ID (ref: User)
  name: string,           // Document title
  doc: string,            // Document content (docx buffer as base64 or empty string initially)
  visibility: "public" | "private",  // Default: "private"
  access: [               // Users with explicit access
    {
      user: ObjectId,     // Reference to User
      email: string,      // Email of the user
      access: "view" | "edit"  // Permission level
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Pages & Routes

### Frontend Pages

| Route | Type | Description |
|-------|------|-------------|
| `/` | Public | Landing page with hero section & login/signup button |
| `/login` | Public | Login form (modal on landing or separate route) |
| `/signup` | Public | Signup form (modal on landing or separate route) |
| `/dashboard` | Private | Document list with create button (auth required) |
| `/share/[docId]` | Public* | Share page for viewing/editing documents |

*Share page is publicly accessible but document content depends on permissions.

### Backend API Routes

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Register new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/auth/me` | Yes | Get current user info |
| GET | `/api/docs` | Yes | Get all documents for logged-in user |
| POST | `/api/docs` | Yes | Create new document |
| GET | `/api/docs/:id` | Yes* | Get single document |
| PUT | `/api/docs/:id` | Yes* | Update document |
| DELETE | `/api/docs/:id` | Yes* | Delete document |
| PUT | `/api/docs/:id/access` | Yes* | Add/remove access for a user |
| GET | `/api/docs/:id/share` | Yes* | Get document for share page |

*Requires ownership or appropriate access level.

---

## Features & Implementation Steps

### Step 1: Project Setup
- [ ] Initialize Next.js frontend project with TypeScript
- [ ] Initialize Express.js backend project with TypeScript
- [ ] Configure Tailwind CSS with Shadcn
- [ ] Set up MongoDB connection
- [ ] Configure folder structures (frontend & backend)
- [ ] Set up CSS variables for design tokens

### Step 2: Backend - Authentication
- [ ] Create User model with Mongoose
- [ ] Implement bcrypt password hashing helpers
- [ ] Implement JWT token generation and verification helpers
- [ ] Create auth routes (register, login, me)
- [ ] Create auth middleware for protected routes
- [ ] Add Zod validation for auth requests
- [ ] Add Helmet security headers
- [ ] Add rate limiting

### Step 3: Backend - Documents
- [ ] Create Document model with Mongoose
- [ ] Implement document CRUD routes
- [ ] Implement access management routes
- [ ] Add Zod validation for document requests
- [ ] Implement permission checks (owner/edit/view)

### Step 4: Frontend - Landing Page
- [ ] Create landing page layout
- [ ] Implement Header with login/signup button
- [ ] Create Login modal/popup component
- [ ] Create Signup modal/popup component
- [ ] Connect to backend auth endpoints

### Step 5: Frontend - Dashboard
- [ ] Create protected dashboard route (redirect if not logged in)
- [ ] Implement document list component
- [ ] Create "Create New Document" modal
  - Name input
  - Visibility toggle (public/private)
  - Access management (add email with view/edit permission)
- [ ] Implement document card component
- [ ] Connect to backend document endpoints

### Step 6: Frontend - Share/Edit Page
- [ ] Create share page route `/share/[docId]`
- [ ] Implement DocxEditor integration
- [ ] Create editor toolbar (view/edit toggle)
- [ ] Handle permission-based rendering (edit vs view mode)
- [ ] Implement save functionality
- [ ] Handle public visibility (view-only for non-accessed users)

### Step 7: Polish & Security
- [ ] Add global error handling
- [ ] Add loading states and spinners
- [ ] Add toast notifications
- [ ] Add form validation feedback
- [ ] Implement proper TypeScript types
- [ ] Add 404 and error pages
- [ ] Ensure responsive design

---

## Design Tokens (CSS Variables)
The impeccable design guide is here : .impeccable.md
Please follow and create a global css file to replicate the file constants for frontend design guide

---

## API Request/Response Shapes

### Auth

**POST /api/auth/register**
```typescript
// Request
{ email: string, password: string }

// Response
{ success: true, data: { user: { id, email }, token } }
```

**POST /api/auth/login**
```typescript
// Request
{ email: string, password: string }

// Response
{ success: true, data: { user: { id, email }, token } }
```

### Documents

**POST /api/docs**
```typescript
// Request
{
  name: string,
  visibility: "public" | "private",
  access: Array<{ email: string, access: "view" | "edit" }>
}

// Response
{ success: true, data: { document } }
```

**PUT /api/docs/:id**
```typescript
// Request
{ doc: string } // Document content

// Response
{ success: true, data: { document } }
```

**PUT /api/docs/:id/access**
```typescript
// Request
{ email: string, access: "view" | "edit" | "remove" }

// Response
{ success: true, data: { document } }
```

---

## Component Inventory

### UI Components
| Component | States | Description |
|-----------|--------|-------------|
| Button | default, hover, active, disabled, loading | Primary action button |
| Input | default, focus, error, disabled | Text input field |
| Modal | open, closed | Popup overlay container |
| Card | default, hover | Container for document cards |
| Badge | - | Access level indicator |
| Toggle | on, off | View/edit mode switch |
| Spinner | - | Loading indicator |
| Toast | success, error, warning, info | Notification messages |

### Feature Components
| Component | Description |
|-----------|-------------|
| LoginForm | Email/password login form |
| SignupForm | Email/password signup form |
| DocumentList | Grid/list of user's documents |
| DocumentCard | Individual document preview card |
| CreateDocModal | Modal for creating new document |
| DocxEditorWrapper | Wrapper for @eigenpal/docx-editor-react |
| EditorToolbar | View/edit toggle and save button |
| Header | App header with navigation |
| Footer | App footer |

---

## Validation Rules (Zod)

### Auth Validation
```typescript
// Register
{
  email: z.string().email(),
  password: z.string().min(8).max(100)
}

// Login
{
  email: z.string().email(),
  password: z.string().min(1)
}
```

### Document Validation
```typescript
// Create
{
  name: z.string().min(1).max(255),
  visibility: z.enum(["public", "private"]),
  access: z.array(z.object({
    email: z.string().email(),
    access: z.enum(["view", "edit"])
  })).optional()
}

// Update
{
  doc: z.string(), // base64 encoded docx
  name: z.string().min(1).max(255).optional()
}

// Access
{
  email: z.string().email(),
  access: z.enum(["view", "edit", "remove"])
}
```

---

## Security Considerations

1. **Password Storage**: bcrypt with salt rounds ≥ 10
2. **JWT Tokens**: 
   - Expiration: 7 days
   - Stored in HTTP-only cookies or Authorization header
3. **Rate Limiting**: 
   - Auth routes: 5 requests/minute per IP
   - General routes: 100 requests/minute per IP
4. **Helmet**: Security headers enabled
5. **Input Validation**: Zod schemas on all routes
6. **Access Control**: 
   - Owner: full access
   - Edit access: can modify document content
   - View access: read-only
   - Public visibility: anyone can view, only access list can edit

---

Rules
- Use the Latest version of all the libraries
- make sure to have a common file in frontend and backend kind of shared so that we can know which API's are used and available ( not common codebase, we will manually update them , so same folder in both ) Zod validations you know