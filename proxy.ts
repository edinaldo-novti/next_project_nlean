import { NextRequest, NextResponse } from "next/server";

const ALLOWED_ORIGIN_REGEX = /^https:\/\/([a-zA-Z0-9-]+\.)?novti\.net$/;

function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return ALLOWED_ORIGIN_REGEX.test(origin);
}

export function proxy(request: NextRequest) {
  const origin = request.headers.get("origin");

  if (request.method === "OPTIONS") {
    const headers: Record<string, string> = {
      "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    };
    if (isAllowedOrigin(origin)) {
      headers["Access-Control-Allow-Origin"] = origin!;
    }
    return new NextResponse(null, { status: 204, headers });
  }

  const response = NextResponse.next();
  if (isAllowedOrigin(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin!);
  }
  response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  return response;
}

export const config = {
  matcher: "/api/:path*",
};
