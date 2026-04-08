import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // The route group is (admin), so paths don't include /admin
  const protectedUIRoutes = ["/dashboard", "/productos", "/ofertas", "/clubes", "/ligas", "/categorias"];
  const isProtectedPath = protectedUIRoutes.some(p => pathname.startsWith(p));
  
  if (isProtectedPath) {
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") || "" }
    });
    const sessionText = await response.text();
    let session = null;
    try { session = JSON.parse(sessionText); } catch(e) {}

    if (!session || !session.session) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // Also protect API routes
  if (pathname.startsWith("/api/")) {
    if (pathname.startsWith("/api/auth")) return NextResponse.next();
    
    // GET requests to products, clubs, ligas are public
    if (request.method === "GET") {
      if (pathname.match(/^\/api\/(products|clubs|ligas)($|\/)/)) {
        return NextResponse.next();
      }
    }
    
    // Check session for other API methods (all POST/PUT/DELETE, and offers GET)
    const response = await fetch(`${request.nextUrl.origin}/api/auth/get-session`, {
      headers: { cookie: request.headers.get("cookie") || "" }
    });
    const sessionText = await response.text();
    let session = null;
    try { session = JSON.parse(sessionText); } catch(e) {}
    
    if (!session || !session.session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
