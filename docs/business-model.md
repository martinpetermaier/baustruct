# BauGPT Procurement — Business Model
**Erstellt:** 2026-03-11 | **Autor:** Brunhilde 👩‍💻 | **Basis:** competitive-deep-dive.md (Hugo)

---

## 1. Executive Summary

BauGPT Procurement is a Procure-to-Pay platform that digitizes the complete material procurement cycle for construction companies — from order to verified, ERP-ready invoice. The model is built on **usage-based pricing** (per document), with a free tier for acquisition and a clear upgrade path to high-volume enterprise contracts.

**Core thesis:** Comstruct has validated the market (€12.5M raised, HOCHTIEF/Implenia as customers) but left the SME segment completely unaddressed. BauGPT enters with existing distribution (1,000+ customers), lower friction (free tier, transparent pricing), and native AI capabilities — undercutting Comstruct on every axis that matters to mid-market construction companies.

**The steelman against this:** Comstruct raised €12.5M and has a 3-year head start with enterprise-grade integrations (RIB, SAP, Procore). Competing on price in a segment they don't serve doesn't validate the thesis — it might mean that segment isn't profitable. Enterprise is where the money actually is.

**Why we still proceed:** BauGPT's 1,000+ existing customers give us a closed beta pool no competitor can replicate. We're not entering blind — we're activating a warm base. And the free → paid funnel de-risks customer acquisition cost entirely.

---

## 2. Pricing Model

### 2.1 Model Choice: Usage-Based (Per-Document)

**Why per-document?**
- Comstruct pioneered it — market has accepted the concept
- Aligns pricing with delivered value (each document processed = money saved)
- No sticker shock: small projects pay small amounts
- Scales naturally with company size and activity level
- Easier to sell: "you only pay when it works"

**The risk:** Unpredictable revenue for BauGPT. Mitigation: minimum monthly commits for Business/Enterprise tiers.

### 2.2 Pricing Tiers

| Tier | Monthly Base | Per-Document | Included Docs | Users | Features |
|------|-------------|--------------|---------------|-------|----------|
| **Free** | €0 | — | 50 | 3 | Lieferschein OCR, Basis-Dashboard |
| **Starter** | €49 | €0.49/Dok | 100 | 10 | + 3-Way-Match, Rechnungsprüfung |
| **Business** | €199 | €0.35/Dok | 500 + overage | 50 | + ERP-Integration, ESG Reporting |
| **Enterprise** | Custom | €0.15–0.25/Dok | Volumendeal | Unbegrenzt | + Dedicated CSM, SLA, Custom ERP |

**Overage:** Documents above included quota billed at tier rate (auto-scales).

**Annual discount:** 2 months free (≈17% discount) for annual prepay — reduces churn risk.

### 2.3 Competitive Price Positioning

| | Comstruct | BauGPT Procurement |
|---|---|---|
| Free Tier | ❌ | ✅ 50 Dok/Monat |
| Self-Service | ❌ (Demo only) | ✅ |
| Transparent Pricing | ❌ | ✅ |
| Entry Price | Unknown / Enterprise | €0 → €49 |
| Estimated per-doc (mid) | ~€0.50–3.00 | €0.35–0.49 |
| SME-accessible | ❌ | ✅ |

We undercut Comstruct by 30–85% while leaving enterprise headroom at €0.15–0.25/Dok for volume deals.

---

## 3. Unit Economics

### 3.1 Customer Segments & Profiles

**Segment A: SME / Handwerksbetrieb**
- 1–20 Mitarbeiter, 2–5 aktive Baustellen gleichzeitig
- ~50–200 Dokumente/Monat (Lieferscheine + Rechnungen)
- Starter Tier: €49 base + ~€25 overage = ~**€75 ARPU/Monat**
- Primary acquisition: BauGPT existing customer base

**Segment B: Mittelstand / Regional Contractor**
- 50–500 Mitarbeiter, 10–30 Baustellen
- ~500–2.000 Dokumente/Monat
- Business Tier: €199 base + ~€250 overage = ~**€450 ARPU/Monat**
- Primary acquisition: Content marketing + outbound

**Segment C: Enterprise / GU**
- 500+ Mitarbeiter, 50+ Baustellen
- 5.000–50.000+ Dokumente/Monat
- Enterprise Custom: ~**€2.000–8.000 ARPU/Monat**
- Primary acquisition: Direct sales, referrals

