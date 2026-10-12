import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";

const COOKIE = "torque_session";
const PLATFORM = process.env.PLATFORM_DOMAIN ?? "softmotors.com.br";
const HELP_HOST = `ajuda.${PLATFORM}`;
const DEMO_HOSTS = [`demo.${PLATFORM}`, "demo.localhost"];

/**
 * 1. Central de Ajuda: `ajuda.softmotors.com.br/x` serve as páginas de `/ajuda/x`.
 * 2. Demonstração (demo.softmotors.com.br): sem demonstração criada, tudo leva ao formulário
 *    /comecar; o login do Torque é automático (/api/demo/torque).
 * 3. Portão do Torque (painel da loja): sem sessão válida, vai para o login.
 *    A checagem completa (usuário ativo, loja certa, papel) acontece no servidor, em getSession.
 */
export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const host = (req.headers.get("x-forwarded-host") ?? req.headers.get("host") ?? "").split(":")[0].toLowerCase();

  if (host === HELP_HOST) {
    if (pathname === "/ajuda" || pathname.startsWith("/ajuda/")) {
      return NextResponse.redirect(new URL(pathname.replace(/^\/ajuda/, "") || "/", req.url), 308);
    }
    return NextResponse.rewrite(new URL(`/ajuda${pathname === "/" ? "" : pathname}${req.nextUrl.search}`, req.url));
  }

  const isTorque = pathname === "/torque" || pathname.startsWith("/torque/");
  if (DEMO_HOSTS.includes(host)) {
    const hasDemo = !!req.cookies.get("sm_demo")?.value;
    const origin = `${req.nextUrl.protocol}//${req.headers.get("x-forwarded-host") ?? req.headers.get("host")}`;
    if (pathname === "/comecar" || pathname.startsWith("/comecar/")) return NextResponse.next();
    if (!hasDemo) return NextResponse.redirect(new URL("/comecar", origin));
    if (pathname.startsWith("/torque/entrar")) return NextResponse.redirect(new URL("/api/demo/torque", origin));
  }
  if (pathname === "/painel" || pathname.startsWith("/painel/")) {
    return NextResponse.redirect(new URL(pathname.replace(/^\/painel/, "/torque"), req.url));
  }
  if (!isTorque || pathname.startsWith("/torque/entrar")) return NextResponse.next();

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

// Tudo menos arquivos estáticos e APIs (a Central de Ajuda precisa ver qualquer caminho).
export const config = { matcher: ["/((?!_next/|api/|.*\\.[a-z0-9]+$).*)"] };
