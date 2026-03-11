# BauGPT Procurement — REST API Specification
**Version:** 1.0 | **Stand:** 2026-03-11 | **Autor:** Hugo 🚀
**Status:** Draft — Ready for Bob's Review

---

## 1. Overview

RESTful API für BauGPT Procurement (Baustruct). Next.js API Routes, JSON responses, JWT Auth via Supabase.

**Base URL:** `https://api.baustruct.de/v1` (Production) | `http://localhost:3000/api/v1` (Dev)

**Auth:** Bearer Token (Supabase JWT) in `Authorization` header. RLS enforces `company_id` isolation.

**Conventions:**
- All dates: ISO 8601 (`2026-03-11T14:30:00Z`)
- All monetary values: cents (integer), currency: EUR
- Pagination: `?page=1&limit=25` (default 25, max 100)
- Sorting: `?sort=created_at&order=desc`
- Soft deletes: `DELETE` sets `deleted_at`, doesn't remove data

---

## 2. Authentication

### POST `/auth/login`
Email/Password login → returns JWT + refresh token.

```json
// Request
{ "email": "polier@baufirma.de", "password": "..." }

// Response 200
{
  "access_token": "eyJ...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "polier@baufirma.de",
    "role": "polier",
    "company_id": "uuid",
    "name": "Max Mustermann"
  }
}
```

### POST `/auth/refresh`
Refresh expired access token.

### POST `/auth/invite`
**Role:** `admin` only. Invite user to company.
```json
{ "email": "neuer@baufirma.de", "role": "polier", "name": "Hans Müller" }
```

---

## 3. Projects (Baustellen)

### GET `/projects`
List all projects for current company. Supports `?status=active&search=Neubau`.

```json
// Response 200
{
  "data": [
    {
      "id": "uuid",
      "name": "Neubau Residenz München-Süd",
      "code": "P-2026-042",
      "address": "Musterstraße 12, 80333 München",
      "status": "active",
      "budget_cents": 250000000,
      "start_date": "2026-01-15",
      "end_date": "2026-12-31",
      "manager_id": "uuid",
      "sqm_bgf": 4500,
      "created_at": "2026-01-10T08:00:00Z"
    }
  ],
  "pagination": { "page": 1, "limit": 25, "total": 8 }
}
```

### POST `/projects`
**Role:** `admin`, `einkauf`
```json
{
  "name": "Sanierung Altbau Schwabing",
  "code": "P-2026-043",
  "address": "Leopoldstr. 88, 80802 München",
  "budget_cents": 180000000,
  "start_date": "2026-04-01",
  "sqm_bgf": 2800
}
```

### GET `/projects/:id`
### PATCH `/projects/:id`
### DELETE `/projects/:id` — Soft delete

---

## 4. Purchase Orders (Bestellungen)

### GET `/purchase-orders`
Filters: `?project_id=uuid&status=approved&supplier_id=uuid`

```json
{
  "data": [
    {
      "id": "uuid",
      "order_number": "PO-2026-0142",
      "project_id": "uuid",
      "project_name": "Neubau Residenz München-Süd",
      "supplier_id": "uuid",
      "supplier_name": "Betonwerk Südbayern GmbH",
      "status": "approved",
      "total_cents": 4875000,
      "items": [
        {
          "id": "uuid",
          "product_id": "uuid",
          "product_name": "Beton C25/30",
          "material_code": "CONC_C2530",
          "quantity": 120,
          "unit": "m3",
          "unit_price_cents": 8500,
          "total_cents": 1020000,
          "contract_price_cents": 8500,
          "delivery_date_requested": "2026-03-20"
        }
      ],
      "approval_status": "approved",
      "approved_by": "uuid",
      "approved_at": "2026-03-10T09:15:00Z",
      "notes": "Lieferung in 3 Chargen KW12-14",
      "created_at": "2026-03-08T14:00:00Z"
    }
  ]
}
```

### POST `/purchase-orders`
**Role:** `einkauf`, `admin`

```json
{
  "project_id": "uuid",
  "supplier_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 120,
      "unit": "m3",
      "unit_price_cents": 8500,
      "delivery_date_requested": "2026-03-20"
    }
  ],
  "notes": "Lieferung in 3 Chargen"
}
```

### PATCH `/purchase-orders/:id`
### POST `/purchase-orders/:id/approve` — Role: `admin`, `einkauf` (if approval_flow configured)
### POST `/purchase-orders/:id/send` — Mark as sent to supplier (status: `sent`)

