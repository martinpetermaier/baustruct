# Supplier Portal — Feature Spec
**Version:** 1.0 | **Stand:** 2026-03-11 | **Lead:** Hugo 🚀  
**Status:** Draft — MVP-Scope definiert

---

## 1. Warum ein Supplier Portal?

Das Supplier Portal ist der **Netzwerk-Hebel** von Baustruct. Jeder Bauunternehmer, der Baustruct nutzt, zieht seine Lieferanten auf die Plattform. Das erzeugt einen **viralen Loop:**

```
Bauunternehmen → lädt Lieferanten ein → Lieferant nutzt Portal →
→ Lieferant sieht Wert → empfiehlt Baustruct an andere Bauunternehmen
```

**Comstruct-Benchmark:** Comstruct hat kein echtes Self-Service Supplier Portal — Lieferanten werden manuell ongeboardet. Das ist unsere Chance, einen **besseren Supplier-Experience** als Differenzierung zu bauen.

---

## 2. Persona: Lieferant

| Attribut | Detail |
|----------|--------|
| **Wer** | Baustoffhändler, Betonwerke, Schalungsverleiher, Spezialmaterial |
| **Größe** | 5–500 Mitarbeiter, 1–3 Personen nutzen das Portal |
| **Tech-Affinität** | Niedrig bis mittel. Excel + E-Mail ist Standard |
| **Motivation** | Schnellere Bezahlung, weniger Rückfragen, weniger Papierkram |
| **Pain Points** | Papier-Lieferscheine verloren, Rechnungsstreitigkeiten, 60+ Tage Zahlungsziel |
| **Key Metric** | Days Sales Outstanding (DSO) — Ziel: von 60 auf 30 Tage senken |

---

## 3. Feature Map

### 3.1 MVP (Phase 1)

| Feature | Beschreibung | Priorität |
|---------|-------------|-----------|
| **Self-Service Registrierung** | Einladungslink vom Bauunternehmen. E-Mail, Firmenname, USt-ID, Bankdaten. Kein Sales-Call nötig | P1 |
| **Bestellungs-Dashboard** | Alle eingehenden POs sehen (Status, Lieferdatum, Positionen). Filtert nach Projekt/Baustelle | P1 |
| **Digitaler Lieferschein erstellen** | Lieferant erstellt Lieferschein digital (Positionen aus PO vorausgefüllt). Barcode/QR für Baustellen-Scan | P1 |
| **Rechnungs-Upload** | PDF hochladen → KI-OCR parsed automatisch → Abgleich mit PO + Lieferschein sichtbar | P1 |
| **Status-Tracking** | Echtzeit-Status: PO bestätigt → Geliefert → Rechnung eingereicht → Rechnung geprüft → Bezahlt | P1 |
| **Benachrichtigungen** | E-Mail-Alerts bei: neue PO, Lieferschein bestätigt, Rechnung genehmigt, Zahlung angewiesen | P1 |

### 3.2 Phase 2

| Feature | Beschreibung | Priorität |
|---------|-------------|-----------|
| **Preislisten-Management** | Lieferant lädt eigene Preisliste hoch (CSV/Excel). Automatischer Abgleich mit Vertragspreisen | P2 |
| **Reklamations-Workflow** | Lieferant sieht Fotos von Mängeln, kann Stellung nehmen, Gutschrift/Nachlieferung anbieten | P2 |
| **Performance-Dashboard** | Lieferant sieht eigene KPIs: Liefertreue, Reklamationsrate, Ø Zahlungsziel | P2 |
| **Skonto-Schnellzahlung** | Lieferant bietet Skonto an → Bauunternehmen sieht Spar-Potential → Win-Win | P2 |
| **Multi-Mandanten** | Ein Lieferant beliefert mehrere Baustruct-Kunden → ein Login, mehrere Mandanten-Views | P2 |

### 3.3 Phase 3

| Feature | Beschreibung | Priorität |
|---------|-------------|-----------|
| **Lieferanten-Katalog** | Öffentliches Profil mit Produktkatalog, Zertifizierungen, Liefergebieten | P3 |
| **ESG-Daten** | CO2-Emissionsfaktoren pro Produkt hinterlegen (ÖKOBAUDAT-kompatibel) | P3 |
| **EDI/API-Integration** | Automatischer PO-Import/Lieferschein-Export für große Lieferanten (z.B. Würth, Hilti) | P3 |
| **Finanzierungs-Option** | Supply Chain Financing: Lieferant bekommt sofortige Zahlung, Bauunternehmen zahlt später (Partner-Modell) | P3 |

---

## 4. User Flows

### 4.1 Onboarding Flow
```
1. Bauunternehmen sendet Einladungslink (per E-Mail/WhatsApp)
2. Lieferant klickt Link → Landing Page mit Value Proposition
3. Registrierung: Firmenname, E-Mail, USt-ID, IBAN (optional)
4. E-Mail-Verifizierung
5. Dashboard öffnet sich → erste PO bereits sichtbar
6. Guided Tour: "So erstellen Sie Ihren ersten digitalen Lieferschein"
```
**Ziel:** < 5 Minuten von Einladung bis erster Nutzung

### 4.2 Lieferschein-Flow
```
1. Lieferant öffnet PO → klickt "Lieferschein erstellen"
2. Positionen sind vorausgefüllt (aus PO)
3. Mengen anpassen (Teillieferung möglich)
4. LKW-Kennzeichen, Fahrer, geplante Ankunft eintragen
5. QR-Code wird generiert
6. Auf Baustelle: Polier scannt QR → bestätigt/meldet Abweichung
7. Lieferant sieht Status: ✅ Bestätigt / ⚠️ Teilweise / ❌ Abgelehnt
```

