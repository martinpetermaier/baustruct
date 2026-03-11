# BauGPT Procurement — MVP Feature Spec (Phase 1)
**Für Bob — Konkrete Build-Anleitung** | Hugo 🚀 | 2026-03-11

---

## Was wir in Phase 1 bauen

**Scope:** Minimales, aber echtes Produkt das den Kern-Wert von Comstruct liefert.
**Zeitrahmen:** 6-8 Wochen (2 Engineers)
**Ziel:** 20 Beta-Kunden aus BauGPT Pro Netzwerk gewinnen

---

## SCREEN 1: Dashboard (Web — alle Rollen)

**Route:** `/dashboard`

**Komponenten:**
```
Header
  Logo | Projektname | User Avatar | Logout

Sidebar
  🏗️ Baustelle    → /field
  🛒 Einkauf      → /procurement
  💼 Finanzen     → /finance
  ⚙️ Einstellungen → /settings

Main Content (rollenabhängig — siehe Screens 2-4)
```

**State Management:**
- Aktives Projekt via Context/URL param (`/dashboard?project=uuid`)
- Rolle via JWT Claims (`role: site_manager | procurement | finance | admin`)

---

## SCREEN 2: Baustelle — Lieferkalender

**Route:** `/field/calendar`
**Rolle:** `site_manager`

**Komponenten:**
```
ProjectSelector          ← Dropdown, aktuelles Projekt
DateNav                  ← Heute / Vor / Zurück
DeliveryList
  DeliveryCard
    supplier_name
    expected_at (Zeit)
    items_summary (z.B. "3 Positionen — Beton, Stahl, Schalung")
    status_badge (PENDING | ARRIVING | DELIVERED | REJECTED)
    [Details →] Button

FAB (Floating Action Button)
  [+ Lieferung melden] → öffnet QuickDeliveryForm
```

**API Calls:**
- `GET /api/deliveries?project_id=&date=2026-03-11`

---

## SCREEN 3: Baustelle — Lieferschein bestätigen

**Route:** `/field/delivery/:id`
**Rolle:** `site_manager`

**Komponenten:**
```
DeliveryHeader
  Lieferant | Datum | Bestellnummer

LineItemList
  LineItem (per Position)
    description | ordered_qty | delivered_qty | unit | unit_price
    [✓ OK] [✗ Abweichung]

AbweichungForm (wenn Abweichung markiert)
  actual_qty (Input)
  damage_description (Textarea)
  Photos (Camera/Upload, max 5)

ActionBar
  [Ablehnen] [Bestätigen →]

ConfirmModal
  "Lieferschein bestätigen? Diese Aktion kann nicht rückgängig gemacht werden."
  [Abbrechen] [Jetzt bestätigen]
```

**API Calls:**
- `GET /api/deliveries/:id`
- `PATCH /api/deliveries/:id` mit `{ status, line_items: [{id, delivered_qty, damage_note}], photos }`

**After Confirm:**
- Status → `DELIVERED`
- Buchhaltung bekommt Notification: "Lieferschein bestätigt — bereit für Rechnungsprüfung"

---

## SCREEN 4: Finanzen — Rechnungseingang

**Route:** `/finance/invoices`
**Rolle:** `finance`

**Komponenten:**
```
InvoiceStatusTabs
  Alle | Buchungsfertig ✓ | Prüfung nötig ⚠️ | Gebucht

InvoiceList
  InvoiceCard
    supplier_name | invoice_number | invoice_date | amount
    match_status_badge
      ✅ Buchungsfertig (3-Way-Match OK)
      ⚠️ Abweichung (X Positionen)
      🔄 Verarbeitung läuft
    [Prüfen →]

BulkActions
  [ ] Alle auswählen | [In ERP buchen]
```

**API Calls:**
- `GET /api/invoices?project_id=&status=`

---

## SCREEN 5: Finanzen — Rechnungsdetail & KI-Prüfung

**Route:** `/finance/invoices/:id`
**Rolle:** `finance`

**Layout: Split View**
```
Left (40%): PDF Viewer
  Originalrechnung als PDF
  Highlighting bei Abweichungen

Right (60%): KI-Analyse
  MatchSummary
    3-Way-Match: ✅ Bestellung ✅ Lieferschein ⚠️ Preis
    Gesamt: €12.450,00 (Rechnung) vs €12.200,00 (Bestellung)
    Differenz: +€250,00 (+2,04%)

  LineItemComparison (Tabelle)
    Position | Bestellt | Geliefert | Berechnet | Status
    Beton C25 | 50m³/€80 | 50m³ | 50m³/€85 | ⚠️ +6,25%
    Stahl | 2t/€900 | 2t | 2t/€900 | ✅

  KICodingProposal
    Sachkonto: 6200 (Materialkosten)
    Kostenstelle: P-2026-042
    [Übernehmen ✓] [Anpassen]

  ActionBar
    [Lieferant kontaktieren] [Ablehnen] [Genehmigen & buchen →]
```

**API Calls:**
- `GET /api/invoices/:id` (inkl. match_result, line_item_comparison, coding_proposal)
- `POST /api/invoices/:id/approve` → triggert ERP-Buchung
- `POST /api/invoices/:id/reject` mit rejection_reason

---

## SCREEN 6: Einkauf — Bestellungen

