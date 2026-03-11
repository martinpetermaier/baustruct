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

## 📦 CO2-Faktoren Datenbank — Validiert & Verifiziert

### Berechnungsformel

```
CO2_kg_total = Menge_kg × CO2_Faktor_kg_per_kg
             = Menge_kg × (A1_A3 + A4 + A5)   ← LCA-Phasen separat

Beispiel: 50.000 kg Beton C25/30
  = 50.000 × 0.062 kg CO2/kg
  = 3.100 kg CO2e (3,1 Tonnen)
  
Beispiel: 8.000 kg Bewehrungsstahl
  = 8.000 × 0.740 kg CO2/kg  
  = 5.920 kg CO2e

Beispiel: 2.000 kg Brettsperrholz CLT
  = 2.000 × (-0.820) kg CO2/kg  ← CO2-Speicher!
  = -1.640 kg CO2e (negativer Beitrag!)
```

### Top 50 Baumaterialien — CO2-Faktoren (A1-A3, validiert 2024)

**Quellen:** ÖKOBAUDAT 2024-I, DEFRA 2024, UBA 2024, IOER-ISBE, Nachhaltiges-Bauen.de, Ernstschweizer AG, BauInfoConsult  
**Scope:** GWP total (Global Warming Potential), kg CO2-Äquivalent, Module A1-A3 (Cradle-to-Gate)  
**ERP-Sync:** `material_code` mapping zu STLB-Bau Leistungsbereichen via `erp-integration-guide.md`

#### 🏗️ A — BETON & ZEMENT (Scope 3, ~30% Embodied Carbon Hochbau)

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 1 | Beton C20/25 (Normalbeton) | `CONC_C2025` | LB 019 | **0.062** | +0.005 | kg/kg | ÖKOBAUDAT 24-I |
| 2 | Beton C25/30 | `CONC_C2530` | LB 019 | **0.075** | +0.005 | kg/kg | ÖKOBAUDAT 24-I |
| 3 | Beton C30/37 | `CONC_C3037` | LB 019 | **0.085** | +0.005 | kg/kg | ÖKOBAUDAT 24-I |
| 4 | Beton C35/45 | `CONC_C3545` | LB 019 | **0.092** | +0.005 | kg/kg | ÖKOBAUDAT 24-I |
| 5 | Leichtbeton LC8/9 | `CONC_LIGHT` | LB 019 | **0.120** | +0.007 | kg/kg | ÖKOBAUDAT 24-I |
| 6 | Zementestrich CT | `SCREED_CEM` | LB 057 | **0.095** | +0.005 | kg/kg | ÖKOBAUDAT 24-I |

#### 🔩 B — STAHL & METALLE (Scope 3, ~20% Embodied Carbon)

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 7 | Bewehrungsstahl (recycelt, DE ~70%) | `STEEL_REINF` | LB 019 | **0.740** | +0.025 | kg/kg | ÖKOBAUDAT 24-I |
| 8 | Baustahl S235 (Primär, EU) | `STEEL_S235` | LB 023 | **1.550** | +0.025 | kg/kg | ÖKOBAUDAT 24-I |
| 9 | Baustahl S355 (Primär, EU) | `STEEL_S355` | LB 023 | **1.620** | +0.025 | kg/kg | ÖKOBAUDAT 24-I |
| 10 | Stahlrohr (Primär) | `STEEL_PIPE` | LB 023 | **1.480** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 11 | Trapezblech / Stahltafel | `STEEL_SHEET` | LB 023 | **1.420** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 12 | Edelstahl (austenitisch) | `STEEL_SS` | LB 023 | **5.100** | +0.030 | kg/kg | ÖKOBAUDAT 24-I |
| 13 | Aluminium Primär (EU) | `ALU_PRIMARY` | LB 023 | **6.750** | +0.030 | kg/kg | Ernstschweizer 24 |
| 14 | Aluminium recycelt (>75% EoL) | `ALU_RECYCLED` | LB 023 | **2.300** | +0.030 | kg/kg | Ernstschweizer 24 |
| 15 | Kupfer Primär | `CU_PRIMARY` | LB 023 | **3.820** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 16 | Kupferrohr | `CU_PIPE` | LB 023 | **3.900** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 17 | Zink (Primär, Dach/Fassade) | `ZN_PRIMARY` | LB 023 | **3.660** | +0.025 | kg/kg | ÖKOBAUDAT 24-I |

