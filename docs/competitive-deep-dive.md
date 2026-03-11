# Comstruct — Competitive Deep Dive
**Erstellt:** 2026-03-11 18:30 | Hugo 🚀 | Sprint Run #2

---

## 🔑 Key Findings (NEU — Run #2)

### Positionierung (aktuell auf comstruct.com)
- **Headline:** "Automatisch vom Lieferschein zur geprüften Rechnung"
- **Sub:** "comstruct automatisiert Ihre Rechnungsprüfung vollständig, indem Lieferscheine direkt vom Lieferanten automatisch mit Bestellungen und Rechnungen abgeglichen werden."
- **Feature-Headline:** "Autonome KI-Agenten für Procure-to-Pay" ← WICHTIG! Sie positionieren sich mit "KI-Agenten", nicht nur "KI"
- **CTA:** "Jetzt Termin buchen — Kostenlose Beratung zur Automatisierung Ihrer Rechnungsprüfung"

### Ansprache
- **FORMELL:** Comstruct nutzt **"Sie/Ihre"** — nicht Du/Dein
- **Stil:** Enterprise, professionell, sachlich
- → **BauGPT Differenzierung:** Wir nutzen "Du/Dein" — nahbarer, moderner

### Verified Kundenaussagen (direkt von comstruct.com)

| Kunde | Person | Rolle | Quote |
|-------|--------|-------|-------|
| **HOCHTIEF** | Maximilian von Wedel | Strategische Projektleitung Beschaffung, ESG und Digitalisierung | "comstruct ist ein schneller und zuverlässiger Partner. Sie haben genau verstanden, wo wir bei HOCHTIEF welche Herausforderungen mit Materialdaten hatten und dort innerhalb ihrer Plattform effektive Lösungen mit uns erarbeitet, die wir jetzt unternehmensweit einsetzen!" |
| **ERNE AG** | Ramon Schweizer | Leiter VDC & Digitalisierung | "Unsere Poliere haben die Tools von Tag 1 an genutzt und es funktioniert heute noch wunderbar." |
| **Implenia** | Adrian Wiederkehr | Finanzbuchhalter, Implenia Schweiz AG | "Rechnungsprüfung und Freigabe dauerten täglich zwei bis drei Stunden wegen der vielen Rechnungen. Heute, dank comstruct, dauert es nur Minuten." |
| **ARGE secondo tubo** | Carla Rieder-Schule | Kaufmännische Assistentin | "Ich darf mit meinen 20 Jahren Erfahrung sicher sagen, dass das jetzt für mich eine der besten Lösungen ist." |

### Case Study Details (aus Search-Ergebnissen)

**HOCHTIEF:**
- Europaweite Partnerschaft
- Fokus: Automatisiertes ESG-Reporting, Transparenz im Lieferanten-Controlling, globale Skalierbarkeit

**Implenia (Gotthard-Tunnel-Projekt):**
- 3+ Stunden/Tag gespart (= 15h/Woche) bei Rechnungsabgleich
- Signifikante Fehlerreduktion
- Mehr Fokus auf Kernaufgaben statt Administration

---

## 🏗️ Technische Details

### Procore Integration
- Comstruct hat ein **Procore Marketplace Listing**: "comstruct Delivery Notes"
- → Integration mit dem größten Construction Management Tool weltweit
- → BauGPT sollte AUCH Procore-Integration planen

### Tech Stack (Research-basiert)
- **Website:** Framer (JS-rendered, moderne SPA)
- **Mobile:** iOS + Android (native oder cross-platform)
- **Backend:** Vermutlich Cloud-native (Google/AWS — deutsches Hosting für DSGVO)
- **AI:** OCR + NLP für Dokumentenverarbeitung, "Autonome KI-Agenten"
- **Integrationen:** EDI, E-Mail-Parsing, Supplier Portal, API

### ERP-Integrationen (verifiziert)
| ERP | Status | Notes |
|-----|--------|-------|
| RIB | ✅ Partnership (03.03.2026) | Flagship Bau-ERP, iTWO/MTWO |
| SAP | ✅ | Enterprise |
| Abacus | ✅ | Schweiz-Fokus |
| Sorba | ✅ | Schweiz-Fokus |
| ABBF | ✅ | |
| Procore | ✅ Marketplace | Construction Management |
| DocuWare | ✅ | DMS |
| JobRouter | ✅ | Workflow |

---

## 💰 Pricing Deep Dive

### Was wir wissen
- **Modell:** Per-Document (usage-based) — KEIN fixer Lizenzpreis
- **Vorteile:** Skaliert mit Projektgröße, Alignment mit Kundennutzen
- **Konkrete Preise:** Nicht öffentlich verfügbar, "customized pricing"
- **Sales:** Demo-basiert, kein Self-Service
- **Target:** Enterprise (HOCHTIEF, Implenia = €10M+ Projekte)

