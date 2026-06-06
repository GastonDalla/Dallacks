import type { NextResponse } from "next/server";
import { clientIp, rateLimit } from "./rate-limit";
import { fail } from "./respond";

export function rateLimitGuard(request: Request): NextResponse | null {
  const ip = clientIp(request);
  const result = rateLimit(`api:${ip}`, { capacity: 60, refillPerSecond: 1 });
  if (result.allowed) return null;
  return fail("RATE_LIMITED", "Demasiadas solicitudes. Probá de nuevo en un momento.", 429, {
    "Retry-After": String(result.retryAfter),
    "X-RateLimit-Limit": String(result.limit),
    "X-RateLimit-Remaining": "0",
  });
}
