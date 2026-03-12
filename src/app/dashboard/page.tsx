import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/utils";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Demo mode: create synthetic user if not in DB
  const dbUser = user.id === "demo-user-id"
    ? { name: user.email?.split("@")[0] ?? "Demo", role: "admin", companyId: null, company: { name: "BauGPT Demo GmbH" } }
    : await prisma.user.findUnique({ where: { id: user.id }, include: { company: true } });

  if (!dbUser) redirect("/login");

  const role = dbUser.role;
  const companyId = dbUser.companyId;

  // Fetch stats based on role (demo mode has no companyId → return zeros)
  const [openOrders, pendingDeliveries, pendingInvoices] = companyId
    ? await Promise.all([
        prisma.purchaseOrder.count({
          where: { companyId, status: { in: ["draft", "pending_approval"] } },
        }),
        prisma.deliveryNote.count({
          where: { companyId, status: "pending" },
        }),
        prisma.invoice.count({
          where: { companyId, status: { in: ["received", "ai_processing"] } },
        }),
      ])
    : [12, 5, 8];

  const recentInvoices = companyId ? await prisma.invoice.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: { supplier: true },
  }) : [];

  return (
    <div className="min-h-screen bg-muted">
      {/* Header */}
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">BauGPT Procurement</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground">
              {dbUser.name} — {dbUser.company.name}
            </span>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              {role}
            </span>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <nav className="hidden w-60 border-r bg-card p-4 md:block">
          <ul className="space-y-2">
            {(role === "polier" || role === "admin") && (
              <li>
                <a
                  href="/field/calendar"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  Baustelle
                </a>
              </li>
            )}
            {(role === "einkauf" || role === "admin") && (
              <li>
                <a
                  href="/procurement/orders"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  Einkauf
                </a>
              </li>
            )}
            {(role === "buchhaltung" || role === "admin") && (
              <li>
                <a
                  href="/finance/invoices"
                  className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-muted"
                >
                  Finanzen
                </a>
              </li>
            )}
          </ul>
        </nav>

        {/* Main */}
        <main className="flex-1 p-6">
          <h2 className="mb-6 text-lg font-semibold">
            Willkommen, {dbUser.name}
          </h2>

          {/* Stats Cards */}
          <div className="mb-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">Offene Bestellungen</p>
              <p className="text-2xl font-bold">{openOrders}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Lieferscheine (offen)
              </p>
              <p className="text-2xl font-bold">{pendingDeliveries}</p>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                Rechnungen (Eingang)
              </p>
              <p className="text-2xl font-bold">{pendingInvoices}</p>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="rounded-lg border bg-card">
            <div className="border-b px-4 py-3">
              <h3 className="font-medium">Letzte Rechnungen</h3>
            </div>
            <div className="divide-y">
              {recentInvoices.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">
                  Noch keine Rechnungen vorhanden.
                </p>
              ) : (
                recentInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {invoice.invoiceNumber ?? "Ohne Nr."}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {invoice.supplier?.name ?? "Unbekannt"}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">
                        {formatCurrency(Number(invoice.totalGross))}
                      </p>
                      <span
                        className={`inline-block rounded-full px-2 py-0.5 text-xs ${
                          invoice.threeWayMatchStatus === "matched"
                            ? "bg-green-100 text-green-800"
                            : invoice.threeWayMatchStatus === "deviation"
                              ? "bg-red-100 text-red-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {invoice.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
