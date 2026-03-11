import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatDate } from "@/lib/utils";

export default async function OrderListPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; project?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const params = await searchParams;

  const orders = await prisma.purchaseOrder.findMany({
    where: {
      companyId: dbUser.companyId,
      ...(params.status ? { status: params.status } : {}),
      ...(params.project ? { projectId: params.project } : {}),
    },
    include: {
      supplier: true,
      project: true,
      createdBy: true,
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusTabs = [
    { label: "Entwurf", value: "draft" },
    { label: "Freigabe ausstehend", value: "pending_approval" },
    { label: "Bestellt", value: "approved" },
    { label: "Alle", value: "" },
  ];

  const statusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-800",
    pending_approval: "bg-yellow-100 text-yellow-800",
    approved: "bg-blue-100 text-blue-800",
    sent: "bg-green-100 text-green-800",
    delivered: "bg-green-200 text-green-900",
    cancelled: "bg-red-100 text-red-800",
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-card px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/dashboard" className="text-sm text-muted-foreground">
              &larr; Dashboard
            </a>
            <h1 className="text-lg font-bold">Bestellungen</h1>
          </div>
          <a
            href="/procurement/orders/new"
            className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            + Neue Bestellung
          </a>
        </div>
      </header>

      <div className="p-6">
        {/* Tabs */}
        <div className="mb-4 flex gap-1 rounded-lg border bg-card p-1">
          {statusTabs.map((tab) => (
            <a
              key={tab.value}
              href={tab.value ? `?status=${tab.value}` : "/procurement/orders"}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                (params.status ?? "") === tab.value
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {tab.label}
            </a>
          ))}
        </div>

        {/* Order List */}
        <div className="space-y-2">
          {orders.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">Keine Bestellungen gefunden.</p>
            </div>
          ) : (
            orders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{order.orderNumber}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[order.status] ?? "bg-gray-100"}`}
                    >
                      {order.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {order.supplier.name} &middot; {order.project.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Erstellt von {order.createdBy.name} am{" "}
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    {order.totalGross
                      ? formatCurrency(Number(order.totalGross))
                      : "—"}
                  </p>
                  {order.requestedDeliveryDate && (
                    <p className="text-xs text-muted-foreground">
                      Lieferung: {formatDate(order.requestedDeliveryDate)}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
