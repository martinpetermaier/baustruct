# BauGPT Procurement — Tech Architecture
**Erstellt:** 2026-03-11 | **Autor:** Bob 👨‍💻 | **Status:** v1.0

---

## 1. Überblick

BauGPT Procurement ist eine Multi-Tenant Procure-to-Pay Plattform für die Bauindustrie.
Core-Flow: **Bestellung → Digitaler Lieferschein → KI-Prüfung → buchungsfertige Rechnung**

Architekturprinzipien:
- **Multi-Tenant first** — company_id überall, Row Level Security (RLS) ab Tag 1
- **AI-native** — OCR + Parsing als First-Class-Feature, nicht Nachgedanke
- **Mobile-ready** — Polier auf der Baustelle ist Primärnutzer der App
- **ERP-agnostisch** — flexible Export-Layer für SAP, RIB, Datev, etc.

---

## 2. Tech Stack

### Frontend

| Layer | Technologie | Begründung |
|---|---|---|
| Framework | **Next.js 15** (App Router) | SSR für Web-App, SEO für Marketing-Seiten |
| Language | **TypeScript (strict)** | Pflicht. Keine Kompromisse. |
| Styling | **Tailwind CSS v4** | Utility-first, konsistent, kein CSS-in-JS Overhead |
| Components | **shadcn/ui** | Accessible, headless, einfach zu customizen |
| State | **Zustand** | Leichtgewichtig, kein Redux-Overkill |
| Data Fetching | **TanStack Query v5** | Server-State-Management, Caching, Background-Refetch |
| Forms | **React Hook Form + Zod** | Schema-Validierung, Typ-sicher |
| Tables | **TanStack Table v8** | Komplexe Datentabellen (Bestellungen, Rechnungen) |
| Date | **date-fns** | Leichtgewichtig, tree-shakeable |
| Charts | **Recharts** | Reporting-Dashboards |
| Mobile App | **Expo (React Native)** | Code-Sharing mit Web möglich, iOS + Android |

### Backend

| Layer | Technologie | Begründung |
|---|---|---|
| Runtime | **Node.js 22 LTS** | Vertraut im Stack, edge-ready |
| API Framework | **Next.js API Routes** (Route Handlers) | Kein separater Server nötig, co-located |
| ORM | **Prisma** | Type-safe DB-Zugriff, Migration-Management |
| Auth | **Supabase Auth** | JWT, OAuth, Row Level Security nativ |
| Queues | **Inngest** | Event-driven async jobs (OCR, AI-Processing) |
| Validation | **Zod** | Shared Schema zwischen Frontend + Backend |

### Infrastructure

| Service | Anbieter | Zweck |
|---|---|---|
| Hosting | **Vercel** | Next.js, Edge Functions, Auto-Deploy |
| Database | **Supabase (PostgreSQL)** | Multi-Tenant mit RLS, Realtime |
| Storage | **Supabase Storage** | Lieferschein-PDFs, Rechnungs-Scans |
| AI/OCR | **OpenAI GPT-4o** | Document Parsing (structured output) |
| Background Jobs | **Inngest** | OCR Queue, 3-Way-Match, ERP-Export |
| Email | **Resend** | Transactional (Bestellbestätigungen, Freigaben) |
| Monitoring | **Sentry** | Error tracking |
| Analytics | **PostHog** | Product Analytics |
| CI/CD | **GitHub Actions** | Tests, Lint, Deploy |

---

## 3. Architektur-Diagramm

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENTS                              │
│  ┌─────────────────┐   ┌──────────────────────────────┐     │
│  │  Next.js Web    │   │  Expo Mobile (iOS/Android)   │     │
│  │  (Einkauf /     │   │  (Polier — Baustelle)        │     │
│  │   Finanzen)     │   │                              │     │
│  └────────┬────────┘   └──────────────┬───────────────┘     │
└───────────┼──────────────────────────┼─────────────────────┘
            │  HTTPS / REST             │  HTTPS / REST
