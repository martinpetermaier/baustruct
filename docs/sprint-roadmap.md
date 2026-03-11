# BauGPT Procurement — Sprint Roadmap
**Erstellt:** 2026-03-11 | Hugo 🚀

---

## Übersicht

6-Monat-Plan: Von 0 zum marktfähigen Produkt.
Basis: Comstruct-Feature-Set + BauGPT-Differenzierung.

---

## Phase 0: Foundation (Woche 1-2) ← AKTUELL

| Deliverable | Owner | Status |
|---|---|---|
| Comstruct Competitive Analysis | Hugo | ✅ Done |
| Tech Architecture | Bob | ✅ Done |
| Business Model & Pricing | Brunhilde | ✅ Done |
| Analytics & ESG Datenmodell | Rainman | ✅ Done |
| PRODUCT-SPEC (konsolidiert) | Hugo | ✅ Done |
| DB Schema Draft | Hugo | ✅ Done |
| User Stories | Hugo | ✅ Done |
| Landing Page Copy | Hugo | ✅ Done |
| UX Flows | Hugo | ✅ Done |
| Sprint Roadmap | Hugo | ✅ Done |
| **Repo Setup + CI/CD** | **Bob** | 🔜 Next |
| **Figma Wireframes** | **Hugo** | 🔜 Backlog |

**Exit Criteria Phase 0:** Alle Docs finalisiert, Repo mit CI/CD, Bob kann coden.

---

## Phase 1: Core MVP (Woche 3-6)

**Ziel:** Lieferschein-Digitalisierung + Basis-Dashboard

### Sprint 1.1 (Woche 3-4): Backend Foundation
| Task | Owner | Prio |
|---|---|---|
| DB Setup (Supabase + Prisma) | Bob | P1 |
| Auth (Supabase Auth, Multi-Tenant) | Bob | P1 |
| Core API: Companies, Users, Projects | Bob | P1 |
| Core API: Suppliers, Products | Bob | P1 |
| RLS Policies (Row Level Security) | Bob | P1 |
| CI/CD Pipeline (GitHub Actions → Vercel) | Bob | P1 |

### Sprint 1.2 (Woche 5-6): Lieferschein + Dashboard
| Task | Owner | Prio |
|---|---|---|
| OCR Pipeline (Upload → AI Parse) | Bob | P1 |
| Delivery Note CRUD | Bob | P1 |
| Dashboard (Web): Lieferungen heute/Woche | Bob | P1 |
| Mobile App: Expo Setup | Bob | P2 |
| Mobile App: Lieferschein bestätigen | Bob | P2 |
| Landing Page implementieren | Hugo/Bob | P2 |

**Exit Criteria Phase 1:** Polier kann Lieferschein digital bestätigen (Web + Mobile).

---

## Phase 2: Procurement Core (Woche 7-10)

**Ziel:** Bestellwesen + 3-Way-Match + Rechnungsprüfung

### Sprint 2.1 (Woche 7-8): Bestellwesen
| Task | Owner | Prio |
|---|---|---|
| Purchase Orders CRUD | Bob | P1 |
| Produktkatalog (Supplier-spezifisch) | Bob | P1 |
| Bestellfreigabe-Workflow | Bob | P1 |
| Mobile: Bestellung aufgeben | Bob | P2 |
| E-Mail Notifications | Bob | P2 |

### Sprint 2.2 (Woche 9-10): Rechnungsprüfung
| Task | Owner | Prio |
|---|---|---|
| Invoice OCR + Parsing | Bob | P1 |
| 3-Way-Match Engine (PO ↔ DN ↔ Invoice) | Bob | P1 |
| KI-Kontierungsvorschläge | Bob | P1 |
| Rechnungs-Dashboard | Bob | P1 |
| Abweichungs-Handling (Dispute Flow) | Bob | P2 |

**Exit Criteria Phase 2:** Vollständiger Procure-to-Pay Flow funktioniert E2E.

---

## Phase 3: Integration & Polish (Woche 11-14)

**Ziel:** ERP-Integration + Supplier Portal + ESG

