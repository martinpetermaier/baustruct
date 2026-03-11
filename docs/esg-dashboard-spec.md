# ESG Dashboard — Screen Spec
**Rainman 👨🏻‍🔧 | 2026-03-11 | Für Bob 👨💻**

---

## Was das ist

Der ESG Dashboard ist **Rainman's Haupt-Deliverable** für die BauGPT Procurement UI.
Er macht den Scope-3-Vorteil (automatisches CO2-Tracking aus Lieferscheinen) sichtbar —
und ist der Hauptgrund warum Comstruct Enterprise-Kunden wie HOCHTIEF anzieht.

**Route:** `/dashboard/esg`  
**Rollen:** `admin` + `finance` (read); `procurement` (read only)  
**Datenquelle:** `project_esg_snapshots` (täglich aggregiert) + `delivery_note_line_co2`

---

## SCREEN 1: Company ESG Overview

**Route:** `/dashboard/esg`

```
┌─────────────────────────────────────────────────────────────┐
│  ESG & Nachhaltigkeit               [Jahr ▼] [Export PDF]  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  📊 SCOPE BREAKDOWN              🎯 JAHRESZIEL             │
│  ┌──────────────────┐           ┌────────────────────┐     │
│  │    [Donut Chart] │           │  Ziel 2026:        │     │
│  │  Scope 1:  3%    │           │  -15% vs. 2025     │     │
│  │  Scope 2:  7%    │           │                    │     │
│  │  Scope 3: 90%    │           │  Ist: -8.2% ✅     │     │
│  │  Total: 847 t    │           │  [Gauge Chart]     │     │
│  └──────────────────┘           └────────────────────┘     │
│                                                             │
│  📈 CO2-VERLAUF (12 Monate)                                 │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  [Line Chart: t CO2e / Monat, Scope 1/2/3 gestapelt]│   │
│  │  Apr | Mai | Jun | Jul | Aug | Sep | Okt | Nov | ...│   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  🏗️ TOP CO2-PROJEKTE              🏭 TOP CO2-MATERIALIEN   │
│  ┌───────────────────┐            ┌───────────────────┐    │
│  │ 1. Neubau HH  42t │            │ 1. Beton      48% │    │
│  │ 2. Sanierung  31t │            │ 2. Stahl      22% │    │
│  │ 3. Gewerbe    18t │            │ 3. Dämmung     8% │    │
│  │ [Alle anzeigen →] │            │ [Alle anzeigen →] │    │
│  └───────────────────┘            └───────────────────┘    │
│                                                             │
│  🚚 LIEFERANTEN CO2-PERFORMANCE                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Lieferant          CO2/€     Trend   Rating         │   │
│  │ Betonwerk Müller   0.045    ↓ -3%   🟢 GREEN       │   │
│  │ Stahlhandel AG     0.082    → 0%    🟡 YELLOW      │   │
│  │ Isolierungen GmbH  0.134    ↑ +5%   🔴 RED        │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### API Calls
```typescript
// KPI Cards
GET /api/esg/summary?year=2026&companyId=xxx
→ { totalCO2Kg, scope1, scope2, scope3, reductionVsLastYear, targetPct }

// Trend Chart (12 Monate)
GET /api/esg/trend?months=12&companyId=xxx
→ [{ month, scope1Kg, scope2Kg, scope3Kg }]

// Top Projects
GET /api/esg/top-projects?limit=5&year=2026
→ [{ projectId, name, co2TotalKg }]

// Top Materials
GET /api/esg/top-materials?limit=10&year=2026
→ [{ materialCode, materialName, co2Kg, pct }]

// Supplier Performance
GET /api/esg/supplier-performance?year=2026
→ [{ supplierId, name, co2PerEur, trendPct, rating }]
```

---

## SCREEN 2: Project CO2 Detail

**Route:** `/dashboard/esg/project/:projectId`

```
┌─────────────────────────────────────────────────────────────┐
│  ← Zurück   Neubau Hamburger Allee   [Export PDF]          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  CO2-GESAMT      SCOPE 3       CO2-INTENSITÄT   DGNB GWP   │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌────────┐ │
│  │  247 t   │  │  91.2%   │  │ 0.068 kg/€   │  │  A5+   │ │
│  │ CO2e     │  │  Scope 3 │  │              │  │ Status │ │
│  └──────────┘  └──────────┘  └──────────────┘  └────────┘ │
│                                                             │
│  📊 CO2 NACH MATERIAL (Bar Chart)                          │
│  Beton    ████████████████░░░░  118t  (47.8%)             │
│  Stahl    ████████░░░░░░░░░░░░   56t  (22.7%)             │
│  Dämmung  ████░░░░░░░░░░░░░░░░   21t   (8.5%)             │
│  Holz     ██░░░░░░░░░░░░░░░░░░  -12t  ← Speicher ✅       │
│  Sonstige ███████░░░░░░░░░░░░░   64t  (22.0%)             │
│                                                             │
│  📋 LIEFERSCHEINE MIT CO2-DATEN                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Datum    | Lieferant     | Material  | Menge | CO2  │   │
│  │ 11.03.26 | Beton AG      | C25/30    | 20 t  | 1.5t │   │
│  │ 10.03.26 | Stahlhandel   | Bewehrstahl| 5 t  | 3.7t │   │
│  │ [Weitere laden...]                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [CSRD Report generieren]  [DGNB Export]                   │
└─────────────────────────────────────────────────────────────┘
```

### API Calls
```typescript
// Project summary
GET /api/esg/project/:projectId/summary
→ { totalCO2Kg, scopeBreakdown, co2PerEur, dgnbGwp }

