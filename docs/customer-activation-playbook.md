# Customer Activation Playbook — Baustruct Launch

> **Autor:** Hugo 🚀 | **Status:** v1.0 | **Datum:** 2026-03-11
> **Ziel:** 1.000+ BauGPT-Bestandskunden in Baustruct Beta aktivieren (€0 CAC)

---

## 1. Executive Summary

BauGPT hat 1.000+ zahlende Unternehmen und 70.000+ Nutzer. Das ist der größte Competitive Advantage gegenüber Comstruct (die von Null aufbauen mussten). Dieser Playbook definiert die **exakte Sequenz**, um Bestandskunden in Baustruct zu aktivieren — ohne den BauGPT-Core-Umsatz zu gefährden.

**Ziel-KPIs:**
- **Woche 1-2:** 200 Beta-Anmeldungen (20% der aktiven Basis)
- **Woche 3-4:** 50 aktive Tester (25% Conversion Beta → Active)
- **Woche 6:** 10 zahlende Kunden (20% Active → Paid)
- **Monat 3:** 30 zahlende Kunden, €15k MRR

---

## 2. Segmentierung der Bestandskunden

### 2.1 Segment-Priorisierung

| Segment | Größe (geschätzt) | Baustruct-Fit | Priorität |
|---------|-------------------|---------------|-----------|
| **GU / Generalunternehmer** | ~80 Kunden | ⭐⭐⭐⭐⭐ | P0 — First Movers |
| **Mittlere Baufirmen (50-500 MA)** | ~200 Kunden | ⭐⭐⭐⭐ | P1 — Core Target |
| **Kleine Baufirmen (10-50 MA)** | ~400 Kunden | ⭐⭐⭐ | P2 — Free Tier |
| **Handwerker / Subunternehmer** | ~300 Kunden | ⭐⭐ | P3 — Supplier-Seite |
| **Recruiting-Only Kunden** | ~120 Kunden | ⭐ | P4 — Später |

### 2.2 Identifikation der High-Value Targets

**SQL-Query für Rainman** (Snowflake/PostgreSQL):
```sql
-- Top 100 Kunden nach Aktivität + Unternehmensgröße
SELECT 
  c.company_name,
  c.company_size,
  c.industry_segment,
  COUNT(DISTINCT u.id) as active_users,
  MAX(u.last_active_at) as last_active,
  c.subscription_tier
FROM companies c
JOIN users u ON u.company_id = c.id
WHERE u.last_active_at > NOW() - INTERVAL '30 days'
  AND c.company_size >= 50
GROUP BY c.id
ORDER BY active_users DESC, c.company_size DESC
LIMIT 100;
```

---

## 3. Aktivierungs-Sequenz (5 Phasen)

### Phase 0: Vorbereitung (1 Woche vor Launch)

**In-App:**
- [ ] Teaser-Banner in BauGPT Pro Dashboard: "Bald: KI-gestützte Einkaufssteuerung — Warteliste beitreten"
- [ ] Landing Page mit Waitlist-Form (Email + Unternehmensname + Rolle)
- [ ] PostHog Event: `baustruct_waitlist_signup`

**Intern:**
- [ ] Sales-Team (Felix) briefen: Top-20-Kunden persönlich ansprechen
- [ ] Support-Team informieren: FAQ vorbereitet
- [ ] Beta-Umgebung stabil + Onboarding-Flow getestet

---

### Phase 1: Soft Launch — E-Mail Sequenz (Tag 1-7)

#### E-Mail 1: Announcement (Tag 1)
**Betreff:** "Neu: BauGPT kann jetzt Einkauf & Rechnungen — kostenlos testen"
**Segment:** Alle aktiven Kunden (letzte 90 Tage)

```
Hey {Vorname},

Du nutzt BauGPT bereits für {Recruiting/KI-Dokumente} — jetzt kommt das nächste Level:

**Baustruct: Einkaufssteuerung mit KI**
✅ Lieferscheine per Foto erfassen (10 Sek statt 30 Min)
✅ Rechnungen automatisch prüfen (OCR + 3-Way-Match)
✅ CO2-Tracking automatisch (CSRD-ready)

**Für BauGPT-Kunden: 50 Dokumente/Monat KOSTENLOS.**

[Jetzt Beta testen →]

Keine neue Registrierung nötig — Dein BauGPT-Login funktioniert.

Grüße,
Das BauGPT-Team
```

**Tracking:**
- PostHog: `baustruct_email_1_opened`, `baustruct_email_1_clicked`
- UTM: `?utm_source=email&utm_medium=activation&utm_campaign=baustruct_launch&utm_content=email1`

---

#### E-Mail 2: Social Proof + Feature Deep-Dive (Tag 3)
**Betreff:** "Wie {Referenzkunde} 4h/Woche bei Rechnungen spart"
**Segment:** Email 1 geöffnet, aber nicht konvertiert

