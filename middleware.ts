import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET as string;

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const url = req.nextUrl.clone();

  console.log("=== Middleware Running ===");
  console.log("Path:", url.pathname);
  console.log("Token:", token ? "✅ Exists" : "❌ No Token");

  if (token) {
    try {
      jwt.verify(token, JWT_SECRET);
      console.log("✅ Token is valid");

      // Kalau sudah login, jangan bisa ke /login atau /register
      if (url.pathname === "/login" || url.pathname === "/register") {
        console.log("🔄 Redirecting to /dashboard");
        url.pathname = "/dashboard";
        return NextResponse.redirect(url);
      }

      return NextResponse.next();
    } catch (error) {
      console.log("❌ Invalid token:", error);
    }
  }

  // Kalau belum login, jangan bisa ke /dashboard
  if (!token && url.pathname.startsWith("/dashboard")) {
    console.log("🔄 Redirecting to /login");
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
