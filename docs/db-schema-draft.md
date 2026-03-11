# BauGPT Procurement — DB Schema Draft
**Erstellt:** 2026-03-11 | Hugo 🚀 | **Status:** Draft für Bob

---

## Übersicht

PostgreSQL-Schema für BauGPT Procurement (Comstruct Clone).
3 Core-Flows: Bestellung → Lieferschein → Rechnung (3-Way-Match)

---

## Core Tables

### `companies` (Mandanten)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK, default gen_random_uuid() | |
| name | VARCHAR(255) | NOT NULL | Firmenname |
| slug | VARCHAR(100) | UNIQUE | URL-Slug |
| subscription_plan | VARCHAR(50) | DEFAULT 'free' | free/starter/pro/enterprise |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `users`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| company_id | UUID | FK → companies.id | |
| email | VARCHAR(255) | UNIQUE, NOT NULL | |
| name | VARCHAR(255) | NOT NULL | |
| role | VARCHAR(50) | NOT NULL | polier/einkauf/buchhaltung/admin |
| password_hash | VARCHAR(255) | | bcrypt |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `projects` (Baustellen)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| company_id | UUID | FK → companies.id | |
| name | VARCHAR(255) | NOT NULL | z.B. "Bürogebäude Maximilianstr." |
| code | VARCHAR(50) | | Projektnummer intern |
| address | TEXT | | Baustellenadresse |
| status | VARCHAR(50) | DEFAULT 'active' | active/completed/archived |
| budget | DECIMAL(15,2) | | Gesamtbudget |
| start_date | DATE | | |
| end_date | DATE | | |
| project_manager_id | UUID | FK → users.id | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `suppliers` (Lieferanten)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| company_id | UUID | FK → companies.id | Mandant |
| name | VARCHAR(255) | NOT NULL | |
| email | VARCHAR(255) | | Supplier-Kontakt |
| phone | VARCHAR(50) | | |
| address | TEXT | | |
| tax_id | VARCHAR(50) | | USt-ID |
| iban | VARCHAR(50) | | Für Zahlungen |
| payment_terms_days | INTEGER | DEFAULT 30 | Zahlungsziel |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

### `products` (Produktkatalog)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| company_id | UUID | FK → companies.id | |
| supplier_id | UUID | FK → suppliers.id | NULL = intern |
| name | VARCHAR(255) | NOT NULL | z.B. "Beton C25/30" |
| description | TEXT | | |
| unit | VARCHAR(50) | NOT NULL | m³, kg, Stk, t, m² |
| unit_price | DECIMAL(12,4) | | Vertragspreise |
| currency | VARCHAR(3) | DEFAULT 'EUR' | |
| category | VARCHAR(100) | | Beton/Stahl/Holz/Schrauben |
| is_active | BOOLEAN | DEFAULT true | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Bestellwesen

### `purchase_orders` (Bestellungen)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| company_id | UUID | FK → companies.id | |
| project_id | UUID | FK → projects.id | |
| supplier_id | UUID | FK → suppliers.id | |
| order_number | VARCHAR(100) | UNIQUE | Auto-generated |
| status | VARCHAR(50) | NOT NULL | draft/pending_approval/approved/sent/delivered/cancelled |
| created_by | UUID | FK → users.id | |
| approved_by | UUID | FK → users.id | NULL bis approved |
| requested_delivery_date | DATE | | |
| notes | TEXT | | |
| total_net | DECIMAL(15,2) | | Calc from items |
| total_vat | DECIMAL(15,2) | | |
| total_gross | DECIMAL(15,2) | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

### `purchase_order_items`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| purchase_order_id | UUID | FK → purchase_orders.id | |
| product_id | UUID | FK → products.id | |
| description | TEXT | | Override product name |
| quantity | DECIMAL(12,4) | NOT NULL | |
| unit | VARCHAR(50) | NOT NULL | |
| unit_price | DECIMAL(12,4) | NOT NULL | |
| vat_rate | DECIMAL(5,2) | DEFAULT 19.00 | % |
| total_net | DECIMAL(15,2) | GENERATED | qty * unit_price |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Lieferscheine

### `delivery_notes` (Lieferscheine)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| company_id | UUID | FK → companies.id | |
| project_id | UUID | FK → projects.id | |
| supplier_id | UUID | FK → suppliers.id | |
| purchase_order_id | UUID | FK → purchase_orders.id | NULL wenn spontan |
| delivery_number | VARCHAR(100) | | Lieferscheinnummer Lieferant |
| status | VARCHAR(50) | DEFAULT 'pending' | pending/confirmed/disputed/rejected |
| delivery_date | DATE | NOT NULL | |
| confirmed_by | UUID | FK → users.id | Polier |
| confirmed_at | TIMESTAMPTZ | | |
| notes | TEXT | | Auffälligkeiten |
| -- OCR/AI fields -- | | | |
| raw_text | TEXT | | OCR output |
| ai_confidence | DECIMAL(5,2) | | 0-100 AI parse confidence |
| ai_parsed_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

### `delivery_note_items`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| delivery_note_id | UUID | FK → delivery_notes.id | |
| product_id | UUID | FK → products.id | NULL wenn unbekannt |
| description | TEXT | NOT NULL | Aus Lieferschein |
| quantity_delivered | DECIMAL(12,4) | NOT NULL | |
| quantity_ordered | DECIMAL(12,4) | | Aus PO |
| unit | VARCHAR(50) | | |
| unit_price | DECIMAL(12,4) | | Aus Lieferschein |
| deviation_flag | BOOLEAN | DEFAULT false | Menge/Preis weicht ab |
| deviation_note | TEXT | | Beschreibung Abweichung |

