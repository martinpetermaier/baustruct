# BauGPT Procurement — Analytics & ESG Datenmodell
**Erstellt:** 2026-03-11 | **Autor:** Rainman 👨🏻‍🔧 | **Status:** v1.0

---

## 📋 Übersicht

Comstruct's ESG-Vorteil liegt im **automatischen CO2-Tracking auf Positionsebene** — jede Materiallieferung erzeugt Verbrauchsdaten, die direkt mit CO2-Faktoren verknüpft werden. Das eliminiert manuelle ESG-Erhebungen vollständig.

**BauGPT repliziert diese Mechanik** und baut darüber hinaus ein vollständiges Analytics-Layer für:
- CO2/ESG Reporting (CSRD, DGNB, Scope 1/2/3)
- Kosten-Analytics pro Projekt, Lieferant, Material
- Einkaufs- und Verbrauchsauswertungen
- Predictive KPIs (Budgetabweichung, CO2-Forecast)

---

## 🏗️ ESG Datenmodell

### Kern-Idee: CO2 entsteht am Lieferschein

```
Bestellung → Lieferschein ↔ [Material × Menge] → × CO2-Faktor = CO2-Emissionen
                                   ↓
                         ESG Report (CSRD/DGNB)
```

Comstruct tracked CO2 nicht separat — es ist ein **Nebenprodukt des Procure-to-Pay Flows**. Jeder gebuchte Lieferschein erzeugt automatisch CO2-Daten.

---

## 📊 Neue Analytics-Tabellen

### `material_categories` — Materialkategorien mit CO2-Faktoren

```sql
CREATE TABLE material_categories (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,         -- z.B. "Beton", "Stahl", "Holz"
  code            VARCHAR(20)  UNIQUE,            -- z.B. "CONC", "STEEL", "WOOD"
  parent_id       UUID REFERENCES material_categories(id), -- Hierarchie
  co2_scope       VARCHAR(10) DEFAULT 'scope3',  -- scope1 / scope2 / scope3
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

### `co2_emission_factors` — CO2-Faktoren pro Material

Dies ist das **Herzstück** des ESG-Modells. Comstruct nutzt Datenbanken wie ÖKOBAUDAT und ECO Portal.

```sql
CREATE TABLE co2_emission_factors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_category_id UUID REFERENCES material_categories(id),
  source          VARCHAR(50) NOT NULL,           -- 'OEKOBAUDAT' | 'EC3' | 'CUSTOM' | 'DEFRA'
  region          VARCHAR(10) DEFAULT 'DE',        -- ISO country code
  unit            VARCHAR(20) NOT NULL,            -- 'kg', 't', 'm3', 'm2', 'pcs'
  co2_kg_per_unit DECIMAL(12,4) NOT NULL,         -- kg CO2e pro Einheit
  co2_a1_a3       DECIMAL(12,4),                  -- Embodied Carbon: Rohstoff bis Werkstor
  co2_a4          DECIMAL(12,4),                  -- Transport zur Baustelle
  co2_a5          DECIMAL(12,4),                  -- Einbau auf Baustelle
  valid_from      DATE NOT NULL,
  valid_until     DATE,
  is_active       BOOLEAN DEFAULT true,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

**Scope-Mapping (GHG Protocol):**
| Scope | Was | Beispiel |
|-------|-----|---------|
| Scope 1 | Direkte Emissionen (Baustelle) | Dieselverbrauch Maschinen |
| Scope 2 | Gekaufte Energie | Strom, Fernwärme auf Baustelle |
| Scope 3 | Lieferkette (Materialien) | Beton, Stahl, Holz — **80-90% des Fußabdrucks** |

---

### `delivery_note_line_co2` — CO2 pro Lieferschein-Position

Wird **automatisch** beim Buchen eines Lieferscheins berechnet. Kein manueller Aufwand.

