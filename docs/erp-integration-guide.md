# ERP Integration Guide — BauGPT Procurement
**Version:** 1.1 | **Stand:** 2026-03-11 | **Autor:** Hugo 🚀 | **Review:** Brunhilde 👩‍💻
**Status:** 🔧 Draft — Research + Architecture | ⚠️ Konto-Mapping korrigiert (v1.1)

---

## 1. Warum ERP-Integration entscheidend ist

**Bottom Line:** Ohne ERP-Integration ist BauGPT Procurement ein Inseltool. Mit ERP-Integration wird es zum Herzstück des Bau-Finanzflows.

| Ohne ERP-Integration | Mit ERP-Integration |
|----------------------|---------------------|
| Manuelle Buchung jeder Rechnung | Auto-Buchung → ERP (1 Klick) |
| Doppelte Dateneingabe | Single Source of Truth |
| Kein Skonti-Management | Automatische Fristüberwachung |
| Export → Import → Fehler | API-Push in Echtzeit |
| Adoption-Blocker für Buchhaltung | "Endlich kein Copy-Paste mehr" |

**Conversion-Impact:** 73% der deutschen Bau-KMU nennen "passt nicht zu unserem ERP" als Hauptgrund gegen neue Software (Quelle: BauInfoConsult 2024).

---

## 2. ERP-Landschaft im DACH Baumarkt

### Tier 1 — Must-Have (MVP-Roadmap)

| ERP | Marktposition DACH | Zielgruppe | Prio |
|-----|--------------------|------------|------|
| **RIB iTWO** | De-facto-Standard Bau-ERP, 150k+ User DACH | Mittelstand + Enterprise | 🔴 P0 |
| **Nevaris** | Top-Lösung AVA + Baukalkulation, stark AT/DE | Mittelstand | 🔴 P0 |
| **DATEV** | Buchhaltungsstandard DE (Steuerberater-Pflicht) | Alle (Finanzen) | 🔴 P0 |
| **Sage 100/Sage Bau** | Breite Basis im KMU-Segment | KMU | 🟡 P1 |

### Tier 2 — Growth Phase

| ERP | Marktposition DACH | Zielgruppe | Prio |
|-----|--------------------|------------|------|
| **BRZ** | Bau-spezifisches ERP, stark Abrechnung | Mittelstand | 🟡 P1 |
| **BMD** | Marktführer Österreich | Österreich | 🟡 P1 |
| **SAP S/4HANA** | Enterprise-Standard | Großbau (>500 MA) | 🔵 P2 |
| **Microsoft Dynamics 365** | Generalist mit Bau-Addons | Mixed | 🔵 P2 |
| **Oracle NetSuite** | Cloud-First, international | Enterprise | 🔵 P2 |

### Tier 3 — Nice-to-Have / Nische

| ERP | Kontext |
|-----|---------|
| **Bechmann AVA** | Reine AVA-Lösung, kein Full-ERP |
| **AUER Success** | Nische AVA + Bauabrechnung |
| **Lexware** | Buchhaltung Kleinst-Unternehmen |
| **sevDesk / Buchhaltungsbutler** | Cloud-Buchhaltung Startups |

---

## 3. Integration-Architektur

### 3.1 Grundprinzip: Adapter-Pattern

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  BauGPT          │     │  Integration    │     │  ERP System  │
│  Procurement     │────▶│  Hub            │────▶│  (iTWO etc.) │
│  (Core)          │◀────│  (Adapter Layer)│◀────│              │
└──────────────────┘     └─────────────────┘     └──────────────┘
                               │
                         ┌─────┴─────┐
                         │ Adapter   │
                         │ Registry  │
                         │           │
                         │ - iTWO    │
                         │ - DATEV   │
                         │ - Nevaris │
                         │ - Sage    │
                         │ - CSV/XML │
                         └───────────┘