**Status Flow:** `draft` → `pending_approval` → `approved` → `sent` → `delivered`

---

## 5. Delivery Notes (Lieferscheine)

### GET `/delivery-notes`
Filters: `?project_id=uuid&status=pending&date=2026-03-11&supplier_id=uuid`

### GET `/delivery-notes/calendar`
**Polier's main view.** Returns deliveries grouped by day.
```json
{
  "data": {
    "2026-03-11": [
      {
        "id": "uuid",
        "delivery_number": "LS-2026-0891",
        "supplier_name": "Betonwerk Südbayern GmbH",
        "project_name": "Neubau Residenz",
        "status": "pending",
        "expected_time": "08:30",
        "items_summary": "120 m³ Beton C25/30",
        "purchase_order_id": "uuid"
      }
    ],
    "2026-03-12": [...]
  }
}
```

### POST `/delivery-notes`
**Role:** `polier`, `einkauf`, `admin`
Upload + manual entry. For OCR upload, use `/delivery-notes/upload`.

```json
{
  "project_id": "uuid",
  "supplier_id": "uuid",
  "purchase_order_id": "uuid",
  "delivery_number": "LS-2026-0891",
  "delivery_date": "2026-03-11",
  "items": [
    {
      "product_id": "uuid",
      "quantity_ordered": 40,
      "quantity_delivered": 38.5,
      "unit": "m3",
      "notes": "Restmenge morgen"
    }
  ]
}
```

### POST `/delivery-notes/upload`
**Multipart upload.** Triggers OCR pipeline (Inngest job).

```
Content-Type: multipart/form-data
- file: PDF/JPG/PNG (max 20MB)
- project_id: uuid
- purchase_order_id: uuid (optional)
```

Response:
```json
{
  "id": "uuid",
  "status": "processing",
  "job_id": "inngest-job-uuid",
  "message": "Lieferschein wird verarbeitet. Status-Updates via WebSocket."
}
```

### POST `/delivery-notes/:id/confirm`
**Role:** `polier`
Polier confirms delivery on-site.

```json
{
  "status": "confirmed",
  "items": [
    {
      "id": "uuid",
      "quantity_confirmed": 38.5,
      "condition": "ok"
    }
  ],
  "photos": ["uuid-attachment-1"],
  "signature_data": "base64...",
  "notes": "2 Paletten leicht beschädigt, Foto dokumentiert"
}
```

### POST `/delivery-notes/:id/dispute`
**Role:** `polier`
```json
{
  "status": "disputed",
  "reason": "Falsche Betonsorte geliefert (C20/25 statt C25/30)",
  "photos": ["uuid-attachment"],
  "items": [
    { "id": "uuid", "quantity_confirmed": 0, "condition": "wrong_material" }
  ]
}
```

### POST `/delivery-notes/:id/attachments`
Upload photos (damage documentation, signed delivery note scan).

---

## 6. Invoices (Rechnungen)

### GET `/invoices`
Filters: `?status=ready_to_book&project_id=uuid&date_from=2026-01-01&date_to=2026-03-31`

```json
{
  "data": [
    {
      "id": "uuid",
      "invoice_number": "RE-2026-4521",
      "supplier_id": "uuid",
      "supplier_name": "Betonwerk Südbayern GmbH",
      "status": "ready_to_book",
      "total_cents": 1054500,
      "tax_cents": 168300,
      "net_cents": 886200,
      "invoice_date": "2026-03-05",
      "due_date": "2026-04-04",
      "skonto_date": "2026-03-19",
      "skonto_percent": 2.0,
      "skonto_amount_cents": 21090,
      "items": [...],
      "match_status": "matched",
      "match_confidence": 0.97,
      "ai_parsed": true,
      "ai_confidence": 0.95,
      "kontierung": {
        "kostenstelle": "KST-042",
        "sachkonto": "4400",
        "confidence": 0.92
      },
      "three_way_match": {
        "purchase_order_id": "uuid",
        "delivery_note_ids": ["uuid"],
        "price_deviation_pct": 0.0,
        "quantity_deviation_pct": -3.75,
        "status": "matched",
        "deviations": []
      },
      "pdf_url": "https://storage.baustruct.de/invoices/uuid.pdf",
      "created_at": "2026-03-06T10:00:00Z"
    }
  ]
}
```

### POST `/invoices/upload`
**Multipart upload.** Triggers AI parsing pipeline.