### 3.2 Customer Acquisition Cost (CAC)

**Free-to-Paid (existing BauGPT customers):**
- No paid acquisition — these users already exist in our platform
- CAC ≈ €0 (product marketing + in-app upsell only)
- Target: 10–15% of free tier users convert within 90 days

**New Acquisition (Starter/Business):**
- Content + SEO: €30–50 CAC
- Google Ads / LinkedIn: €80–150 CAC
- Blended CAC target (SME): **€60–80**

**Enterprise:**
- Direct sales, demos, trade shows
- CAC: **€1,500–4,000**
- Justified by LTV

### 3.3 Customer Lifetime Value (LTV)

**Assumptions:**
- Annual churn: 15% (SME), 8% (Business), 3% (Enterprise)
- Average customer life: 6.7y / 12.5y / 33y
- Gross margin: 75% (variable cost primarily = compute for OCR/AI + infra)

| Segment | ARPU/Mo | Gross Margin | Life (Mo) | **LTV** |
|---------|---------|--------------|-----------|---------|
| SME / Starter | €75 | 75% | 80 | **€4,500** |
| Business | €450 | 75% | 150 | **€50,625** |
| Enterprise | €4,000 | 80% | 400 | **€1,280,000** |

### 3.4 LTV:CAC Ratios

| Segment | LTV | CAC | **LTV:CAC** | Payback |
|---------|-----|-----|-------------|---------|
| SME (existing BauGPT) | €4,500 | ~€0 | ∞ | Immediate |
| SME (new acquisition) | €4,500 | €70 | **64:1** | ~1.1 months |
| Business | €50,625 | €120 | **422:1** | <1 month |
| Enterprise | €1,280,000 | €2,500 | **512:1** | ~1.5 months |

These ratios are exceptionally strong because of the free tier funnel from existing customers. The key constraint is **conversion rate from free to paid**, not CAC.

### 3.5 Gross Margin Breakdown

**Variable costs per document:**
- AI/OCR processing: ~€0.008/Dok (Claude API + Tesseract)
- Infrastructure (storage, compute): ~€0.003/Dok
- Payment processing: ~2.5% of revenue
- Total variable: ~€0.012/Dok

**At €0.35/Dok (Business tier):** Gross margin = **96.6%** on document revenue
**At €0.49/Dok (Starter tier):** Gross margin = **97.5%** on document revenue

But when factoring in base plan infrastructure, support, and CS overhead, blended gross margin target is **75–80%** — in line with SaaS benchmarks.

### 3.6 Break-Even Analysis

**Monthly fixed costs (Year 1 estimate):**
- Engineering (Bob + support): €0 (existing team)
- Infrastructure: €800/month
- Sales & Marketing: €3,000/month
- CS/Support: €1,500/month
- **Total Fixed: ~€5,300/month**

**Break-even customer count:**
- 100% Business tier: ~12 customers (€450 ARPU × 75% margin)
- Mixed portfolio: ~60–80 customers total
- With existing BauGPT conversions: achievable in **Month 1–2 of launch**

---

## 4. Revenue Projections

### 4.1 Assumptions

- BauGPT has 1,000+ existing customers
- 5% adopt Free tier in Month 1 → 50 customers on free
- 12% convert from Free to Paid within 90 days
- New acquisition: 20 SME + 5 Business/month from Month 3 onward
- 1 Enterprise deal per quarter from Month 6 onward
- Annual churn: 15%/8%/3% per segment

### 4.2 Revenue Forecast

**Year 1 (Launch + Ramp):**

| Quarter | Free Users | Paying Customers | MRR (end of period) |
|---------|------------|-----------------|---------------------|
| Q1 | 50 | 6 (conversions) | €450 |
| Q2 | 150 | 28 | €5,200 |
| Q3 | 300 | 62 | €13,400 |
| Q4 | 500 | 110 + 1 Enterprise | €27,800 |

**Year 1 ARR Target: ~€220,000**

**Year 2 (Scale):**
- 400+ paying SME/Business
- 5 Enterprise accounts
- MRR: ~€85,000
- **ARR: ~€1,020,000**

**Year 3 (Market position):**
- 1,200+ paying customers
- 20 Enterprise accounts
- MRR: ~€280,000
- **ARR: ~€3,360,000**