```

**Warum Adapter-Pattern:**
- Jedes ERP hat eigene API/Formate → ein Adapter pro ERP
- Core bleibt ERP-agnostisch
- Neue ERPs = neuer Adapter, kein Core-Change
- Fallback: CSV/GAEB-Export für ERPs ohne API

### 3.2 Datenfluss-Richtungen

| Flow | Richtung | Daten | Frequenz |
|------|----------|-------|----------|
| **Stammdaten-Sync** | ERP → BauGPT | Projekte, Kostenstellen, Lieferanten, Materialstamm | Initial + Daily |
| **Bestellungen** | BauGPT → ERP | Freigegebene POs mit Positionen | On-Event |
| **Lieferscheine** | BauGPT → ERP | Wareneingang (Mengen, Fotos, Abweichungen) | On-Event |
| **Rechnungsbuchung** | BauGPT → ERP | Buchungssatz (Konto, Kostenstelle, Betrag, USt) | On-Event |
| **Zahlungsstatus** | ERP → BauGPT | Zahlungsfreigabe, Skonto-Nutzung | Daily |

### 3.3 Standard-Formate

| Format | Verwendung | ERPs |
|--------|-----------|------|
| **GAEB XML (3.2-3.4)** | Leistungsverzeichnisse, Mengen | iTWO, Nevaris, BRZ, alle AVA |
| **XRechnung / ZUGFeRD** | E-Rechnung (gesetzlich ab 2025) | Alle DE ERPs |
| **DATEV-Format (ASCII)** | Buchungssätze → Steuerberater | DATEV Kanzlei-Rechnungswesen |
| **CSV** | Universal Fallback | Alle |
| **IFC (BIM)** | 3D-Mengenverknüpfung | iTWO, Nevaris (Zukunft) |
| **UGL (GAEB-Nachfolger)** | Nächste Gen LV-Austausch | Pilot-Phase |

---

## 4. Integration-Details pro ERP

### 4.1 RIB iTWO (P0 — MVP)

**Warum zuerst:** Höchste DACH-Verbreitung im Bau, 150k+ User, de-facto-Standard für Kalkulation + Abrechnung.

**Integration-Approach:**
```
Methode 1: GAEB-Export/Import (Quick Win)
─────────────────────────────────────────
BauGPT exportiert:
  - Bestellungen als GAEB 84 (Auftragserteilung)
  - Rechnungen als XRechnung
iTWO importiert:
  - Standard GAEB-Import (vorhandene Funktion)
  - XRechnung via Belegimport

Methode 2: iTWO API (ab Phase 2)
──────────────────────────────────
RIB bietet:
  - REST API für Connectors (seit iTWO 5D)
  - Projekt-/Kostenstellenabfrage
  - Buchungssatz-Push
  - Wareneingangs-Buchung

Aufwand: ~4-6 Wochen (Adapter + Testing)
```

**Datenfeld-Mapping iTWO ↔ BauGPT:**

| BauGPT Feld | iTWO Feld | Typ | Hinweis |
|-------------|-----------|-----|---------|
| `project_id` | Projekt-Nr. | String | iTWO-Projektnummer als External-ID |
| `cost_center` | Kostenstelle | String | Hierarchisch (Projekt → Bauabschnitt → Gewerk) |
| `order_number` | Bestellnummer | String | BauGPT-generiert, iTWO-referenziert |
| `material_code` | STLB-Bau-Nr. | String | Standardleistungsbuch-Referenz |
| `unit_price` | EP (Einheitspreis) | Decimal | Netto, 4 Nachkommastellen |
| `quantity` | Menge | Decimal | 3 Nachkommastellen |
| `vat_rate` | USt-Satz | Enum | 0%, 7%, 19% |
| `gl_account` | Sachkonto | String | SKR03/SKR04 Mapping |

### 4.2 DATEV (P0 — MVP)

**Warum zuerst:** Gesetzliche Pflicht — 90%+ der deutschen Bau-KMU nutzen DATEV über ihren Steuerberater.

**Korrigiertes Konto-Mapping (SKR03 + SKR04):**

| Kategorie | SKR03 Konto | SKR04 Konto | Beschreibung |
|-----------|-------------|-------------|--------------|
| Baumaterial (Beton, Stahl, Holz, etc.) | **3200** | **5200** | Roh-, Hilfs- und Betriebsstoffe |
| Handelswaren / Wiederverkauf | 3400 | 5400 | Nur wenn Material weiterverkauft wird |
| Fremdleistungen / Subunternehmer | 3600 | 5900 | Nachunternehmerleistungen |
| Transportkosten / Fracht | **4600** | **6800** | Frachtkosten, Nachnahme, Transportversicherung |
| Kleinmaterial / Verbrauchsmaterial | 3100 | 5100 | Hilfs- und Betriebsstoffe |
| Maschinenmiete | 4530 | 6130 | Miet- und Leasingkosten Maschinen |

> ⚠️ **WICHTIG:** Konten 3400 (Waren) und 3800 (existiert nicht in Standard-SKR03) sind für Bau-Materialien FALSCH. Korrekte Konten sind 3200 / 4600 (SKR03) oder 5200 / 6800 (SKR04). Das KI-Auto-Mapping muss den Kontenrahmen des Kunden ermitteln und entsprechend mappen.

**Integration-Approach:**
```
Methode 1: DATEV-Buchungsstapel Export (Quick Win — MVP)
────────────────────────────────────────────────────────
BauGPT exportiert:
  - Buchungssätze als DATEV-CSV (ASCII-Format)
  - Felder: Umsatz, Soll/Haben-Konto, Datum, Buchungstext, Kostenstelle
  - Beleg-Link (URL zur digitalen Rechnung in BauGPT)
  