### Sprint 3.1 (Woche 11-12): Integrationen
| Task | Owner | Prio |
|---|---|---|
| ERP Export Layer (Generic) | Bob | P1 |
| RIB iTWO Integration | Bob | P1 |
| Supplier Portal (Web) | Bob | P2 |
| Push Notifications (FCM/APNs) | Bob | P2 |

### Sprint 3.2 (Woche 13-14): ESG + Analytics
| Task | Owner | Prio |
|---|---|---|
| CO2 Tracking (ÖKOBAUDAT Integration) | Bob + Rainman | P2 |
| ESG Dashboard | Bob | P2 |
| Einkaufsauswertungen | Bob | P2 |
| Skonto-Management | Bob | P2 |
| Performance Optimization | Bob | P2 |

**Exit Criteria Phase 3:** Enterprise-Ready mit ERP + ESG.

---

## Phase 4: Beta Launch (Woche 15-18)

**Ziel:** 10 Beta-Kunden aus BauGPT-Bestand

| Task | Owner | Prio |
|---|---|---|
| Beta Onboarding Flow | Hugo + Bob | P1 |
| Beta-Kunden Auswahl (10 aus 1.000+) | Hugo + Felix | P1 |
| Feedback Loop Setup | Hugo | P1 |
| Landing Page Live | Hugo | P1 |
| Sales Deck + Demo-Video | Hugo | P1 |
| Billing Integration (Stripe) | Bob | P2 |
| Bug Fixes + Feedback-Integration | Bob | P1 |

**Exit Criteria Phase 4:** 10 aktive Beta-Kunden, NPS > 7.

---

## Phase 5: Public Launch (Woche 19-24)

| Task | Owner | Prio |
|---|---|---|
| Public Pricing Page | Hugo | P1 |
| Self-Service Signup (Free Tier) | Bob | P1 |
| Marketing Campaign (LinkedIn, Google Ads) | Hugo | P1 |
| Cross-Sell an BauGPT-Bestandskunden | Hugo + Felix | P1 |
| Weitere ERP-Integrationen (SAP, Abacus) | Bob | P2 |
| Supplier Network Effekt nutzen | Hugo | P2 |
| Case Studies + Testimonials | Hugo | P2 |

**Exit Criteria Phase 5:** 50+ zahlende Kunden, MRR > €5.000.

---

## Team-Zuordnung

| Person | Rolle | Fokus |
|---|---|---|
| **Hugo** 🚀 | Product + Marketing | Specs, Research, Landing Page, GTM, Beta |
| **Bob** 👨‍💻 | Engineering | Code, Infrastructure, Integrations |
| **Brunhilde** 👩‍💼 | Business | Pricing, Unit Economics, Partnerships |
| **Rainman** 👨🏻‍🔧 | Data | Analytics Schema, ESG Model, Dashboards |
| **Andi** | Lead | Strategy, Decisions, Beta Customer Selection |
| **Felix** | Sales | Beta Outreach, Customer Feedback |

---

## Milestones

| Datum | Milestone |
|---|---|
| **KW 12** (heute) | Phase 0 Complete — Alle Docs |
| **KW 14** | Backend Foundation + DB |
| **KW 16** | MVP: Lieferschein digital bestätigen |
| **KW 20** | E2E Procure-to-Pay Flow |
| **KW 24** | ERP + ESG Integration |
| **KW 28** | Beta mit 10 Kunden |
| **KW 34** | Public Launch |

---

## Risiken

| Risiko | Impact | Mitigation |
|---|---|---|
| Bob's Kapazität (BauGPT Core + Procurement) | Hoch | Klare Prio-Absprache mit Andi |
| ERP-Integration komplexer als erwartet | Mittel | Generic Export Layer zuerst, dann Custom |
| Beta-Kunden finden kein Value | Hoch | 3 Personas = 3 Value Props testen |
| Comstruct reagiert aggressiv | Niedrig | Unser Free Tier + Distribution = Moat |
| OCR-Qualität bei schlechten Lieferscheinen | Mittel | Fallback auf manuelle Eingabe + KI-Learning |

---

*Stand: 2026-03-11 | Hugo 🚀*
