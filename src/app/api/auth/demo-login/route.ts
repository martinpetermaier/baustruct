export const dynamic = "force-dynamic"
import { NextRequest, NextResponse } from "next/server";

const DEMO_USERS: Record<string, string> = {
  "demo@baugpt.com": "demo2026",
  "admin@baugpt.com": "demo123",
  "einkauf@baugpt.com": "demo123",
};

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();
  const expected = DEMO_USERS[email?.toLowerCase()];
  if (!expected || password !== expected) {
    return NextResponse.json({ error: "Ungültige Zugangsdaten" }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set("baustruct_demo_session", JSON.stringify({ email, role: "admin", company_id: "baugpt-demo" }), {
    httpOnly: true, path: "/", maxAge: 60 * 60 * 24 * 7, sameSite: "lax",
  });
  return res;
}