Steuerberater importiert:
  - DATEV Kanzlei-Rechnungswesen → "Stapelverarbeitung"
  - Belege via DMS-Link abrufbar

Methode 2: DATEV API (Phase 2)
───────────────────────────────
DATEV Developer Portal bietet:
  - hr:exchange API (Stammdaten-Sync)
  - Lohnaustauschdatenservice (Lohn-Daten)
  - Lohnergebnisdatenservice (Ergebnisse)
  - hr:documents (Belegübertragung)

Für Procurement relevant:
  - Buchungssatz-API (Accounting Data Service)
  - Belegbild-API (Document Upload)

Zertifizierung: DATEV-Schnittstellen-Zertifikat nötig!
Aufwand: ~6-8 Wochen + Zertifizierungsprozess
```

**DATEV Buchungssatz-Format:**

```csv
# DATEV Buchungsstapel — BauGPT Procurement Export
# Header: Umsatz;S/H;Konto;Gegenkonto;BU;Datum;Buchungstext;Kostenstelle1;Belegfeld1
# SKR03: 3200 = Roh-, Hilfs- und Betriebsstoffe | 4600 = Frachtkosten | 70000 = Verbindlichkeiten LuL
1250.00;S;3200;70000;;1103;Lieferung Bewehrungsstahl Projekt München-Ost;4711;RE-2026-001
892.50;S;3200;70000;;1103;Transportbeton C25/30 20m³;4711;RE-2026-002
185.00;S;4600;70000;;1103;Transportkosten Kies-Lieferung Projekt München-Ost;4711;RE-2026-003
```

> ⚠️ **Konto-Mapping Review (Brunhilde, 2026-03-11):**
> - **3400** ("Bezogene Waren") ist FALSCH für Baumaterialien — das ist das Konto für Handelswaren (Wiederverkauf). Korrekt ist **3200** "Roh-, Hilfs- und Betriebsstoffe" für Materialien die im Bau verbaut werden.
> - **3800** existiert in DATEV SKR03 NICHT als Transportkonto. Korrekt ist **4600** "Frachtkosten" (Nachnahmegebühren, Transportversicherungen).
> - Für SKR04-Nutzer: Material → **5200**, Transport → **6800** (Frachtkosten)
> - Das KI-Auto-Mapping muss beide Kontenrahmen (SKR03 + SKR04) unterstützen.

### 4.3 Nevaris (P0 — MVP)

**Warum zuerst:** Stärkste AVA-Lösung in AT/DE, besonders bei Kalkulation + Abrechnung.

**Integration-Approach:**
```
Methode 1: GAEB-Austausch (Quick Win)
──────────────────────────────────────
- Nevaris unterstützt GAEB 81-86 Import/Export nativ
- Bestellungen als GAEB 84 exportieren
- Abrechnungsdaten als GAEB 85/86 austauschen

