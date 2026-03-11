# BauGPT Procurement — Onboarding Flow
**Version:** 1.0 | **Erstellt:** 2026-03-11 | **Autor:** Hugo (Marketing)

---

## 1. Ziel & Metriken

### Ziel
Neukunden innerhalb von **10 Minuten** von Signup zu erstem produktivem Workflow führen. Keine Konfigurationsberge, kein IT-Support nötig.

### Erfolgsmetriken
| Metrik | Ziel | Kill-Kriterium |
|--------|------|----------------|
| Time to First Value (TTFV) | ≤10 Min | >30 Min |
| Aktivierungsrate (5+ Docs in 7 Tagen) | ≥60% | <30% |
| Onboarding Completion Rate | ≥80% | <50% |
| Support-Tickets pro Onboarding | ≤1 | >3 |
| NPS nach Onboarding (D+3) | ≥50 | <30 |

---

## 2. Onboarding-Phasen Übersicht

```
Signup → Account Setup → Team Setup → Erster Test-Workflow → Go Live
  (2 Min)    (3 Min)       (3 Min)         (5 Min)            (sofort)
```

---

## 3. Phase 0: Pre-Onboarding (Landing Page → Signup)

### 3.1 Signup-Formular (minimal)
```
Felder:
- Firmenname (Pflicht)
- E-Mail (Pflicht — Arbeitsemail prüfen via MX-Record)
- Passwort (Pflicht)
- Mitarbeiterzahl (Optional — für Pricing-Empfehlung)

NICHT abfragen:
- Adresse (später)
- USt-ID (später)
- Kreditkarte (Beta: kein Payment)
```

### 3.2 Email-Bestätigung
- Bestätigungslink: gültig 24h
- Absender: `noreply@baugpt.com` (SPF/DKIM konfiguriert)
- Subject: "BauGPT Procurement — Bitte E-Mail bestätigen"
- Klick auf Link → direkt in Onboarding-Wizard

### 3.3 UTM-Tracking
Alle Signup-Sources tracken:
- `utm_source`: email / linkedin / referral / direct
- `utm_campaign`: beta-invite / andi-outreach / waitlist
- → In `users.utm_source` speichern (für Segment-Analyse)

---

## 4. Phase 1: Account Setup (Schritt 1/4)

### Screen: Unternehmen einrichten
```
┌─────────────────────────────────────────┐
│  🏗️  Willkommen bei BauGPT Procurement  │
│  Schritt 1 von 4: Unternehmen           │
│                                         │
│  Firmenname *                           │
│  [Mustermann Bau GmbH               ]   │
│                                         │
│  Rechtsform *                           │
│  [GmbH ▼                            ]   │
│                                         │
│  USt-ID (für DATEV-Export)             │
│  [DE123456789                       ]   │
│                                         │
│  Unternehmensgröße                      │
│  ○ 1–20 MA   ● 20–100 MA   ○ 100+ MA   │
│                                         │
│  [ Weiter → Schritt 2 ]                 │
└─────────────────────────────────────────┘
```

**Felder & Validierung:**
- Firmenname: Pflicht, min. 3 Zeichen
- Rechtsform: GmbH / GmbH & Co. KG / GbR / AG / Einzelunternehmer
- USt-ID: Optional, Regex-Validierung (DE + 9 Ziffern)
- Größe: Bestimmt Pricing-Tier-Vorschlag

**Backend-Aktion:**
- `POST /api/companies` → company_id generieren
- RLS-Regeln aktivieren (Mandanten-Isolation)

---

## 5. Phase 2: Erster Nutzer & Rollen (Schritt 2/4)

### Screen: Team einladen
```
┌─────────────────────────────────────────┐
│  👥 Schritt 2 von 4: Team einladen      │
│                                         │
│  Deine Rolle (du)                       │
│  [Einkauf / Procurement       ▼      ]  │
│                                         │
│  Kollegen einladen (optional)           │
│  ┌──────────────────────┬──────────┐   │
│  │ max.mustermann@...   │ Polier ▼ │ ✕ │
│  ├──────────────────────┼──────────┤   │
│  │ m.schmidt@firma.de   │ Finance▼ │ ✕ │
│  └──────────────────────┴──────────┘   │
│  + Weitere Person einladen              │
│                                         │
│  💡 Tipp: Poliere brauchen nur die     │
│  Mobile-App — keine Desktop-Einladung  │
│  nötig!                                │
│                                         │
│  [ ← Zurück ]  [ Jetzt einladen → ]    │
└─────────────────────────────────────────┘
```

