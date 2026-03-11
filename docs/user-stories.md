# BauGPT Procurement — User Stories
**Erstellt:** 2026-03-11 | Hugo 🚀

---

## Persona 1: Polier / Bauleiter (Baustelle)

### US-01: Lieferungen im Blick
**Als** Polier auf der Baustelle
**möchte ich** sehen, welche Materiallieferungen heute und diese Woche ankommen
**damit** ich meinen Ablauf planen und das Entladepersonal einteilen kann.

**Acceptance Criteria:**
- Kalenderansicht mit Datum, Uhrzeit, Lieferant, Materialart, Menge
- Filter nach heute / diese Woche / Projekt
- Offline-fähig (Baustelle oft ohne Internet)
- Push-Notification wenn Lieferung sich verzögert

---

### US-02: Lieferschein digital bestätigen
**Als** Polier
**möchte ich** einen Lieferschein direkt in der App bestätigen oder ablehnen
**damit** kein Papierchaos entsteht und die Daten direkt ins System fließen.

**Acceptance Criteria:**
- Lieferschein mit allen Positionen, Mengen, Preisen anzeigen
- "Alles OK" mit einem Tap bestätigen
- Abweichungen markieren (falsche Menge, Schaden, falsches Material)
- Foto anfügen bei Schäden
- Unterschrift/Bestätigung digital erfassen
- Daten sofort für Buchhaltung verfügbar

---

### US-03: Bestellung aufgeben
**Als** Polier
**möchte ich** direkt von der Baustelle aus Material nachbestellen
**damit** ich nicht erst ins Büro fahren oder anrufen muss.

**Acceptance Criteria:**
- Vordefinierter Produktkatalog (vom Einkauf konfiguriert)
- Menge, Wunschliefertermin eingeben
- Direkt an Einkauf zur Freigabe weiterleiten
- Status der Bestellung tracken

---

### US-04: Verbrauchsauswertung
**Als** Polier / Projektleiter
**möchte ich** sehen, was auf meiner Baustelle bisher verbaut/verbraucht wurde
**damit** ich den Überblick über Kosten und Mengen behalte.

**Acceptance Criteria:**
- Verbrauch nach Material, Lieferant, Zeitraum
- Vergleich: geplant vs. tatsächlich
- Export als PDF/Excel

---

## Persona 2: Einkäufer (Procurement)

### US-05: Produktkatalog konfigurieren
**Als** Einkäufer
**möchte ich** bestellbare Produkte und Lieferanten für jede Baustelle konfigurieren
**damit** die Poliere nur freigegebene Produkte zu Vertragspreisen bestellen können.

**Acceptance Criteria:**
- Produkte mit Artikelnummer, Beschreibung, Einheit, Preis anlegen
- Lieferanten zuordnen
- Projekte/Baustellen mit Produktkatalog verknüpfen
- Preislisten importieren (CSV/Excel)

---

### US-06: Bestellungen freigeben
**Als** Einkäufer
**möchte ich** eingehende Bestellungsanfragen von der Baustelle prüfen und freigeben
**damit** keine unkontrollierten Bestellungen entstehen.

**Acceptance Criteria:**
- Bestellungsanfragen in Inbox mit Priorität
- Freigabe oder Ablehnung mit Kommentar
- Automatische Weiterleitung an Lieferant nach Freigabe
- Delegieren an Kollegen möglich

---

### US-07: Rechnungsabgleich mit Vertragspreisen
**Als** Einkäufer
**möchte ich** eingehende Rechnungen automatisch mit hinterlegten Vertragspreisen vergleichen
**damit** ich sofort sehe, wenn ein Lieferant falsch abrechnet.

**Acceptance Criteria:**
- KI vergleicht Rechnung Zeile für Zeile mit Vertragspreisen
- Abweichungen werden rot markiert mit Prozent-Differenz
- Kommentar-/Rückfragefunktion an Lieferant
- Audit-Trail aller Korrekturen

---

### US-08: Einkaufsauswertungen
**Als** Einkäufer
**möchte ich** sehen, was wir bei welchem Lieferanten zu welchen Preisen einkaufen
**damit** ich bessere Konditionen verhandeln kann.

**Acceptance Criteria:**
- Einkaufsvolumen nach Lieferant, Material, Projekt, Zeitraum
- Durchschnittspreise und Preisentwicklung
- Top-Lieferanten Ranking
- Exportfunktion

---

## Persona 3: Buchhalter / Finanzen