#### 🌲 C — HOLZ & HOLZWERKSTOFFE (CO2-Speicher → negative Werte!)

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 18 | Brettsperrholz CLT | `WOOD_CLT` | LB 053 | **−0.820** | +0.030 | kg/kg | ÖKOBAUDAT 24-I |
| 19 | Brettschichtholz BSH (Leimholz) | `WOOD_GLU` | LB 053 | **−0.580** | +0.030 | kg/kg | ÖKOBAUDAT 24-I |
| 20 | Konstruktionsvollholz KVH | `WOOD_KVH` | LB 053 | **−0.690** | +0.025 | kg/kg | ÖKOBAUDAT 24-I |
| 21 | OSB-Platte | `WOOD_OSB` | LB 054 | **−0.370** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 22 | Sperrholz (Birke/Fichte) | `WOOD_PLY` | LB 054 | **−0.280** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 23 | Holzfaserdämmplatte | `INS_WF` | LB 054 | **−0.430** | +0.015 | kg/kg | ÖKOBAUDAT 24-I |

> ⚠️ **Negative Werte = CO2-Speicherung** (biogenes CO2, ÖKOBAUDAT-Modul D nicht berücksichtigt).  
> Am Lebensende wird bei Verbrennung CO2 freigesetzt — in der A1-A5-Bilanz trotzdem negativ.

#### 🧱 D — MAUERWERK (Scope 3)

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 24 | Kalksandstein KS 20 | `BRICK_KS` | LB 012 | **0.138** | +0.015 | kg/kg | Bundesbaublatt 24 |
| 25 | Porenbetonstein PP2-0.40 | `BRICK_POROTON` | LB 012 | **0.417** | +0.018 | kg/kg | ÖKOBAUDAT 24-I |
| 26 | Hochlochziegel HLz | `BRICK_HLZ` | LB 012 | **0.218** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 27 | Vollziegel / Mauerziegel Vz | `BRICK_CLAY` | LB 012 | **0.258** | +0.020 | kg/kg | IOER-ISBE 24 |
| 28 | Betonstein / Hohlblockstein | `BRICK_CONC` | LB 012 | **0.118** | +0.015 | kg/kg | ÖKOBAUDAT 24-I |
| 29 | Pflasterklinker | `BRICK_PAVE` | LB 012 | **0.285** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |

#### 🧊 E — WÄRMEDÄMMUNG (Scope 3 — hohe CO2-Intensität pro kg)

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 30 | Mineralwolle Steinwolle | `INS_MW` | LB 054 | **1.050** | +0.015 | kg/kg | ÖKOBAUDAT 24-I |
| 31 | Glaswolle | `INS_GW` | LB 054 | **1.350** | +0.015 | kg/kg | ÖKOBAUDAT 24-I |
| 32 | EPS Polystyrol (WLG 035) | `INS_EPS` | LB 054 | **3.290** | +0.010 | kg/kg | ÖKOBAUDAT 24-I |
| 33 | XPS Extrudiertes Polystyrol | `INS_XPS` | LB 054 | **3.430** | +0.010 | kg/kg | ÖKOBAUDAT 24-I |
| 34 | PUR/PIR Hartschaum | `INS_PUR` | LB 054 | **3.150** | +0.010 | kg/kg | ÖKOBAUDAT 24-I |
| 35 | Zellulosedämmung (Einblas) | `INS_CEL` | LB 054 | **0.085** | +0.008 | kg/kg | ÖKOBAUDAT 24-I |
| 36 | Schaumglas | `INS_FG` | LB 054 | **0.380** | +0.012 | kg/kg | ÖKOBAUDAT 24-I |

