import { cookies } from "next/headers";

// Mock Supabase client that reads from demo cookie
export async function createClient() {
  const cookieStore = await cookies();
  const demoSession = cookieStore.get("baustruct_demo_session");

  const user = demoSession?.value
    ? (() => {
        try {
          const s = JSON.parse(demoSession.value);
          return {
            id: "demo-user-id",
            email: s.email ?? "demo@baugpt.com",
            user_metadata: { role: s.role ?? "admin", company_id: s.company_id ?? "baugpt-demo" },
          };
        } catch {
          return null;
        }
      })()
    : null;

  const storageMock = {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    from: (_bucket?: string) => ({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      upload: async (..._args: unknown[]) => ({ data: { path: "demo/placeholder" }, error: null }),
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      getPublicUrl: (..._args: unknown[]) => ({ data: { publicUrl: "/placeholder-doc.pdf" } }),
    }),
  };

  return {
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      getSession: async () => ({ data: { session: user ? { user } : null }, error: null }),
    },
    storage: storageMock,
  };
}
