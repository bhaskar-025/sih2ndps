# MAITRI+ (Maharashtra AI-powered Industrial Registration & Tracking Intelligence)
### Smart India Hackathon (SIH) — Problem Statement PS-26130
**Category:** Streamlining industrial approvals, compliance processes and access to government support services.

---

## 🏛️ Project Architecture (Isolated MERN Structure)

The MAITRI+ project is decoupled into two completely independent applications:
- **`client/`** — React 18, Vite, TypeScript, TailwindCSS, Lucide React, Recharts frontend application
- **`server/`** — Node.js, Express, TypeScript, Mongoose ODM backend application

```
maitri-plus/
├── client/                     # Frontend Application
│   ├── public/                 # Static assets & favicons
│   ├── src/
│   │   ├── assets/             # Images & design tokens
│   │   ├── components/         # Atomic UI System (Navbar, Sidebar, Breadcrumb, Badges, etc.)
│   │   ├── context/            # AuthContext (state & role switcher) & ThemeContext
│   │   ├── data/               # Demo credentials & test datasets
│   │   ├── hooks/              # Custom hooks (useAuth, useTheme)
│   │   ├── layouts/            # DashboardLayout (Sidebar+Navbar+Breadcrumb+Footer) & AuthLayout
│   │   ├── pages/              # Role dashboards (Entrepreneur, Officer, Admin) & feature views
│   │   ├── services/
│   │   │   └── api.ts          # Central Axios client with Bearer interceptors & baseURL
│   │   ├── types/              # Type-safe schemas and domain types
│   │   └── utils/              # Utility helpers & class merger (cn)
│   ├── .env                    # VITE_API_URL=http://localhost:5000/api/v1
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── vite.config.ts
│
└── server/                     # Backend Application
    ├── src/
    │   ├── config/
    │   │   ├── database.ts     # Mongoose connection & reconnection handler
    │   │   └── environment.ts  # Dotenv environment variable loader
    │   ├── controllers/        # Domain controllers
    │   ├── middlewares/        # Authentication, Error handling, Logging & Validation
    │   ├── models/             # 10 Core Mongoose Schema Models
    │   ├── routes/             # Isolated route groups (/api/v1/...)
    │   │   ├── auth.routes.ts
    │   │   ├── project.routes.ts
    │   │   ├── application.routes.ts
    │   │   ├── approval.routes.ts
    │   │   ├── document.routes.ts
    │   │   ├── department.routes.ts
    │   │   ├── inspection.routes.ts
    │   │   ├── scheme.routes.ts
    │   │   ├── analytics.routes.ts
    │   │   └── index.ts
    │   ├── services/           # Service layer
    │   ├── types/              # Backend TypeScript definitions
    │   ├── utils/              # Logger, ApiError, ApiResponse, JWT utilities
    │   ├── validators/         # Zod request validators
    │   ├── app.ts              # Express setup with Helmet, CORS, Compression, Morgan
    │   └── server.ts           # Server bootstrap & graceful shutdown handler
    ├── .env                    # PORT, MONGODB_URI, JWT_SECRET, CLIENT_URL
    ├── .env.example
    ├── package.json
    └── tsconfig.json
```

---

## ⚙️ Environment Variables

### Client (`client/.env`)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Server (`server/.env`)
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/maitri_plus
JWT_SECRET=maitri_plus_super_secure_jwt_secret_sih2026_key
CLIENT_URL=http://localhost:5173
```

---

## 🚀 How to Run

Both frontend and backend are completely isolated and run with their own scripts:

### 1. Run Backend Server
```bash
cd server
npm install
npm run dev
```
- Server starts on: **`http://localhost:5000`**
- Health Check: **`http://localhost:5000/api/v1/health`**

### 2. Run Frontend Client
```bash
cd client
npm install
npm run dev
```
- Client starts on: **`http://localhost:5173`**

---

## 🛠️ Development Commands

| Directory | Command | Description |
|---|---|---|
| `client/` | `npm run dev` | Start Vite development server with Hot Module Replacement |
| `client/` | `npm run build` | Compile TypeScript and generate optimized production bundle |
| `client/` | `npm run preview` | Locally preview the production build |
| `server/` | `npm run dev` | Start Express with `tsx watch` (auto-restarts on change) |
| `server/` | `npm run build` | Compile TypeScript to JavaScript in `/dist` |
| `server/` | `npm run start` | Run compiled production server with Node.js |
| `server/` | `npm run seed` | Seed database with initial regulatory departments & demo accounts |

---

## 🌐 API Route Architecture (`/api/v1`)

The backend Express application organizes endpoints into 9 modular route groups:

| Route Group | Base Path | Scope |
|---|---|---|
| **Auth** | `/api/v1/auth` | Login, register, profile (`/me`), logout |
| **Projects** | `/api/v1/projects` | Industrial investment dockets, capital, land info |
| **Applications** | `/api/v1/applications` | Inter-departmental single window clearances |
| **Approvals** | `/api/v1/approvals` | Issued NOCs, certificates, digital signatures |
| **Documents** | `/api/v1/documents` | Industrial plans, AI OCR verification |
| **Departments** | `/api/v1/departments` | Regulatory authorities (MPCB, MIDC, DMFS, DOI) |
| **Inspections** | `/api/v1/inspections` | Site inspections, scheduled dates, checklists |
| **Schemes** | `/api/v1/schemes` | State incentive policies (PSI 2019, CMEGP 2024) |
| **Analytics** | `/api/v1/analytics` | State-wide clearance velocity, RTS SLA metrics |
| **Health** | `/api/v1/health` | Service health & MongoDB database connection status |