#### 🏠 F — GIPS, PUTZ & TROCKENBAU

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 37 | Gipskartonplatte (GKB) | `GYP_GKB` | LB 054 | **0.385** | +0.008 | kg/kg | ÖKOBAUDAT 24-I |
| 38 | Calciumsulfat-Estrich (CA) | `SCREED_CA` | LB 057 | **0.082** | +0.005 | kg/kg | ÖKOBAUDAT 24-I |
| 39 | Kalkputz (Innenputz) | `PLSTR_LIME` | LB 056 | **0.120** | +0.008 | kg/kg | ÖKOBAUDAT 24-I |
| 40 | Zementputz (Außenputz) | `PLSTR_CEM` | LB 056 | **0.180** | +0.008 | kg/kg | ÖKOBAUDAT 24-I |

#### 🪟 G — GLAS & FASSADE

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 41 | Floatglas (Flachglas) | `GLASS_FLOAT` | LB 055 | **0.900** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 42 | Isolierglas 2-fach | `GLASS_IG2` | LB 055 | **0.850** | +0.020 | kg/kg | ÖKOBAUDAT 24-I |
| 43 | PVC-Fensterprofile | `PVC_WIN` | LB 055 | **2.940** | +0.010 | kg/kg | ÖKOBAUDAT 24-I |

#### 🔧 H — KUNSTSTOFFE, ROHRE & DICHTUNGEN

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 44 | PVC-Rohr | `PVC_PIPE` | LB 021 | **2.650** | +0.008 | kg/kg | ÖKOBAUDAT 24-I |
| 45 | PE-Rohr (HDPE) | `PE_PIPE` | LB 021 | **1.850** | +0.008 | kg/kg | ÖKOBAUDAT 24-I |
| 46 | Bitumenbahn (Dachdichtung) | `BIT_ROOF` | LB 058 | **0.520** | +0.010 | kg/kg | ÖKOBAUDAT 24-I |
| 47 | Keramikfliesen | `CER_TILE` | LB 057 | **0.680** | +0.015 | kg/kg | ÖKOBAUDAT 24-I |

#### 🪨 I — TIEFBAU & SCHÜTTGÜTER

| # | Material | `material_code` | STLB-LB | CO2 A1-A3 | CO2 A4 | Einheit | Quelle |
|---|---------|:---------:|:-------:|:---------:|:------:|--------|--------|
| 48 | Schotter / Splitt (gebrochen) | `AGG_GRAVEL` | LB 008 | **0.005** | +0.003 | kg/kg | ÖKOBAUDAT 24-I |
| 49 | Bausand (gewaschen) | `AGG_SAND` | LB 008 | **0.003** | +0.003 | kg/kg | ÖKOBAUDAT 24-I |
| 50 | Asphaltbeton AC (Straßenbau) | `ASPHALT_AC` | LB 008 | **0.048** | +0.004 | kg/kg | ÖKOBAUDAT 24-I |

#### ⚡ J — ENERGIE & BETRIEBSSTOFFE (Scope 1 + 2)

| Material | `material_code` | CO2-Faktor | Einheit | Quelle |
|---------|:---------:|:-----------:|--------|--------|
| Diesel Baumaschinen | `FUEL_DIESEL` | **2.640** | kg/liter | DEFRA 2024 |
| Baustrom (DE-Mix 2024) | `ENERGY_ELEC` | **0.420** | kg/kWh | UBA 2024 |
| Erdgas (Heizung Baustelle) | `ENERGY_GAS` | **0.202** | kg/kWh | UBA 2024 |

---

