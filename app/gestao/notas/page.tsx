import { getUsuarioLogado } from "@/lib/auth-utils"
import { redirect } from "next/navigation"
import { getSupabaseServerClient } from "@/lib/supabase-server"
import { NotasMesesList } from "@/components/notas-meses-list"
import { PageHeader } from "@/components/ui/page-header"

async function listarMesesComNotas() {
  const supabase = await getSupabaseServerClient()

  const { data, error } = await supabase
    .from("pedidos_pagamento")
    .select("created_at, status")
    .in("status", ["pendente_financeiro", "aprovado", "nota_recebida", "pago"])
    .not("nota_fiscal_url", "is", null)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Erro ao buscar meses com notas:", error)
    return []
  }

  // Agrupa por mes/ano e conta quantas notas tem em cada
  const mesesMap = new Map<string, { total: number; pendentes: number; recebidas: number }>()

  data?.forEach((pedido) => {
    const date = new Date(pedido.created_at)
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`

    if (!mesesMap.has(key)) {
      mesesMap.set(key, { total: 0, pendentes: 0, recebidas: 0 })
    }

    const mesData = mesesMap.get(key)!
    mesData.total++
    if (pedido.status === "pendente_financeiro" || pedido.status === "aprovado") {
      mesData.pendentes++
    } else {
      mesData.recebidas++
    }
  })

  // Converte para array ordenado por data (mais recente primeiro)
  return Array.from(mesesMap.entries())
    .map(([key, counts]) => {
      const [ano, mes] = key.split("-")
      return {
        key,
        ano: parseInt(ano),
        mes: parseInt(mes),
        ...counts,
      }
    })
    .sort((a, b) => {
      if (a.ano !== b.ano) return b.ano - a.ano
      return b.mes - a.mes
    })
}

export default async function NotasPage() {
  const usuario = await getUsuarioLogado()

  if (!usuario) {
    redirect("/login")
  }

  if (!["Financeiro", "Adm"].includes(usuario.tipo_acesso)) {
    redirect("/")
  }

  const meses = await listarMesesComNotas()

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <PageHeader eyebrow="Gestão" title="Notas fiscais por período" description="Notas fiscais recebidas, agrupadas por mês de competência." />

      <NotasMesesList meses={meses} />
    </div>
  )
}
