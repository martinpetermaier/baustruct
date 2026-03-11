// BauGPT Procurement — Landing Page (Marketing)
// Route: / (public, no auth required)
// Hugo 🚀 | 2026-03-11

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 w-full bg-white/90 backdrop-blur border-b border-slate-100 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-slate-900">BauGPT</span>
            <span className="text-xs font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">Procurement</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
            <a href="#features">Features</a>
            <a href="#pricing">Preise</a>
            <a href="#roi">ROI Rechner</a>
            <a href="#faq">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm font-semibold text-slate-700 hover:text-slate-900">Einloggen</a>
            <a href="/onboarding" className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors">
              Kostenlos starten →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs font-bold px-3 py-1.5 rounded-full mb-6">
          <span className="w-1.5 h-1.5 bg-orange-500 rounded-full animate-pulse"></span>
          Beta-Zugang — Jetzt kostenlos starten
        </div>
        <h1 className="text-5xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-6">
          Rechnungsprüfung in
          <span className="text-orange-500"> 30 Sekunden</span>
          <br />statt 2,5 Stunden.
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
          BauGPT Procurement automatisiert Deinen kompletten Procure-to-Pay-Prozess.
          KI prüft Rechnungen gegen Bestellungen, Poliere bestätigen Lieferscheine per Handy —
          buchungsfertig für DATEV.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="/onboarding" className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-4 rounded-xl text-lg transition-colors">
            Kostenlos testen — 3 Monate Beta
          </a>
          <a href="#demo" className="border border-slate-200 hover:border-slate-300 text-slate-700 font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
            Demo ansehen →
          </a>
        </div>
        <p className="text-sm text-slate-400 mt-4">Keine Kreditkarte. Kein Setup-Fee. Sofort loslegen.</p>
      </section>

      {/* Social proof */}
      <section className="py-12 bg-slate-50 border-y border-slate-100">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold text-slate-500 mb-6 uppercase tracking-wider">Beta-Kunden aus dem BauGPT Pro Netzwerk</p>
          <div className="flex flex-wrap justify-center gap-8 items-center opacity-60">
            {['Mustermann Bau GmbH', 'Fischer Hochbau', 'Bauunion Bayern', 'Tiefbau Koch KG', 'GreenBuild GmbH'].map((co) => (
              <span key={co} className="text-slate-700 font-bold text-sm">{co}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ROI Numbers */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: '30 Sek.', label: 'Rechnungsprüfung (statt 2,5h)' },
            { value: '94%', label: 'KI-Genauigkeit' },
            { value: '€25.500', label: 'Ersparnis/Jahr (50-MA-Betrieb)' },
            { value: '1.114%', label: 'ROI im ersten Jahr' },
          ].map((stat) => (
            <div key={stat.label} className="bg-slate-50 rounded-2xl p-6">
              <div className="text-3xl font-black text-orange-500 mb-2">{stat.value}</div>
              <div className="text-sm text-slate-600 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 px-6 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black mb-4">Der komplette Procure-to-Pay-Flow</h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto">Von der Bestellung bis zur buchungsfertigen Rechnung — vollständig automatisiert.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: '📦',
                title: 'Digitaler Lieferschein',
                desc: 'Poliere bestätigen Lieferungen per Handy — mit Foto, Unterschrift und automatischem Mengenabgleich gegen die Bestellung.',
                badge: 'Mobile-First',
              },
              {
                icon: '🤖',
                title: 'KI-Rechnungsprüfung',
                desc: 'GPT-4o liest jede Rechnung in Sekunden aus, prüft Beträge, MwSt und Positionen — und schlägt DATEV-Konten vor.',
                badge: '94% Genauigkeit',
              },
              {
                icon: '🔗',
                title: '3-Way-Match',
                desc: 'Automatischer Abgleich von Bestellung, Lieferschein und Rechnung. Abweichungen sofort sichtbar, Freigabe mit einem Klick.',
                badge: 'Vollautomatisch',
              },
              {
                icon: '⏳',
                title: 'Skonto-Monitor',
                desc: 'Nie wieder Skonto vergessen. Das System erinnert Dich 48h vor Ablauf und zeigt den exakten Einsparbetrag.',
                badge: 'Ø €769/Rechnung',
              },
              {
                icon: '📊',
                title: 'DATEV & ERP-Export',
                desc: 'Buchungsfertige DATEV-CSV auf Knopfdruck. Integrationen für RIB iTWO und Nevaris in Entwicklung.',
                badge: 'DATEV-ready',
              },
              {
                icon: '🌱',
                title: 'ESG & CO₂-Reporting',
                desc: 'Automatischer CO₂-Footprint pro Projekt auf Basis der ÖKOBAUDAT-Faktoren — CSRD-konform ab 2026.',
                badge: 'CSRD-Pflicht 2026',
              },
            ].map((f) => (
              <div key={f.title} className="bg-slate-800 rounded-2xl p-6 hover:bg-slate-750 transition-colors">
                <div className="text-3xl mb-4">{f.icon}</div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-bold text-lg">{f.title}</h3>
                  <span className="text-xs font-bold bg-orange-500/20 text-orange-400 px-2 py-0.5 rounded-full">{f.badge}</span>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Einfaches Preismodell</h2>
          <p className="text-slate-600 mb-12">Du zahlst nur für das, was Du nutzt. Pro verarbeitetem Dokument — keine Grundgebühr.</p>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Starter',
                price: '€0,50',
                unit: 'pro Dokument',
                limit: 'bis 500 Dokumente/Monat',
                features: ['KI-Rechnungsprüfung', 'Lieferschein-App', '3-Way-Match', 'DATEV CSV-Export', 'Email Support'],
                cta: 'Kostenlos starten',
                highlight: false,
              },
              {
                name: 'Business',
                price: '€0,35',
                unit: 'pro Dokument',
                limit: '500–5.000 Dokumente/Monat',
                features: ['Alles in Starter', 'ERP-Integration', 'Skonto-Monitor', 'ESG-Reporting', 'Priority Support', 'DATEV-Konto-Mapping'],
                cta: 'Jetzt starten',
                highlight: true,
              },
              {
                name: 'Enterprise',
                price: 'Auf Anfrage',
                unit: '',
                limit: 'ab 5.000 Dokumente/Monat',
                features: ['Alles in Business', 'SAP-Integration', 'On-Premise Option', 'SLA-Garantie', 'Dedicated CSM', 'Custom Workflows'],
                cta: 'Kontakt aufnehmen',
                highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border-2 ${plan.highlight ? 'border-orange-500 bg-orange-50' : 'border-slate-200 bg-white'}`}>
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">{plan.name}</div>
                <div className="text-4xl font-black text-slate-900 mb-1">{plan.price}</div>
                {plan.unit && <div className="text-slate-600 text-sm mb-1">{plan.unit}</div>}
                <div className="text-xs text-slate-500 mb-6">{plan.limit}</div>
                <ul className="space-y-2 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                      <span className="text-green-500">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <a href="/onboarding" className={`block w-full text-center font-bold py-3 rounded-xl transition-colors ${plan.highlight ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}>
                  {plan.cta}
                </a>
              </div>
            ))}
          </div>
          <p className="text-sm text-slate-500 mt-8">BauGPT Pro Kunden erhalten 20% Rabatt auf alle Pläne. Monatlich kündbar.</p>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-6 bg-orange-500 text-white text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-black mb-4">Bereit für die digitale Baustelle?</h2>
          <p className="text-orange-100 text-lg mb-8">20 Beta-Plätze verfügbar. Kostenlos für 3 Monate.</p>
          <a href="/onboarding" className="bg-white text-orange-600 font-black text-lg px-10 py-4 rounded-xl hover:bg-orange-50 transition-colors inline-block">
            Jetzt Beta-Zugang sichern →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 bg-slate-900 text-slate-400 text-sm">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="font-bold text-white">BauGPT Procurement</div>
          <div className="flex gap-6">
            <a href="/datenschutz" className="hover:text-white">Datenschutz</a>
            <a href="/impressum" className="hover:text-white">Impressum</a>
            <a href="/agb" className="hover:text-white">AGB</a>
          </div>
          <div>© 2026 BauGPT GmbH · München</div>
        </div>
      </footer>
    </main>
  );
}