### 4.3 Rechnungs-Flow
```
1. Lieferant lädt Rechnung hoch (PDF)
2. KI parsed: Positionen, Preise, Mengen, Rechnungsnummer
3. Automatischer Abgleich: Rechnung ↔ PO ↔ Lieferschein(e)
4. Status sichtbar: ✅ Match / ⚠️ Abweichung bei Pos. X / ❌ Keine PO gefunden
5. Bei Match: Rechnung geht automatisch zur Freigabe beim Kunden
6. Lieferant sieht: "Voraussichtliches Zahlungsdatum: [Datum]"
```

---

## 5. Technische Eckpunkte

### Authentifizierung
- **Magic Link** (E-Mail) für Erstanmeldung — kein Passwort-Setup nötig
- Optional: Passwort setzen für regelmäßige Nutzung
- Multi-Mandanten: JWT mit `supplier_id` + `company_ids[]` Array

### QR-Code Lieferschein
- QR enthält: `baustruct://dn/{delivery_note_id}?token={short_lived_token}`
- Polier-App scannt → öffnet Bestätigungs-Screen
- Offline-Fallback: 6-stelliger Bestätigungscode manuell eintippen

### Datenmodell-Erweiterungen
```sql
-- Neue Tabelle: supplier_users
CREATE TABLE supplier_users (
  id UUID PRIMARY KEY,
  supplier_id UUID REFERENCES suppliers(id),
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'member', -- 'admin' | 'member'
  invited_by_company_id UUID REFERENCES companies(id),
  onboarded_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Neue Tabelle: supplier_company_links (Multi-Mandant)
CREATE TABLE supplier_company_links (
  supplier_id UUID REFERENCES suppliers(id),
  company_id UUID REFERENCES companies(id),
  status TEXT DEFAULT 'active', -- 'active' | 'suspended'
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (supplier_id, company_id)
);

-- Erweiterung delivery_notes
ALTER TABLE delivery_notes ADD COLUMN qr_token TEXT;
ALTER TABLE delivery_notes ADD COLUMN driver_name TEXT;
ALTER TABLE delivery_notes ADD COLUMN vehicle_plate TEXT;
ALTER TABLE delivery_notes ADD COLUMN expected_arrival TIMESTAMPTZ;
```

### API Endpoints (Supplier-Scope)
```
GET    /api/supplier/orders          — Alle POs für diesen Lieferanten
GET    /api/supplier/orders/:id      — PO-Detail mit Positionen
POST   /api/supplier/delivery-notes  — Neuen Lieferschein erstellen
GET    /api/supplier/delivery-notes  — Alle eigenen Lieferscheine
POST   /api/supplier/invoices        — Rechnung hochladen
GET    /api/supplier/invoices        — Rechnungs-Status Dashboard
GET    /api/supplier/stats           — Performance KPIs
```

---

## 6. Viraler Loop & Growth

### Einladungs-Mechanik
- Jedes Bauunternehmen kann unbegrenzt Lieferanten einladen (auch im Free Tier)
- Einladungs-E-Mail enthält: "Ihr Kunde [Firmenname] nutzt Baustruct für digitale Lieferscheine"
- **Incentive:** "Erhalten Sie Zahlungen bis zu 30 Tage schneller"

### Network Effects
```
Phase 1: Lieferant nutzt Portal für 1 Kunden → sieht Wert
Phase 2: Lieferant fragt andere Kunden: "Nutzt ihr auch Baustruct?"
Phase 3: Lieferant empfiehlt Baustruct aktiv (weniger Papierkram)
Phase 4: Lieferant wird zum Vertriebskanal
```

### Metriken
| Metrik | Ziel (6 Monate) |
|--------|-----------------|
| Lieferanten-Registrierungsrate | >60% der eingeladenen |
| Ø Lieferanten pro Bauunternehmen | 8-12 |
| Lieferanten-initiierte Signups (viral) | >10% aller Neukunden |
| Lieferanten-NPS | >40 |

---

## 7. Abgrenzung zu Wettbewerb

| Feature | Baustruct | Comstruct | Cosuno |
|---------|-----------|-----------|--------|
| Self-Service Onboarding | ✅ < 5 Min | ❌ Manuell | ❌ Kein Portal |
| Digitale Lieferscheine (Lieferant erstellt) | ✅ | ✅ | ❌ |
| QR-Code Baustellen-Scan | ✅ | ❌ | ❌ |
| Rechnungs-Status Echtzeit | ✅ | Teilweise | ❌ |
| Multi-Mandanten für Lieferanten | ✅ | ❌ | ❌ |
| Free für Lieferanten | ✅ Immer kostenlos | ❌ | N/A |
| Skonto-Schnellzahlung | Phase 2 | ❌ | ❌ |

**Key Differenzierung:** Das Portal ist für Lieferanten **immer kostenlos**. Wir monetarisieren nur die Bauunternehmen-Seite. Das senkt die Adoptions-Hürde auf Null.

---

## 8. Open Questions

- [ ] **Lieferant erstellt Lieferschein vs. Bauunternehmen?** → MVP: Beides möglich. Lieferant hat Vorrang wenn digital erstellt.
- [ ] **Zahlungsinformationen (IBAN) Pflicht bei Registrierung?** → Empfehlung: Optional, aber incentiviert ("Schnellere Zahlung bei hinterlegter IBAN")
- [ ] **White-Label Option?** Große Bauunternehmen wollen eigenes Branding → Phase 3
- [ ] **Supply Chain Financing Partner?** Potenzielle Partner: Billie.io, Taulia, C2FO → Brunhilde evaluieren

---

*Autor: Hugo 🚀 | Version 1.0 — 2026-03-11*  
*Basiert auf: PRODUCT-SPEC.md (Persona 4), Competitive Research, Web Research*
