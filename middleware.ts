import { NextResponse, type NextRequest } from "next/server"
import { LEGACY_SESSION_COOKIE, SESSION_COOKIE, verifyAndParse } from "./lib/session-crypto"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  response.headers.set("x-pathname", request.nextUrl.pathname)

  const sessionCookie = request.cookies.get(SESSION_COOKIE) ?? request.cookies.get(LEGACY_SESSION_COOKIE)
  const session = await verifyAndParse<{ tipoAcesso: string; isSuperAdmin?: boolean }>(sessionCookie?.value)

  const publicRoutes = [
    "/login",
    "/setup",
    "/faq",
    "/termos",
    "/privacidade",
    "/esqueci-senha",
    "/redefinir-senha",
    // Site institucional (FluxoPay · módulo Fluxteme)
    "/site",
    "/fluxopay",
    "/seguranca",
    "/empresa",
  ]
  const isPublicRoute = publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))

  // Visitante sem sessão na raiz vê o site institucional; com sessão, "/"
  // continua sendo o dashboard. Rewrite (não redirect): a URL fica "/".
  if (!session && request.nextUrl.pathname === "/") {
    const headers = new Headers(request.headers)
    headers.set("x-pathname", "/site")
    const rewrite = NextResponse.rewrite(new URL("/site", request.url), { request: { headers } })
    rewrite.headers.set("x-pathname", "/site")
    return rewrite
  }

  // Se não estiver logado e tentar acessar rota protegida, redirecionar para login
  if (!session && !isPublicRoute) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  // Se estiver logado como Colaborador, só pode acessar meus-pagamentos
  if (session?.tipoAcesso === "Colaborador") {
    if (!request.nextUrl.pathname.startsWith("/meus-pagamentos")) {
      return NextResponse.redirect(new URL("/meus-pagamentos", request.url))
    }
  }

  // /admin/* é exclusivo do Super Admin — cada page ali já tem seu próprio
  // guard, isso é defesa em profundidade pra quem tentar acessar direto pela URL.
  if (request.nextUrl.pathname.startsWith("/admin") && !session?.isSuperAdmin) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