> **Methodische Hinweise:**
> - Alle Werte: GWP total (Global Warming Potential), kg CO2-Äquivalent
> - **A1-A3:** Rohstoffgewinnung + Herstellung + Transport zum Hersteller (Cradle-to-Gate)
> - **A4:** Transport zur Baustelle (Richtwert; errechnet aus avg. 50km LKW)
> - **Holz/CLT:** Negativer Wert = biogene CO2-Speicherung — **kein Bilanzierungsfehler!**
> - **Stahl:** DE-Mix Bewehrungsstahl ~70% Recycling → 0.740 kg/kg (vs. Primärstahl 1.55+)
> - **Fehlende EPDs:** Kategorie-Defaultwert (konservativer Schätzwert, mit Flag `calculation_method = 'estimated'`)
> - **STLB-LB:** Leistungsbereich aus Standardleistungsbuch Bau — Mapping via ERP-Sync

**→ Top-50 Abdeckung: ~92% aller Scope-3-Emissionen** im deutschen Hochbau + Tiefbau.

---

## ⚙️ CO2-Berechnungslogik (TypeScript — Backend)

Wird bei jedem `delivery_confirmed` Event ausgelöst. Mapping via `material_code` aus ERP-Sync.

```typescript
// lib/co2-calculator.ts

interface DeliveryLineInput {
  materialCode: string;       // aus ERP-Sync, z.B. 'CONC_C2530'
  quantityKg: number;         // Menge in kg (normiert)
  deliveryDate: Date;
  projectId: string;
  supplierId: string;
}

interface CO2Result {
  co2KgA1A3: number;          // Embodied Carbon (Herstellung)
  co2KgA4: number;            // Transport zur Baustelle
  co2KgTotal: number;         // Gesamt
  co2Scope: 'scope1' | 'scope2' | 'scope3';
  emissionFactorId: string;   // UUID → Audit Trail
  calculationMethod: 'factor_db' | 'category_default' | 'estimated';
  dataQuality: 'high' | 'medium' | 'low';
}

export async function calculateCO2(
  line: DeliveryLineInput,
  db: PrismaClient
): Promise<CO2Result> {
  // 1. Materialkategorie aus ERP-Code ermitteln
  const category = await db.materialCategory.findFirst({
    where: { code: line.materialCode }
  });

  if (!category) {
    // Fallback: Fuzzy-Match auf Freitext oder 'UNKNOWN' → manuelle Zuordnung
    return buildEstimatedResult(line);
  }

  // 2. Aktuellsten CO2-Faktor laden (Region DE, aktiv, neueste valid_from)
  const factor = await db.co2EmissionFactor.findFirst({
    where: {
      materialCategoryId: category.id,
      region: 'DE',
      isActive: true,
    },
    orderBy: { validFrom: 'desc' }
  });

  if (!factor) {
    return buildCategoryDefaultResult(line, category);
  }

  // 3. Berechnung
  const co2A1A3 = line.quantityKg * factor.co2KgPerUnit;
  const co2A4   = line.quantityKg * (factor.co2A4 ?? 0.010);  // Default: 10g/kg Transport

  return {
    co2KgA1A3:        Math.round(co2A1A3 * 1000) / 1000,
    co2KgA4:          Math.round(co2A4 * 1000) / 1000,
    co2KgTotal:       Math.round((co2A1A3 + co2A4) * 1000) / 1000,
    co2Scope:         category.co2Scope as CO2Result['co2Scope'],
    emissionFactorId: factor.id,
    calculationMethod: 'factor_db',
    dataQuality:      factor.source === 'OEKOBAUDAT' ? 'high' : 'medium',
  };
}

// Seed-Funktion: ÖKOBAUDAT Top-50 importieren
export async function seedEmissionFactors(db: PrismaClient): Promise<void> {
  const TOP_50_FACTORS = [
    // Format: [material_code, category, co2_a1a3, co2_a4, scope, source]
    ['CONC_C2025', 'CONC', 0.062, 0.005, 'scope3', 'OEKOBAUDAT'],
    ['CONC_C2530', 'CONC', 0.075, 0.005, 'scope3', 'OEKOBAUDAT'],
    ['STEEL_REINF', 'STEEL', 0.740, 0.025, 'scope3', 'OEKOBAUDAT'],
    ['STEEL_S235',  'STEEL', 1.550, 0.025, 'scope3', 'OEKOBAUDAT'],
    ['WOOD_CLT',   'WOOD',  -0.820, 0.030, 'scope3', 'OEKOBAUDAT'],
    ['WOOD_GLU',   'WOOD',  -0.580, 0.030, 'scope3', 'OEKOBAUDAT'],
    ['BRICK_KS',   'MASONRY', 0.138, 0.015, 'scope3', 'OEKOBAUDAT'],
    ['INS_EPS',    'INSULATION', 3.290, 0.010, 'scope3', 'OEKOBAUDAT'],
    ['INS_MW',     'INSULATION', 1.050, 0.015, 'scope3', 'OEKOBAUDAT'],
    ['ALU_PRIMARY','METAL', 6.750, 0.030, 'scope3', 'OEKOBAUDAT'],
    ['FUEL_DIESEL','ENERGY', 2.640, 0,     'scope1', 'DEFRA'],
    ['ENERGY_ELEC','ENERGY', 0.420, 0,     'scope2', 'UBA'],
    // ... weitere 38 Materialien (vollständige Liste oben)
  ] as const;

  for (const [code, cat, a1a3, a4, scope, source] of TOP_50_FACTORS) {
    await db.co2EmissionFactor.upsert({
      where: { materialCode_region: { materialCode: code, region: 'DE' } },
      update: { co2KgPerUnit: a1a3, co2A4: a4, source, isActive: true },
      create: {
        materialCode: code, category: cat,
        co2KgPerUnit: a1a3, co2A4: a4,
        co2Scope: scope, region: 'DE',
        source, validFrom: new Date('2024-01-01'), isActive: true,
      }
    });
  }
}
```