```
Content-Type: multipart/form-data
- file: PDF (max 20MB)
- project_id: uuid (optional — AI tries to auto-detect)
```

Response:
```json
{
  "id": "uuid",
  "status": "ai_processing",
  "job_id": "inngest-job-uuid",
  "estimated_seconds": 15
}
```

### GET `/invoices/:id/match`
Returns detailed 3-way-match breakdown.

```json
{
  "invoice_id": "uuid",
  "match_status": "deviation",
  "items": [
    {
      "invoice_item_id": "uuid",
      "description": "Beton C25/30",
      "invoice_quantity": 40,
      "invoice_unit_price_cents": 9200,
      "po_quantity": 40,
      "po_unit_price_cents": 8500,
      "delivered_quantity": 38.5,
      "price_deviation_pct": 8.24,
      "price_deviation_cents": 28000,
      "quantity_deviation_pct": -3.75,
      "status": "price_deviation",
      "flag": "⚠️ Preis 8.2% über Vertragspreis"
    }
  ],
  "total_price_deviation_cents": 28000,
  "recommendation": "manual_review"
}
```

### POST `/invoices/:id/approve`
**Role:** `buchhaltung`, `admin`

```json
{
  "kontierung": {
    "kostenstelle": "KST-042",
    "sachkonto": "4400"
  },
  "approved_amount_cents": 1054500,
  "use_skonto": true,
  "notes": "Preisabweichung mit Lieferant geklärt"
}
```

### POST `/invoices/:id/dispute`
**Role:** `buchhaltung`, `einkauf`

```json
{
  "reason": "Preisabweichung 8.2% nicht vereinbart",
  "notify_supplier": true
}
```

### POST `/invoices/:id/book`
**Role:** `buchhaltung`
Marks as booked → triggers ERP export (if configured).

---

## 7. Products (Produktkatalog)

