import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Public routes that don't require auth
  const publicPaths = ["/login", "/api/inngest"];
  const isPublicPath = publicPaths.some((path) =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If logged in and hitting /login, redirect to dashboard
  if (user && request.nextUrl.pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  // Role-based route protection
  if (user) {
    const role = user.user_metadata?.role as string | undefined;
    const path = request.nextUrl.pathname;

    const roleRouteMap: Record<string, string[]> = {
      polier: ["/field", "/dashboard"],
      einkauf: ["/procurement", "/dashboard", "/field"],
      buchhaltung: ["/finance", "/dashboard"],
      admin: ["/field", "/procurement", "/finance", "/dashboard", "/settings"],
    };

    const allowedPrefixes = roleRouteMap[role ?? ""] ?? ["/dashboard"];
    const isApiRoute = path.startsWith("/api");
    const isAllowed =
      isApiRoute || allowedPrefixes.some((prefix) => path.startsWith(prefix));

    if (!isAllowed) {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}