### `delivery_note_attachments`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| delivery_note_id | UUID | FK → delivery_notes.id | |
| file_url | TEXT | NOT NULL | S3 URL |
| file_type | VARCHAR(50) | | pdf/jpeg/png |
| file_name | VARCHAR(255) | | |
| uploaded_by | UUID | FK → users.id | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Rechnungen

### `invoices` (Eingangsrechnungen)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| company_id | UUID | FK → companies.id | |
| supplier_id | UUID | FK → suppliers.id | |
| invoice_number | VARCHAR(100) | | Rechnungsnummer Lieferant |
| status | VARCHAR(50) | DEFAULT 'received' | received/ai_processing/ready_to_book/disputed/booked/paid |
| invoice_date | DATE | NOT NULL | |
| due_date | DATE | | Fälligkeitsdatum |
| payment_date | DATE | | Tatsächliche Zahlung |
| total_net | DECIMAL(15,2) | NOT NULL | |
| total_vat | DECIMAL(15,2) | NOT NULL | |
| total_gross | DECIMAL(15,2) | NOT NULL | |
| currency | VARCHAR(3) | DEFAULT 'EUR' | |
| -- 3-Way-Match -- | | | |
| three_way_match_status | VARCHAR(50) | | matched/partial/deviation |
| match_confidence | DECIMAL(5,2) | | AI confidence % |
| -- AI fields -- | | | |
| raw_text | TEXT | | OCR output |
| ai_parsed_at | TIMESTAMPTZ | | |
| ai_booking_suggestion | JSONB | | KI-Kontierungsvorschlag |
| -- ERP -- | | | |
| erp_booking_code | VARCHAR(100) | | Kostenstelle/Sachkonto |
| erp_exported_at | TIMESTAMPTZ | | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | |

### `invoice_items`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | UUID | PK | |
| invoice_id | UUID | FK → invoices.id | |
| delivery_note_item_id | UUID | FK → delivery_note_items.id | NULL wenn kein Match |
| description | TEXT | NOT NULL | |
| quantity | DECIMAL(12,4) | NOT NULL | |
| unit | VARCHAR(50) | | |
| unit_price | DECIMAL(12,4) | NOT NULL | |
| vat_rate | DECIMAL(5,2) | DEFAULT 19.00 | |
| total_net | DECIMAL(15,2) | | |
| deviation_flag | BOOLEAN | DEFAULT false | |

### `invoice_purchase_order_links` (3-Way-Match Verknüpfung)
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| invoice_id | UUID | FK → invoices.id | PK composite |
| purchase_order_id | UUID | FK → purchase_orders.id | PK composite |
| delivery_note_id | UUID | FK → delivery_notes.id | |
| matched_at | TIMESTAMPTZ | DEFAULT NOW() | |
| matched_by | VARCHAR(50) | | ai/manual |

---

## Analytics & Audit

### `audit_log`
| Column | Type | Constraints | Notes |
|--------|------|-------------|-------|
| id | BIGSERIAL | PK | |
| company_id | UUID | FK → companies.id | |
| user_id | UUID | FK → users.id | NULL für AI actions |
| entity_type | VARCHAR(100) | NOT NULL | purchase_order/invoice/delivery_note |
| entity_id | UUID | NOT NULL | |
| action | VARCHAR(50) | NOT NULL | created/updated/approved/rejected/booked |
| changes | JSONB | | Old vs new values |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | |

---

## Key Indexes

```sql
-- Performance
CREATE INDEX idx_purchase_orders_project ON purchase_orders(project_id);
CREATE INDEX idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX idx_delivery_notes_project ON delivery_notes(project_id);
CREATE INDEX idx_delivery_notes_status ON delivery_notes(status);
CREATE INDEX idx_invoices_company_status ON invoices(company_id, status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date) WHERE payment_date IS NULL;
CREATE INDEX idx_audit_log_entity ON audit_log(entity_type, entity_id);

-- Full-text search
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('german', name));
CREATE INDEX idx_suppliers_name ON suppliers USING gin(to_tsvector('german', name));
```

---

## Status Flow Übersicht

```
Purchase Order:  draft → pending_approval → approved → sent → delivered
Delivery Note:   pending → confirmed / disputed / rejected
Invoice:         received → ai_processing → ready_to_book → booked / disputed → paid
```

---

## Notes für Bob

- **Multi-Tenant:** company_id überall — Row Level Security (RLS) in Supabase empfohlen
- **OCR/AI:** raw_text + ai_confidence Felder für Async-Processing (Queue-basiert)
- **3-Way-Match:** `invoice_purchase_order_links` ist der Kern — kann NULL sein wenn kein PO vorhanden
- **Soft Delete:** Empfehle `deleted_at` Spalte statt hartem DELETE für Audit-Zwecke
- **Migrations:** Flyway oder Prisma Migrate empfohlen
- **Supabase:** Kompatibel — direkt als PostgreSQL nutzbar mit RLS Policies pro Role

---

*Erstellt: Hugo 🚀 | 2026-03-11 | Basis für Bob's Backend-Implementierung*