```sql
CREATE TABLE delivery_note_line_co2 (
  id                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_note_line_id     UUID NOT NULL,  -- FK → delivery_note_lines.id (Bob's Schema)
  project_id                UUID NOT NULL,  -- FK → projects.id
  company_id                UUID NOT NULL,  -- FK → companies.id
  material_category_id      UUID REFERENCES material_categories(id),
  co2_emission_factor_id    UUID REFERENCES co2_emission_factors(id),
  quantity                  DECIMAL(12,3) NOT NULL,
  unit                      VARCHAR(20) NOT NULL,
  co2_kg_total              DECIMAL(14,4),          -- quantity × co2_kg_per_unit
  co2_scope                 VARCHAR(10),             -- scope1 / scope2 / scope3
  co2_phase                 VARCHAR(10),             -- a1_a3 / a4 / a5
  calculation_method        VARCHAR(50),             -- 'factor_db' | 'manual' | 'estimated'
  delivery_date             DATE NOT NULL,
  created_at                TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `project_esg_snapshots` — Tägliche ESG-Aggregation pro Projekt

Materialized Snapshots für schnelle Dashboard-Queries.

```sql
CREATE TABLE project_esg_snapshots (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id      UUID NOT NULL REFERENCES projects(id),
  company_id      UUID NOT NULL REFERENCES companies(id),
  snapshot_date   DATE NOT NULL,
  period_type     VARCHAR(10) NOT NULL,             -- 'day' | 'week' | 'month' | 'quarter' | 'year'

  -- CO2 Scope Breakdown
  co2_scope1_kg   DECIMAL(14,2) DEFAULT 0,          -- Direkte Emissionen
  co2_scope2_kg   DECIMAL(14,2) DEFAULT 0,          -- Energie
  co2_scope3_kg   DECIMAL(14,2) DEFAULT 0,          -- Materialien (Hauptteil)
  co2_total_kg    DECIMAL(14,2) DEFAULT 0,           -- Summe

  -- CO2 Phase Breakdown (LCA)
  co2_a1_a3_kg    DECIMAL(14,2) DEFAULT 0,          -- Embodied Carbon
  co2_a4_kg       DECIMAL(14,2) DEFAULT 0,           -- Transport
  co2_a5_kg       DECIMAL(14,2) DEFAULT 0,           -- Einbau

  -- Finanz-Metriken
  total_spend_eur DECIMAL(15,2) DEFAULT 0,
  invoice_count   INTEGER DEFAULT 0,
  delivery_count  INTEGER DEFAULT 0,

  -- CO2-Intensität
  co2_per_eur_spend DECIMAL(10,6),                   -- kg CO2 pro € Ausgabe
  co2_per_sqm     DECIMAL(10,4),                     -- kg CO2 pro m² BGF (falls bekannt)

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (project_id, snapshot_date, period_type)
);
```

---

### `company_esg_targets` — CO2-Ziele & Benchmarks

```sql
CREATE TABLE company_esg_targets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  target_year     INTEGER NOT NULL,                  -- z.B. 2030, 2045
  target_type     VARCHAR(50) NOT NULL,              -- 'net_zero' | 'reduction_pct' | 'intensity'
  baseline_year   INTEGER,
  baseline_co2_kg DECIMAL(14,2),
  target_co2_kg   DECIMAL(14,2),
  reduction_pct   DECIMAL(5,2),                      -- z.B. 50.00 = 50% Reduktion
  framework       VARCHAR(50),                        -- 'CSRD' | 'DGNB' | 'SBTi' | 'internal'
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

---

### `esg_reports` — Compliance Reports (CSRD, DGNB)

```sql
CREATE TABLE esg_reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      UUID NOT NULL REFERENCES companies(id),
  report_type     VARCHAR(50) NOT NULL,              -- 'CSRD' | 'DGNB' | 'GRI' | 'custom'
  fiscal_year     INTEGER NOT NULL,
  status          VARCHAR(30) DEFAULT 'draft',       -- draft / in_review / final / submitted
  period_start    DATE NOT NULL,
  period_end      DATE NOT NULL,

  -- Aggregated Scope Data
  scope1_total_kg  DECIMAL(14,2),
  scope2_total_kg  DECIMAL(14,2),
  scope3_total_kg  DECIMAL(14,2),
  total_co2_kg     DECIMAL(14,2),

  -- vs. Targets
  target_id        UUID REFERENCES company_esg_targets(id),
  target_achieved  BOOLEAN,
  reduction_vs_baseline_pct DECIMAL(5,2),

  -- Report Metadata
  auditor          VARCHAR(255),
  audit_date       DATE,
  pdf_url          TEXT,                              -- Generated Report URL
  data_quality     VARCHAR(20),                       -- 'high' | 'medium' | 'estimated'
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  published_at     TIMESTAMPTZ
);
```

