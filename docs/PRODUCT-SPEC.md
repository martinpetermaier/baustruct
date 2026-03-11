# BauGPT Procurement — Product Specification (Consolidated)
**Version:** 1.0 (Draft) | **Stand:** 2026-03-11 | **Lead:** Hugo 🚀
**Status:** ⚠️ 90% — Analytics-Datenmodell fehlt noch (Rainman)

---

## 1. Executive Summary

**BauGPT Procurement** ist eine Multi-Tenant Procure-to-Pay Plattform für die Bauindustrie.

**Core-Flow:**
```
Bestellung → Digitaler Lieferschein → KI-Prüfung → Buchungsfertige Rechnung → ERP
```

**Marktthese:** Comstruct hat den Markt validiert (€12.5M raised, HOCHTIEF/Implenia als Kunden), aber den KMU-Markt komplett ignoriert. BauGPT hat 1.000+ Bestandskunden als Distributionskanal, native KI-Kompetenz, und kann mit einem Freemium-Modell den Markt von unten aufrollen.

**Ziel:** Comstruct's Feature-Set 1:1 klonen, mit BauGPT's Stärken (Distribution, AI, Pricing) als Differenzierung.

---

## 2. Problem Statement

| Problem | Impact | Betrifft |
|---------|--------|----------|
| Manuelle Rechnungsprüfung | 2-3h/Tag (Implenia Case) | Buchhaltung |
| Papier-Lieferscheine | Fehler, Verlust, kein Audit-Trail | Poliere |
| Kein Abgleich Bestellung ↔ Rechnung | ~12% Mehrkosten durch Falschabrechnungen | Einkauf |
| Keine Transparenz zwischen Baustelle, Einkauf, Finanzen | Doppelbestellungen, verpasste Skonti | Alle |
| Kein ESG/CO2-Reporting für Materialien | CSRD-Compliance-Risiko | GF/CFO |

---

## 3. User Personas

### Persona 1: Polier / Bauleiter (Baustelle — Mobile First)
- **Sieht:** Lieferkalender, ankommende Bestellungen
- **Macht:** Lieferscheine bestätigen/ablehnen, Schäden fotografieren, nachbestellen
- **Pain:** Papierchaos, kein Überblick, falsche Lieferungen
- **Key Metric:** Zeit pro Lieferschein-Bestätigung (Ziel: <30 Sekunden)

### Persona 2: Einkäufer (Procurement — Web)
- **Sieht:** Alle Bestellungen, Vertragspreise, Auswertungen
- **Macht:** Produktkatalog pflegen, Bestellungen freigeben, Preisabweichungen prüfen
- **Pain:** Manuelle Preisvergleiche, keine Gesamtübersicht über Baustellen
- **Key Metric:** Procurement Savings (Ziel: >5% durch Preisvergleich)

### Persona 3: Buchhalter / Finanzen (Accounting — Web)
- **Sieht:** Eingehende Rechnungen, 3-Way-Match-Status, Buchungsvorschläge
- **Macht:** Rechnungen freigeben, in ERP buchen, Skonti-Management
- **Pain:** Stundenlange Rechnungsprüfung, manuelle ERP-Eingabe
- **Key Metric:** % Rechnungen direkt buchungsfertig (Ziel: >95%)

### Persona 4: Lieferant (Sekundär — Web Portal)
- **Sieht:** Bestellungen, Lieferschein-Status
- **Macht:** Lieferscheine digital einreichen
- **Pain:** Papier, Rückfragen, lange Zahlungsziele

---

## 4. Feature Map

### 4.1 Baustelle (Mobile App)
| Feature | Priorität | MVP |
|---------|-----------|-----|
| Lieferkalender (heute/Woche) | P1 | ✅ |
| Digitale Lieferschein-Bestätigung | P1 | ✅ |
| Foto-Dokumentation bei Schäden | P1 | ✅ |
| Material nachbestellen (Produktkatalog) | P2 | ❌ |
| Verbrauchsauswertung pro Projekt | P3 | ❌ |
| Offline-Fähigkeit | P1 | ✅ |
| Push-Notifications (Lieferverzögerung) | P2 | ❌ |

