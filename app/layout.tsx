import type React from "react"
import type { Metadata } from "next"
import { Inter, Jost, JetBrains_Mono } from "next/font/google"
import "./globals.css" // Import globals.css here
import "./main.css"
import { SidebarNavigation } from "@/components/sidebar-navigation"
import { UserHeader } from "@/components/user-header"
import { getSession } from "@/lib/session"
import { listarTenants } from "@/app/actions/tenants"
import { headers } from "next/headers"
import { AutoLogoutProvider } from "@/components/auto-logout-provider"
import { ValoresVisibilityProvider } from "@/contexts/valores-visibility-context"
import { TermsAcceptanceProvider } from "@/components/terms-acceptance-provider"
import { TermoComercialGate } from "@/components/termo-comercial-gate"
import { SystemStatusProvider } from "@/components/system-status-provider"
import { Toaster } from "@/components/ui/sonner"
import { ThemeProvider } from "@/components/theme-provider"
import cn from "classnames"

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
})

// Fonte dos títulos, a mesma do site da Fluxteme.
const jost = Jost({
  variable: "--font-jost",
  subsets: ["latin"],
})

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "Fluxteme",
  description: "Contrato, medição da entrega, validação da nota e pagamento de cada prestador PJ, com trilha auditável.",
  icons: { icon: "/favicon.svg" },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const session = await getSession()
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || ""

  const tenantsParaSwitcher = session?.isSuperAdmin ? await listarTenants().catch(() => []) : []

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/setup" ||
    pathname === "/faq" ||
    pathname === "/termos" ||
    pathname === "/privacidade" ||
    pathname === "/esqueci-senha" ||
    pathname.startsWith("/redefinir-senha/")

  return (
    <html
      lang="pt-BR"
      className={`${inter.variable} ${jost.variable} ${jetbrainsMono.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased bg-background font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange>
        {/* Sistema único de feedback. hooks/use-toast.ts repassa para cá. */}
        <Toaster />
        <ValoresVisibilityProvider>
          {!isAuthPage && (
            <SidebarNavigation
              tipoAcesso={session?.tipoAcesso}
              isSuperAdmin={session?.isSuperAdmin}
              viewingAsTenantId={session?.viewingAsTenantId}
            />
          )}

          <div className={cn("min-h-screen", !isAuthPage && "transition-[padding] duration-150 lg:pl-[var(--sidebar-w,14rem)]")}>
            {!isAuthPage && session && (
              <UserHeader
                nomeCompleto={session.nomeCompleto}
                email={session.email}
                tipoAcesso={session.tipoAcesso}
                cnpj={session.tipoAcesso === "Colaborador" ? session.cnpj : undefined}
                salario={session.tipoAcesso === "Colaborador" ? session.salario : undefined}
                isSuperAdmin={session.isSuperAdmin}
                viewingAsTenantId={session.viewingAsTenantId}
                tenants={tenantsParaSwitcher}
              />
            )}
            <main className={cn(!isAuthPage && !session && "pt-14 lg:pt-0")}>
              {!isAuthPage && session ? (
                <SystemStatusProvider tipoAcesso={session.tipoAcesso}>
                  <AutoLogoutProvider>
                    <TermsAcceptanceProvider 
                      isAuthenticated={!!session} 
                      userName={session.nomeCompleto}
                      userId={session.colaboradorId}
                    >
                      {children}
                      <TermoComercialGate
                        tipoAcesso={session.tipoAcesso}
                        isSuperAdmin={!!session.isSuperAdmin}
                        userName={session.nomeCompleto}
                      />
                    </TermsAcceptanceProvider>
                  </AutoLogoutProvider>
                </SystemStatusProvider>
              ) : children}
            </main>
          </div>
        </ValoresVisibilityProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