### Rollen & Berechtigungen
| Rolle | Beschreibung | Typische Person |
|-------|-------------|-----------------|
| `admin` | Vollzugriff, User-Management, Billing | Geschäftsführer |
| `procurement` | Bestellungen erstellen, Lieferanten, Budgets | Einkäufer |
| `finance` | Rechnungsprüfung, ERP-Export, Berichte | Buchhaltung |
| `site_manager` | Lieferkalender, Lieferschein-Bestätigung | Bauleiter / Polier |

**Einladungs-Flow:**
1. Email an Eingeladene: "Max Mustermann lädt dich zu BauGPT Procurement ein"
2. Link → Passwort setzen → direkt in App (kein erneutes Onboarding)
3. Einladung läuft ab nach 7 Tagen

**Kann übersprungen werden** — "Erst allein starten" Button vorhanden

---

## 6. Phase 3: ERP-Verbindung (Schritt 3/4)

### Screen: ERP auswählen
```
┌─────────────────────────────────────────┐
│  🔗 Schritt 3 von 4: ERP verbinden     │
│  (Optional — kann später eingerichtet   │
│   werden)                               │
│                                         │
│  Welches ERP nutzt ihr?                 │
│                                         │
│  [🔵 DATEV] [📊 RIB iTWO] [🏗️ Nevaris]│
│  [📁 SAP]   [🖥️ Arriba]   [📤 CSV-Export]│
│                                         │
│  → Kein ERP / Weiß nicht               │
│                                         │
│  ✅ Ausgewählt: DATEV                  │
│  Klicke auf "Verbinden" nach dem        │
│  Setup — wir führen dich Schritt für    │
│  Schritt durch die Konfiguration.       │
│                                         │
│  [ Überspringen ]  [ Weiter → ]        │
└─────────────────────────────────────────┘
```

### ERP-Auswahl Logik
- **DATEV** → CSV-Export Format voreingestellt (Konto-Mapping automatisch)
- **RIB iTWO** → API-Key Eingabe (Anleitung verlinkt)
- **SAP** → Enterprise-Flow (CSM-Kontakt wird getriggert)
- **CSV** → Manueller Export erklärt (immer verfügbar als Fallback)
- **Weiß nicht** → Skip, CSV default

**Überspringen** jederzeit möglich → Reminder nach 7 Tagen per Email

---

## 7. Phase 4: Erster Test-Workflow (Schritt 4/4)

### Der "Aha-Moment" in 5 Minuten

Ziel: Nutzer erlebt sofort den Kern-Mehrwert (KI-Rechnungsprüfung) — kein leeres Dashboard.

```
┌─────────────────────────────────────────┐
│  🎯 Schritt 4 von 4: Erste Rechnung!   │
│                                         │
│  Lade jetzt deine erste Rechnung hoch  │
│  — die KI prüft sie in <30 Sekunden.   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │  📎 Datei hierhin ziehen        │   │
│  │  oder                           │   │
│  │  [ Rechnung auswählen ]         │   │
│  │                                 │   │
│  │  Akzeptiert: PDF, JPG, PNG      │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Keine Rechnung zur Hand?               │
│  [ Demo-Rechnung verwenden ]           │
│  (wir laden eine Beispielrechnung hoch) │
│                                         │
│  [ ← Zurück ]                          │
└─────────────────────────────────────────┘
```

### Demo-Rechnung Flow
1. System lädt vordefinierte Test-PDF (Holzner Bau, Beton 50m³, €12.750)
2. Automatische KI-Verarbeitung startet sofort (animierter Progress)
3. Nach 10–15 Sekunden: Ergebnis anzeigen
4. Nutzer sieht: Lieferant erkannt, Betrag, MwSt, Konten-Vorschlag, Match-Status

### Echte Rechnung Flow
1. Upload via Drag & Drop oder Datei-Browser
2. `POST /api/invoices/upload` → Supabase Storage
3. Background Job: GPT-4o OCR → Structured Output
4. Status-Polling alle 2 Sekunden (oder WebSocket)
5. Ergebnis in <30 Sekunden

