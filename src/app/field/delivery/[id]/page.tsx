"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

type LineItemState = {
  id: string;
  description: string;
  quantityOrdered: number | null;
  quantityDelivered: number;
  unit: string | null;
  status: "ok" | "deviation" | "pending";
  deviationNote: string;
};

export default function DeliveryConfirmPage() {
  const router = useRouter();
  const params = useParams();
  const deliveryId = params.id as string;

  const [items, setItems] = useState<LineItemState[]>([]);
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Fetch delivery on mount
  useState(() => {
    fetch(`/api/delivery-notes?id=${deliveryId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.items) {
          setItems(
            data.items.map(
              (item: {
                id: string;
                description: string;
                quantityOrdered: number | null;
                quantityDelivered: number;
                unit: string | null;
              }) => ({
                ...item,
                status: "pending" as const,
                deviationNote: "",
              })
            )
          );
        }
      });
  });

  function markItem(index: number, status: "ok" | "deviation") {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, status } : item))
    );
  }

  function updateDeviationNote(index: number, note: string) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, deviationNote: note } : item
      )
    );
  }

  function updateDeliveredQty(index: number, qty: number) {
    setItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, quantityDelivered: qty } : item
      )
    );
  }

  async function handleConfirm() {
    setLoading(true);

    const formData = new FormData();
    formData.append("deliveryId", deliveryId);
    formData.append("status", "confirmed");
    formData.append("notes", notes);
    formData.append("items", JSON.stringify(items));
    photos.forEach((photo) => formData.append("photos", photo));

    const res = await fetch(`/api/delivery-notes`, {
      method: "PATCH",
      body: formData,
    });

    if (res.ok) {
      router.push("/field/calendar");
      router.refresh();
    } else {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="text-sm text-muted-foreground"
          >
            &larr; Zurück
          </button>
          <h1 className="text-lg font-bold">Lieferschein prüfen</h1>
          <div />
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Line Items */}
        {items.map((item, index) => (
          <div key={item.id} className="rounded-lg border bg-card p-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{item.description}</p>
                <p className="text-sm text-muted-foreground">
                  Bestellt: {item.quantityOrdered ?? "—"} {item.unit}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => markItem(index, "ok")}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    item.status === "ok"
                      ? "bg-green-600 text-white"
                      : "border bg-card hover:bg-green-50"
                  }`}
                >
                  OK
                </button>
                <button
                  onClick={() => markItem(index, "deviation")}
                  className={`rounded-md px-3 py-1 text-sm font-medium ${
                    item.status === "deviation"
                      ? "bg-red-600 text-white"
                      : "border bg-card hover:bg-red-50"
                  }`}
                >
                  Abweichung
                </button>
              </div>
            </div>

            {item.status === "deviation" && (
              <div className="mt-3 space-y-2 border-t pt-3">
                <div>
                  <label className="text-xs font-medium">Tatsächliche Menge</label>
                  <input
                    type="number"
                    value={item.quantityDelivered}
                    onChange={(e) =>
                      updateDeliveredQty(index, Number(e.target.value))
                    }
                    className="mt-1 flex h-9 w-full rounded-md border bg-background px-3 text-sm"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Beschreibung</label>
                  <textarea
                    value={item.deviationNote}
                    onChange={(e) => updateDeviationNote(index, e.target.value)}
                    placeholder="Beschädigungen, Fehlmengen..."
                    className="mt-1 flex w-full rounded-md border bg-background px-3 py-2 text-sm"
                    rows={2}
                  />
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Photos */}
        <div className="rounded-lg border bg-card p-4">
          <label className="text-sm font-medium">Fotos hinzufügen</label>
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={(e) =>
              setPhotos(Array.from(e.target.files ?? []))
            }
            className="mt-2 block w-full text-sm"
          />
          {photos.length > 0 && (
            <p className="mt-1 text-xs text-muted-foreground">
              {photos.length} Foto(s) ausgewählt
            </p>
          )}
        </div>

        {/* Notes */}
        <div className="rounded-lg border bg-card p-4">
          <label className="text-sm font-medium">Anmerkungen</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-2 flex w-full rounded-md border bg-background px-3 py-2 text-sm"
            rows={3}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="flex-1 rounded-md border bg-card py-3 text-sm font-medium hover:bg-muted"
          >
            Ablehnen
          </button>
          <button
            onClick={() => setShowConfirmModal(true)}
            disabled={items.some((i) => i.status === "pending")}
            className="flex-1 rounded-md bg-primary py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
          >
            Bestätigen
          </button>
        </div>
      </div>

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-sm rounded-lg bg-card p-6">
            <h2 className="text-lg font-semibold">Lieferschein bestätigen?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Diese Aktion kann nicht rückgängig gemacht werden.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 rounded-md border py-2 text-sm hover:bg-muted"
              >
                Abbrechen
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 rounded-md bg-primary py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              >
                {loading ? "Wird bestätigt..." : "Jetzt bestätigen"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