### US-09: Automatische Rechnungsprüfung
**Als** Buchhalter
**möchte ich**, dass eingehende Rechnungen automatisch geprüft und buchungsfertig aufbereitet werden
**damit** ich nicht stundenlang manuell Lieferscheine mit Rechnungen abgleichen muss.

**Acceptance Criteria:**
- Rechnung kommt rein → KI liest aus (OCR + AI Parsing)
- 3-Way-Match: Bestellung ↔ Lieferschein ↔ Rechnung
- Ergebnis: "OK - buchungsfertig" oder "Abweichung - prüfen"
- >95% der Rechnungen direkt buchungsfertig
- Manuelle Prüfung nur bei Abweichungen

**Business Impact:**
- ERNE AG: 2-3 Stunden täglich → Minuten (realer Comstruct Case)

---

### US-10: KI-Kontierungsvorschläge
**Als** Buchhalter
**möchte ich** für jede Rechnung automatische Buchungsvorschläge (Konten, Kostenstellen)
**damit** ich nicht jeden Beleg manuell verbuchen muss.

**Acceptance Criteria:**
- KI schlägt Sachkonto, Kostenstelle, Projekt vor
- Vorschlag basiert auf historischen Buchungen + Stammdaten
- Einmalklick-Übernahme wenn korrekt
- Korrekturen werden als Lerngrundlage genutzt

---

### US-11: ERP-Buchung
**Als** Buchhalter
**möchte ich** geprüfte Rechnungen direkt in mein ERP (RIB, SAP, etc.) buchen
**damit** ich keine manuelle Übertragung mehr mache.

**Acceptance Criteria:**
- Direkte API-Integration zu unterstützten ERPs
- Buchungsbeleg mit Datum, Betrag, Konto, Kostenstelle
- Status "gebucht" in BauGPT Procurement sichtbar
- Rollback möglich bei Fehlbuchung

---

### US-12: Skonto-Management
**Als** Buchhalter
**möchte ich** über ablaufende Zahlungsziele und Skonto-Fristen informiert werden
**damit** ich keine Skonti mehr verpasse.

**Acceptance Criteria:**
- Dashboard mit offenen Rechnungen nach Fälligkeit sortiert
- Farbliche Ampel (grün/gelb/rot)
- Push-Notification X Tage vor Ablauf
- Hochrechnung: "Diese Woche Skonto-Potenzial: €X"

---

## Persona 4: Lieferant (Supplier — Sekundär)

### US-13: Lieferschein digital übermitteln
**Als** Lieferant
**möchte ich** Lieferscheine direkt digital an BauGPT Procurement senden
**damit** ich keine Papierlieferscheine mehr ausdrucken und schicken muss.

**Acceptance Criteria:**
- Supplier Portal (Web)
- Lieferschein hochladen (PDF) oder strukturiert eingeben
- Status "bestätigt durch Polier" zurückbekommen
- Rechnungsstellung auf Basis bestätigter Lieferscheine

---

## Epic Overview

| Epic | Stories | Persona | Priorität |
|------|---------|---------|-----------|
| Lieferkalender | US-01 | Polier | P1 |
| Digitaler Lieferschein | US-02 | Polier | P1 |
| Bestellung Mobile | US-03 | Polier | P2 |
| Verbrauchsauswertung | US-04 | Polier | P3 |
| Produktkatalog | US-05 | Einkauf | P1 |
| Bestellfreigabe | US-06 | Einkauf | P1 |
| Rechnungsabgleich | US-07 | Einkauf | P1 |
| Einkaufsauswertungen | US-08 | Einkauf | P2 |
| Auto-Rechnungsprüfung | US-09 | Finanzen | P1 |
| KI-Kontierung | US-10 | Finanzen | P1 |
| ERP-Integration | US-11 | Finanzen | P2 |
| Skonto-Management | US-12 | Finanzen | P2 |
| Supplier Portal | US-13 | Lieferant | P3 |

---

## MVP Scope (P1 Stories)

Für MVP reichen: **US-01, US-02, US-05, US-06, US-07, US-09, US-10**

Das ist der Kern von Comstruct's Value Proposition:
- Baustelle: Lieferungen sehen + bestätigen
- Einkauf: Produktkatalog + Bestellfreigabe + Rechnungsabgleich
- Finanzen: Automatische Rechnungsprüfung + KI-Kontierung

---

*Stand: 2026-03-11 | Hugo 🚀*
