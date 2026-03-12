# BauGPT Procurement — DSGVO & Compliance Spec
**Version:** 1.0 | **Autor:** Hugo 🚀 | **Erstellt:** 2026-03-12
**Status:** Draft — Review durch Brunhilde (Legal) erforderlich

---

## 1. Warum dieses Dokument

BauGPT Procurement verarbeitet geschäftskritische Dokumente: Lieferscheine, Rechnungen, Bestellungen, Lieferantendaten. Das sind personenbezogene Daten (Ansprechpartner, Unterschriften, Kontaktdaten) UND steuerrelevante Geschäftsunterlagen.

**Compliance ist kein Nice-to-Have — es ist Launch-Blocker.**

Ohne saubere DSGVO-Compliance + GoBD-konforme Aufbewahrung kann kein deutscher Bauunternehmer unser Produkt legal einsetzen.

---

## 2. Rechtliche Grundlagen

### 2.1 DSGVO (EU-GDPR)
- **Art. 5(1)(e):** Speicherbegrenzung — nicht länger als nötig
- **Art. 6:** Rechtsgrundlage für Verarbeitung (Vertrag, berechtigtes Interesse, gesetzliche Pflicht)
- **Art. 28:** Auftragsverarbeitungsvertrag (AVV) — PFLICHT für SaaS
- **Art. 30:** Verzeichnis der Verarbeitungstätigkeiten
- **Art. 32:** Technische & organisatorische Maßnahmen (TOMs)
- **Art. 33/34:** Meldepflicht bei Datenpannen (72h)
- **Art. 17:** Recht auf Löschung — aber begrenzt durch Aufbewahrungspflichten

### 2.2 Handelsgesetzbuch (HGB § 257)
- Aufbewahrung von Handelsbriefen, Buchungsbelegen, Jahresabschlüssen
- Regelt WAS aufbewahrt werden muss

### 2.3 Abgabenordnung (AO § 147)
- Steuerrelevante Aufbewahrungspflichten
- Regelt WIE LANGE aufbewahrt werden muss

### 2.4 GoBD (Grundsätze ordnungsmäßiger Buchführung)
- Regelt WIE digital aufbewahrt wird
- Unveränderbarkeit, Nachvollziehbarkeit, Vollständigkeit
- Gilt explizit für Cloud/SaaS-Lösungen

---

## 3. Aufbewahrungsfristen — Dokumentenmatrix

### 3.1 Übersicht nach Dokumenttyp

| Dokumenttyp | Aufbewahrungsfrist | Rechtsgrundlage | Start der Frist |
|---|---|---|---|
| **Rechnungen (eingehend/ausgehend)** | **8 Jahre** ¹ | AO § 147, HGB § 257 | Ende des Kalenderjahres der Erstellung |
| **Lieferscheine (mit Buchungsrelevanz)** | **8 Jahre** ¹ | AO § 147 | Ende des Kalenderjahres |
| **Lieferscheine (reine Begleitdokumente)** | **Keine Pflicht** ² | — | Nach Abgleich mit Rechnung löschbar |
| **Lieferscheine (als Handelsbrief)** | **6 Jahre** | HGB § 257 | Ende des Kalenderjahres |
| **Bestellungen / Auftragsbestätigungen** | **6 Jahre** | HGB § 257 | Ende des Kalenderjahres |
| **Verträge (Lieferanten/Kunden)** | **6 Jahre** nach Ende | HGB § 257 | Ende des Vertragsverhältnisses |
| **Korrespondenz (geschäftlich)** | **6 Jahre** | HGB § 257 | Ende des Kalenderjahres |

¹ Seit 01.01.2025: Verkürzung von 10 auf 8 Jahre (Wachstumschancengesetz)
² Praxisempfehlung: Trotzdem 6 Jahre aufbewahren für Beweissicherung

### 3.2 Sonderfall: CO2/ESG-Daten

| Dokumenttyp | Aufbewahrungsfrist | Rechtsgrundlage |
|---|---|---|
| CO2-Berechnungen | **10 Jahre** (empfohlen) | CSRD-Nachweispflicht |
| ESG-Reports | **10 Jahre** (empfohlen) | CSRD / EU-Taxonomie |
| DGNB-Zertifizierungsdaten | **Projektlaufzeit + 10 Jahre** | DGNB-Anforderungen |

**Hinweis:** Die CSRD (ab 2026 für große Unternehmen) wird eigene Aufbewahrungsfristen mit sich bringen. Wir bauen konservativ mit 10 Jahren.

---

## 4. Technische Umsetzung

### 4.1 Datenklassifikation

Jedes Dokument im System muss klassifiziert werden:

```typescript
enum DocumentRetentionClass {
  INVOICE = 'invoice',              // 8 Jahre
  DELIVERY_NOTE_BOOKING = 'dn_booking', // 8 Jahre (buchungsrelevant)
  DELIVERY_NOTE_LETTER = 'dn_letter',   // 6 Jahre (Handelsbrief)
  DELIVERY_NOTE_SIMPLE = 'dn_simple',   // optional, 6 Jahre empfohlen
  ORDER = 'order',                  // 6 Jahre
  CONTRACT = 'contract',            // 6 Jahre nach Vertragsende
  CORRESPONDENCE = 'correspondence', // 6 Jahre
  ESG_REPORT = 'esg_report',        // 10 Jahre
}

interface RetentionPolicy {
  class: DocumentRetentionClass;
  retentionYears: number;
  retentionStart: 'calendar_year_end' | 'contract_end' | 'creation_date';
  deletionBehavior: 'auto_delete' | 'flag_for_review' | 'anonymize';
}
```

### 4.2 Retention-Tabelle (DB-Erweiterung für Bob)

```sql
CREATE TABLE document_retention (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id         UUID NOT NULL,           -- FK → documents.id
  document_type       VARCHAR(50) NOT NULL,     -- enum: invoice, delivery_note, etc.
  retention_class     VARCHAR(30) NOT NULL,     -- aus DocumentRetentionClass
  retention_years     INT NOT NULL,
  retention_start     DATE NOT NULL,            -- Startdatum der Frist
  retention_end       DATE NOT NULL,            -- Berechnetes Löschdatum
  deletion_status     VARCHAR(20) DEFAULT 'active', -- active | flagged | deleted | anonymized
  deletion_executed   TIMESTAMPTZ,
  deletion_method     VARCHAR(30),              -- auto | manual | anonymized
  legal_hold          BOOLEAN DEFAULT false,    -- Löschsperre (z.B. bei Rechtsstreit)
  legal_hold_reason   TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW(),
  updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Index für Lösch-Cron
CREATE INDEX idx_retention_end ON document_retention(retention_end)
  WHERE deletion_status = 'active';

-- Täglicher Cron prüft:
-- SELECT * FROM document_retention
-- WHERE retention_end <= CURRENT_DATE
--   AND deletion_status = 'active'
--   AND legal_hold = false;
```

### 4.3 Löschkonzept

**Automatischer Ablauf:**

```
1. Dokument wird hochgeladen/erstellt
   → retention_class wird automatisch zugewiesen (OCR-Erkennung)
   → retention_end wird berechnet

2. Täglicher Cron-Job (02:00 UTC):
   → Prüft abgelaufene Dokumente
   → deletion_status → 'flagged'
   → Admin bekommt Notification: "X Dokumente zur Löschung bereit"

3. Admin Review (optional, konfigurierbar):
   → Auto-Delete nach 30 Tagen ohne Aktion
   → Oder: manuelle Bestätigung erforderlich

4. Löschung:
   → Dokument-Datei wird gelöscht (S3 Object Delete)
   → Metadaten werden anonymisiert (Name, Ansprechpartner entfernt)
   → Aggregierte Statistiken bleiben erhalten (Anzahl Dokumente, Summen)
   → Audit-Log Eintrag: "Document XYZ deleted per retention policy"
```

### 4.4 GoBD-konforme Speicherung

**Anforderungen:**
1. **Unveränderbarkeit:** Einmal gespeicherte Dokumente dürfen nicht verändert werden
2. **Nachvollziehbarkeit:** Jede Änderung muss protokolliert werden
3. **Vollständigkeit:** Kein Dokument darf "verschwinden"
4. **Verfügbarkeit:** Dokumente müssen jederzeit lesbar sein (für Prüfer)
5. **Maschinelle Auswertbarkeit:** Strukturierte Daten müssen exportierbar sein

**Technische Umsetzung:**

```typescript
// S3 Object Lock (WORM - Write Once Read Many)
const uploadConfig = {
  Bucket: 'baustruct-documents',
  ObjectLockMode: 'GOVERNANCE',     // Admin kann in Notfällen entsperren
  ObjectLockRetainUntilDate: retentionEndDate,
};

// Audit Trail für jede Aktion
interface AuditEntry {
  documentId: string;
  action: 'upload' | 'view' | 'download' | 'annotate' | 'delete';
  userId: string;
  timestamp: Date;
  ipAddress: string;
  details: Record<string, unknown>;
}
```

---

## 5. Auftragsverarbeitungsvertrag (AVV)

### 5.1 Was muss rein (Art. 28 DSGVO)

BauGPT als SaaS-Anbieter ist **Auftragsverarbeiter** — der Kunde (Bauunternehmen) ist **Verantwortlicher**.