### 4.2 Einkauf (Web App)
| Feature | Priorität | MVP |
|---------|-----------|-----|
| Produktkatalog mit Vertragspreisen | P1 | ✅ |
| Bestellungen erstellen/freigeben | P1 | ✅ |
| Automatischer Rechnungsabgleich vs. Vertragspreise | P1 | ✅ |
| Einkaufsauswertungen (Volumen, Lieferanten) | P2 | ❌ |
| Lieferantenmanagement | P2 | ❌ |
| Preislisten-Import (CSV/Excel) | P2 | ❌ |

### 4.3 Finanzen (Web App)
| Feature | Priorität | MVP |
|---------|-----------|-----|
| KI-Rechnungsprüfung (OCR + AI) | P1 | ✅ |
| 3-Way-Match (Bestellung ↔ Lieferschein ↔ Rechnung) | P1 | ✅ |
| KI-Kontierungsvorschläge | P1 | ✅ |
| Skonto-Management / Fristübersicht | P2 | ❌ |
| ERP-Integration (RIB, DATEV, SAP) | P2 | ❌ |
| ESG/CO2-Reporting | P3 | ❌ |

### 4.4 KI-Core
| Feature | Priorität | MVP |
|---------|-----------|-----|
| OCR für Lieferscheine + Rechnungen | P1 | ✅ |
| AI Invoice Parsing (Positionsebene) | P1 | ✅ |
| Automatischer Preisvergleich vs. Vertrag | P1 | ✅ |
| KI-Kontierungsvorschläge | P1 | ✅ |
| Anomalie-Erkennung (Duplikate, Abweichungen) | P2 | ❌ |

### 4.5 Supplier Portal (Phase 3)
| Feature | Priorität | MVP |
|---------|-----------|-----|
| Lieferschein digital einreichen | P3 | ❌ |
| Bestellstatus einsehen | P3 | ❌ |
| Rechnungsstellung auf Basis Lieferscheine | P3 | ❌ |

---

## 5. MVP Scope (User Stories)

**7 Core Stories für MVP — das ist der Kern von Comstruct's Value Proposition:**

| ID | Story | Persona | Priorität |
|----|-------|---------|-----------|
| US-01 | Lieferkalender — alle Lieferungen heute/Woche sehen | Polier | P1 |
| US-02 | Lieferschein digital bestätigen/ablehnen per App | Polier | P1 |
| US-05 | Produktkatalog mit Vertragspreisen konfigurieren | Einkauf | P1 |
| US-06 | Bestellungen freigeben von überall | Einkauf | P1 |
| US-07 | Rechnungsabgleich mit Vertragspreisen (automatisch) | Einkauf | P1 |
| US-09 | Automatische Rechnungsprüfung (OCR + 3-Way-Match) | Finanzen | P1 |
| US-10 | KI-Kontierungsvorschläge | Finanzen | P1 |

**Vollständige User Stories:** → `docs/user-stories.md`

---

## 6. Tech Architecture (Bob)

### Tech Stack
| Layer | Technologie |
|-------|------------|
| Frontend Web | Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui |
| State | Zustand + TanStack Query v5 |
| Mobile | Expo (React Native) |
| Backend | Next.js API Routes, Prisma ORM, Zod |
| Auth | Supabase Auth (JWT, OAuth, RLS) |
| DB | Supabase PostgreSQL (Multi-Tenant mit RLS) |
| Storage | Supabase Storage (PDFs, Scans) |
| AI/OCR | OpenAI GPT-4o (structured output) |
| Background Jobs | Inngest (OCR Queue, 3-Way-Match, ERP Export) |
| Hosting | Vercel |
| Monitoring | Sentry + PostHog |
| CI/CD | GitHub Actions |