### 4.3 Revenue Mix (Year 3)

| Segment | Customers | % Revenue |
|---------|-----------|-----------|
| Starter (SME) | 900 | 20% |
| Business (Mid) | 280 | 28% |
| Enterprise | 20 | 52% |

Enterprise is the margin engine, but SME volume builds defensibility and brand.

---

## 5. Go-to-Market Strategy

### 5.1 Beachhead: BauGPT Existing Customer Base

**Why this is the only valid Phase 1:**
BauGPT has 1,000+ construction companies already using the platform. They trust the brand. They already pay for BauGPT Pro. A Procurement add-on is a natural expansion — zero cold outreach required.

**Execution:**
- In-app banner: "Digitalisiere deine Lieferscheine — kostenlos starten"
- Email campaign to existing customers: 3-email nurture sequence
- Dedicated onboarding for first 10 beta customers
- Offer beta customers free Business tier for 3 months in exchange for feedback + case study

**Target:** 50 free sign-ups, 6 paying customers in Month 1.

### 5.2 Phase 1: Beta (Month 1–2)

**Goal:** Validate core product with real construction workflows.

**Actions:**
1. Activate 10 hand-picked BauGPT Pro customers as design partners
2. Weekly feedback calls with each design partner
3. Prioritize bug fixes and workflow gaps over new features
4. Document ROI metrics: hours saved, errors caught, documents processed

**Success criteria:**
- NPS > 40
- At least 3 customers publicly willing to be referenced
- Average 80%+ of documents auto-matched without manual intervention
- 0 critical data loss incidents

### 5.3 Phase 2: Self-Service Launch (Month 3–4)

**Goal:** Open free tier to all BauGPT customers + limited public launch.