**Route:** `/procurement/orders`
**Rolle:** `procurement`

**Komponenten:**
```
OrderTabs: Entwurf | Freigabe ausstehend | Bestellt | Abgeschlossen

OrderList
  OrderCard
    project | supplier | created_by | total_amount | status
    [Details →]

[+ Neue Bestellung] Button → /procurement/orders/new
```

---

## SCREEN 7: Einkauf — Neue Bestellung

**Route:** `/procurement/orders/new`
**Rolle:** `procurement | site_manager`

**Komponenten:**
```
Step 1: Projekt & Lieferant
  ProjectSelect (Dropdown)
  SupplierSelect (Dropdown, gefiltert nach Projekt)
  DeliveryDate (DatePicker)

Step 2: Positionen
  ProductSearch (aus Produktkatalog)
  LineItemForm
    product | quantity | unit | unit_price (auto-fill aus Vertrag)
  [+ Position hinzufügen]

Step 3: Zusammenfassung
  Order Preview
  Gesamtbetrag
  [Speichern als Entwurf] [Zur Freigabe einreichen →]
```

---

## KI-Pipeline (Backend — kein UI)

### OCR + Parsing
```
Input: PDF (Rechnung oder Lieferschein)
Step 1: pdf-parse → raw text
Step 2: OpenAI GPT-4o → structured JSON
  {
    invoice_number, invoice_date, supplier_name,
    total_amount, tax_amount,
    line_items: [{
      description, quantity, unit, unit_price, total
    }]
  }
Step 3: Fuzzy-match auf Products & Suppliers
Step 4: 3-Way-Match Berechnung
Step 5: Coding Proposal generieren
```

### 3-Way-Match Algorithmus
```
für jede invoice_line_item:
  matched_po_item = find by product_id + tolerance(±5%)
  matched_dn_item = find by delivery_note + product_id
  
  if qty_match AND price_match:
    status = MATCH_OK
  elif qty_diff > 5% OR price_diff > 2%:
    status = MISMATCH (+ reason)
  else:
    status = MATCH_WITH_WARNING
    
overall_status:
  ALL OK → BOOKING_READY
  ANY MISMATCH → REVIEW_REQUIRED
```

---

## API Routes (vollständig)

```
AUTH
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/me

PROJECTS
GET    /api/projects
POST   /api/projects
GET    /api/projects/:id

SUPPLIERS
GET    /api/suppliers
POST   /api/suppliers
GET    /api/suppliers/:id

PRODUCTS
GET    /api/products?project_id=
POST   /api/products

ORDERS (Purchase Orders)
GET    /api/orders?project_id=&status=
POST   /api/orders
GET    /api/orders/:id
PATCH  /api/orders/:id
POST   /api/orders/:id/submit     ← Freigabe anfordern
POST   /api/orders/:id/approve    ← Einkauf genehmigt
POST   /api/orders/:id/reject

DELIVERY NOTES
GET    /api/deliveries?project_id=&date=
POST   /api/deliveries              ← manuell anlegen
GET    /api/deliveries/:id
PATCH  /api/deliveries/:id          ← bestätigen/ablehnen
POST   /api/deliveries/:id/photos   ← Foto upload

INVOICES
GET    /api/invoices?project_id=&status=
POST   /api/invoices                ← PDF upload → triggers KI-Pipeline
GET    /api/invoices/:id
POST   /api/invoices/:id/approve    ← + ERP-Buchung
POST   /api/invoices/:id/reject

USERS
GET    /api/users?company_id=
POST   /api/users/invite
PATCH  /api/users/:id/role

WEBHOOKS (ERP Integration)
POST   /api/webhooks/erp/rib
POST   /api/webhooks/erp/sap
```

---

## Tech Entscheidungen (Final)

| Layer | Technologie | Begründung |
|---|---|---|
| Frontend | Next.js 14 (App Router) | BauGPT-Standard |
| UI | shadcn/ui + Tailwind | Design System |
| Backend | Next.js API Routes | Same Repo |
| DB | PostgreSQL (Supabase) | BauGPT-Standard, RLS |
| ORM | Prisma | Type-safe, Migrations |
| Auth | Supabase Auth | Multi-Tenant ready |
| File Storage | Supabase Storage | PDFs, Fotos |
| KI/OCR | OpenAI GPT-4o | API bereits vorhanden |
| Background Jobs | Supabase Edge Functions | PDF-Processing async |
| Hosting | Vercel | BauGPT-Standard |

---

## Definition of Done — Phase 1

- [ ] Nutzer kann sich einloggen (3 Rollen)
- [ ] Polier sieht Lieferungen des Tages
- [ ] Polier kann Lieferschein bestätigen (mit Foto)
- [ ] Buchhalter kann Rechnung hochladen (PDF)
- [ ] KI liest Rechnung aus (>90% Accuracy)
- [ ] 3-Way-Match wird angezeigt (auch wenn manuell)
- [ ] Buchhalter kann Rechnung genehmigen
- [ ] Einkäufer kann Bestellung anlegen & freigeben
- [ ] E-Mail Notification bei Status-Änderungen
- [ ] Mobile-responsive (Polier nutzt Handy)

---

*Bob: Das ist dein Build-Plan. Start mit DB Setup → Auth → API Routes → Frontend.*
*Bei Fragen → Hugo taggen in Discord. 🚀*