**Pflichtinhalte des AVV:**

| Abschnitt | Inhalt |
|---|---|
| Gegenstand | Verarbeitung von Lieferscheinen, Rechnungen, Bestellungen, ESG-Daten |
| Zweck | Digitalisierung des Procure-to-Pay-Prozesses |
| Dauer | Vertragslaufzeit + Aufbewahrungsfristen |
| Art der Daten | Geschäftsdokumente, Kontaktdaten, Lieferantendaten, Finanzdaten |
| Betroffene | Mitarbeiter des Kunden, Lieferanten-Ansprechpartner, Fahrer |
| Weisungsgebundenheit | BauGPT verarbeitet NUR nach Weisung des Kunden |
| Unterauftragsverarbeiter | AWS (Hosting), ggf. OCR-Provider → Kunden-Zustimmung erforderlich |
| TOMs | Siehe Abschnitt 6 |
| Löschung/Rückgabe | Nach Vertragsende: Daten zurückgeben oder löschen (Kundenwahl) |
| Prüfrechte | Kunde darf Audits durchführen (oder Zertifizierung akzeptieren) |

### 5.2 Template-Erstellung

**Action Item für Brunhilde:** AVV-Template erstellen, das:
- Im Self-Service-Signup automatisch akzeptiert wird (Checkbox)
- Als PDF herunterladbar ist
- Für Enterprise-Kunden individuell verhandelbar ist

---

## 6. Technische & Organisatorische Maßnahmen (TOMs)

### 6.1 Infrastruktur

| Maßnahme | Implementierung |
|---|---|
| **Hosting** | AWS eu-central-1 (Frankfurt) — Daten bleiben in DE |
| **Verschlüsselung at rest** | AES-256 (S3 SSE, RDS Encryption) |
| **Verschlüsselung in transit** | TLS 1.3 |
| **Backup** | Tägliche Snapshots, 30 Tage Retention, geo-redundant (eu-west-1) |
| **Zugriffskontrolle** | RBAC (Role-Based Access Control) per Firma + Projekt |
| **MFA** | Pflicht für Admin-Rollen, optional für User |
| **Audit Logging** | Alle Zugriffe auf Dokumente werden protokolliert |
| **Penetration Testing** | Jährlich durch externen Dienstleister |

### 6.2 Anwendungsebene

| Maßnahme | Implementierung |
|---|---|
| **Data Isolation** | Mandantentrennung: Jede Firma hat eigene `company_id`, Row-Level Security |
| **Session Management** | JWT mit 15min Expiry, Refresh Token Rotation |
| **Rate Limiting** | API Rate Limits pro User + IP |
| **Input Validation** | Server-side Validation aller Uploads (Dateityp, Größe, Malware-Scan) |
| **CORS** | Nur eigene Domains erlaubt |
| **CSP** | Content Security Policy Headers |

### 6.3 Organisatorisch

| Maßnahme | Implementierung |
|---|---|
| **Datenschutzbeauftragter** | Extern bestellt (erforderlich ab 20 MA mit Datenverarbeitung) |
| **Mitarbeiterschulung** | Jährliche DSGVO-Schulung für alle mit Datenzugang |
| **Incident Response Plan** | Dokumentierter Prozess: Erkennung → 72h Meldung → Maßnahmen |
| **Löschkonzept** | Automatisiert (siehe Abschnitt 4.3) |
| **Dokumentation** | Verarbeitungsverzeichnis (Art. 30) wird gepflegt |

---

## 7. Datenschutz-Folgenabschätzung (DSFA)

### 7.1 Ist eine DSFA erforderlich?

**Ja.** Gründe:
- Systematische Verarbeitung von Geschäftsdokumenten in großem Umfang
- OCR-Verarbeitung extrahiert automatisch personenbezogene Daten
- Profiling-Elemente (Lieferantenbewertung, Kostenanalysen)
- Potenziell sensible Daten (Preise, Vertragskonditionen, Finanzdaten)

### 7.2 Risikobewertung (vereinfacht)

| Risiko | Eintritt | Schwere | Maßnahme |
|---|---|---|---|
| Datenleck (Rechnungsdaten) | Mittel | Hoch | Verschlüsselung, RBAC, Audit Logs |
| Unbefugter Zugriff (Lieferantenpreise) | Mittel | Hoch | MFA, Row-Level Security, IP-Whitelist (Enterprise) |
| Verlust von Dokumenten | Niedrig | Hoch | Tägliche Backups, S3 Versioning |
| Falsche Löschung | Niedrig | Hoch | Legal Hold, Admin-Review vor Löschung |
| OCR-Fehler → falsche Zuordnung | Mittel | Mittel | Manuelle Korrekturmöglichkeit, Konfidenz-Score |

