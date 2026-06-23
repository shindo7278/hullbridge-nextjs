// ============================================================
// Shared helper: verifies the admin_session cookie on every
// protected /api/admin/* route. Keeping this in one place means
// every admin endpoint enforces auth the same way.
//
// Written for the Next.js App Router: pass in the standard Request
// object that route handlers receive, and this reads the cookie via
// the Web Cookie API instead of the older req.headers.cookie string.
// ============================================================
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET);

export async function verifyAdminSession(request) {
  const token = request.cookies.get("admin_session")?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return { userId: payload.sub, role: payload.role };
  } catch {
    return null; // expired or tampered token
  }
}