Methode 2: Nevaris Open Interface (Phase 2)
────────────────────────────────────────────
- Nevaris bietet offene Schnittstellen
- REST API für Projekt-/Kostendaten
- Aufwand: ~4 Wochen
```

### 4.4 Universal CSV/GAEB Fallback

**Für alle ERPs ohne direkte API:**

```
Export-Formate:
├── /exports/datev/           → DATEV-Buchungsstapel (.csv)
├── /exports/gaeb/            → GAEB XML 3.2/3.4 (.x84, .x86)
├── /exports/xrechnung/       → XRechnung 3.0 (.xml)
├── /exports/zugferd/         → ZUGFeRD 2.2 (.pdf mit XML)
└── /exports/csv/             → Generic CSV (anpassbare Spalten)
```

---

## 5. XRechnung / E-Rechnung (Gesetzliche Pflicht)

### Kontext
- **Ab 01.01.2025:** E-Rechnung Empfangspflicht für alle B2B in DE
- **Ab 01.01.2027:** E-Rechnung Sendepflicht (Umsatz >800k)
- **Ab 01.01.2028:** E-Rechnung Sendepflicht für ALLE

### BauGPT Procurement Lösung
```
Eingehende Rechnungen:
  1. Lieferant sendet XRechnung/ZUGFeRD
  2. BauGPT parst XML automatisch (KI-unterstützt)
  3. 3-Way-Match: Bestellung ↔ Lieferschein ↔ Rechnung
  4. Auto-Buchungsvorschlag generieren
  5. Export in ERP-Format (DATEV/iTWO/etc.)

Ausgehende Rechnungen (Lieferanten-Portal):
  1. Lieferant lädt PDF hoch
  2. BauGPT extrahiert Daten via OCR/KI
  3. Konvertiert zu XRechnung-konformem Format
  4. Validierung gegen EN 16931
```

### XRechnung Felder für Bau

| Feld | XRechnung Path | Bau-Besonderheit |
|------|----------------|------------------|
| Baustellen-Referenz | `BuyerReference` | Projekt-Nr. als Referenz |
| Aufmaß-Referenz | `AdditionalDocumentReference` | Link zum digitalen Aufmaß |
| Abschlagsrechnung | `InvoiceTypeCode = 386` | Teilrechnungen üblich im Bau |
| Schlussrechnung | `InvoiceTypeCode = 380` | Mit Abzug aller Abschläge |
| Sicherheitseinbehalt | `AllowanceCharge` | 5% Gewährleistungseinbehalt |
| Skonto | `PaymentTerms` | "2% Skonto bei Zahlung innerhalb 14 Tagen" |

---

## 6. Technische Implementierung

### 6.1 DB-Schema Erweiterung

```sql
-- ERP Connection Config (Multi-Tenant)
CREATE TABLE erp_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES companies(id),
    erp_type VARCHAR(50) NOT NULL,  -- 'itwo', 'datev', 'nevaris', 'sage', 'csv'
    connection_config JSONB NOT NULL DEFAULT '{}',
    -- iTWO: { "api_url": "...", "api_key": "...", "project_mapping": {...} }
    -- DATEV: { "export_format": "ascii", "skr": "03", "berater_nr": "...", "mandant_nr": "..." }
    sync_enabled BOOLEAN DEFAULT false,
    last_sync_at TIMESTAMPTZ,
    sync_status VARCHAR(20) DEFAULT 'idle', -- idle, syncing, error
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync Log für Audit Trail
CREATE TABLE erp_sync_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES erp_connections(id),
    direction VARCHAR(10) NOT NULL, -- 'push', 'pull'
    entity_type VARCHAR(50) NOT NULL, -- 'invoice', 'order', 'delivery_note', 'master_data'
    entity_id UUID NOT NULL,
    erp_reference VARCHAR(255), -- External ID im ERP
    status VARCHAR(20) NOT NULL, -- 'pending', 'success', 'error', 'skipped'
    error_message TEXT,
    request_payload JSONB,
    response_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Konto-Mapping (BauGPT → ERP Sachkonten)
CREATE TABLE erp_account_mappings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES erp_connections(id),
    baugpt_category VARCHAR(100) NOT NULL, -- 'material_concrete', 'material_steel', etc.
    erp_account VARCHAR(20) NOT NULL, -- '3400' (SKR03) oder '5400' (SKR04)
    erp_cost_center VARCHAR(50),
    tax_code VARCHAR(10), -- 'V19', 'V7', 'V0'
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(connection_id, baugpt_category)
);
```

### 6.2 Adapter Interface (TypeScript)

```typescript
interface ERPAdapter {
    // Connection
    connect(config: ERPConnectionConfig): Promise<void>;
    testConnection(): Promise<{ ok: boolean; message: string }>;
    
