/**
 * Demo-mode helpers — used when no real DB user exists.
 * All server pages call getDbUser() instead of prisma.user.findUnique().
 */

export const DEMO_DB_USER = {
  id: "demo-user-id",
  name: "Demo User",
  email: "demo@baugpt.com",
  role: "admin" as const,
  companyId: null as string | null,
  company: { id: "demo-company", name: "BauGPT Demo GmbH" },
};

export const DEMO_COMPANY_ID = null; // no real DB company → pages return empty lists

/**
 * Returns a synthetic DB user for demo mode.
 * Drop-in replacement for prisma.user.findUnique in server pages.
 */
export function getDemoDbUser(email?: string | null) {
  return {
    ...DEMO_DB_USER,
    email: email ?? DEMO_DB_USER.email,
    name: email ? email.split("@")[0] : DEMO_DB_USER.name,
  };
}
