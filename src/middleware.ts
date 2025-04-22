import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// You can replace these with your desired credentials
const VALID_EMAIL = process.env.AUTH_EMAIL || "admin@example.com";
const VALID_PASSWORD = process.env.AUTH_PASSWORD || "your-secure-password";

export default function middleware(request: NextRequest) {
  const authHeader = request.headers.get("authorization");

  if (!authHeader) {
    return new NextResponse(null, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  const auth = Buffer.from(authHeader.split(" ")[1], "base64")
    .toString()
    .split(":");
  const email = auth[0];
  const password = auth[1];

  if (email !== VALID_EMAIL || password !== VALID_PASSWORD) {
    return new NextResponse(null, {
      status: 401,
      headers: {
        "WWW-Authenticate": 'Basic realm="Secure Area"',
      },
    });
  }

  return NextResponse.next();
}

// Configure which routes to protect
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/inngest (inngest API endpoints)
     * - api/slack (slack API endpoints)
     */
    "/((?!_next/static|_next/image|favicon.ico|api/inngest|api/slack).*)",
  ],
};