**Actions:**
1. Launch freemium signup — no demo required (critical differentiator vs. Comstruct)
2. Publish pricing page publicly (transparent = trust)
3. Activate 3–5 case studies from beta customers (hard numbers: "saved 12h/week")
4. SEO content: "Lieferschein digitalisieren", "Rechnungsprüfung automatisieren", "3-Way-Match Bau"
5. Begin LinkedIn content push (Hugo's lane) targeting Bauleiter + Einkaufsleiter

**Channel mix (Month 3–4):**
- BauGPT in-app: 60% of signups
- Direct/organic: 20%
- Paid social (LinkedIn): 20%

### 5.4 Phase 3: Mid-Market Push (Month 5–8)

**Goal:** Acquire first Business-tier customers who are NOT existing BauGPT users.

**Actions:**
1. Outbound: Target Einkaufsleiter and CFOs at 50–500 employee contractors (XING/LinkedIn)
2. Partner: Accounting software resellers (DATEV ecosystem), ERP consultants (RIB, SAP)
3. Events: BAU München, digitalBAU, Bauma — demo pod
4. Referral program: €200 credit per referred paying customer
5. First ERP integration live (RIB iTWO — largest DACH market share)

**KPIs:**
- 30 Business-tier customers by Month 8
- CAC < €150
- Payback < 3 months

### 5.5 Phase 4: Enterprise Motion (Month 9–12+)

**Goal:** Land first Enterprise accounts (200+ employee contractors).

**Actions:**
1. Hire first dedicated sales rep (quota: 4 Enterprise deals/year)
2. Build enterprise-grade features: SSO, custom ERP mappings, audit logs, SLA
3. Target decision process: initial contact CFO/Finanzleitung, champion = Einkaufsleitung
4. Proof-of-concept: 2-week free Enterprise pilot (10 projects, unlimited documents)
5. Leverage SME customer base for warm intros (small subs of large GCs already using product)

**Sales cycle:** 3–6 months for Enterprise
**Target:** 2 Enterprise contracts signed by end of Year 1

### 5.6 Customer Success & Expansion Revenue

The biggest untapped lever is **net revenue retention (NRR) > 100%**.

How to get there:
- Customers add more projects → more documents → automatic overage revenue
- Upsell: ESG Reporting add-on (+€99/month for Business, +€500/month for Enterprise)
- Upsell: Supplier Portal (invite suppliers to submit digitally) — €49/month add-on
- Cross-sell: BauGPT Pro features to Procurement users who don't have them

**NRR target:**
- SME: 95% (slight churn offset by usage growth)
- Business: 110%
- Enterprise: 120%

---

## 6. Risk Analysis

### 6.1 Critical Risks

**Risk 1: Comstruct launches freemium / SME offering**
- Probability: Medium (they have the cash, 12.5M raised)
- Impact: High (eliminates our key differentiator)
- Mitigation: Move fast. Capture SME market before they pivot. Build switching costs (ERP integrations, historical data).

**Risk 2: Document volume lower than projected (low usage churn)**
- Probability: Medium
- Impact: Medium (revenue misses projections)
- Mitigation: Add minimum monthly commits for Business+ tiers from Day 1.

**Risk 3: OCR/AI accuracy insufficient for production use**
- Probability: Medium-High in early days
- Impact: High (one bad invoice match destroys trust)
- Mitigation: Ship with human-in-the-loop for exceptions. Market 95%+ accuracy, not 100%. Build confidence indicators into UI.

**Risk 4: ERP integration complexity blocks enterprise deals**
- Probability: High
- Impact: Medium (slows enterprise ARR)
- Mitigation: Prioritize RIB (widest DACH market share) for V1. Use middleware (n8n / Zapier) as interim solution for other ERPs.

**Risk 5: BauGPT brand = recruiting tool, not procurement tool**
- Probability: Low-Medium
- Impact: Medium (conversion from existing base lower than expected)
- Mitigation: Consider sub-brand "BauGPT Supply" or "Baustruct" for procurement module. Keep separate positioning.

### 6.2 Competitive Moats (what protects us long-term)

1. **Data moat:** Every document processed improves our AI models. More customers = better OCR = harder to replicate.
2. **ERP integrations:** Each integration takes 2–3 months to build. First-mover advantage in each integration.
3. **Customer base:** 1,000+ existing relationships = distribution no startup can buy.
4. **Switching cost:** Once historical invoice/delivery data lives in BauGPT, migration is painful.
5. **Full-stack play:** Recruiting + Procurement + AI = no competitor offers this combination.

---

## 7. Key Metrics Dashboard

### North Star Metric
**Monthly Processed Documents** — proxy for value delivered and leading indicator for revenue.

### Acquisition
- Free signups / month
- Free-to-paid conversion rate (target: 12% at 90 days)
- CAC by channel

### Revenue
- MRR / ARR
- ARPU by segment
- MRR expansion (upsell/overage)
- MRR contraction (downgrades/churn)
- NRR (target: >100% for Business+)

### Product
- Documents processed / month (total + per customer)
- Auto-match rate (target: >95%)
- Manual intervention rate (target: <5%)
- Time-to-value: days from signup to first document processed (target: <1 day)

### Customer Success
- NPS (target: >50)
- Support ticket volume per 100 customers
- Churn rate by segment

---

## 8. Funding Requirements

For the initial 6-month sprint (MVP + first paying customers), no external funding is required — this is an add-on to existing BauGPT infrastructure.

**For Year 2 scale-up:**
- 1 sales rep: €80,000/year
- Marketing budget: €60,000/year
- Engineering (1 additional dev for ERP integrations): €90,000/year
- **Total additional: ~€230,000/year**

This can be self-funded from Year 1 ARR (target €220,000) if gross margins hold at 75%+. Enterprise deals will unlock further reinvestment.

If external capital is raised, the pitch is: **"Comstruct for the 99% of construction companies Comstruct doesn't serve."**

---

## 9. Decision Checklist (Pre-Launch)

- [ ] Free tier quota: 50 documents/month confirmed as loss leader math
- [ ] Minimum monthly commit for Business tier: €199 base (reduces revenue volatility)
- [ ] Product brand decision: "BauGPT Procurement" vs. "Baustruct" vs. "BauGPT Supply"
- [ ] First ERP integration: RIB iTWO (highest DACH priority)
- [ ] Legal: DSGVO compliance for document storage (German law, construction contracts are sensitive)
- [ ] Pricing page live before any acquisition spend
- [ ] 3 reference customers with named quotes before public launch

---

*Autor: Brunhilde 👩‍💻 | 2026-03-11 | BauGPT Procurement Sprint*
*Quellen: competitive-deep-dive.md (Hugo), comstruct-analysis.md (Hugo), Marktrecherche*