---

## 8. Onboarding Complete Screen

```
┌─────────────────────────────────────────┐
│         🎉 Bereit zum Loslegen!         │
│                                         │
│  KI-Score: 94,2% ✓                     │
│  Lieferant erkannt: Holzner Bau GmbH   │
│  Betrag: €12.750,00                     │
│  Kontenvorschlag: 3400 (DATEV)          │
│  3-Way-Match: ✓ ausstehend             │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  Nächste Schritte:                      │
│  ✓ Team einladen (0/3 eingeladen)      │
│  ✓ ERP verbinden (DATEV ausstehend)    │
│  ✓ Ersten Lieferkalender einrichten    │
│                                         │
│  [ 🚀 Zum Dashboard ]                  │
└─────────────────────────────────────────┘
```

---

## 9. Post-Onboarding Email-Sequenz

### Sequenz (automatisiert via Supabase Edge Functions + Resend.io)

| Tag | Subject | Inhalt |
|-----|---------|--------|
| D+0 | "Deine erste Rechnung wurde geprüft ✓" | Ergebnis-Zusammenfassung, nächste Schritte |
| D+1 | "So richtest du den Lieferkalender ein" | Kurzanleitung + Polier einladen |
| D+3 | "Wie ist dein Einstieg?" | NPS-Abfrage (1–10 Skala), offenes Feedback |
| D+7 | "ERP noch nicht verbunden?" | Erinnerung + Schritt-für-Schritt Video |
| D+14 | "BauGPT Procurement Status: Woche 2" | Usage-Stats, Tipp der Woche |
| D+30 | "Dein erster Monat: Was hast du gespart?" | ROI-Berechnung, Upgrade-Empfehlung |

### Email-Template: D+0 Bestätigung
```
Betreff: ✅ Rechnung geprüft — 94,2% KI-Genauigkeit

Hallo [Name],

deine erste Rechnung wurde in 12 Sekunden vollständig geprüft.

Ergebnis:
• Lieferant: Holzner Bau GmbH ✓
• Betrag: €12.750,00 ✓
• MwSt 19%: €2.022,37 ✓
• DATEV-Konto: 3400 (Rohstoffe) — Vorschlag
• Status: Bereit zur Freigabe

Nächster Schritt: Freigeben oder ablehnen →
[Rechnung jetzt freigeben]

Tipp: Lade dein Team ein — Poliere können direkt
vom Handy Lieferscheine bestätigen.

Hugo & das BauGPT Team
```

---

## 10. In-App Onboarding Checklist

### Progress Bar (sichtbar in Dashboard bis alle Punkte erledigt)
```
Erste Schritte (3/6 erledigt) ████░░ 50%

✅ Account erstellt
✅ Erste Rechnung hochgeladen
✅ KI-Prüfung abgeschlossen
☐ Team-Mitglied eingeladen
☐ ERP verbunden
☐ Ersten Lieferschein bestätigt

[Checkliste schließen]
```

### Contextual Tooltips (nur beim ersten Besuch)
- Dashboard: "Hier siehst du alle offenen Rechnungen auf einen Blick"
- Lieferkalender: "Poliere sehen ihre Lieferungen hier — einfach per Link auf's Handy schicken"
- Rechnungseingang: "Rechnung per Drag & Drop hochladen — KI prüft in <30 Sek."
- Skonto-Monitor: "Nie wieder Skonto vergessen — wir erinnern dich 48h vorher"

---

## 11. Mobile Onboarding (Polier / Site Manager)

### Vereinfachter Flow für Field-Workers
Der Polier bekommt keinen normalen Account-Setup, sondern:

1. **Einladungs-SMS** (oder Email): "Dein Vorgesetzter hat dich zu BauGPT Procurement eingeladen"
2. Link → PWA im Browser öffnen (kein App Store nötig)
3. **Nur 2 Felder**: Name + PIN (4-stellig, für Unterschrift-Authentifizierung)
4. Sofort auf dem Lieferkalender seiner Baustellen

**Was der Polier NICHT sieht:**
- Kein Dashboard, keine Berichte
- Keine Rechnungen, kein ERP
- Nur: Lieferkalender + Lieferschein bestätigen