### Architecture Pattern
```
Clients (Web + Mobile)
    ↓ HTTPS
Next.js API Routes (Vercel)
    ├── Supabase (PostgreSQL + Auth + Storage)
    └── Inngest (Background Jobs)
            └── OpenAI GPT-4o (Document Parsing + Matching)
```

### Security Model
- **Multi-Tenant:** company_id + Row Level Security (RLS) ab Tag 1
- **RBAC:** polier / einkauf / buchhaltung / admin
- **JWT Auth** via Supabase
- **Soft Deletes** für Audit-Trail

### AI Pipeline
```
Upload PDF → Supabase Storage → Inngest: ocr.process → GPT-4o Vision (structured output)
→ Parse: Lieferant, Datum, Positionen, Preise, Confidence Score
→ Inngest: invoice.three-way-match → Auto-Matching gegen POs + Delivery Notes
→ Status: matched / partial / deviation
```

### ERP Integration (Adapter Pattern)
- Phase 1: RIB iTWO, DATEV, Generic CSV/Excel
- Pattern: `ErpAdapter` Interface → konkrete Implementierungen pro ERP

**Vollständige Tech-Architektur:** → `docs/tech-architecture.md`

---

## 7. Database Schema

### Core Tables
- `companies` — Mandanten (Multi-Tenant)
- `users` — Mitarbeiter (mit Rollen: polier/einkauf/buchhaltung/admin)
- `projects` — Baustellen/Projekte
- `suppliers` — Lieferanten
- `products` — Produktkatalog mit Vertragspreisen

### Transaktionen
- `purchase_orders` + `purchase_order_items` — Bestellungen
- `delivery_notes` + `delivery_note_items` + `delivery_note_attachments` — Lieferscheine
- `invoices` + `invoice_items` — Rechnungen
- `invoice_purchase_order_links` — 3-Way-Match Verknüpfung

### Audit & Analytics
- `audit_log` — Alle Änderungen mit JSONB-Diff

### Status Flows
```
Purchase Order: draft → pending_approval → approved → sent → delivered
Delivery Note:  pending → confirmed / disputed / rejected
Invoice:        received → ai_processing → ready_to_book → booked / disputed → paid
```

**Vollständiges DB-Schema:** → `docs/db-schema-draft.md`

---

## 8. Business Model (Brunhilde)

### Pricing Tiers

| Tier | Basis/Mo | Per-Dok | Included | Users |
|------|----------|---------|----------|-------|
| **Free** | €0 | — | 50 Dok | 3 |
| **Starter** | €49 | €0.49 | 100 Dok | 10 |
| **Business** | €199 | €0.35 | 500 Dok | 50 |
| **Enterprise** | Custom | €0.15–0.25 | Volume | ∞ |

### Competitive Price Positioning
- **Comstruct:** Kein Free Tier ❌, kein Self-Service ❌, keine transparenten Preise ❌
- **BauGPT Procurement:** Free Tier ✅, Self-Service ✅, transparente Preise ✅
- Undercut Comstruct by 30–85% + Freemium für Acquisition

### Unit Economics (Highlight)
| Segment | ARPU/Mo | CAC | LTV:CAC | Payback |
|---------|---------|-----|---------|---------|
| SME (existing BauGPT) | €75 | ~€0 | ∞ | Immediate |
| Business | €450 | €120 | 422:1 | <1 Mo |
| Enterprise | €4.000 | €2.500 | 512:1 | ~1.5 Mo |

### Revenue Projections
- **Year 1 ARR:** ~€220.000
- **Year 2 ARR:** ~€1.020.000
- **Year 3 ARR:** ~€3.360.000

### Go-to-Market (5 Phasen)
1. **Beachhead:** BauGPT Bestandskunden (50 Free → 6 Paid in Month 1)
2. **Beta:** 10 Design Partner, Weekly Feedback (Month 1-2)
3. **Self-Service Launch:** Freemium öffentlich + SEO + LinkedIn Push (Month 3-4)
4. **Mid-Market:** Outbound + ERP Partner + Events (Month 5-8)
5. **Enterprise:** Dedicated Sales, SSO, Custom ERP (Month 9-12+)