┌───────────▼──────────────────────────▼─────────────────────┐
│                    NEXT.JS API (Vercel)                      │
│                                                             │
│  /api/                                                      │
│    ├── auth/          (Supabase Auth integration)           │
│    ├── companies/     (Mandanten-Management)                │
│    ├── projects/      (Baustellen)                          │
│    ├── suppliers/     (Lieferanten)                         │
│    ├── products/      (Produktkatalog)                      │
│    ├── purchase-orders/  (Bestellwesen)                     │
│    ├── delivery-notes/   (Lieferscheine)                    │
│    ├── invoices/      (Rechnungen + 3-Way-Match)            │
│    ├── documents/     (Upload-Handler → Storage)            │
│    ├── ai/            (OCR Trigger → Inngest)               │
│    └── erp/           (Export-Endpoints)                    │
│                                                             │
└──────────┬──────────────────────────────────────┬──────────┘
           │                                      │
┌──────────▼──────────┐              ┌────────────▼──────────┐
│  SUPABASE           │              │  INNGEST              │
│  ├── PostgreSQL     │              │  (Background Jobs)    │
│  │   (mit RLS)      │              │                       │
│  ├── Auth (JWT)     │              │  ├── ocr.process      │
│  └── Storage        │              │  ├── invoice.match    │
│      (PDFs/Images)  │              │  ├── erp.export       │
└─────────────────────┘              │  └── notification.send│
                                     └────────────┬──────────┘
                                                  │
                                     ┌────────────▼──────────┐
                                     │  OpenAI GPT-4o        │
                                     │  (structured_output)  │
                                     │  - Document Parsing   │
                                     │  - 3-Way-Match AI     │
                                     │  - Booking Suggestion │
                                     └───────────────────────┘
```

---

## 4. API Design

### Prinzipien
- **RESTful** mit klaren Resource-Hierarchien
- **JWT Auth** im Authorization Header (Supabase)
- **Pagination** überall (cursor-based für große Tabellen)
- **Consistent Error Format** über alle Endpoints
- **Zod-validated** Input/Output auf Server-Seite

### URL-Schema
```
/api/v1/{resource}              GET (list), POST (create)
/api/v1/{resource}/{id}         GET (detail), PATCH (update), DELETE
/api/v1/{resource}/{id}/{sub}   Nested resources
```

### Beispiel: Core Endpoints

```typescript
// Bestellungen
GET    /api/v1/purchase-orders?projectId=&status=&page=
POST   /api/v1/purchase-orders
GET    /api/v1/purchase-orders/:id
PATCH  /api/v1/purchase-orders/:id
POST   /api/v1/purchase-orders/:id/approve
POST   /api/v1/purchase-orders/:id/send

// Lieferscheine
GET    /api/v1/delivery-notes?projectId=&status=
POST   /api/v1/delivery-notes
POST   /api/v1/delivery-notes/upload          ← PDF Upload → OCR Queue
GET    /api/v1/delivery-notes/:id
PATCH  /api/v1/delivery-notes/:id/confirm
PATCH  /api/v1/delivery-notes/:id/dispute

// Rechnungen
GET    /api/v1/invoices?status=&supplierId=&dueDate=
POST   /api/v1/invoices/upload               ← PDF Upload → AI Parse Queue
GET    /api/v1/invoices/:id
GET    /api/v1/invoices/:id/match            ← 3-Way-Match Status
POST   /api/v1/invoices/:id/approve
POST   /api/v1/invoices/:id/book

// Documents
POST   /api/v1/documents/upload              ← Supabase Storage
```

### Error Format (Standard)
```typescript
type ApiError = {
  error: {
    code: string;          // "UNAUTHORIZED" | "NOT_FOUND" | "VALIDATION_ERROR"
    message: string;       // Human-readable
    details?: unknown;     // Zod validation errors etc.
  }
}
```

### Pagination (cursor-based)
```typescript
type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    cursor: string | null;   // next page cursor
    hasMore: boolean;
  }
}
```

---

## 5. Multi-Tenancy & Security

### Row Level Security (Supabase RLS)

Jede Tabelle hat eine RLS-Policy die sicherstellt, dass ein User nur Daten seiner `company_id` sieht:

```sql
-- Beispiel: purchase_orders
CREATE POLICY "Users see own company orders"
  ON purchase_orders
  FOR ALL
  USING (company_id = auth.jwt() ->> 'company_id');