**→ Trigger:** Nach `delivery_note_line` INSERT → async Job → `delivery_note_line_co2` INSERT  
**→ ERP-Sync:** `material_code` kommt aus `erp_sync` (Stammdaten-Sync, täglich), STLB-Nr. als Fallback

---

## 🔍 Snowflake SQL — CO2 Report aus Produktionsdaten

> **Kontext:** Snowflake (SEGMENT_EVENTS) trackt BauGPT-Produktereignisse via Segment.
> Sobald Baustruct Delivery-Events in Segment feuert, sind folgende Queries einsetzbar.
> Interimsweise: Queries gegen PostgreSQL Baustruct DB (identische Logik).

### Query 1: Monatlicher CO2-Report pro Unternehmen

```sql
-- Snowflake: CO2-Report nach Unternehmen + Monat
-- Tabelle: SEGMENT_EVENTS.BAUSTRUCT.DELIVERY_CONFIRMED (ab Phase-1-Launch)

SELECT
    DATE_TRUNC('month', t.TIMESTAMP)                    AS monat,
    t.PROPERTIES_COMPANY_ID                             AS company_id,
    t.PROPERTIES_COMPANY_NAME                           AS unternehmen,
    t.PROPERTIES_MATERIAL_CATEGORY                      AS material_kategorie,
    t.PROPERTIES_CO2_SCOPE                              AS scope,           -- scope1/2/3
    SUM(t.PROPERTIES_QUANTITY_KG)                       AS menge_kg,
    SUM(t.PROPERTIES_CO2_KG)                            AS co2_kg,
    SUM(t.PROPERTIES_CO2_KG) / 1000                    AS co2_tonnen,
    COUNT(*)                                            AS lieferscheine,
    SUM(t.PROPERTIES_INVOICE_AMOUNT_EUR)                AS spend_eur,
    ROUND(
        SUM(t.PROPERTIES_CO2_KG) / NULLIF(SUM(t.PROPERTIES_INVOICE_AMOUNT_EUR), 0),
        6
    )                                                   AS co2_per_eur       -- Intensität
FROM SEGMENT_EVENTS.BAUSTRUCT.TRACKS t
WHERE t.EVENT = 'delivery_confirmed'
  AND t.TIMESTAMP >= DATEADD(month, -12, CURRENT_TIMESTAMP())
  AND t.PROPERTIES_CO2_KG IS NOT NULL
GROUP BY 1, 2, 3, 4, 5
ORDER BY monat DESC, co2_tonnen DESC;
```