```
Hey {Vorname},

{Referenzkunde} verarbeitet 200 Lieferscheine pro Monat.
Vorher: 30 Min pro Lieferschein = 100h/Monat.
Jetzt: 10 Sek per Foto + KI = 1h/Monat.

**Das spart {Referenzkunde} €3.000/Monat** an Verwaltungskosten.

So funktioniert's in 3 Schritten:
1️⃣ Polier fotografiert Lieferschein auf der Baustelle
2️⃣ KI liest alles aus — Mengen, Preise, Lieferant
3️⃣ Automatischer Abgleich mit Bestellung + Rechnung

Du hast 50 Dokumente/Monat kostenlos. Probier's aus:

[Ersten Lieferschein hochladen →]
```

---

#### E-Mail 3: FOMO + Deadline (Tag 7)
**Betreff:** "Letzte Chance: Early Adopter Pricing für Baustruct"
**Segment:** Email 1 oder 2 geöffnet, noch nicht registriert

```
Hey {Vorname},

142 Bauunternehmen testen Baustruct bereits.
Early Adopter bekommen:
🔒 **-30% auf den ersten Jahresvertrag** (nur noch bis {Datum})
🎯 **Persönliches Onboarding** mit unserem Team
📊 **Individuelle CO2-Analyse** Deiner ersten 50 Dokumente

[Jetzt starten — kostenlos →]

PS: Dein BauGPT-Login funktioniert sofort. Kein neues Konto nötig.
```

---

### Phase 2: In-App Activation (Tag 1-14)

#### Banner-Typen (Rotation):

**Banner A — Dashboard-Top (persistent):**
```
🏗️ NEU: Einkauf & Rechnungen mit KI | 50 Dokumente/Monat kostenlos
[Jetzt testen]  [Später erinnern]
```

**Banner B — Nach Dokumenten-Upload:**
```
Du hast gerade ein Dokument mit BauGPT verarbeitet.
Wusstest Du, dass BauGPT jetzt auch Lieferscheine & Rechnungen kann?
[Baustruct entdecken →]
```

**Banner C — Settings-Page:**
```
Neues Modul verfügbar: Baustruct — KI-Einkaufssteuerung
Aktiviere es kostenlos für Dein Unternehmen.
[Modul aktivieren]
```

**Tracking:** PostHog events für jede Banner-Interaction (view, click, dismiss)

---

### Phase 3: Persönliche Outreach (Tag 3-14)

**Top-20 GU-Kunden → Felix (Sales) + Hugo (Content)**

| Aktion | Wer | Wann |
|--------|-----|------|
| LinkedIn-Nachricht an Entscheider | Hugo (Draft) + Andi (Send) | Tag 3 |
| Persönliche E-Mail vom CEO (Patrick) | Hugo (Draft) + Patrick (Send) | Tag 5 |
| 15-Min Demo-Call anbieten | Felix | Tag 7-10 |
| Follow-Up mit Case Study PDF | Hugo | Tag 14 |

**LinkedIn Nachricht (Template für Andi):**
```
Hey {Name},

kurze Info: Wir haben bei BauGPT was Neues gebaut, das perfekt zu {Firma} passt.

KI-gestützter Einkauf — Lieferscheine in 10 Sek erfassen, Rechnungen auto-prüfen, CO2 automatisch tracken.

Für {Firma} als Bestandskunde komplett kostenlos zum Testen.
Kurzer Call nächste Woche? 15 Min reichen.

Beste Grüße, Andi
```

---

### Phase 4: Onboarding-Flow (nach Registrierung)

#### In-App Onboarding (5 Schritte):

```
Step 1: Willkommen bei Baustruct
        → Firma bestätigen (aus BauGPT übernommen)
        → Rolle wählen: Einkäufer / Buchhalter / Polier / GF

Step 2: Erstes Projekt anlegen
        → Projektname + Adresse
        → Optional: Budget eingeben

Step 3: Ersten Lieferschein hochladen
        → Foto oder PDF
        → KI-Ergebnis zeigen (WOW-Moment!)
        → "Das hätte 30 Min gedauert — Du hast 10 Sek gebraucht"

Step 4: Team einladen
        → E-Mail-Einladungen an Poliere + Buchhalter
        → Rollen zuweisen

Step 5: Fertig — Dashboard zeigen
        → Übersicht: Projekt, Dokumente, CO2
        → Nächster Schritt: "Lade Deine erste Rechnung hoch"
```

**Onboarding-KPIs:**
- Step 1 → Step 3 Completion: >70%
- Time to First Document: <5 Min
- Team-Invite Rate: >30%

---

### Phase 5: Retention & Upgrade (Woche 2-8)

#### Trigger-basierte E-Mails:

| Trigger | E-Mail | Ziel |
|---------|--------|------|
| 0 Dokumente nach 3 Tagen | "Dein erster Lieferschein wartet" | Activation |
| 10 Dokumente erreicht | "Du sparst bereits X Stunden" | Engagement |
| 40/50 Free-Dokumente | "Fast am Limit — Upgrade für €49/Mo" | Conversion |
| 50/50 Free-Dokumente | "Limit erreicht — weiter mit Starter" | Conversion |
| 14 Tage ohne Login | "Dein Team hat 3 neue Lieferscheine" | Re-Engagement |
| Erster 3-Way-Match | "Perfekt! Rechnung + Lieferschein matchen" | AHA-Moment |