---

## 📈 Analytics Views (Materialised)

### `mv_project_co2_by_material` — CO2 nach Materialkategorie

```sql
CREATE MATERIALIZED VIEW mv_project_co2_by_material AS
SELECT
  p.company_id,
  p.id AS project_id,
  p.name AS project_name,
  mc.name AS material_category,
  mc.code AS material_code,
  dnl.co2_scope,
  DATE_TRUNC('month', dnl.delivery_date) AS month,
  SUM(dnl.quantity) AS total_quantity,
  SUM(dnl.co2_kg_total) AS total_co2_kg,
  COUNT(*) AS delivery_line_count
FROM delivery_note_line_co2 dnl
JOIN projects p ON p.id = dnl.project_id
JOIN material_categories mc ON mc.id = dnl.material_category_id
GROUP BY 1,2,3,4,5,6,7;

CREATE UNIQUE INDEX ON mv_project_co2_by_material (company_id, project_id, material_code, co2_scope, month);
```

### `mv_supplier_co2_performance` — CO2-Footprint nach Lieferant

```sql
CREATE MATERIALIZED VIEW mv_supplier_co2_performance AS
SELECT
  s.company_id,
  s.id AS supplier_id,
  s.name AS supplier_name,
  DATE_TRUNC('month', dnl.delivery_date) AS month,
  SUM(dnl.co2_kg_total) AS total_co2_kg,
  SUM(inv.total_amount) AS total_spend_eur,
  SUM(dnl.co2_kg_total) / NULLIF(SUM(inv.total_amount), 0) AS co2_per_eur,
  COUNT(DISTINCT dnl.project_id) AS project_count
FROM delivery_note_line_co2 dnl
JOIN delivery_note_lines dl ON dl.id = dnl.delivery_note_line_id
JOIN delivery_notes dn ON dn.id = dl.delivery_note_id
JOIN suppliers s ON s.id = dn.supplier_id
LEFT JOIN invoice_lines il ON il.delivery_note_line_id = dl.id
LEFT JOIN invoices inv ON inv.id = il.invoice_id
GROUP BY 1,2,3,4;
```

---

## 🎯 KPI-Definitionen

### Kern-KPIs für ESG Dashboard

| KPI | Formel | Ziel | CSRD-Relevant |
|-----|--------|------|---------------|
| **Total CO2 (t)** | `SUM(co2_total_kg) / 1000` | Trending ↓ | ✅ |
| **CO2-Intensität (kg/€)** | `co2_total_kg / total_spend_eur` | Benchmark | ✅ |
| **CO2-Intensität (kg/m²)** | `co2_total_kg / project_sqm` | Branchenvergleich | ✅ |
| **Scope 3 Anteil (%)** | `co2_scope3_kg / co2_total_kg` | < 90% | ✅ |
| **Top CO2-Material** | Max-Kategorie | Aktionsfeld | ✅ |
| **Reduction vs. Vorjahr (%)** | `(CO2_t-1 - CO2_t) / CO2_t-1` | > 5% p.a. | ✅ |
| **DGNB-Score (geschätzt)** | Aus CO2 + Abfall + Wasser | Zertifizierung | ✅ |
| **Supplier CO2-Risk** | Lieferanten ohne CO2-Daten / Gesamt | < 10% | ⚠️ |

### Operationelle KPIs (Procurement)

| KPI | Formel | Ziel |
|-----|--------|------|
| **Invoice Match Rate** | `auto_matched / total_invoices` | > 95% |
| **Rechnungsprüfzeit (h)** | Ø Zeit bis Freigabe | < 1h |
| **Budgetabweichung (%)** | `(actual - budget) / budget` | < 5% |
| **Skonto-Ausschöpfung (%)** | `skonti_genutzt / skonti_verfügbar` | > 90% |
| **Lieferantentreue** | Vertragspreise vs. abgerechnete Preise | < 2% Abw. |
| **Digitalisierungsgrad** | Digitale Lieferscheine / Gesamt | > 80% |

---

## 📊 Reporting-Struktur

### Dashboard-Hierarchie

