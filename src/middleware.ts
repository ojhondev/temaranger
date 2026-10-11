import { NextResponse, type NextRequest } from "next/server";

/**
 * Proteção provisória do painel: Basic Auth com uma senha única (`PAINEL_PASSWORD`).
 * Será trocada por login de gestor/vendedor. Sem a variável, o painel fica fechado.
 */
export function middleware(req: NextRequest) {
  const password = process.env.PAINEL_PASSWORD;
  const header = req.headers.get("authorization");
  if (password && header?.startsWith("Basic ")) {
    const [, pass] = atob(header.slice(6)).split(":");
    if (pass === password) return NextResponse.next();
  }
  return new NextResponse("Acesso restrito", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Painel SoftMotors", charset="UTF-8"' },
  });
}

export const config = { matcher: ["/painel/:path*"] };