### Pricing-Benchmarks (Markt)
Basierend auf Markt-Research für Construction Procurement Software 2025/2026:
- **Tiered Plans:** Basic/Standard/Premium üblich
- **User-basiert:** $25-150/User/Monat bei anderen Tools
- **Per-Document:** Einzigartig für Comstruct — $0.50-3.00/Dokument geschätzt
- **Enterprise Custom:** Ab $1.000+/Monat

### BauGPT Pricing-Strategie (Vorschlag)
| Tier | Preis | Dokumente | Nutzer | Features |
|------|-------|-----------|--------|----------|
| **Free** | €0 | 50/Monat | 3 | Basis OCR + Lieferscheine |
| **Starter** | Ab €0,50/Dok | Bis 500/Mo | 10 | + Rechnungsprüfung |
| **Business** | Ab €0,35/Dok | 500-5.000/Mo | 50 | + ERP, + ESG |
| **Enterprise** | Custom | Unbegrenzt | Unbegrenzt | + Dedicated Support |

**Differenzierung:** BauGPT bietet **Free Tier** — Comstruct hat kein Self-Service!

---

## 📊 Marktpositionierung

### Comstruct Stärken
1. ✅ €12.5M Funding (GV, 20VC) — starkes Signal
2. ✅ Enterprise-Kunden (HOCHTIEF, Implenia) — Social Proof
3. ✅ First Mover in DACH für Bau-Procurement
4. ✅ Procore + RIB Partnerships
5. ✅ 4 Gründer — breite Expertise

### Comstruct Schwächen
1. ❌ Kein Self-Service / Free Tier — hohe Einstiegshürde
2. ❌ Enterprise-fokussiert — ignoriert KMU / Handwerker
3. ❌ Pricing nicht transparent — Vertrauens-Killer
4. ❌ Keine bestehende Plattform — muss alles von Null aufbauen
5. ❌ Formelle Ansprache ("Sie") — wenig zeitgemäß für Digital Natives

### BauGPT Vorteile
1. 🚀 **1.000+ bestehende Kunden** = Distribution Day 1
2. 🚀 **KI-Infrastruktur** bereits vorhanden (OCR, NLP, Templates)
3. 🚀 **Brand Trust** in Bau-Industrie
4. 🚀 **Free Tier möglich** — Lead Generation Engine
5. 🚀 **Recruiting + KI + Procurement** = einzigartige Full-Stack-Plattform
6. 🚀 **"Du"-Ansprache** — moderner, nahbarer
7. 🚀 **Schnellere Entwicklung** — bestehende Codebasis + Team

---

## 🎯 Go-to-Market Empfehlung

### Phase 1: Proof of Concept (Monat 1-2)
- OCR + Lieferschein-Digitalisierung als Feature in BauGPT Pro
- 10 Beta-Kunden aus bestehendem Pool
- Free Tier für Lead Generation

### Phase 2: MVP (Monat 3-4)
- 3-Way-Match (Bestellung ↔ Lieferschein ↔ Rechnung)
- Mobile App für Poliere
- 1 ERP-Integration (RIB oder SAP)

### Phase 3: Scale (Monat 5-6)
- Supplier Portal
- Weitere ERP-Integrationen
- ESG Reporting
- Pricing auf Per-Document

### Differenzierungsstrategie
1. **Price:** Undercut Comstruct mit Free Tier + transparentem Pricing
2. **Distribution:** Cross-sell an 1.000+ BauGPT-Bestandskunden
3. **Product:** KI-First (nicht Workflow-First wie Comstruct)
4. **Brand:** "Du/Dein" + Bau-Community vs. Enterprise-Kälte

---

## 📱 App Store Intelligence

### Google Play
- **App ID:** eu.comstruct.comstruct
- **Kategorie:** Business / Productivity
- Details zu Reviews und Downloads konnten in diesem Run nicht extrahiert werden (JS-rendered)
- → Nächster Run: Browser-basierte Extraktion für Screenshots + Reviews

### Feature-Vergleich (Mobile App)
| Feature | Comstruct | BauGPT Procurement (geplant) |
|---------|-----------|------------------------------|
| Lieferkalender | ✅ | ✅ |
| Digitale Lieferscheine | ✅ | ✅ |
| Foto-Upload | ✅ | ✅ |
| Offline-Mode | ✅ | ✅ |
| Bestellung aufgeben | ✅ | ✅ |
| Verbrauchsauswertung | ✅ | ✅ |
| Free Tier | ❌ | ✅ ← Differenzierung |
| KI-Dokumentenverstehen | Basis | ✅ Advanced (BauGPT Pro) |
| Recruiting-Integration | ❌ | ✅ ← Unique |

---

*Erstellt: Hugo 🚀 | 2026-03-11 18:30 | Sprint Run #2*
*Quellen: comstruct.com, Procore Marketplace, Web Research, Tracxn, PitchBook*