```
Company Dashboard (Gesamt)
├── ESG Overview
│   ├── CO2 by Scope (1/2/3) — Donut Chart
│   ├── CO2 Trend (12 Monate) — Line Chart
│   ├── CO2 by Material Category — Bar Chart
│   ├── Top 5 CO2-Projekte — Ranking
│   ├── Supplier CO2-Performance — Heatmap
│   └── Target Tracking (Ziel vs. Ist) — Gauge
│
├── Procurement Analytics
│   ├── Spend by Project — Treemap
│   ├── Material Cost Trends — Line
│   ├── Supplier Spend Concentration — Pie
│   ├── Invoice Processing Metrics
│   └── Budget vs. Actual by Project
│
└── CSRD / DGNB Report Builder
    ├── Auto-Generated Draft (PDF)
    ├── Data Quality Check
    └── Audit Trail

Project Dashboard (je Baustelle)
├── CO2 Timeline
├── Material Verbrauch (Tabelle + Chart)
├── Budget-Tracking
├── Lieferschein-Übersicht
└── ESG-Ampel (Green/Yellow/Red vs. Ziel)
```

---

## 🔄 Datenfluss: Vom Lieferschein zum ESG-Report

```
1. Lieferschein wird auf Baustelle digital bestätigt
          ↓
2. OCR/KI extrahiert Positionen (Material, Menge, Einheit)
          ↓
3. Automatisches Mapping auf material_categories (fuzzy match + manual fallback)
          ↓
4. Lookup co2_emission_factors (nach Kategorie + Region + aktuellstem Factor)
          ↓
5. Berechnung: co2_kg_total = quantity × co2_kg_per_unit
          ↓
6. INSERT INTO delivery_note_line_co2
          ↓
7. Täglicher Cronjob: Refresh project_esg_snapshots
          ↓
8. Dashboard zieht aus Snapshots (sub-100ms Queries)
          ↓
9. Quartalsweise: CSRD-Report-Generierung aus esg_reports
```

---

## 🇩🇪 CSRD Compliance — Was BauGPT abdecken muss

**Corporate Sustainability Reporting Directive (ab 2025 für >500 MA, ab 2026 für >250 MA)**

| CSRD-Anforderung | BauGPT Abdeckung | Status |
|-----------------|-----------------|--------|
| Scope 1 Emissionen | Direkte Energieverbräuche Baustelle | ⚠️ Manuell erfassen |
| Scope 2 Emissionen | Strom-Tracking per Projekt | ⚠️ Manuell erfassen |
| Scope 3 Upstream | Materialbeschaffung (Lieferscheine) | ✅ Automatisch |
| Scope 3 Downstream | Abfallentsorgung, Logistik | ⚠️ Phase 2 |
| Audit Trail | Vollständige Datenherkunft | ✅ DB-Level |
| Datengranularität | Positions-Ebene | ✅ |
| Vergleichsperiode | Vorjahresvergleich | ✅ Snapshots |
| Externe Prüfbarkeit | Auditierbare Rohdaten | ✅ |

**→ Quick Win:** Comstruct bewirbt genau diesen Scope-3-Vorteil. BauGPT repliziert ihn durch den Procure-to-Pay Flow.

---

## 🏆 DGNB Scoring (Deutsche Gesellschaft für Nachhaltiges Bauen)

DGNB bewertet u.a. den **Global Warming Potential (GWP)** von Gebäuden.

Relevante Berechnungen aus BauGPT-Daten:
- **GWP Herstellung (A1-A3):** `SUM(co2_a1_a3_kg)` pro Projekt
- **GWP Transport (A4):** `SUM(co2_a4_kg)` pro Projekt
- **GWP Errichtung (A5):** `SUM(co2_a5_kg)` pro Projekt
- **GWP Gesamt (A1-A5):** `co2_total_kg` pro Projekt

BauGPT kann den DGNB-Report vorausfüllen — das ist **echter Kundenwert**.

---

## 📦 CO2-Faktoren Datenbank (Initialbefüllung)

Wichtigste Materialien im Bau nach Mengenanteil:

