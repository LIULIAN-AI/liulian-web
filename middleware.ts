/**
 * Demo-minimal middleware — no redirects, no Clerk, no next-intl
 * gating. Lets / fall through to (marketing)/page.tsx.
 *
 * Original (neobanker /homepage redirect + intl cookie logic) preserved
 * at middleware.original.ts for M2 restoration.
 */
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(_request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico).*)'],
};