    // Master Data Sync (ERP → BauGPT)
    syncProjects(): Promise<SyncResult>;
    syncCostCenters(): Promise<SyncResult>;
    syncSuppliers(): Promise<SyncResult>;
    syncMaterials(): Promise<SyncResult>;
    
    // Transaction Push (BauGPT → ERP)
    pushOrder(order: ProcurementOrder): Promise<PushResult>;
    pushDeliveryNote(note: DeliveryNote): Promise<PushResult>;
    pushInvoice(invoice: Invoice): Promise<PushResult>;
    
    // Export (für ERPs ohne API)
    exportToFile(entities: ExportableEntity[], format: ExportFormat): Promise<Buffer>;
    
    // Status
    getLastSync(): Promise<SyncStatus>;
}

type ExportFormat = 'datev_csv' | 'gaeb_xml' | 'xrechnung' | 'zugferd' | 'generic_csv';

// Adapter Registry
const adapterRegistry: Record<string, () => ERPAdapter> = {
    'itwo': () => new ITwoAdapter(),
    'datev': () => new DATEVAdapter(),
    'nevaris': () => new NevarisAdapter(),
    'sage': () => new SageAdapter(),
    'csv': () => new GenericCSVAdapter(),
};
```

### 6.3 DATEV Export Implementierung (MVP-Ready)

```typescript
class DATEVAdapter implements ERPAdapter {
    private config: DATEVConfig;
    
    async exportToFile(invoices: Invoice[]): Promise<Buffer> {
        const header = this.generateDATEVHeader();
        const rows = invoices.map(inv => this.toDATEVRow(inv));
        return Buffer.from([header, ...rows].join('\n'), 'utf-8');
    }
    
    private toDATEVRow(invoice: Invoice): string {
        return [
            this.formatAmount(invoice.grossAmount),  // Umsatz
            invoice.isDebit ? 'S' : 'H',              // Soll/Haben
            this.mapAccount(invoice.category),          // Konto
            invoice.supplierAccount,                    // Gegenkonto
            '',                                         // BU-Schlüssel
            this.formatDate(invoice.invoiceDate),       // Datum TTMM
            this.truncate(invoice.description, 60),     // Buchungstext
            invoice.costCenter,                         // Kostenstelle 1
            invoice.invoiceNumber,                      // Belegfeld 1
        ].join(';');
    }
    
    private generateDATEVHeader(): string {
        return [
            `"EXTF";700;21;`,                           // Format-Version
            `"Buchungsstapel";12;`,                      // Kategorie
            `${this.config.beraterNr};`,                 // Berater-Nr.
            `${this.config.mandantNr};`,                 // Mandant-Nr.
            `${this.config.wirtschaftsjahrBeginn};`,     // WJ-Beginn
            `${this.config.skr};`,                       // Sachkontenrahmen (03/04)
        ].join('');
    }
}
```

---

## 7. Onboarding-Flow für ERP-Integration

### User Journey (Settings → ERP-Integration)

```
Schritt 1: ERP auswählen
┌─────────────────────────────────────────────┐
│  🔗 ERP-Integration einrichten              │
│                                              │
│  Welches ERP nutzen Sie?                     │
│                                              │
│  [RIB iTWO]  [DATEV]  [Nevaris]  [Sage]    │
│  [Anderes ERP]  [Kein ERP / Excel]          │
│                                              │
│  💡 Kein passendes ERP? Wir exportieren     │
│     auch als CSV, GAEB oder XRechnung.      │
└─────────────────────────────────────────────┘

Schritt 2: Verbindung konfigurieren
┌─────────────────────────────────────────────┐
│  🔗 DATEV-Export einrichten                  │
│                                              │
│  Berater-Nr.:     [_______]                  │
│  Mandant-Nr.:     [_______]                  │
│  Kontenrahmen:    [SKR03 ▼]                  │
│  WJ-Beginn:       [01.01.2026]               │
│                                              │
│  📋 Konto-Mapping:                           │
│  Material Beton    → Konto [3200]            │
│  Material Stahl    → Konto [3200]            │
│  Transportkosten   → Konto [4600]            │
│  ...                                         │
│                                              │
│  [Verbindung testen]  [Speichern & Aktivieren]│
└─────────────────────────────────────────────┘