**Vollständiges Business Model:** → `docs/business-model.md`

---

## 9. Analytics & Data Model

> ⚠️ **PENDING — Rainman's Deliverable**
> 
> Erwartete Inhalte:
> - Event-Tracking Schema (Segment/Snowflake)
> - Core KPIs & Metrics (Conversion Funnel, Document Processing Stats)
> - Dashboard-Anforderungen
> - Datenmodell für Reporting (ESG/CO2, Kosten, Lieferanten-Performance)
> - PostHog Event-Setup

**Placeholder KPIs (aus business-model.md):**
- **North Star:** Monthly Processed Documents
- Acquisition: Free signups, F2P conversion (target: 12% at 90d)
- Revenue: MRR/ARR, ARPU by segment, NRR (target: >100%)
- Product: Auto-match rate (target: >95%), time-to-value (<1 day)
- CS: NPS (target: >50), churn by segment

---

## 10. Competitive Position

### Comstruct (Hauptwettbewerber)
| Aspekt | Comstruct | BauGPT Procurement |
|--------|-----------|-------------------|
| Funding | €12.5M | Bootstrapped (BauGPT-Infra) |
| Kunden | HOCHTIEF, Implenia, ERNE AG | 1.000+ BauGPT-Bestandskunden |
| Pricing | Demo-only, opak | Transparent, Self-Service, Free Tier |
| Ansprache | Sie/Ihre (Enterprise) | Du/Dein (nahbar, modern) |
| Positioning | "Autonome KI-Agenten" | "KI-native Procure-to-Pay" |
| SME-Zugang | ❌ | ✅ (Freemium) |
| Full-Stack | Nur Procurement | KI + Recruiting + Procurement |

### BauGPT Moats
1. **Distribution:** 1.000+ Bestandskunden = warme Leads
2. **Data Moat:** Jedes Dokument verbessert AI-Modelle
3. **ERP-Integrationen:** First-Mover je Integration (2-3 Monate pro ERP)
4. **Switching Costs:** Historische Daten = Lock-in
5. **Full-Stack:** Recruiting + AI + Procurement — niemand bietet diese Kombi

### Risiken (Steelman)
1. Comstruct launched Freemium → eliminiert Differenzierung → **Mitigierung:** Speed, First-Mover SME
2. Niedrige Document-Volume bei KMUs → **Mitigierung:** Minimum Monthly Commits ab Business
3. OCR-Genauigkeit unzureichend für Production → **Mitigierung:** Human-in-the-loop, 95%+ Target
4. ERP-Integration blockt Enterprise-Deals → **Mitigierung:** RIB first, Middleware als Interim
5. Brand = Recruiting, nicht Procurement → **Mitigierung:** Sub-Brand "Baustruct" evaluieren

---

## 11. Marketing & Landing Page

### Positioning
**Tagline:** "Von der Bestellung zur gebuchten Rechnung — automatisch."

### Target Keywords (SEO)
- Rechnungsprüfung Bauunternehmen
- Digitale Lieferscheine Bau
- Materialbeschaffung Software Bau
- Procure to Pay Baubranche

### Landing Page Structure
1. Hero (Headline + Animation: Lieferschein → KI → Buchung ✓)
2. Social Proof Bar (1.000+ Bauunternehmen)
3. Problem Section (3 Pain Cards)
4. Solution / How It Works (Flow-Diagram)
5. Features (3 Spalten: Baustelle / Einkauf / Finanzen)
6. Pricing (transparent)
7. FAQ
8. CTA: Demo buchen / Kostenlos starten

**Vollständige Landing Page Copy:** → `docs/landing-page.md`
**Marketing Strategy:** → `docs/marketing-strategy.md`

