# BauGPT Procurement — UX Flows (Comstruct Field App Reverse-Engineering)
**Erstellt:** 2026-03-11 | Hugo 🚀 | Sprint Run #5

---

## Quelle: Comstruct Field App (Google Play)

**App Name:** Comstruct Field App  
**Package:** `eu.comstruct.comstruct`  
**Plattform:** iOS + Android  
**Zielgruppe:** Poliere, Bauleiter, Site Manager

---

## 1. Core UX Flows (aus App Store Description + Web Research)

### Flow 1: Lieferung empfangen & bestätigen

```
[Login] → [Dashboard: Heutige Lieferungen]
    ↓
[Lieferung auswählen]
    ↓
[Lieferschein-Detail anzeigen]
  - Liefernummer, Lieferant, Ankunftszeit
  - Material-Liste (Artikel, Menge, Einheit)
  - Preis-Info (wenn hinterlegt)
    ↓
[Positionen prüfen]
  - ✅ "Alles OK" → Gesamte Lieferung bestätigen
  - ⚠️ Abweichung → Position bearbeiten
    - Menge anpassen
    - Material falsch markieren
    - Schaden dokumentieren (Foto)
    ↓
[Bestätigung / Ablehnung]
  - Digitale Unterschrift/Bestätigung
  - Timestamp wird automatisch gesetzt
  - → Supplier wird benachrichtigt (E-Mail + Web App)
  - → Änderungshistorie wird gespeichert
```

**Key UX Insights:**
- Einzel-Tap zum Bestätigen ("checked/unchecked" Paradigma)
- Jede Änderung erzeugt Historie-Eintrag → Audit Trail
- Supplier sieht Änderungen in Echtzeit in Web App
- Benachrichtigung per E-Mail an Supplier bei Änderungen

---

### Flow 2: Bestellung aufgeben (vom Feld)

```
[Dashboard] → [Neue Bestellung]
    ↓
[Lieferant auswählen]
  - Aus vorkonfigurierter Liste (Einkauf hat Setup gemacht)
    ↓
[Produkt auswählen]
  - Katalog basiert auf Lieferant + Projekt
  - Vertragspreise sind hinterlegt
    ↓
[Menge + Details eingeben]
  - Menge, Wunschtermin, Bemerkungen
    ↓
[Bestellung senden ODER als Entwurf speichern]
  - "Bestellen" → Supplier wird benachrichtigt
  - "Entwurf" → Firmenintern gespeichert (Einkauf kann freigeben)
```

**Key UX Insights:**
- Guided Workflow ("Sequel of Inputs") — nicht ein großes Formular
- Entwurf-Modus = wichtig für Freigabe-Workflows
- Katalog ist Supplier-spezifisch → kein "alles suchen"

---

### Flow 3: Lieferschein bearbeiten (Korrekturen)

```
[Bestätigter Lieferschein] → [Bearbeiten]
    ↓
[Änderung eingeben]
  - Ankunftszeit anpassen
  - Mengen korrigieren
  - Material-Änderungen
    ↓
[Speichern]
  - → Supplier wird automatisch per E-Mail benachrichtigt
  - → Änderungshistorie wird aktualisiert
  - → Beide Seiten (Contractor + Supplier) sehen History
```

---

## 2. Web App Flows (Einkauf + Finanzen)

### Flow 4: 3-Way-Match (Rechnungsprüfung)

```
[Rechnung kommt rein (E-Mail/Upload/API)]
    ↓
[OCR + AI Parsing]
  - Rechnungsnummer, Datum, Betrag
  - Positionen extrahieren
  - Lieferant identifizieren
    ↓
[Automatischer Abgleich]
  - Bestellung ←→ Lieferschein ←→ Rechnung
  - Position-für-Position-Matching
  - Preisabweichungen markieren
    ↓
[Ergebnis]
  ├── ✅ Match → "Buchungsfertig" → ERP Export
  ├── ⚠️ Teilmatch → Manuelle Prüfung für Abweichungen
  └── ❌ Kein Match → Manueller Review
```

### Flow 5: ESG/CO2 Tracking

```
[Lieferschein bestätigt]
    ↓
[Material erkannt]
  - Kategorie: Beton C25/30
  - Menge: 15 m³
    ↓
[CO2-Faktor angewendet]
  - Beton C25/30 → 230 kg CO2/m³ (ÖKOBAUDAT)
  - 15 × 230 = 3.450 kg CO2
    ↓
[ESG Dashboard aktualisiert]
  - Projekt-Emissionen
  - Lieferanten-Vergleich
  - CSRD-konformer Report exportierbar
```

---

## 3. BauGPT Procurement — Geplante UX Differenzierung

### Wo wir BESSER sein müssen

| Bereich | Comstruct | BauGPT (geplant) |
|---------|-----------|-------------------|
| **Onboarding** | Demo buchen → Sales Call → Setup | Self-Service Signup → 50 Free Docs |
| **Sprache** | Formell ("Sie") | "Du" — modern, nahbar |
| **Offline** | ✅ Field App | ✅ + PWA Fallback |
| **KI-Feedback** | Basis-OCR | Advanced NLP + Lerneffekt aus Korrekturen |
| **Dashboard** | Standard Charts | BauGPT-AI-Insights ("Du sparst diese Woche €X Skonto") |
| **Supplier Portal** | Web App | Web + WhatsApp Bot (Lieferant kann per Chat bestätigen) |
| **Notifications** | E-Mail | E-Mail + Push + WhatsApp |
| **Pricing Transparency** | "Kontaktieren Sie uns" | Öffentliche Pricing Page + Rechner |

### UX Prinzipien für BauGPT Procurement

1. **One-Tap-Actions:** Bestätigung, Ablehnung, Freigabe = 1 Tap
2. **Progressive Disclosure:** Einfach starten, Details auf Nachfrage
3. **Mobile-First:** Polier auf der Baustelle = Primär-Nutzer
4. **KI-Assistenz sichtbar:** "KI schlägt vor: ..." als UI-Pattern
5. **Instant Feedback:** Jede Aktion → sofortiges visuelles Feedback
6. **Offline-Resilient:** Alles cached, sync wenn online

### Navigation Concept (Mobile App)

```
Bottom Nav: [Dashboard] [Lieferungen] [Bestellungen] [Mehr]

Dashboard:
├── Heute erwartete Lieferungen (Cards)
├── Offene Bestellungen (Badge Count)
├── KI-Insights ("3 Rechnungen buchungsfertig")
└── Quick Actions (Neue Bestellung, Scan Lieferschein)

Lieferungen:
├── Kalender-View (Woche)
├── Liste-View (Filter: Status, Projekt, Lieferant)
└── Detail → Bestätigen / Bearbeiten / Ablehnen

Bestellungen:
├── Meine Entwürfe
├── Wartend auf Freigabe
├── Bestellhistorie
└── Neue Bestellung (Guided Flow)
```

---

## 4. Kritische UX-Fragen (für Bob)

1. **Offline-Sync Strategie:** Welche Daten cachen? Conflict Resolution?
2. **Kamera-Integration:** Foto-Upload für Schäden — Compression? Max Filesize?
3. **Push Notifications:** FCM (Android) + APNs (iOS) — Expo unterstützt beides
4. **Barcode/QR Scanning:** Lieferschein-Scanning als Feature? Comstruct scheint das nicht zu haben
5. **Signaturen:** Digitale Unterschrift = rechtlich bindend? TouchID/FaceID als Alternative?

---

*Stand: 2026-03-11 | Hugo 🚀*
*Quellen: Google Play Store, Comstruct Web, Web Research*
