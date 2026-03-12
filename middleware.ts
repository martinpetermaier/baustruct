import { type NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/login", "/api/"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Always allow public paths
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  // Check demo session cookie
  const session = request.cookies.get("baustruct_demo_session");
  if (session?.value) {
    return NextResponse.next();
  }

  // No session → redirect to login
  const loginUrl = new URL("/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