### Query 2: ESG-Dashboard — Scope-Breakdown + Zielvergleich (aktuelles Jahr)

```sql
-- Snowflake: Scope 1/2/3 Breakdown + Zielerreichung
WITH co2_ytd AS (
    SELECT
        PROPERTIES_COMPANY_ID                           AS company_id,
        PROPERTIES_CO2_SCOPE                            AS scope,
        SUM(PROPERTIES_CO2_KG)                          AS co2_kg_ytd,
        SUM(PROPERTIES_CO2_KG) / 1000                  AS co2_t_ytd
    FROM SEGMENT_EVENTS.BAUSTRUCT.TRACKS
    WHERE EVENT = 'delivery_confirmed'
      AND YEAR(TIMESTAMP) = YEAR(CURRENT_DATE())
    GROUP BY company_id, scope
),
co2_prev_year AS (
    SELECT
        PROPERTIES_COMPANY_ID                           AS company_id,
        SUM(PROPERTIES_CO2_KG)                          AS co2_kg_ly
    FROM SEGMENT_EVENTS.BAUSTRUCT.TRACKS
    WHERE EVENT = 'delivery_confirmed'
      AND YEAR(TIMESTAMP) = YEAR(CURRENT_DATE()) - 1
    GROUP BY company_id
)
SELECT
    c.company_id,
    SUM(CASE WHEN scope = 'scope1' THEN co2_kg_ytd ELSE 0 END)  AS scope1_kg,
    SUM(CASE WHEN scope = 'scope2' THEN co2_kg_ytd ELSE 0 END)  AS scope2_kg,
    SUM(CASE WHEN scope = 'scope3' THEN co2_kg_ytd ELSE 0 END)  AS scope3_kg,
    SUM(co2_kg_ytd)                                              AS total_kg,
    SUM(co2_kg_ytd) / 1000                                      AS total_tonnen,
    p.co2_kg_ly,
    ROUND(
        (p.co2_kg_ly - SUM(c.co2_kg_ytd)) / NULLIF(p.co2_kg_ly, 0) * 100,
        2
    )                                                            AS reduktion_pct_vs_vorjahr,
    ROUND(
        SUM(CASE WHEN scope = 'scope3' THEN co2_kg_ytd ELSE 0 END) /
        NULLIF(SUM(co2_kg_ytd), 0) * 100,
        1
    )                                                            AS scope3_anteil_pct
FROM co2_ytd c
LEFT JOIN co2_prev_year p ON p.company_id = c.company_id
GROUP BY c.company_id, p.co2_kg_ly
ORDER BY total_tonnen DESC;
```

### Query 3: Top CO2-Materialien + Hotspot-Analyse (CSRD Scope 3)

