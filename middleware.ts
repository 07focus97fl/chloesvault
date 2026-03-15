import { NextResponse, type NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const role = request.cookies.get("vault-role")?.value;

  if (
    !role &&
    !request.nextUrl.pathname.startsWith("/login")
  ) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
