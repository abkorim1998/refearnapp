import { NextRequest, NextResponse } from "next/server"
import { db } from "@/db/drizzle"
import { websiteDomain } from "@/db/schema"
import { and, eq } from "drizzle-orm"
import { isReservedDomain } from "@/lib/constants/domains"

export async function proxy(req: NextRequest) {
  const host = req.headers.get("host")
  if (!host) return NextResponse.next()

  // Extract hostname (strip port for local testing, e.g. partners.localhost:3000 -> partners.localhost)
  const hostname = host.split(":")[0]

  // 🚫 Skip platform / dev / vercel
  if (
    isReservedDomain(hostname) ||
    hostname.endsWith(".vercel.app") ||
    hostname === "localhost" ||
    hostname === "127.0.0.1"
  ) {
    return NextResponse.next()
  }

  // 🔍 Find domain
  const [domain] = await db
    .select({
      orgId: websiteDomain.orgId,
      isActive: websiteDomain.isActive,
      isRedirect: websiteDomain.isRedirect,
      isPrimary: websiteDomain.isPrimary,
    })
    .from(websiteDomain)
    .where(eq(websiteDomain.domainName, hostname))
    .limit(1)

  // ❌ Unknown domain
  if (!domain) {
    return NextResponse.rewrite(new URL("/404", req.url))
  }

  /**
   * 🔁 Redirect case
   * inactive + redirect = true
   */
  if (domain.isRedirect && !domain.isPrimary) {
    const [primary] = await db
      .select({ domainName: websiteDomain.domainName })
      .from(websiteDomain)
      .where(
        and(
          eq(websiteDomain.orgId, domain.orgId),
          eq(websiteDomain.isPrimary, true)
        )
      )
      .limit(1)

    if (!primary) {
      // ⚠️ Data corruption fallback
      return NextResponse.rewrite(new URL("/404", req.url))
    }

    return NextResponse.redirect(
      new URL(
        req.nextUrl.pathname + req.nextUrl.search,
        `https://${primary.domainName}`
      ),
      308
    )
  }

  /**
   * ❌ Inactive and no redirect
   */
  if (!domain.isActive) {
    return NextResponse.rewrite(new URL("/404", req.url))
  }

  // 🚫 Skip rewriting if the path already starts with /affiliate
  if (req.nextUrl.pathname.startsWith("/affiliate")) {
    return NextResponse.next()
  }

  /**
   * 🟢 Active domain → rewrite
   */
  if (req.nextUrl.pathname === "/") {
    return NextResponse.redirect(new URL("/login", req.url), 307)
  }
  const rewriteUrl = new URL(
    `/affiliate/${domain.orgId}${req.nextUrl.pathname}${req.nextUrl.search}`,
    req.url
  )

  const response = NextResponse.rewrite(rewriteUrl)
  response.headers.set("x-current-host", host)

  return response
}

export const config = {
  matcher: ["/((?!_next|api|.*\\..*).*)"],
}