```

### Role-Based Access (RBAC)

| Role | Bestellungen | Lieferscheine | Rechnungen | Admin |
|---|---|---|---|---|
| `polier` | Lesen, Erstellen | Bestätigen | Nein | Nein |
| `einkauf` | Voll | Lesen | Lesen | Nein |
| `buchhaltung` | Lesen | Lesen | Voll | Nein |
| `admin` | Voll | Voll | Voll | Ja |

Role wird im JWT-Claim gespeichert und per Middleware geprüft:

```typescript
// middleware.ts
export async function middleware(req: NextRequest) {
  const jwt = await verifySupabaseJWT(req);
  if (!hasPermission(jwt.role, req.method, req.nextUrl.pathname)) {
    return NextResponse.json({ error: { code: "FORBIDDEN" } }, { status: 403 });
  }
}
```

---

## 6. KI/OCR Pipeline

### Document Processing Flow

```
User uploads PDF/Image
       │
       ▼
POST /api/v1/documents/upload
       │
       ├── Datei → Supabase Storage (raw/)
       ├── DB Record anlegen (status: "processing")
       └── Inngest Event: { type: "document.uploaded", id }

Inngest Job: ocr.process
       │
       ├── Datei aus Storage laden
       ├── OpenAI GPT-4o Vision API (structured output)
       ├── Parse: Lieferant, Datum, Positionen, Preise
       ├── Confidence Score berechnen
       └── DB Update (status: "parsed", ai_parsed_data: {...})

Inngest Job: invoice.three-way-match (nur für Rechnungen)
       │
       ├── Passende Purchase Orders suchen (Lieferant + Datum + ~Betrag)
       ├── Passende Delivery Notes suchen
       ├── AI-Matching: Positionen abgleichen
       ├── Abweichungen markieren (deviation_flag)
       └── three_way_match_status setzen (matched/partial/deviation)
```

### GPT-4o Prompt-Strategie

```typescript
// Structured Output für Invoice Parsing
const invoiceSchema = z.object({
  invoice_number: z.string(),
  invoice_date: z.string(),
  supplier_name: z.string(),
  supplier_tax_id: z.string().optional(),
  total_net: z.number(),
  total_vat: z.number(),
  total_gross: z.number(),
  items: z.array(z.object({
    description: z.string(),
    quantity: z.number(),
    unit: z.string(),
    unit_price: z.number(),
    total_net: z.number(),
    vat_rate: z.number(),
  })),
  confidence: z.number().min(0).max(100),
});
```

---

## 7. ERP Integration Layer

### Design-Prinzip: Adapter-Pattern

```typescript
interface ErpAdapter {
  name: string;
  exportInvoice(invoice: Invoice): Promise<ErpExportResult>;
  formatBookingCode(invoice: Invoice): string;
  validateMapping(company: Company): ValidationResult;
}

class RibAdapter implements ErpAdapter { ... }
class SapAdapter implements ErpAdapter { ... }
class DatevAdapter implements ErpAdapter { ... }
```

### Unterstützte ERPs (Phase 1)
1. **RIB** — höchste Priorität (neue Partnerschaft 03.2026)
2. **DATEV** — standard in DE KMU
3. **Generic CSV/Excel** — Fallback für alle anderen

### Export-Flow
```
Invoice status: "ready_to_book"
       │
       ▼
User klickt "In ERP buchen"
       │
POST /api/v1/invoices/:id/book
       │
       ├── ErpAdapter für company.erp_type laden
       ├── Buchungsdaten formatieren
       ├── API-Call oder File-Export
       ├── erp_booking_code setzen
       └── status → "booked", erp_exported_at = NOW()
```

---

## 8. Infrastructure & Deployment

### Environments

| Env | Branch | URL | DB |
|---|---|---|---|
| Production | `main` | baustruct.baugpt.com | Supabase Prod |
| Staging | `develop` | staging.baustruct.baugpt.com | Supabase Staging |
| Preview | PR branches | auto via Vercel | Staging DB |

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
on: [push, pull_request]
jobs:
  check:
    - TypeScript typecheck (tsc --noEmit)
    - ESLint
    - Zod schema validation tests
    - Prisma schema validate
  test:
    - Unit Tests (Vitest)
    - Integration Tests (API routes)
  deploy:
    if: branch == main
    - Vercel deploy
    - Prisma migrate deploy (Staging → Prod)
```

### Vercel Config