### GET `/products`
Filters: `?category=CONC&supplier_id=uuid&search=Beton`

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Beton C25/30",
      "material_code": "CONC_C2530",
      "material_category_id": "uuid",
      "category_name": "Beton & Zement",
      "unit": "m3",
      "contract_prices": [
        {
          "supplier_id": "uuid",
          "supplier_name": "Betonwerk Südbayern GmbH",
          "price_cents": 8500,
          "valid_from": "2026-01-01",
          "valid_until": "2026-12-31"
        }
      ],
      "co2_factor_kg_per_unit": 0.075,
      "stlb_code": "LB 019"
    }
  ]
}
```

### POST `/products`
### PATCH `/products/:id`
### POST `/products/import` — CSV/Excel bulk import of price lists

---

## 8. Suppliers (Lieferanten)

### GET `/suppliers`
### POST `/suppliers`
### GET `/suppliers/:id`
### GET `/suppliers/:id/performance`

```json
{
  "supplier_id": "uuid",
  "name": "Betonwerk Südbayern GmbH",
  "metrics": {
    "total_orders": 42,
    "total_spend_cents": 89500000,
    "on_time_delivery_pct": 94.2,
    "price_accuracy_pct": 98.1,
    "dispute_rate_pct": 2.4,
    "co2_total_kg": 45200,
    "co2_per_eur": 0.051,
    "co2_rating": "GREEN"
  },
  "period": "last_12_months"
}
```

---

## 9. ESG / CO2 Endpoints

### GET `/esg/dashboard`
**Company-level ESG overview.**

```json
{
  "company_id": "uuid",
  "period": "2026-YTD",
  "co2_total_kg": 285000,
  "co2_total_t": 285.0,
  "scope_breakdown": {
    "scope1_kg": 12500,
    "scope2_kg": 8200,
    "scope3_kg": 264300
  },
  "scope3_pct": 92.7,
  "co2_per_eur": 0.042,
  "co2_per_sqm": 18.5,
  "vs_previous_year_pct": -7.2,
  "target": {
    "year": 2030,
    "target_co2_kg": 200000,
    "progress_pct": 42.5,
    "on_track": true
  },
  "top_materials": [
    { "name": "Beton", "co2_kg": 145000, "pct": 50.9 },
    { "name": "Stahl", "co2_kg": 68000, "pct": 23.9 },
    { "name": "Aluminium", "co2_kg": 22000, "pct": 7.7 }
  ]
}
```

### GET `/esg/projects/:id`
Project-level CO2 breakdown.

### GET `/esg/reports`
List generated CSRD/DGNB reports.

### POST `/esg/reports`
Generate new ESG report.
```json
{
  "report_type": "CSRD",
  "fiscal_year": 2026,
  "period_start": "2026-01-01",
  "period_end": "2026-12-31"
}
```

### GET `/esg/materials`
CO2 factor database (read-only for non-admins).

---

## 10. Analytics Endpoints

### GET `/analytics/spend`
```
?group_by=project|supplier|material&period=month&from=2026-01-01&to=2026-03-31
```

### GET `/analytics/documents`
Document processing metrics (North Star).
```json
{
  "period": "2026-03",
  "documents_processed": 342,
  "auto_match_rate": 0.946,
  "avg_processing_time_seconds": 12.4,
  "manual_interventions": 18,
  "by_type": {
    "delivery_notes": 198,
    "invoices": 144
  }
}
```

### GET `/analytics/budget`
Budget vs. actual per project.

### GET `/analytics/skonto`
Skonto utilization overview.

---

## 11. ERP Integration

### GET `/erp/config`
Current ERP integration status.

### POST `/erp/export`
Manual ERP export trigger.
```json
{
  "target": "rib_itwo",
  "invoice_ids": ["uuid1", "uuid2"],
  "format": "xml"
}
```

### GET `/erp/export/:id/status`
Export job status.

### POST `/erp/import/pricelist`
Import supplier price lists from ERP.

---

## 12. Notifications & Webhooks

### GET `/notifications`
User's notification feed.
```json
{
  "data": [
    {
      "id": "uuid",
      "type": "delivery_arriving",
      "title": "Lieferung in 30 Min",
      "body": "Betonwerk Südbayern: 40m³ C25/30 — Projekt München-Süd",
      "read": false,
      "action_url": "/delivery-notes/uuid",
      "created_at": "2026-03-11T07:58:00Z"
    }
  ]
}
```

### POST `/webhooks`
Register webhook for events (supplier portal, ERP).
```json
{
  "url": "https://erp.baufirma.de/webhook",
  "events": ["invoice.booked", "delivery_note.confirmed"],
  "secret": "whsec_..."
}
```

---

## 13. Error Responses

All errors follow this format:
```json
{
  "error": {
    "code": "INVOICE_NOT_FOUND",
    "message": "Rechnung mit ID xyz nicht gefunden.",
    "status": 404,
    "details": {}
  }
}
```

**Standard Error Codes:**
| Code | HTTP | Description |
|------|------|-------------|
| `UNAUTHORIZED` | 401 | Missing/invalid JWT |
| `FORBIDDEN` | 403 | Role insufficient for action |
| `NOT_FOUND` | 404 | Resource not found (or RLS blocked) |
| `VALIDATION_ERROR` | 422 | Request body validation failed |
| `CONFLICT` | 409 | Status transition not allowed |
| `RATE_LIMITED` | 429 | Too many requests |
| `AI_PROCESSING_FAILED` | 500 | OCR/AI pipeline error |

---

## 14. WebSocket Events

Real-time updates via WebSocket (`wss://api.baustruct.de/ws`).

| Event | Payload | Trigger |
|-------|---------|---------|
| `delivery.arriving` | `{ delivery_note_id, eta_minutes, supplier }` | Supplier ETA update |
| `delivery.confirmed` | `{ delivery_note_id, confirmed_by }` | Polier confirms |
| `invoice.parsed` | `{ invoice_id, confidence, match_status }` | AI parsing complete |
| `invoice.matched` | `{ invoice_id, match_result }` | 3-way-match done |
| `invoice.booked` | `{ invoice_id, erp_export_status }` | Booked to ERP |
| `co2.calculated` | `{ delivery_note_id, co2_kg }` | CO2 auto-calc done |

---

## 15. Rate Limits

| Tier | Requests/min | Burst |
|------|-------------|-------|
| Free | 60 | 10 |
| Starter | 300 | 50 |
| Business | 600 | 100 |
| Enterprise | 1200 | 200 |

Headers: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

---

## 16. Mobile API Notes (Expo App)

The mobile app (Polier) uses the same REST API with these additions:
- **Offline queue:** `POST /sync` — batch upload of offline-confirmed deliveries
- **Push tokens:** `POST /devices` — register FCM/APNs token
- **Compressed responses:** `Accept-Encoding: gzip` (saves ~70% bandwidth on-site)
- **Image upload:** Max 5MB per photo, auto-compressed client-side

---

*Autor: Hugo 🚀 | v1.0 — 2026-03-11*
*Nächste Schritte: Bob reviewed & implementiert Route-Struktur*
