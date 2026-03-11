import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

export default async function FieldCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string; project?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!dbUser) redirect("/login");

  const params = await searchParams;
  const selectedDate = params.date
    ? new Date(params.date)
    : new Date();

  const deliveries = await prisma.deliveryNote.findMany({
    where: {
      companyId: dbUser.companyId,
      deliveryDate: selectedDate,
      ...(params.project ? { projectId: params.project } : {}),
    },
    include: {
      supplier: true,
      project: true,
      items: true,
    },
    orderBy: { createdAt: "asc" },
  });

  const projects = await prisma.project.findMany({
    where: { companyId: dbUser.companyId, status: "active" },
    orderBy: { name: "asc" },
  });

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-100 text-yellow-800",
    confirmed: "bg-green-100 text-green-800",
    disputed: "bg-red-100 text-red-800",
    rejected: "bg-red-200 text-red-900",
  };

  return (
    <div className="min-h-screen bg-muted">
      <header className="border-b bg-card px-4 py-3">
        <div className="flex items-center justify-between">
          <a href="/dashboard" className="text-sm text-muted-foreground">
            &larr; Dashboard
          </a>
          <h1 className="text-lg font-bold">Lieferkalender</h1>
          <div />
        </div>
      </header>

      <div className="p-4">
        {/* Filters */}
        <div className="mb-4 flex flex-wrap gap-3">
          <select
            className="rounded-md border bg-card px-3 py-2 text-sm"
            defaultValue={params.project ?? ""}
          >
            <option value="">Alle Baustellen</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="flex items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm">
            <span>{formatDate(selectedDate)}</span>
          </div>
        </div>

        {/* Delivery Cards */}
        <div className="space-y-3">
          {deliveries.length === 0 ? (
            <div className="rounded-lg border bg-card p-8 text-center">
              <p className="text-muted-foreground">
                Keine Lieferungen für diesen Tag.
              </p>
            </div>
          ) : (
            deliveries.map((dn) => (
              <a
                key={dn.id}
                href={`/field/delivery/${dn.id}`}
                className="block rounded-lg border bg-card p-4 transition-shadow hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{dn.supplier.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {dn.project.name}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {dn.items.length} Position
                      {dn.items.length !== 1 ? "en" : ""}
                      {dn.deliveryNumber && ` — LS-Nr. ${dn.deliveryNumber}`}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${statusColors[dn.status] ?? "bg-gray-100"}`}
                  >
                    {dn.status.toUpperCase()}
                  </span>
                </div>
              </a>
            ))
          )}
        </div>

        {/* FAB */}
        <a
          href="/field/delivery/new"
          className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground shadow-lg hover:bg-primary/90"
        >
          +
        </a>
      </div>
    </div>
  );
}
