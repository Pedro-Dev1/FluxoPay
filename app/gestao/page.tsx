import { getUsuarioLogado } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, TrendingUp, ChevronRight, FileCheck } from "lucide-react"
import { createClient } from "@/lib/supabase-server"
import { AniversariosContratoDashboard } from "@/components/aniversarios-contrato-dashboard"
import type { Colaborador } from "@/types/colaborador"
import { PageHeader } from "@/components/ui/page-header"

export default async function GestaoPage() {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  if (!["Financeiro", "Adm"].includes(usuario.tipo_acesso)) {
    redirect("/")
  }

  const supabase = await createClient()

  // Buscar todos colaboradores para verificar aniversários de contrato
  const { data: colaboradores } = await supabase
    .from("colaboradores")
    .select("id, nome_completo, salario, data_aniversario_contrato, email, tipo_acesso, cnpj, data_nascimento, equipe_id, dia_pagamento, chave_pix, tipo_chave_pix, centro_custo_id, created_at")
    .order("nome_completo")

  const items = [
    {
      href: "/gestao/notas",
      title: "Gerenciar Notas",
      description: "Visualize e gerencie as notas fiscais organizadas por mês de competência.",
      icon: FileText,
      color: "bg-accent text-primary border-primary/30",
    },
    {
      href: "/gestao/reajustes",
      title: "Aplicar Reajustes",
      description: "Aplique reajustes salariais nos colaboradores e consulte o histórico.",
      icon: TrendingUp,
      color: "bg-success-subtle text-success border-success/30",
    },
    {
      href: "/gestao/aceites",
      title: "Aceites de Termos",
      description: "Visualize e gerencie os aceites de termos de uso dos colaboradores.",
      icon: FileCheck,
      color: "bg-accent text-primary border-primary/30",
    },
  ]

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader eyebrow="Gestão" title="Gestão de pessoas" description="Aniversários de contrato, notas fiscais e reajustes salariais dos prestadores." />

      {/* Dashboard de Aniversários de Contrato */}
      <div className="mb-8">
        <AniversariosContratoDashboard colaboradores={(colaboradores || []) as Colaborador[]} />
      </div>

      {/* Cards de navegação */}
      <div className="grid gap-4 md:grid-cols-2">
        {items.map((item) => {
          const Icon = item.icon
          return (
            <Link key={item.href} href={item.href} className="group">
              <Card className="h-full transition-colors hover:border-foreground/20 group-hover:bg-muted/30">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className={`p-3 rounded-lg border ${item.color}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <CardTitle className="text-lg mt-4">{item.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {item.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