// Material breakdown
GET /api/esg/project/:projectId/by-material
→ [{ materialCode, name, co2Kg, pct, isCarbon-sink }]

// Delivery lines with CO2
GET /api/esg/project/:projectId/deliveries?page=1&limit=20
→ [{ date, supplier, material, quantityKg, co2Kg, dataQuality }]

// CSRD Report (PDF)
POST /api/esg/reports/generate
  { projectId, reportType: 'CSRD', fiscalYear: 2026 }
→ { reportId, pdfUrl }
```

---

## SCREEN 3: CSRD Report Builder

**Route:** `/dashboard/esg/reports`

```
┌─────────────────────────────────────────────────────────────┐
│  CSRD Report Builder                                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Berichtsjahr: [2026 ▼]   Geltungsbereich: [Alle Proj. ▼] │
│                                                             │
│  📋 DATENQUALITÄT                                           │
│  ████████████████████░░░  82% Hohe Datenqualität ✅        │
│  ████░░░░░░░░░░░░░░░░░░░  14% Mittlere Qualität ⚠️        │
│  ██░░░░░░░░░░░░░░░░░░░░░   4% Schätzwert 🔴                │
│  → 4% der Positionen ohne Material-Mapping (manuell prüfen)│
│                                                             │
│  ✅ SCOPE 1: 12.4 t CO2e (Diesel Baumaschinen)             │
│  ✅ SCOPE 2: 8.7 t CO2e  (Baustrom)                        │
│  ✅ SCOPE 3: 826 t CO2e  (Materialien, Lieferkette)        │
│                                                             │
│  ⚠️ OFFENE PUNKTE (vor Finalisierung klären):              │
│  • 3 Positionen ohne Materialkategorie (→ manuell zuordnen)│
│  • Scope 2: Stromlieferant nicht verknüpft                  │
│                                                             │
│  [Vorschau PDF]  [Finalisieren & Exportieren]              │
└─────────────────────────────────────────────────────────────┘
```

---

## API Routes — Vollständige Spezifikation

```typescript
// ─── ESG Routes (app/api/esg/) ─────────────────────────────

// Company-level summary
GET  /api/esg/summary
     ?year=number &companyId=string
→    EsgSummary

// 12-month trend
GET  /api/esg/trend
     ?months=number &companyId=string &projectId?=string
→    EsgTrendPoint[]

// Top projects by CO2
GET  /api/esg/top-projects
     ?limit=5 &year=number &companyId=string
→    ProjectCO2[]

// Top materials by CO2 contribution
GET  /api/esg/top-materials
     ?limit=20 &year=number &companyId=string &projectId?=string
→    MaterialCO2[]

// Supplier CO2 performance
GET  /api/esg/supplier-performance
     ?year=number &companyId=string
→    SupplierCO2Performance[]

// Project ESG detail
GET  /api/esg/project/:projectId/summary
→    ProjectEsgSummary

GET  /api/esg/project/:projectId/by-material
→    MaterialBreakdown[]

GET  /api/esg/project/:projectId/deliveries
     ?page=number &limit=number
→    { data: DeliveryWithCO2[], total: number }

// Report generation
POST /api/esg/reports/generate
     { projectId?, companyId, reportType: 'CSRD'|'DGNB'|'custom', fiscalYear: number }
→    { reportId: string, status: 'generating' }

GET  /api/esg/reports/:reportId
→    { status: 'ready'|'generating'|'error', pdfUrl?: string }
```

---

## Recharts Komponenten (für Bob)

```tsx
// components/esg/ScopeDonut.tsx
import { PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const SCOPE_COLORS = {
  scope1: '#ef4444',  // Rot — direkte Emissionen
  scope2: '#f97316',  // Orange — Energie
  scope3: '#3b82f6',  // Blau — Materialien (der große Anteil)
};

// components/esg/CO2TrendChart.tsx
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
// Gestapeltes Area-Chart: Scope 1 + 2 + 3 über Zeit

// components/esg/MaterialBarChart.tsx  
import { BarChart, Bar, XAxis, YAxis, Cell } from 'recharts';
// Horizontal Bar — negative Werte (Holz) in Grün, positive in Blau/Rot

// components/esg/SupplierHeatmap.tsx
// Custom: Tabelle mit CO2/€ Intensität + Ampel-Coloring (Tailwind: bg-green/bg-yellow/bg-red)
```

---

## CO2-Datenqualitäts-Badge

```tsx
// components/esg/DataQualityBadge.tsx
type DataQuality = 'high' | 'medium' | 'low';

const badges = {
  high:   { label: 'ÖKOBAUDAT', color: 'bg-green-100 text-green-800'  },
  medium: { label: 'Schätzwert', color: 'bg-yellow-100 text-yellow-800'},
  low:    { label: 'Unbekannt',  color: 'bg-red-100 text-red-800'     },
};
// Zeige Badge bei jedem Lieferschein-CO2-Wert → Transparenz für Kunden
```

---

*v1.0 | Rainman 👨🏻‍🔧 | 2026-03-11 | BauGPT Analytics Team*