---

## 8. Besonderheiten Bauindustrie

### 8.1 Lieferscheine auf der Baustelle

- Oft handschriftlich, verknittert, nass, beschädigt
- Fotos von Lieferscheinen = personenbezogene Daten (Fahrername, Kfz-Kennzeichen)
- **Empfehlung:** Automatische Schwärzung von Fahrer-Personendaten nach OCR-Extraktion

### 8.2 Subunternehmer-Kette

- Baubranche = viele Subunternehmer mit eigenen Datenschutz-Anforderungen
- Jeder Sub kann eigene AVV-Anforderungen haben
- **Empfehlung:** Standard-AVV-Klausel für die Lieferkette

### 8.3 Baustellen-Fotos

- Lieferschein-Fotos können Personen im Hintergrund zeigen
- **Empfehlung:** Automatische Gesichtserkennung + Blur (optional) oder klare Nutzerhinweise

---

## 9. Implementierungs-Roadmap

### Phase 1 (MVP — Wochen 1-8)
- [x] Hosting in eu-central-1
- [ ] Row-Level Security (company_id)
- [ ] Audit Log für Dokumentenzugriffe
- [ ] TLS 1.3 + AES-256
- [ ] Basis-AVV Template (PDF)
- [ ] Datenschutz-Seite auf Website
- [ ] Cookie-Banner (nur technisch notwendige Cookies)

### Phase 2 (Post-MVP — Wochen 9-16)
- [ ] Automatisches Löschkonzept (Retention-Tabelle + Cron)
- [ ] S3 Object Lock (GoBD-Compliance)
- [ ] DSFA durchführen + dokumentieren
- [ ] Verarbeitungsverzeichnis (Art. 30) erstellen
- [ ] MFA für Admin-Rollen
- [ ] Penetration Test beauftragen

### Phase 3 (Enterprise — Wochen 17+)
- [ ] Individueller AVV für Enterprise-Kunden
- [ ] IP-Whitelisting Option
- [ ] SSO/SAML Integration
- [ ] ISO 27001 Zertifizierung (Ziel)
- [ ] SOC 2 Type II (für internationale Kunden)
- [ ] Externer Datenschutzbeauftragter bestellen

---

## 10. Checkliste für Launch

| # | Item | Verantwortlich | Status |
|---|---|---|---|
| 1 | AVV Template erstellen | Brunhilde | ⬜ TODO |
| 2 | Datenschutzerklärung (Website) | Brunhilde + Hugo | ⬜ TODO |
| 3 | Impressum aktualisieren | Brunhilde | ⬜ TODO |
| 4 | Cookie-Consent implementieren | Bob | ⬜ TODO |
| 5 | Row-Level Security (DB) | Bob | ⬜ TODO |
| 6 | Audit-Log Tabelle | Bob | ⬜ TODO |
| 7 | Retention-Tabelle + Logic | Bob | ⬜ TODO |
| 8 | S3 Encryption + Object Lock Config | Bob | ⬜ TODO |
| 9 | DSFA Entwurf | Brunhilde | ⬜ TODO |
| 10 | Verarbeitungsverzeichnis | Brunhilde | ⬜ TODO |
| 11 | TOMs-Dokument finalisieren | Bob + Brunhilde | ⬜ TODO |
| 12 | Penetration Test planen | Bob | ⬜ TODO |

---

## 11. Steelman: Warum Compliance uns HILFT

**Contra:** "DSGVO ist nur Overhead und verlangsamt den Launch."

**Pro:**
1. **Verkaufsargument #1:** Deutsche Bauunternehmen FRAGEN nach DSGVO-Compliance. Ohne = kein Deal.
2. **Comstruct-Differenzierung:** Comstruct ist CH-basiert — wir können "Made in Germany, hosted in Frankfurt" als USP nutzen.
3. **Enterprise-Readiness:** Große GUs (HOCHTIEF, STRABAG) haben eigene Compliance-Abteilungen. Je früher wir ready sind, desto kürzer der Sales-Cycle.
4. **Vertrauen:** Free-Tier-User uploaden echte Geschäftsdokumente. Ohne Vertrauen = kein Upload = kein Conversion.
5. **Rechtssicherheit:** Ein DSGVO-Verstoß kostet bis zu €20M oder 4% des Jahresumsatzes. Das ist existenzbedrohend für ein Startup.

---

*Erstellt von Hugo 🚀 | 2026-03-12 | Basiert auf DSGVO, HGB § 257, AO § 147, GoBD*
*Quellen: DSGVO-Gesetzestext, Wachstumschancengesetz 2025, GoBD 2019, CSRD-Richtlinie*