**Was der Polier sieht:**
- Heutige und morgige Lieferungen (seine Baustellen)
- Ein-Tap Bestätigung mit Foto und Unterschrift
- Push-Notification bei neuer Lieferung

---

## 12. Error States & Recovery

### Häufige Abbrecher und wie wir sie zurückgewinnen

| Schritt | Abbrecherquote (erwartet) | Recovery-Maßnahme |
|---------|--------------------------|-------------------|
| Email-Bestätigung | 15% | Reminder nach 24h |
| Schritt 1 Firmendaten | 8% | Session fortsetzen (localStorage) |
| Schritt 3 ERP | 30% | "Überspringen" prominent, keine Pflicht |
| Erste Rechnung | 20% | Demo-Rechnung als sofortiger Fallback |

### Session-Persistenz
- Alle Fortschritte werden in `localStorage` gespeichert
- Nutzer kann Onboarding zu einem anderen Zeitpunkt fortsetzen
- URL: `/onboarding?step=3&resume=true`

---

## 13. A/B-Test Hypothesen (für Launch)

| Test | Variante A | Variante B | Metrik |
|------|-----------|-----------|--------|
| Erste Aktion | Rechnung hochladen | Demo-Rechnung | Aktivierungsrate |
| ERP-Schritt | Pflicht | Optional | Completion Rate |
| Team-Einladung | Im Onboarding | Nach 3 Tagen | Langzeit-Retention |
| Polier-Onboarding | SMS | Email | Aktivierungsrate Poliere |

---

## 14. Technische Implementation

### API Endpoints (Onboarding)
```typescript
POST /api/auth/signup          // Account erstellen
POST /api/auth/verify-email    // Email bestätigen
POST /api/companies            // Unternehmen anlegen
POST /api/invitations          // Team einladen
POST /api/integrations/erp     // ERP konfigurieren
POST /api/invoices/upload      // Erste Rechnung (Onboarding)
GET  /api/onboarding/status    // Aktueller Fortschritt
PUT  /api/onboarding/complete  // Onboarding abschließen
```

### State Management
```typescript
interface OnboardingState {
  step: 1 | 2 | 3 | 4 | 'complete';
  company: CompanySetup;
  team: TeamMember[];
  erp: ERPConfig | null;
  firstInvoice: InvoiceResult | null;
  completedAt: string | null;
}
// Gespeichert in: Supabase users.onboarding_state (JSONB)
```

### Analytics Events
```typescript
// Alle Events tracken (Segment)
track('onboarding_started', { source: utm_source })
track('onboarding_step_completed', { step: 1 | 2 | 3 | 4 })
track('onboarding_skipped_erp', { erp_selected: string })
track('first_invoice_uploaded', { is_demo: boolean })
track('onboarding_completed', { duration_seconds: number })
track('onboarding_abandoned', { last_step: number })
```

---

## 15. CSM-Trigger (Beta-Phase)

Während der Beta werden folgende Events manuell nachgeführt:

| Event | CSM-Aktion |
|-------|-----------|
| Onboarding abgebrochen bei Schritt 3+ | Andi ruft an (persönlich) |
| D+3 NPS <5 | Sofort-Feedback-Call |
| Keine Aktivität nach 7 Tagen | Re-engagement Email + Angebot: Setup-Call |
| Erste Rechnung mit AI-Score <70% | CSM erklärt Prompt-Verbesserung |
| Erster fehlerfreier 3-Way-Match | Glückwunsch-Email + NPS-Request |

---

## Anhang: Onboarding-Dauer Benchmark

| Tool | TTFV | Benchmark |
|------|------|-----------|
| Notion | <5 Min | Klasse-1 |
| Figma | ~8 Min | Klasse-1 |
| **BauGPT Procurement (Ziel)** | **<10 Min** | Klasse-1 |
| Comstruct (geschätzt) | ~20 Min | Klasse-2 |
| Traditionelles ERP | Tage–Wochen | Legacy |

**Fazit:** 10-Minuten-Onboarding ist erreichbar und differenziert uns klar von Legacy-ERPs und Comstruct.

---
*Erstellt: 2026-03-11 | BauGPT Marketing — Hugo 🚀*