---

## 4. Metriken & Tracking

### PostHog Event-Taxonomie:

```javascript
// Acquisition
posthog.capture('baustruct_waitlist_signup')
posthog.capture('baustruct_email_clicked', { email_number: 1 })
posthog.capture('baustruct_banner_clicked', { banner_type: 'A' })

// Activation
posthog.capture('baustruct_onboarding_started')
posthog.capture('baustruct_onboarding_step', { step: 3 })
posthog.capture('baustruct_onboarding_completed')
posthog.capture('baustruct_first_document')

// Engagement
posthog.capture('baustruct_document_processed', { type: 'lieferschein' })
posthog.capture('baustruct_three_way_match')
posthog.capture('baustruct_team_invited', { count: 2 })

// Revenue
posthog.capture('baustruct_upgrade_started', { from: 'free', to: 'starter' })
posthog.capture('baustruct_upgrade_completed', { plan: 'starter', mrr: 49 })
```

### Weekly Dashboard (Rainman):

| Metrik | Woche 1 Ziel | Woche 4 Ziel |
|--------|-------------|-------------|
| Waitlist Signups | 200 | — |
| Beta Registrierungen | 100 | 200 |
| Aktive Nutzer (≥1 Dok/Woche) | 30 | 50 |
| Dokumente verarbeitet | 500 | 5.000 |
| Ø Time to First Document | <5 Min | <3 Min |
| Upgrade Rate (Free→Paid) | — | 20% |
| MRR | €0 | €2.450 |

---

## 5. Budget & Ressourcen

| Posten | Kosten | Verantwortlich |
|--------|--------|----------------|
| E-Mail Tool (Bestandskunden-CRM) | €0 (bestehend) | Hugo |
| In-App Banner Development | 4h Dev-Zeit | Bob |
| PostHog Events Setup | 2h | Bob + Rainman |
| LinkedIn Outreach | €0 (organisch) | Andi + Hugo |
| Demo-Calls | Internes Sales-Team | Felix |
| **Total zusätzliches Budget** | **€0** | — |

**Gesamt-CAC für erste 50 Kunden: €0.** Das ist der unfaire Vorteil.

---

## 6. Risiken & Mitigations

| Risiko | Impact | Wahrscheinlichkeit | Mitigation |
|--------|--------|--------------------|----|
| Kannibalisierung BauGPT Pro | Hoch | Niedrig | Baustruct = Add-on, kein Replacement. Separate Pricing. |
| Support-Überlastung | Mittel | Mittel | Self-Service Onboarding + FAQ Page. Controlled Beta (Batches à 50). |
| Niedrige Activation Rate | Hoch | Mittel | Persönlicher Outreach Top-20. Onboarding-Optimierung nach Woche 1. |
| Free-Tier-Missbrauch | Niedrig | Niedrig | 50 Dok/Monat = zu wenig für ernsthaften Einsatz. Natürlicher Upgrade-Druck. |
| Negative Feedback zu Beta-Qualität | Hoch | Mittel | Erwartungsmanagement: "Beta" klar kommunizieren. Schnelle Bug-Fixes (Bob). |

---

## 7. Timeline

```
Woche -1:  Vorbereitung (Banner, Emails, Landing Page)
Woche 1:   Soft Launch → Email 1 + Banner A
Woche 1+:  Email 2 (Tag 3) + Email 3 (Tag 7)
Woche 2:   Persönliche Outreach Top-20 GU
Woche 2-4: In-App Onboarding optimieren
Woche 4:   Erste Conversion-Analyse
Woche 6:   Early Adopter Pricing endet
Woche 8:   Public Launch (wenn Beta-KPIs erreicht)
```

---

## 8. Steelman: Warum dieser Plan scheitern könnte

1. **Bestandskunden wollen kein zweites Tool** — "Noch eine App" Fatigue. **Mitigation:** Kein neues Konto, gleicher Login, In-App integriert.
2. **Poliere nutzen kein Smartphone für Dokumentation** — Altersstruktur Bau. **Mitigation:** Desktop-Upload als Fallback. WhatsApp-Upload als Alternative.
3. **50 Free-Dokumente reichen für kleine Firmen dauerhaft** — kein Upgrade-Druck. **Mitigation:** Wertvolle Features (3-Way-Match, ERP) nur ab Starter. Free = OCR only.
4. **E-Mail-Fatigue** — Kunden ignorieren Marketing-Mails. **Mitigation:** In-App ist der Hauptkanal. E-Mail nur Ergänzung.
5. **Beta-Bugs zerstören First Impression** — bei Bau-Kunden gibt's keine zweite Chance. **Mitigation:** Controlled Beta, persönliches Onboarding für Top-20.

---

*Erstellt von Hugo 🚀 | 2026-03-11 | v1.0*
*Nächste Review: Nach Phase 1 (Woche 2)*
