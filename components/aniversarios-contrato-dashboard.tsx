"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  CalendarDays,
  Users,
  DollarSign
} from "lucide-react"
import { ReajusteDialog } from "./reajuste-dialog"
import type { Colaborador } from "@/types/colaborador"

interface AniversarioInfo {
  colaborador: Colaborador
  diasRestantes: number
  dataAniversario: Date
  urgencia: "vencido" | "critico" | "atencao" | "normal"
}

interface Props {
  colaboradores: Colaborador[]
  onReajusteAplicado?: () => void
}

export function AniversariosContratoDashboard({ colaboradores, onReajusteAplicado }: Props) {
  const [selectedColaborador, setSelectedColaborador] = useState<Colaborador | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  const calcularAniversarios = (): AniversarioInfo[] => {
    const hoje = new Date()
    hoje.setHours(0, 0, 0, 0)

    return colaboradores
      .filter(c => c.data_aniversario_contrato)
      .map(colaborador => {
        // A data armazenada é a data de início do contrato
        // O aniversário é quando completa 1 ano (ou mais anos)
        const dataInicio = new Date(colaborador.data_aniversario_contrato! + "T12:00:00")
        
        // Calcular o próximo aniversário de contrato
        const proximoAniversario = new Date(dataInicio)
        proximoAniversario.setFullYear(hoje.getFullYear())
        
        // Se o aniversário deste ano já passou, pega o do ano que vem
        if (proximoAniversario < hoje) {
          proximoAniversario.setFullYear(hoje.getFullYear() + 1)
        }
        
        // Se o aniversário ainda é este ano mas a data inicial é maior que hoje (contrato novo)
        // pega o do ano que vem
        if (dataInicio > hoje) {
          proximoAniversario.setFullYear(dataInicio.getFullYear() + 1)
        }
        
        const diffTime = proximoAniversario.getTime() - hoje.getTime()
        const diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

        let urgencia: "vencido" | "critico" | "atencao" | "normal"
        if (diasRestantes <= 0) {
          urgencia = "vencido"
        } else if (diasRestantes <= 30) {
          urgencia = "critico"
        } else if (diasRestantes <= 60) {
          urgencia = "atencao"
        } else if (diasRestantes <= 90) {
          urgencia = "normal"
        } else {
          return null // Mais de 3 meses, não mostrar
        }

        return {
          colaborador,
          diasRestantes,
          dataAniversario: proximoAniversario,
          urgencia
        }
      })
      .filter((item): item is AniversarioInfo => item !== null)
      .sort((a, b) => a.diasRestantes - b.diasRestantes)
  }

  const aniversarios = calcularAniversarios()
  
  const vencidos = aniversarios.filter(a => a.urgencia === "vencido")
  const criticos = aniversarios.filter(a => a.urgencia === "critico")
  const atencao = aniversarios.filter(a => a.urgencia === "atencao")
  const normais = aniversarios.filter(a => a.urgencia === "normal")
  const semData = colaboradores.filter(c => !c.data_aniversario_contrato)

  const handleAplicarReajuste = (colaborador: Colaborador) => {
    setSelectedColaborador(colaborador)
    setDialogOpen(true)
  }

  const formatarData = (data: Date) => {
    return data.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  const formatarSalario = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(valor)
  }

  const totalPendentes = aniversarios.length

  if (totalPendentes === 0 && semData.length === 0) {
    return (
      <Card className="border-0">
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <CalendarDays className="mx-auto mb-3 h-8 w-8 text-text-tertiary" />
            <p className="text-sm font-medium text-foreground">Nenhum aniversário de contrato nos próximos 3 meses</p>
            <p className="text-sm">Os reajustes previstos em contrato aparecem aqui 90 dias antes da data.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (totalPendentes === 0 && semData.length > 0) {
    return (
      <Card className="border-0">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" />
            Aniversários de contrato
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 rounded-lg bg-warning-subtle text-warning">
            <Users className="w-8 h-8 text-warning" />
            <div>
              <p className="font-medium text-foreground">
                {semData.length} {semData.length === 1 ? "colaborador sem data de contrato" : "colaboradores sem data de contrato"}
              </p>
              <p className="text-sm text-text-secondary">Cadastre a data de aniversário de contrato em Cadastros › Colaboradores.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="border-0">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-primary" />
              Aniversários de contrato
            </CardTitle>
            {totalPendentes > 0 && (
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20">
                {totalPendentes} pendente{totalPendentes > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Cards de resumo */}
          <div className="grid grid-cols-4 gap-px overflow-hidden rounded-lg border border-border bg-border">
            {[
              { rotulo: "Vencidos", n: vencidos.length, tom: "text-danger" },
              { rotulo: "Em até 1 mês", n: criticos.length, tom: "text-warning" },
              { rotulo: "Em até 2 meses", n: atencao.length, tom: "text-warning" },
              { rotulo: "Em até 3 meses", n: normais.length, tom: "text-foreground" },
            ].map((f) => (
              <div key={f.rotulo} className="bg-card p-3">
                <p className={`font-display text-2xl font-light tabular-nums ${f.n > 0 ? f.tom : "text-text-tertiary"}`}>{f.n}</p>
                <p className="type-eyebrow mt-0.5 text-[10px] text-text-tertiary">{f.rotulo}</p>
              </div>
            ))}
          </div>

          {/* Lista de aniversários */}
          <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
            {aniversarios.map((item) => {
              const isVencido = item.urgencia === "vencido"
              const isCritico = item.urgencia === "critico"
              const isAtencao = item.urgencia === "atencao"
              
              let bgClass = "bg-accent border-primary/30 hover:bg-accent"
              let badgeClass = "bg-accent text-primary"
              let diasText = `${item.diasRestantes} dias`
              
              if (isVencido) {
                bgClass = "bg-danger-subtle border-danger/30 hover:bg-danger-subtle"
                badgeClass = "bg-danger text-danger-foreground"
                diasText = `Vencido há ${Math.abs(item.diasRestantes)} dia${Math.abs(item.diasRestantes) > 1 ? 's' : ''}`
              } else if (isCritico) {
                bgClass = "bg-warning-subtle border-warning/30 hover:bg-warning-subtle"
                badgeClass = "bg-warning text-warning-foreground"
              } else if (isAtencao) {
                bgClass = "bg-warning-subtle border-warning/30 hover:bg-warning-subtle"
                badgeClass = "bg-warning text-warning-foreground"
              }

              return (
                <div
                  key={item.colaborador.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${bgClass} transition-colors`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="font-semibold text-foreground truncate">
                        {item.colaborador.nome_completo}
                      </span>
                      <Badge className={badgeClass}>{diasText}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatarData(item.dataAniversario)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {formatarSalario(item.colaborador.salario)}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleAplicarReajuste(item.colaborador)}
                    className={isVencido ? "bg-danger hover:bg-danger/90" : ""}
                    variant={isVencido ? "default" : "outline"}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {isVencido ? "Aplicar Reajuste" : "Reajustar"}
                  </Button>
                </div>
              )
            })}
          </div>

          {/* Alerta de colaboradores sem data */}
          {semData.length > 0 && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/30 text-muted-foreground text-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{semData.length} colaborador(es) sem data de aniversário cadastrada</span>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedColaborador && (
        <ReajusteDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          colaborador={selectedColaborador}
          onSuccess={() => {
            setDialogOpen(false)
            setSelectedColaborador(null)
            onReajusteAplicado?.()
          }}
        />
      )}
    </>
  )
}