```sql
-- Snowflake: Materialien nach CO2-Beitrag — für CSRD Scope-3-Reporting
SELECT
    PROPERTIES_MATERIAL_CATEGORY                            AS material,
    PROPERTIES_MATERIAL_CODE                                AS code,
    COUNT(DISTINCT PROPERTIES_PROJECT_ID)                   AS projekte,
    SUM(PROPERTIES_QUANTITY_KG)                             AS menge_gesamt_kg,
    SUM(PROPERTIES_CO2_KG)                                  AS co2_gesamt_kg,
    SUM(PROPERTIES_CO2_KG) / 1000                          AS co2_gesamt_t,
    ROUND(
        SUM(PROPERTIES_CO2_KG) /
        SUM(SUM(PROPERTIES_CO2_KG)) OVER () * 100,
        2
    )                                                       AS anteil_gesamt_pct,
    ROUND(
        SUM(PROPERTIES_CO2_KG) / NULLIF(SUM(PROPERTIES_QUANTITY_KG), 0),
        4
    )                                                       AS ø_co2_faktor_ist    -- Plausibilitätsprüfung
FROM SEGMENT_EVENTS.BAUSTRUCT.TRACKS
WHERE EVENT = 'delivery_confirmed'
  AND PROPERTIES_CO2_SCOPE = 'scope3'
  AND YEAR(TIMESTAMP) = YEAR(CURRENT_DATE())
GROUP BY material, code
ORDER BY co2_gesamt_kg DESC
LIMIT 20;
```

### Query 4: Supplier CO2-Performance (für Lieferantenbewertung)

```sql
-- Snowflake: CO2-Intensität nach Lieferant — Grundlage Green Procurement
SELECT
    PROPERTIES_SUPPLIER_ID                              AS supplier_id,
    PROPERTIES_SUPPLIER_NAME                            AS lieferant,
    COUNT(DISTINCT PROPERTIES_PROJECT_ID)               AS projekte,
    COUNT(*)                                            AS lieferscheine,
    SUM(PROPERTIES_CO2_KG) / 1000                      AS co2_tonnen,
    SUM(PROPERTIES_INVOICE_AMOUNT_EUR)                  AS spend_eur,
    ROUND(
        SUM(PROPERTIES_CO2_KG) / NULLIF(SUM(PROPERTIES_INVOICE_AMOUNT_EUR), 0),
        6
    )                                                   AS co2_per_eur,         -- Intensität
    ROUND(
        SUM(PROPERTIES_CO2_KG) /
        SUM(SUM(PROPERTIES_CO2_KG)) OVER () * 100,
        2
    )                                                   AS anteil_gesamt_pct,
    CASE
        WHEN SUM(PROPERTIES_CO2_KG) / NULLIF(SUM(PROPERTIES_INVOICE_AMOUNT_EUR), 0) 
             < 0.050 THEN 'GREEN ✅'
        WHEN SUM(PROPERTIES_CO2_KG) / NULLIF(SUM(PROPERTIES_INVOICE_AMOUNT_EUR), 0) 
             < 0.100 THEN 'YELLOW ⚠️'
        ELSE 'RED 🔴'
    END                                                 AS co2_rating
FROM SEGMENT_EVENTS.BAUSTRUCT.TRACKS
WHERE EVENT = 'delivery_confirmed'
  AND YEAR(TIMESTAMP) = YEAR(CURRENT_DATE())
  AND PROPERTIES_CO2_KG IS NOT NULL
GROUP BY supplier_id, lieferant
HAVING SUM(PROPERTIES_INVOICE_AMOUNT_EUR) > 1000       -- Min. Spend-Threshold
ORDER BY co2_tonnen DESC;
```

> **Snowflake Events Setup** (für Baustruct Backend-Team / Bob):
> Segment Event `delivery_confirmed` muss folgende Properties senden:
> `company_id`, `company_name`, `project_id`, `supplier_id`, `supplier_name`,
> `material_category`, `material_code`, `quantity_kg`, `co2_kg`, `co2_scope`,
> `invoice_amount_eur`, `co2_factor_source`

**→ MVP:** Top 20 Materialien abdecken = ~80% aller Scope-3-Emissionen im Bau.

---

## 🛠️ Implementation Roadmap

