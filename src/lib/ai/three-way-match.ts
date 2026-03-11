import type { Decimal } from "@prisma/client/runtime/library";

export type MatchLineResult = {
  invoiceItemId: string;
  poItemId: string | null;
  dnItemId: string | null;
  description: string;
  qtyOrdered: number;
  qtyDelivered: number;
  qtyInvoiced: number;
  priceOrdered: number;
  priceInvoiced: number;
  qtyMatch: boolean;
  priceMatch: boolean;
  status: "match" | "warning" | "mismatch";
  reason?: string;
};

export type ThreeWayMatchResult = {
  overallStatus: "matched" | "partial" | "deviation";
  confidence: number;
  totalDeviation: number;
  lines: MatchLineResult[];
};

type POItem = {
  id: string;
  description: string | null;
  quantity: Decimal;
  unit: string;
  unitPrice: Decimal;
};

type DNItem = {
  id: string;
  description: string;
  quantityDelivered: Decimal;
  quantityOrdered: Decimal | null;
  unitPrice: Decimal | null;
};

type InvItem = {
  id: string;
  description: string;
  quantity: Decimal;
  unitPrice: Decimal;
};

const QTY_TOLERANCE = 0.05; // 5%
const PRICE_TOLERANCE = 0.02; // 2%

function toNum(val: Decimal | null | undefined): number {
  if (val == null) return 0;
  return Number(val);
}

function withinTolerance(a: number, b: number, tolerance: number): boolean {
  if (b === 0) return a === 0;
  return Math.abs((a - b) / b) <= tolerance;
}

function fuzzyMatch(a: string, b: string): boolean {
  const normalize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const na = normalize(a);
  const nb = normalize(b);
  return na.includes(nb) || nb.includes(na);
}

export function computeThreeWayMatch(
  poItems: POItem[],
  dnItems: DNItem[],
  invoiceItems: InvItem[]
): ThreeWayMatchResult {
  const lines: MatchLineResult[] = [];
  let totalDeviation = 0;

  for (const invItem of invoiceItems) {
    // Find matching PO item by description similarity
    const poItem = poItems.find(
      (po) => po.description && fuzzyMatch(po.description, invItem.description)
    );

    // Find matching DN item
    const dnItem = dnItems.find((dn) =>
      fuzzyMatch(dn.description, invItem.description)
    );

    const qtyOrdered = poItem ? toNum(poItem.quantity) : 0;
    const qtyDelivered = dnItem ? toNum(dnItem.quantityDelivered) : 0;
    const qtyInvoiced = toNum(invItem.quantity);
    const priceOrdered = poItem ? toNum(poItem.unitPrice) : 0;
    const priceInvoiced = toNum(invItem.unitPrice);

    const qtyMatch = withinTolerance(qtyInvoiced, qtyOrdered, QTY_TOLERANCE);
    const priceMatch = withinTolerance(
      priceInvoiced,
      priceOrdered,
      PRICE_TOLERANCE
    );

    let status: "match" | "warning" | "mismatch";
    let reason: string | undefined;

    if (qtyMatch && priceMatch) {
      status = "match";
    } else if (
      !qtyMatch &&
      Math.abs(qtyInvoiced - qtyOrdered) / (qtyOrdered || 1) > QTY_TOLERANCE
    ) {
      status = "mismatch";
      reason = `Menge: bestellt ${qtyOrdered}, berechnet ${qtyInvoiced}`;
    } else if (
      !priceMatch &&
      Math.abs(priceInvoiced - priceOrdered) / (priceOrdered || 1) >
        PRICE_TOLERANCE
    ) {
      status = "mismatch";
      reason = `Preis: bestellt €${priceOrdered.toFixed(2)}, berechnet €${priceInvoiced.toFixed(2)}`;
    } else {
      status = "warning";
      reason = "Geringe Abweichung innerhalb Toleranz";
    }

    const lineDeviation =
      qtyInvoiced * priceInvoiced - qtyOrdered * priceOrdered;
    totalDeviation += lineDeviation;

    lines.push({
      invoiceItemId: invItem.id,
      poItemId: poItem?.id ?? null,
      dnItemId: dnItem?.id ?? null,
      description: invItem.description,
      qtyOrdered,
      qtyDelivered,
      qtyInvoiced,
      priceOrdered,
      priceInvoiced,
      qtyMatch,
      priceMatch,
      status,
      reason,
    });
  }

  const hasMismatch = lines.some((l) => l.status === "mismatch");
  const hasWarning = lines.some((l) => l.status === "warning");

  const overallStatus: ThreeWayMatchResult["overallStatus"] = hasMismatch
    ? "deviation"
    : hasWarning
      ? "partial"
      : "matched";

  const matchedCount = lines.filter((l) => l.status === "match").length;
  const confidence =
    lines.length > 0 ? (matchedCount / lines.length) * 100 : 0;

  return {
    overallStatus,
    confidence,
    totalDeviation,
    lines,
  };
}
