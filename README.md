# Baustruct — BauGPT Procurement

> Procure-to-Pay platform for German construction companies. Inspired by Comstruct, built for the BauGPT ecosystem.

## Core Flow

```
Purchase Order → Delivery Note → Invoice → 3-Way-Match → ERP Export
```

**3 User Roles:**
- **Polier** (Site Manager) — mobile delivery calendar, delivery confirmation with photos
- **Einkauf** (Procurement) — order management, supplier catalog, approval flow
- **Buchhaltung** (Finance) — AI invoice parsing, 3-way-match, DATEV export

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Database | Supabase (PostgreSQL + Auth + Storage) |
| ORM | Prisma |
| AI/OCR | OpenAI GPT-4o |
| Background Jobs | Inngest |
| Forms | React Hook Form + Zod |
| Data Fetching | TanStack Query v5 |

## Getting Started

### Prerequisites

- Node.js 22+
- Supabase project (free tier works)
- OpenAI API key (for invoice OCR)
- Inngest account (optional, for background jobs)

### Setup

```bash
# 1. Clone & install
git clone <repo-url> && cd baustruct
npm install

# 2. Environment variables
cp .env.example .env
# Fill in your Supabase + OpenAI keys

# 3. Database
npx prisma generate
npx prisma db push

# 4. Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Inngest (Background Jobs)

```bash
# In a separate terminal
npx inngest-cli@latest dev
```

## Project Structure

```
baustruct/
├── prisma/
│   └── schema.prisma          # Full DB schema (12 models)
├── src/
│   ├── app/
│   │   ├── (auth)/login/      # Login page
│   │   ├── dashboard/         # Role-based dashboard
│   │   ├── field/
│   │   │   ├── calendar/      # Delivery calendar (mobile)
│   │   │   └── delivery/[id]/ # Delivery confirmation
│   │   ├── finance/
│   │   │   └── invoices/      # Invoice list + 3-way-match
│   │   ├── procurement/
│   │   │   └── orders/        # Order list + new order form
│   │   └── api/
│   │       ├── inngest/       # Inngest webhook
│   │       ├── invoices/      # Invoice upload + OCR trigger
│   │       ├── delivery-notes/ # Delivery CRUD + confirm
│   │       └── purchase-orders/ # PO CRUD + approval
│   ├── inngest/
│   │   ├── client.ts          # Inngest client
│   │   └── functions.ts       # OCR + 3-way-match jobs
│   └── lib/
│       ├── ai/
│       │   ├── invoice-parser.ts  # GPT-4o OCR pipeline
│       │   └── three-way-match.ts # PO-DN-Invoice matching
│       ├── supabase/
│       │   ├── client.ts      # Browser client
│       │   ├── server.ts      # Server client
│       │   └── middleware.ts   # Auth + role-based routing
│       ├── prisma.ts          # Prisma singleton
│       └── utils.ts           # formatCurrency, formatDate, cn()
├── middleware.ts               # Next.js middleware (auth guard)
├── docs/                       # Product specs, architecture docs
└── .env.example               # Required environment variables
```

## Key Features

- **Multi-Tenant**: All DB queries filter by `company_id`, Supabase RLS ready
- **KI Rechnungsprüfung**: Upload PDF → GPT-4o extracts fields → auto-match with PO
- **3-Way-Match**: PO ↔ Delivery Note ↔ Invoice with tolerance thresholds
- **Skonto Tracking**: Auto-calculate skonto deadlines from supplier payment terms
- **Mobile-First**: Field views optimized for site managers on mobile
- **Per-Document Billing**: Track `document_count_month` for usage-based pricing

## Team

| Role | Agent | Focus |
|---|---|---|
| Lead | Hugo | Strategy, Coordination |
| Engineering | Bob | Architecture, Implementation |
| Analytics | Rainman | Data Model, ESG |
| Business | Brunhilde | Business Model, GTM |

---

*Project started: 2026-03-11 | BauGPT Marketing Team*
