"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type Supplier = { id: string; name: string };
type Project = { id: string; name: string };
type Product = { id: string; name: string; unit: string; unitPrice: number | null };
type LineItem = {
  productId: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
};

export default function NewOrderPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Step 1
  const [projects, setProjects] = useState<Project[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");

  // Step 2
  const [products, setProducts] = useState<Product[]>([]);
  const [items, setItems] = useState<LineItem[]>([]);

  useEffect(() => {
    fetch("/api/purchase-orders?meta=form")
      .then((r) => r.json())
      .then((data) => {
        setProjects(data.projects ?? []);
        setSuppliers(data.suppliers ?? []);
        setProducts(data.products ?? []);
      });
  }, []);

  function addLineItem() {
    setItems([
      ...items,
      { productId: "", description: "", quantity: 1, unit: "Stk", unitPrice: 0 },
    ]);
  }

  function updateItem(index: number, field: keyof LineItem, value: string | number) {
    setItems((prev) =>
      prev.map((item, i) => {
        if (i !== index) return item;
        const updated = { ...item, [field]: value };
        // Auto-fill from product catalog
        if (field === "productId") {
          const product = products.find((p) => p.id === value);
          if (product) {
            updated.description = product.name;
            updated.unit = product.unit;
            updated.unitPrice = product.unitPrice ?? 0;
          }
        }
        return updated;
      })
    );
  }

  function removeItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  const totalNet = items.reduce((sum, i) => sum + i.quantity * i.unitPrice, 0);
  const totalVat = totalNet * 0.19;
  const totalGross = totalNet + totalVat;

  async function handleSubmit(asDraft: boolean) {
    setLoading(true);
    const res = await fetch("/api/purchase-orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        projectId: selectedProject,
        supplierId: selectedSupplier,
        requestedDeliveryDate: deliveryDate || null,
        status: asDraft ? "draft" : "pending_approval",
        items,
      }),
    });

    if (res.ok) {
      router.push("/procurement/orders");
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground"
          >
            &larr; Zurück
          </button>
          <h1 className="text-lg font-bold">Neue Bestellung</h1>
        </div>
      </header>

      <div className="mx-auto max-w-2xl p-6">
        {/* Steps indicator */}
        <div className="mb-6 flex gap-2">
          {[1, 2, 3].map((s) => (
            <div
              key={s}
              className={`h-1 flex-1 rounded-full ${s <= step ? "bg-primary" : "bg-border"}`}
            />
          ))}
        </div>

        {/* Step 1: Project & Supplier */}
        {step === 1 && (
          <div className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Projekt & Lieferant</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium">Baustelle</label>
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Bitte wählen...</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Lieferant</label>
              <select
                value={selectedSupplier}
                onChange={(e) => setSelectedSupplier(e.target.value)}
                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
              >
                <option value="">Bitte wählen...</option>
                {suppliers.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Gewünschtes Lieferdatum</label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="flex h-10 w-full rounded-md border bg-background px-3 text-sm"
              />
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!selectedProject || !selectedSupplier}
              className="w-full rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
            >
              Weiter
            </button>
          </div>
        )}

        {/* Step 2: Line Items */}
        {step === 2 && (
          <div className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Positionen</h2>

            {items.map((item, index) => (
              <div key={index} className="space-y-2 border-b pb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Position {index + 1}
                  </span>
                  <button
                    onClick={() => removeItem(index)}
                    className="text-sm text-destructive hover:underline"
                  >
                    Entfernen
                  </button>
                </div>

                <select
                  value={item.productId}
                  onChange={(e) => updateItem(index, "productId", e.target.value)}
                  className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">Produkt wählen...</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.unit})
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-xs">Menge</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) =>
                        updateItem(index, "quantity", Number(e.target.value))
                      }
                      className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Einheit</label>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => updateItem(index, "unit", e.target.value)}
                      className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs">Einzelpreis (€)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) =>
                        updateItem(index, "unitPrice", Number(e.target.value))
                      }
                      className="flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={addLineItem}
              className="w-full rounded-md border border-dashed py-2 text-sm text-muted-foreground hover:bg-muted"
            >
              + Position hinzufügen
            </button>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 rounded-md border py-2 text-sm hover:bg-muted"
              >
                Zurück
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={items.length === 0}
                className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Weiter
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Summary */}
        {step === 3 && (
          <div className="space-y-4 rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Zusammenfassung</h2>

            <div className="space-y-1 text-sm">
              <p>
                <span className="text-muted-foreground">Baustelle:</span>{" "}
                {projects.find((p) => p.id === selectedProject)?.name}
              </p>
              <p>
                <span className="text-muted-foreground">Lieferant:</span>{" "}
                {suppliers.find((s) => s.id === selectedSupplier)?.name}
              </p>
              {deliveryDate && (
                <p>
                  <span className="text-muted-foreground">Lieferdatum:</span>{" "}
                  {deliveryDate}
                </p>
              )}
            </div>

            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-left text-muted-foreground">
                  <th className="pb-2">Position</th>
                  <th className="pb-2">Menge</th>
                  <th className="pb-2 text-right">Preis</th>
                  <th className="pb-2 text-right">Summe</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => (
                  <tr key={i} className="border-b">
                    <td className="py-2">{item.description || "—"}</td>
                    <td className="py-2">
                      {item.quantity} {item.unit}
                    </td>
                    <td className="py-2 text-right">€{item.unitPrice.toFixed(2)}</td>
                    <td className="py-2 text-right">
                      €{(item.quantity * item.unitPrice).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="space-y-1 border-t pt-2 text-sm">
              <div className="flex justify-between">
                <span>Netto</span>
                <span>€{totalNet.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>MwSt. (19%)</span>
                <span>€{totalVat.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-semibold">
                <span>Gesamt</span>
                <span>€{totalGross.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 rounded-md border py-2 text-sm hover:bg-muted"
              >
                Zurück
              </button>
              <button
                onClick={() => handleSubmit(true)}
                disabled={loading}
                className="flex-1 rounded-md border py-2 text-sm hover:bg-muted disabled:opacity-50"
              >
                Als Entwurf speichern
              </button>
              <button
                onClick={() => handleSubmit(false)}
                disabled={loading}
                className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                Zur Freigabe
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