| Material | Kategorie | CO2-Faktor | Einheit | Quelle |
|---------|-----------|-----------|--------|--------|
| Beton C25/30 | CONC | 0.159 | kg/kg | ÖKOBAUDAT |
| Bewehrungsstahl | STEEL_REINF | 0.740 | kg/kg | ÖKOBAUDAT |
| Baustahl S235 | STEEL_STRUCT | 1.550 | kg/kg | ÖKOBAUDAT |
| Brettsperrholz (CLT) | WOOD_CLT | -0.490 | kg/kg | ÖKOBAUDAT (CO2-Speicher!) |
| Kalksandstein | BRICK_KS | 0.157 | kg/kg | ÖKOBAUDAT |
| Porenbetonstein | BRICK_POROTON | 0.350 | kg/kg | ÖKOBAUDAT |
| Mineralwolle | INS_MW | 1.280 | kg/kg | ÖKOBAUDAT |
| EPS Dämmung | INS_EPS | 3.290 | kg/kg | ÖKOBAUDAT |
| Glaswolle | INS_GW | 1.350 | kg/kg | ÖKOBAUDAT |
| Gips-Kartonplatte | GYP | 0.385 | kg/kg | ÖKOBAUDAT |
| Aluminium (Primär) | ALU | 8.240 | kg/kg | ÖKOBAUDAT |
| PVC (Fenster) | PVC | 2.940 | kg/kg | ÖKOBAUDAT |
| Diesel Baumaschinen | FUEL_DIESEL | 2.640 | kg/liter | DEFRA |
| Baustrom | ENERGY_ELEC | 0.420 | kg/kWh | UBA 2024 |

**→ MVP:** Top 20 Materialien abdecken = ~80% aller Scope-3-Emissionen im Bau.

---

## 🛠️ Implementation Roadmap

### Phase 1 — ESG Foundation (Sprint 1-2)
- [ ] `material_categories` + seed data (Top 50 Kategorien)
- [ ] `co2_emission_factors` + ÖKOBAUDAT-Import
- [ ] `delivery_note_line_co2` — Auto-Berechnung bei Lieferschein-Buchung
- [ ] Fuzzy-Matching: Freitext-Material → Kategorie (KI)

### Phase 2 — Reporting (Sprint 3-4)
- [ ] `project_esg_snapshots` + täglicher Cronjob
- [ ] ESG Dashboard (CO2 by Scope, by Material, Trend)
- [ ] CSRD-Report Draft (PDF-Export)
- [ ] `company_esg_targets` + Target Tracking

### Phase 3 — Advanced (Sprint 5+)
- [ ] Supplier CO2-Benchmarking + Lieferantenvergleich
- [ ] DGNB-Score-Berechnung
- [ ] Scope 1+2 (manuelle Energie-Erfassung)
- [ ] Predictive CO2-Forecast (ML-basiert)
- [ ] API für externe ESG-Tools (RIB ESG Manager)

---

## 🔗 Abhängigkeiten zu Bob's Schema

Folgende Tabellen aus `db-schema-draft.md` werden referenziert:

| Tabelle | Referenz aus Analytics |
|---------|----------------------|
| `projects` | Alle ESG-Aggregationen |
| `companies` | Mandantentrennung |
| `suppliers` | Supplier CO2-Performance |
| `delivery_note_lines` | Positions-CO2-Berechnung |
| `delivery_notes` | Header-Daten (Datum, Lieferant) |
| `invoices` | Spend-Korrelation |
| `products` | Material-Matching |

**→ Bob** bitte `delivery_note_lines` eine `material_category_id` Spalte spendieren (optional, für automatisches Mapping).

---

## 📝 Open Questions

1. **ÖKOBAUDAT-Lizenz:** Freie Nutzung für Softwareprodukte? Oder EC3 (open-source) nutzen?
2. **Fuzzy-Matching-Genauigkeit:** Wie mit unklaren Materialbezeichnungen umgehen? → Fallback-Workflow nötig
3. **Scope 1+2 Erfassung:** Manuell im MVP oder IoT-Integration (Phase 2)?
4. **Multi-Tenant CO2-Faktoren:** Globale Faktoren oder firmeneigene Faktoren erlauben?

---

*v1.0 | Rainman 👨🏻‍🔧 | 2026-03-11 | BauGPT Analytics Team*
*Basiert auf: Comstruct-Analyse, ÖKOBAUDAT, GHG Protocol, CSRD ESRS E1, DGNB Kriteriensteckbrief*