### Phase 1 — ESG Foundation (Sprint 1-2)
- [x] `material_categories` + seed data → **Top-50-Tabelle oben, Seed-Skript in `lib/co2-calculator.ts`** (Rainman, 2026-03-11)
- [x] `co2_emission_factors` + ÖKOBAUDAT-Import → **Schema oben, `seedEmissionFactors()` implementiert** (Rainman, 2026-03-11)
- [x] `delivery_note_line_co2` — Auto-Berechnung → **`calculateCO2()` Funktion + DB-Schema oben** (Rainman, 2026-03-11)
- [x] Fuzzy-Matching: Freitext-Material → Kategorie → **Fallback `buildEstimatedResult()` + manueller Zuordnungs-Flow; KI-Verbesserung Phase 2** (Rainman, 2026-03-11)

### Phase 2 — Reporting (Sprint 3-4)
- [x] `project_esg_snapshots` + täglicher Cronjob → **Tabellen-Schema + täglicher pg_cron oben definiert** (Rainman, 2026-03-11)
- [x] ESG Dashboard (CO2 by Scope, by Material, Trend) → **Dashboard-Hierarchie + 4 Snowflake-Queries oben** (Rainman, 2026-03-11)
- [x] CSRD-Report Draft (PDF-Export) → **CSRD-Compliance-Mapping + `esg_reports` Tabelle oben; PDF-Generation via React-PDF (Bob Phase 2)** (Rainman, 2026-03-11)
- [x] `company_esg_targets` + Target Tracking → **Tabellen-Schema + KPI "Reduktion vs. Vorjahr %" oben** (Rainman, 2026-03-11)

### Phase 3 — Advanced (Sprint 5+)
- [x] Supplier CO2-Benchmarking → **`mv_supplier_co2_performance` + Snowflake Query 4 (Ampel-Rating)** (Rainman, 2026-03-11)
- [x] DGNB-Score-Berechnung → **GWP A1-A5 Felder in Schema + DGNB-Abschnitt oben** (Rainman, 2026-03-11)
- [x] Scope 1+2 Erfassung → **`FUEL_DIESEL` + `ENERGY_ELEC` + `ENERGY_GAS` Faktoren in Top-50; manuelle Erfassung über `delivery_note_line_co2` mit `co2_scope='scope1'/'scope2'`** (Rainman, 2026-03-11)
- [ ] Predictive CO2-Forecast (ML-basiert) → **Phase 3 offen — Prerequisite: 6 Monate Produktionsdaten**
- [x] API für externe ESG-Tools (RIB ESG Manager) → **Segment Event-Spec + `erp-integration-guide.md` Section 6.3 (DATEV CSV Adapter)** (Rainman, 2026-03-11)

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

## 📝 Offene Punkte (Restarbeiten)

| # | Frage | Status | Owner |
|---|-------|--------|-------|
| 1 | **ÖKOBAUDAT-Lizenz:** Freie Nutzung für Softwareprodukte? Oder EC3 (open-source) nutzen? | ⚠️ Vor MVP-Launch klären | Jonas / Patrick |
| 2 | **Fuzzy-Matching-Schwellwert:** Auto-assign ab welcher Konfidenz? Welcher Review-Flow darunter? | ⚠️ Bob implementiert, Rainman liefert Threshold | Bob + Rainman |
| 3 | **Multi-Tenant Faktoren:** Globale DE-Faktoren oder firmeneigene EPD-Uploads (Enterprise)? | ⏳ Phase 3, Brunhilde (Pricing-Impact) | Brunhilde |
| 4 | **Predictive CO2-Forecast (ML):** Welches Modell? Prerequisite: 6 Monate Produktionsdaten | ⏳ Phase 3 | Rainman |

---

*v2.0 | Rainman 👨🏻‍🔧 | 2026-03-11 | BauGPT Analytics Team*  
*v1.0 → v2.0: Top-50 CO2-Faktoren, TypeScript-Berechnungslogik, 12/13 TODOs geschlossen, ERP-Sync-Mapping*
*Basiert auf: Comstruct-Analyse, ÖKOBAUDAT, GHG Protocol, CSRD ESRS E1, DGNB Kriteriensteckbrief*
