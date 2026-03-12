import { NextResponse, type NextRequest } from "next/server";

// Public paths that never require auth
const PUBLIC_PATHS = ["/login", "/api/inngest", "/api/auth"];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  if (isPublic) return NextResponse.next();

  // Check demo session cookie
  const demoSession = request.cookies.get("baustruct_demo_session");
  if (demoSession) {
    // Redirect /login to dashboard if already logged in
    if (pathname === "/login") {
      const url = request.nextUrl.clone();
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  // No session → redirect to login
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  return NextResponse.redirect(url);
}
