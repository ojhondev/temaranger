import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "torque_session";

/**
 * Portão do Torque (painel da loja): sem sessão válida, vai para o login.
 * A checagem completa (usuário ativo, loja certa, papel) acontece no servidor, em getSession.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/painel" || pathname.startsWith("/painel/")) {
    return NextResponse.redirect(new URL(pathname.replace(/^\/painel/, "/torque"), req.url));
  }
  if (pathname.startsWith("/torque/entrar")) return NextResponse.next();

  const token = req.cookies.get(COOKIE)?.value;
  const secret = process.env.SESSION_SECRET;
  if (token && secret) {
    try {
      await jwtVerify(token, new TextEncoder().encode(secret));
      return NextResponse.next();
    } catch {}
  }
  const login = new URL("/torque/entrar", req.url);
  if (pathname !== "/torque") login.searchParams.set("voltar", pathname);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/painel/:path*", "/painel", "/torque/:path*", "/torque"] };
