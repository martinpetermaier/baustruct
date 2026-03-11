"use client";

import { useEffect, useState } from "react";
import { formatCurrency, formatDate } from "@/lib/utils";

interface SkontoInvoice {
  id: string;
  invoiceNumber: string | null;
  totalGross: number;
  skontoAmount: number;
  skontoDeadline: string;
  daysRemaining: number;
  supplier: { name: string } | null;
  supplierSkonto: number | null;
}

function urgencyColor(days: number): string {
  if (days < 1) return "bg-red-100 text-red-800 border-red-300";
  if (days < 2) return "bg-orange-100 text-orange-800 border-orange-300";
  return "bg-yellow-100 text-yellow-800 border-yellow-300";
}

function urgencyBadge(days: number): string {
  if (days < 1) return "bg-red-600";
  if (days < 2) return "bg-orange-500";
  return "bg-yellow-500";
}

export default function SkontoMonitorPage() {
  const [invoices, setInvoices] = useState<SkontoInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState<string | null>(null);

  useEffect(() => {
    fetchSkontoInvoices();
  }, []);

  async function fetchSkontoInvoices() {
    try {
      const res = await fetch("/api/invoices?skonto=upcoming");
      const json = await res.json();
      if (json.data) {
        const now = new Date();
        const mapped = json.data
          .filter(
            (inv: Record<string, unknown>) =>
              inv.skontoDeadline && inv.skontoAmount
          )
          .map((inv: Record<string, unknown>) => {
            const deadline = new Date(inv.skontoDeadline as string);
            const daysRemaining = Math.max(
              0,
              (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
            );
            return {
              id: inv.id,
              invoiceNumber: inv.invoiceNumber,
              totalGross: Number(inv.totalGross),
              skontoAmount: Number(inv.skontoAmount),
              skontoDeadline: inv.skontoDeadline as string,
              daysRemaining,
              supplier: inv.supplier as { name: string } | null,
              supplierSkonto: inv.supplier
                ? Number(
                    (inv.supplier as Record<string, unknown>).skontoPercent ?? 0
                  )
                : null,
            };
          })
          .filter((inv: SkontoInvoice) => inv.daysRemaining <= 5)
          .sort(
            (a: SkontoInvoice, b: SkontoInvoice) =>
              a.daysRemaining - b.daysRemaining
          );
        setInvoices(mapped);
      }
    } catch {
      // Silently handle — user sees empty state
    } finally {
      setLoading(false);
    }
  }

  async function approveInvoice(id: string) {
    setApproving(id);
    try {
      const res = await fetch(`/api/invoices/${id}/approve`, {
        method: "POST",
      });
      if (res.ok) {
        setInvoices((prev) => prev.filter((inv) => inv.id !== id));
      }
    } finally {
      setApproving(null);
    }
  }

  const totalSavings = invoices.reduce((sum, inv) => sum + inv.skontoAmount, 0);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-64 rounded bg-muted" />
          <div className="h-64 rounded bg-muted" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Skonto-Monitor
          </h1>
          <p className="text-muted-foreground mt-1">
            Rechnungen mit ablaufendem Skonto — nach Dringlichkeit sortiert
          </p>
        </div>
      </div>

      {/* Savings summary */}
      {invoices.length > 0 && (
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <p className="text-sm text-muted-foreground">
            Mögliche Einsparungen heute
          </p>
          <p className="text-3xl font-bold text-green-600 mt-1">
            Du kannst heute {formatCurrency(totalSavings)} sparen
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {invoices.length} Rechnung{invoices.length !== 1 ? "en" : ""} mit
            Skonto-Frist in den nächsten 5 Tagen
          </p>
        </div>
      )}

      {invoices.length === 0 ? (
        <div className="rounded-lg border bg-card p-12 text-center">
          <p className="text-muted-foreground">
            Keine Rechnungen mit ablaufendem Skonto in den nächsten 5 Tagen.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left p-3 font-medium">Lieferant</th>
                <th className="text-right p-3 font-medium">Betrag</th>
                <th className="text-right p-3 font-medium">Skonto %</th>
                <th className="text-right p-3 font-medium">Skonto-Betrag</th>
                <th className="text-center p-3 font-medium">Fällig in</th>
                <th className="text-center p-3 font-medium">Aktion</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr
                  key={inv.id}
                  className={`border-b last:border-0 ${urgencyColor(inv.daysRemaining)}`}
                >
                  <td className="p-3">
                    <div className="font-medium">
                      {inv.supplier?.name ?? "Unbekannt"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {inv.invoiceNumber ?? "—"}
                    </div>
                  </td>
                  <td className="p-3 text-right font-mono">
                    {formatCurrency(inv.totalGross)}
                  </td>
                  <td className="p-3 text-right">
                    {inv.supplierSkonto ? `${inv.supplierSkonto}%` : "—"}
                  </td>
                  <td className="p-3 text-right font-mono font-medium text-green-700">
                    {formatCurrency(inv.skontoAmount)}
                  </td>
                  <td className="p-3 text-center">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${urgencyBadge(inv.daysRemaining)}`}
                    >
                      {inv.daysRemaining < 1
                        ? "< 24h"
                        : `${Math.ceil(inv.daysRemaining)} Tag${Math.ceil(inv.daysRemaining) !== 1 ? "e" : ""}`}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => approveInvoice(inv.id)}
                      disabled={approving === inv.id}
                      className="inline-flex items-center px-3 py-1.5 rounded-md text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors"
                    >
                      {approving === inv.id ? "..." : "Jetzt freigeben"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
