// ============================================================
// Protects every /admin/* route except /admin/login itself.
// Redirects to /admin/login if there's no valid session cookie.
// Actual cookie verification (signature + expiry) happens here at
// the edge before the page even renders, so protected admin pages
// never get a chance to flash their content to an unauthenticated
// visitor.
// ============================================================
import { NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  const token = request.cookies.get("admin_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  try {
    await jwtVerify(token, JWT_SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }
}

export const config = {
  matcher: "/admin/:path*",
};
