# COMSTRUCT CLONE — Master Research Brief
**Erstellt:** 2026-03-11 | **Lead:** Hugo 🚀 | **Auftrag:** Andi

---

## 🎯 Ziel

Comstruct's Kernprodukt 1:1 verstehen und als **BauGPT Procurement** nachbauen.

---

## 🏢 Über Comstruct

| Eigenschaft | Detail |
|---|---|
| **Website** | https://comstruct.com |
| **Headquarter** | München, Deutschland |
| **Gegründet** | 2022 |
| **Founder** | Dominik Brosch, Henric Meinhardt, Jonas Beckort, Julian Hufnagel |
| **Funding** | €12.5M (Feb 2025) — GV, 20VC, Booom, Puzzle Ventures |
| **Märkte** | DACH + Schweden, Norwegen, Frankreich, Polen, Tschechien |
| **Kunden** | HOCHTIEF, ERNE AG, Implenia, ARGE secondo tubo |
| **Pricing** | Per-Document (kein fixer Lizenzpreis) |

---

## 🔧 Was Comstruct macht

**Kern-Produkt:** Procure-to-Pay Plattform für Materialbeschaffung im Bau

**Problem:** 
- Analoge Lieferscheine → manuelle Rechnungsprüfung → Fehler, Verzögerungen
- Unkoordinierte Bestellungen → Doppelbestellungen, Chaos
- Keine Transparenz zwischen Baustelle, Einkauf und Buchhaltung
- ESG Reporting unmöglich ohne digitale Materialdaten

**Lösung:**
Vollautomatischer Procure-to-Pay Flow:
```
Bestellung → digitaler Lieferschein → KI-Prüfung → buchungsfertige Rechnung
```

---

## 🏗️ Feature Map (vollständig)

### 1. BAUSTELLE (Field App — Mobile)
- Kalender für alle ankommenden Lieferungen (Bestellübersicht)
- Digitale Lieferschein-Ablage (statt Papier)
- Lieferscheine bestätigen/ablehnen per App
- Projektauswertungen für Verbräuche und Finanzen
- Fotos bei Lieferung anfügen
- Bestellungen direkt von Baustelle aufgeben

### 2. EINKAUF (Procurement — Web)
- Bestellbare Produkte für Baustellen konfigurieren (Produktkatalog)
- Vertragsdaten/Preise hinterlegen
- Automatischer Rechnungsabgleich mit Vertragsdaten
- Bestellungen verwalten und freigeben
- Auswertungen für Einkäufe & Verbrauchsmengen
- Lieferantenanbindung (EDI, E-Mail-Parsing, Supplier Portal)

### 3. FINANZEN (Accounting — Web)
- >95% Rechnungen direkt buchungsfertig
- KI-Kontierungsvorschläge (automatische Buchungscodes)
- Automatischer 3-Way-Match: Bestellung ↔ Lieferschein ↔ Rechnung
- Abweichungen werden hervorgehoben (AI-gestützt)
- Keine Skonti mehr verpassen (Fristmanagement)
- Direkt in ERP buchen (keine manuelle Übertragung)

### 4. KI-CORE
- OCR für Lieferscheine und Rechnungen
- AI Invoice Parsing (Positionsebene — nicht nur Gesamtbetrag!)
- Automatischer Preisvergleich (Rechnung vs. Vertragspreise)
- KI-Kontierungsvorschläge
- Anomalie-Erkennung (Duplikate, Abweichungen)

### 5. REPORTING & ANALYTICS
- Einkaufsvolumen-Dashboard
- Materialkosten-Trends
- Lieferantenperformance
- Projektkosten-Tracking
- ESG/CO2-Reporting (CSRD-konform)
- Sustainability KPIs

### 6. INTEGRATIONEN
- **ERP:** RIB (neues Partnership 03.03.2026!), SAP, Abacus, Sorba, ABBF
- **Projektmanagement:** Procore
- **Dokumentenmanagement:** DocuWare
- **Workflow:** JobRouter
- **Datenaustausch:** EDI, E-Mail-Parsing, API

### 7. MOBILE APP (iOS + Android)
- Polier-App für Baustelle
- Lieferscheine empfangen + bestätigen
- Bestellübersicht (Kalender)
- Fotos anhängen
- Offline-fähig (Baustelle oft ohne Internet)

---

## 👥 User Personas

### Polier / Bauleiter (Baustelle)
- Sieht: Welche Lieferungen kommen heute/diese Woche?
- Macht: Lieferschein bestätigen, Mängel fotografieren, Mengen prüfen
- Pain: Papierchaos, fehlende Übersicht, falsche Lieferungen

### Einkäufer / Procurement
- Sieht: Alle Bestellungen, Vertragspreise, Auswertungen
- Macht: Produktkatalog pflegen, Bestellungen freigeben, Abweichungen prüfen
- Pain: Manuelle Preisvergleiche, keine Übersicht über alle Baustellen

### Buchhalter / Finanzen
- Sieht: Eingehende Rechnungen, Prüfstatus, Buchungsvorschläge
- Macht: Rechnungen freigeben, in ERP buchen
- Pain: Manuelle Rechnungsprüfung dauert Stunden täglich (ERNE AG: 2-3h/Tag → Minuten mit comstruct)

---

## 💰 Business Model

- **Pricing:** Per-Document (keine Lizenz)
  - → Alignment mit Kundennutzen: mehr Dokumente = mehr Wert
  - → Skaliert mit Projektgröße
- **Sales:** Demo-basiert (kostenlose Beratung auf Website)
- **Customer Success:** Enterprise-fokus (HOCHTIEF, Implenia = Großbaustellen)

---

## 🔄 BauGPT Clone — Produktname Vorschlag

**"BauGPT Procurement"** oder **"BauGPT Supply"**

### Vorteile BauGPT hat gegenüber Comstruct:
1. Bereits 1k+ Unternehmen als Kunden → Distribution Day 1
2. KI-Infrastruktur bereits vorhanden
3. Brand-Trust in Bau-Industrie
4. Kombination mit BauGPT Pro (Dokumentenverstehen) = natürlicher Fit
5. Recruiting + KI + jetzt Procurement = Full-Stack Bau-Platform

---

## 📋 Offene Forschungsfragen (für Team-Delegation)

1. **BOB:** Wie ist die Tech-Architektur aufgebaut? (DB Schema, API-Design, Tech Stack)
2. **RAINMAN:** Wie funktioniert das Reporting/Analytics intern? (Datenmodell für ESG, Kosten)
3. **BRUNHILDE:** Business Model Analyse, Pricing Deep-Dive, Go-to-Market
4. **HUGO:** Marketing-Positionierung, Landing Page Konzept, Competitor Differenzierung

---

## 🗂️ Dateien in diesem Folder

- `00-MASTER-BRIEF.md` ← diese Datei
- `01-tech-architecture.md` → Bob's Deliverable
- `02-analytics-datamodel.md` → Rainman's Deliverable
- `03-business-model.md` → Brunhilde's Deliverable
- `04-marketing-strategy.md` → Hugo's Deliverable

---

*Status: Research Phase — Stand 2026-03-11*
