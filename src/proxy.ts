import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

export default function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDev = process.env.NODE_ENV === "development";

  const scriptSrc = isDev
    ? `'self' 'unsafe-inline' 'unsafe-eval' https://www.youtube.com`
    : `'self' 'nonce-${nonce}' 'strict-dynamic' https://www.youtube.com`;

  const csp = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://i.discogs.com https://i.ytimg.com https://img.youtube.com`,
    `font-src 'self'`,
    `connect-src 'self'`,
    `frame-src https://www.youtube-nocookie.com https://www.youtube.com`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
    `upgrade-insecure-requests`,
  ].join("; ");

  request.headers.set("x-nonce", nonce);
  request.headers.set("content-security-policy", csp);

  const response = intlMiddleware(request);
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|fonts/|.*\\..*).*)"],
};