Schritt 3: Bestätigung
┌─────────────────────────────────────────────┐
│  ✅ DATEV-Export aktiv!                      │
│                                              │
│  Jede freigegebene Rechnung wird automatisch │
│  als DATEV-Buchungsstapel exportiert.        │
│                                              │
│  Export-Ordner: /exports/datev/              │
│  Frequenz: Bei Rechnungsfreigabe (sofort)    │
│                                              │
│  [Export testen mit Beispiel-Rechnung]       │
└─────────────────────────────────────────────┘
```

---

## 8. MVP-Scope vs. Roadmap

### MVP (v1.0) — Quick Wins
- [x] DATEV-Buchungsstapel CSV-Export
- [x] GAEB XML Export (Bestellungen)
- [x] XRechnung Import (Parser)
- [x] Generic CSV Export (anpassbar)
- [ ] ERP-Auswahl im Onboarding
- [ ] Konto-Mapping UI
- [ ] Export-Download in Settings

### Phase 2 (v1.1) — API-Integrationen
- [ ] RIB iTWO REST API Adapter
- [ ] DATEV API Zertifizierung + Live-Sync
- [ ] Nevaris Open Interface
- [ ] Automatischer Stammdaten-Import

### Phase 3 (v2.0) — Enterprise
- [ ] SAP S/4HANA Integration
- [ ] Microsoft Dynamics 365 Connector
- [ ] BIM-Mengenverknüpfung (IFC → Bestellung)
- [ ] Echtzeit-Sync (Webhooks)
- [ ] Multi-ERP (verschiedene ERPs pro Niederlassung)

---

## 9. Wettbewerber-Vergleich: ERP-Integrationen

| Feature | Comstruct | BauGPT Procurement (Ziel) |
|---------|-----------|--------------------------|
| DATEV Export | ✅ | ✅ (MVP) |
| RIB iTWO | ✅ (API) | 🔜 (Phase 2, GAEB MVP) |
| Nevaris | ❌ | 🔜 (Phase 2, GAEB MVP) |
| SAP | ✅ (Enterprise) | 🔜 (Phase 3) |
| XRechnung | ✅ | ✅ (MVP) |
| GAEB | ✅ | ✅ (MVP) |
| BIM/IFC | 🔜 | 🔜 (Phase 3) |
| CSV Fallback | ✅ | ✅ (MVP) |
| **KI-Erkennung** | ❌ | ✅ (OCR + Auto-Mapping) |
| **Auto-Buchungsvorschlag** | ❌ | ✅ (BauGPT AI) |

**USP:** Comstruct hat die Standard-Integrationen. BauGPT Procurement hat **KI-unterstützte Buchungsvorschläge** — das ERP bekommt fertige, korrekte Buchungssätze statt nur Rohdaten.

---

## 10. Offene Entscheidungen

| # | Entscheidung | Optionen | Empfehlung | Owner |
|---|-------------|----------|------------|-------|
| 1 | DATEV Zertifizierung jetzt oder später? | MVP ohne, Phase 2 mit | **Phase 2 bestätigt** — CSV-Export reicht für MVP. Begründung: (1) Zertifizierungsprozess 6–8 Wochen + bürokratischer Overhead, (2) 90% der KMU-Kunden haben einen Steuerberater, der die CSV manuell importiert — das ist der tatsächliche Workflow, (3) Live-API-Sync ist ein Enterprise-Feature, kein MVP-Feature. Risiko: Kein DATEV-Logo auf der Preisseite → minimal, da Zielgruppe KMU, die CSV verstehen. | Brunhilde ✅ |
| 2 | iTWO API vs. nur GAEB? | API = besser UX, GAEB = schneller | GAEB für MVP, API für Phase 2 | Bob |
| 3 | Eigenes Export-UI oder Zapier-artig? | Custom UI / Zapier / Make.com | Custom UI — Bau-ERPs haben keine Zapier-Anbindung | Bob + Hugo |
| 4 | XRechnung-Validierung selbst oder Service? | Eigene Lib / Peppol-Service | Eigene Lib (kosinus-xml) — Kontrolle | Bob |

---

*Nächster Review: Sprint Week 2 — Bob baut DATEV CSV-Adapter, Hugo erweitert Onboarding-Wireframe*
