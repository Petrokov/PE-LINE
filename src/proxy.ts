import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "@/i18n/routing";
import { updateSession } from "@/lib/supabase/middleware";
import { isPublicHost } from "@/lib/seo";

const intlMiddleware = createMiddleware(routing);

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/admin")) {
    const { response } = await updateSession(request);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  const response = intlMiddleware(request);
  // Only pe-line.hr is indexed; the same site on *.vercel.app or a preview URL
  // stays out of search results. This switches off by itself once the domain
  // points here.
  if (!isPublicHost(request.headers.get("host"))) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\..*).*)"],
};
