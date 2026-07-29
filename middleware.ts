import { NextResponse } from "next/server";

export function middleware(request) {
  const token = request.cookies.get("access-token")?.value;

  if (token !== process.env.ACCESS_TOKEN) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/:path*",
};