```json
{
  "buildCommand": "prisma generate && next build",
  "env": {
    "DATABASE_URL": "@database-url",
    "SUPABASE_URL": "@supabase-url",
    "SUPABASE_SERVICE_KEY": "@supabase-service-key",
    "OPENAI_API_KEY": "@openai-api-key",
    "INNGEST_EVENT_KEY": "@inngest-event-key"
  }
}
```

---

## 9. Datenbank & Migrations

### Prisma Schema (Auszug)

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model Company {
  id               String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name             String   @db.VarChar(255)
  slug             String   @unique @db.VarChar(100)
  subscriptionPlan String   @default("free") @map("subscription_plan") @db.VarChar(50)
  createdAt        DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt        DateTime @updatedAt @map("updated_at") @db.Timestamptz

  users            User[]
  projects         Project[]
  suppliers        Supplier[]
  purchaseOrders   PurchaseOrder[]
  invoices         Invoice[]
  deliveryNotes    DeliveryNote[]

  @@map("companies")
}

// → Alle weiteren Models aus db-schema-draft.md implementieren
```

### Migration-Strategie
- **Prisma Migrate** für alle Schema-Änderungen
- **Forward-only** — kein Down-Migration in Prod
- **Naming:** `YYYYMMDD_beschreibung` (z.B. `20260311_initial_schema`)
- **Soft Deletes:** `deleted_at TIMESTAMPTZ NULL` statt `DELETE` für Audit-Sicherheit

---

## 10. Mobile App (Expo)

### Stack
```
Expo SDK 52 (React Native)
├── expo-router (File-based routing)
├── @supabase/supabase-js (Auth + API)
├── expo-camera (Fotos bei Lieferung)
├── expo-document-picker (Lieferschein Upload)
├── react-native-mmkv (Offline Storage)
└── TanStack Query (Caching + Offline Support)
```

### Kern-Screens (Polier)
1. **Kalender** — Heute / Diese Woche / Alle Lieferungen
2. **Lieferschein-Detail** — Positionen, Bestätigen/Ablehnen, Foto
3. **Neue Bestellung** — Produktkatalog, Menge, Lieferdatum
4. **Benachrichtigungen** — Push für neue Lieferankündigungen

### Offline-Strategie
- Lieferscheine werden lokal gecacht (MMKV)
- Bestätigungen im Offline-Mode queued → sync on reconnect
- Fotos local gespeichert bis Upload möglich

---

## 11. Roadmap Tech

### Phase 1 — MVP (Wochen 1-6)
- [ ] Projekt-Setup (Next.js, Supabase, Prisma)
- [ ] Auth (Login, Rollen, Multi-Tenant)
- [ ] Bestellwesen (CRUD, Approval-Flow)
- [ ] Lieferschein-Upload + manuelle Erfassung
- [ ] Rechnungs-Upload + manuelle Erfassung
- [ ] Einfacher 3-Way-Match (manuell)

### Phase 2 — KI-Features (Wochen 7-10)
- [ ] OCR Pipeline (Inngest + GPT-4o)
- [ ] Automatischer 3-Way-Match
- [ ] KI-Kontierungsvorschläge
- [ ] Anomalie-Erkennung

### Phase 3 — Mobile + Integrationen (Wochen 11-16)
- [ ] Expo Mobile App (Polier)
- [ ] RIB Integration
- [ ] DATEV Export
- [ ] ESG/CO2 Reporting

---

## 12. Key Decisions & Rationale

| Decision | Gewählt | Nicht gewählt | Warum |
|---|---|---|---|
| DB | Supabase PostgreSQL | PlanetScale, Neon | RLS nativ, Auth integriert, EU-Region |
| ORM | Prisma | Drizzle, raw SQL | Team-Erfahrung, Migrations, Type-safety |
| Queues | Inngest | BullMQ, AWS SQS | Vercel-kompatibel, no infra overhead |
| AI | GPT-4o | Claude, Gemini | structured_output Stabilität für Dokumente |
| Mobile | Expo | Flutter, native | Code-Sharing möglich, React-Erfahrung |
| Hosting | Vercel | Railway, Hetzner | CI/CD nativ, Edge Functions, Team-Erfahrung |

---

*Erstellt: Bob 👨‍💻 | 2026-03-11 | Basis für Sprint-Planung und Implementierung*
*Reviewed by: Hugo 🚀 (Lead) | Status: Ready for implementation*