---

## 12. Roadmap

### Phase 1: MVP (Wochen 1-6)
- Auth, Multi-Tenant, Rollen
- Bestellwesen (CRUD + Approval-Flow)
- Lieferschein-Upload + manuelle Erfassung
- Rechnungs-Upload + manuelle Erfassung
- Einfacher 3-Way-Match (manuell)

### Phase 2: KI-Features (Wochen 7-10)
- OCR Pipeline (Inngest + GPT-4o)
- Automatischer 3-Way-Match
- KI-Kontierungsvorschläge
- Anomalie-Erkennung

### Phase 3: Mobile + Integrationen (Wochen 11-16)
- Expo Mobile App (Polier)
- RIB Integration
- DATEV Export
- ESG/CO2 Reporting

### Phase 4: Scale (Wochen 17+)
- Supplier Portal
- Weitere ERP-Integrationen (SAP, Abacus)
- Enterprise Features (SSO, Audit Logs, SLA)
- International Expansion

---

## 13. Pre-Launch Decision Checklist

- [ ] **Produktname:** "BauGPT Procurement" vs. "Baustruct" vs. "BauGPT Supply" → Andi-Entscheidung
- [ ] **Free Tier Quota:** 50 Dok/Monat bestätigen (Loss-Leader-Rechnung)
- [ ] **Minimum Monthly Commit:** €199 für Business (Revenue-Stabilität)
- [ ] **Erste ERP-Integration:** RIB iTWO (höchste DACH-Marktabdeckung)
- [ ] **DSGVO-Compliance:** Dokumentenspeicherung, Aufbewahrungsfristen
- [ ] **3 Referenzkunden** mit namentlichen Quotes vor Public Launch
- [ ] **Pricing Page** live vor jeder Acquisition-Kampagne
- [ ] **Analytics-Setup** (PostHog Events, Snowflake-Pipeline) → Rainman

---

## 14. Document Index

| Dokument | Autor | Status |
|----------|-------|--------|
| `comstruct-analysis.md` | Hugo 🚀 | ✅ Complete |
| `competitive-deep-dive.md` | Hugo 🚀 | ✅ Complete |
| `marketing-strategy.md` | Hugo 🚀 | ✅ Complete |
| `landing-page.md` | Hugo 🚀 | ✅ Complete |
| `user-stories.md` | Hugo 🚀 | ✅ Complete |
| `db-schema-draft.md` | Hugo 🚀 | ✅ Complete |
| `tech-architecture.md` | Bob 👨‍💻 | ✅ Complete |
| `business-model.md` | Brunhilde 👩‍💼 | ✅ Complete |
| `analytics-datamodel.md` | Rainman 👨🏻‍🔧 | ❌ **PENDING** |
| `PRODUCT-SPEC.md` | Hugo 🚀 | ⚠️ 90% (Analytics pending) |

---

## 15. Steelman Against This Entire Project

**Why this might fail:**
1. **Comstruct has 3-year head start + €12.5M** — they can iterate faster with more resources
2. **Enterprise customers (HOCHTIEF, Implenia) = powerful references** we can't match Day 1
3. **Procurement ≠ Marketing/Recruiting** — brand stretch risk for BauGPT
4. **Engineering bandwidth** — Bob is already stretched across BauGPT core product
5. **KMU segment might not be profitable** — Comstruct avoided it for a reason

**Why we proceed anyway:**
1. **1.000+ warm customers** — no competitor has this distribution in DACH
2. **€0 CAC** for first cohort — de-risks the bet completely
3. **AI is our core competence** — not bolt-on like it is for Comstruct
4. **Free tier validates demand** before committing to enterprise features
5. **Cross-sell flywheel:** Recruiting → AI → Procurement = Full-Stack lock-in

---

*Consolidated by Hugo 🚀 | 2026-03-11 | Sources: All team docs*
*Next: Finalize when Rainman delivers analytics-datamodel.md*
