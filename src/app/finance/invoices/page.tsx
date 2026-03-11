import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function InvoiceListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const params = await searchParams;
  const statusFilter = params.status;

  const invoices = await prisma.invoice.findMany({
    where: {
      companyId: dbUser.companyId,
      ...(statusFilter ? { status: statusFilter } : {}),
    },
    include: { supplier: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const counts = await prisma.invoice.groupBy({
    by: ["status"],
    where: { companyId: dbUser.companyId },
    _count: true,
  });

  const countMap = Object.fromEntries(
    counts.map((c) => [c.status, c._count])
  );

  const tabs = [
    { label: "Alle", value: "", count: invoices.length },
    { label: "Buchungsfertig", value: "ready_to_book", count: countMap["ready_to_book"] ?? 0 },
    { label: "Prüfung nötig", value: "received", count: countMap["received"] ?? 0 },
    { label: "Gebucht", value: "booked", count: countMap["booked"] ?? 0 },
  ];

  const matchStatusBadge: Record<string, { bg: string; label: string }> = {
    matched: { bg: "bg-green-100 text-green-800", label: "Buchungsfertig" },
    partial: { bg: "bg-yellow-100 text-yellow-800", label: "Teilmatch" },
    deviation: { bg: "bg-red-100 text-red-800", label: "Abweichung" },
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-muted-foreground">
              &larr; Dashboard
            </a>
            <h1 className="text-lg font-bold">Rechnungseingang</h1>
          </div>
          <form action="/api/invoices/upload" method="POST" encType="multipart/form-data">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
              Rechnung hochladen
              <input type="file" name="file" accept=".pdf" className="hidden" />
            </label>
          </form>
        </div>
      </header>

      <div className="p-6">
        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg border bg-card p-1">
          {tabs.map((tab) => (
            <a
              key={tab.value}
              href={tab.value ? `?status=${tab.value}` : "/finance/invoices"}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                (statusFilter ?? "") === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {tab.label} ({tab.count})
            </a>
          ))}
        </div>

        {/* Invoice List */}
        <div className="space-y-2">
          {invoices.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                Keine Rechnungen gefunden.
              </p>
            </div>
          ) : (
            invoices.map((inv) => {
              const badge = matchStatusBadge[inv.threeWayMatchStatus ?? ""] ?? {
                bg: "bg-gray-100 text-gray-800",
                label: inv.status,
              };
              const hasSkontoUrgency =
                inv.skontoDeadline &&
                new Date(inv.skontoDeadline) <=
                  new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

              return (
                <div
                  key={inv.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {inv.invoiceNumber ?? "Ohne Nr."}
                      </p>
                      {hasSkontoUrgency && (
                        <span className="rounded-full bg-orange-100 px-2 py-0.5 text-xs font-medium text-orange-800">
                          Skonto läuft ab
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {inv.supplier?.name ?? "Unbekannt"} &middot;{" "}
                      {formatDate(inv.invoiceDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${badge.bg}`}>
                      {badge.label}
                    </span>
                    <p className="text-sm font-semibold">
                      {formatCurrency(Number(inv.totalGross))}
                    </p>
                    <a
                      href={`/finance/invoices/${inv.id}`}
                      className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
                    >
                      Prüfen
                    </a>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
