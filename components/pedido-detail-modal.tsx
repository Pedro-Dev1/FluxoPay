"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { formatCurrency } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Calendar, User, DollarSign, Clock, Car, Briefcase, AlertCircle } from "lucide-react"

interface PedidoDetailModalProps {
  pedido: any
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PedidoDetailModal({ pedido, open, onOpenChange }: PedidoDetailModalProps) {
  if (!pedido) return null

  const isReembolsoKm = pedido.tipo_pedido === "reembolso_km"

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pendente_supervisor":
        return "bg-warning-subtle text-warning border-warning/30"
      case "pendente_gerente":
        return "bg-warning-subtle text-warning border-warning/30"
      case "pendente_financeiro":
        return "bg-accent text-primary border-primary/30"
      case "aprovado":
        return "bg-success-subtle text-success border-success/30"
      case "pago":
        return "bg-success-subtle text-success border-success/30"
      case "nota_recebida":
        return "bg-accent text-primary border-primary/30"
      case "recusado":
        return "bg-danger-subtle text-danger border-danger/30"
      case "correcao_solicitada":
        return "bg-accent text-primary border-primary/30"
      default:
        return "bg-muted text-foreground border-border"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pendente_supervisor: "Aguardando Supervisor",
      pendente_gerente: "Aguardando Gerente",
      pendente_financeiro: "Aguardando Financeiro",
      aprovado: "Aprovado",
      pago: "Pago",
      nota_recebida: "Nota Recebida",
      recusado: "Recusado",
      correcao_solicitada: "Correção Solicitada",
    }
    return labels[status] || status
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center justify-between">
            <span>Detalhes do Pedido</span>
            <Badge className={getStatusColor(pedido.status)}>{getStatusLabel(pedido.status)}</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Informações do Colaborador */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-start gap-3">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Colaborador</p>
                    <p className="font-semibold text-lg">{pedido.colaborador?.nome_completo || "N/A"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Data de Criação</p>
                    <p className="font-semibold">
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {pedido.criador && (
                  <div className="flex items-start gap-3">
                    <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Criado por</p>
                      <p className="font-semibold">{pedido.criador.nome_completo}</p>
                    </div>
                  </div>
                )}
                {pedido.data_previsao_pagamento && (
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Previsão de Pagamento</p>
                      <p className="font-semibold">
                        {new Date(pedido.data_previsao_pagamento).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Tipo de Pedido */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Tipo de Pedido</h3>
              </div>
              <Badge variant="outline" className="text-base px-4 py-2">
                {isReembolsoKm ? "Reembolso de Quilometragem" : "Pedido Completo"}
              </Badge>
            </CardContent>
          </Card>

          {/* Valores */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <h3 className="font-semibold text-lg">Valores</h3>
              </div>
              <div className="space-y-3">
                {!isReembolsoKm && (
                  <>
                    <div className="flex justify-between items-center py-2 border-b">
                      <span className="text-muted-foreground">Salário Base</span>
                      <span className="font-semibold">{formatCurrency(pedido.salario_base)}</span>
                    </div>
                    {pedido.horas_extras > 0 && (
                      <div className="flex justify-between items-center py-2 border-b">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-warning" />
                          <span className="text-muted-foreground">Horas Extras</span>
                        </div>
                        <span className="font-semibold text-warning">{formatCurrency(pedido.horas_extras)}</span>
                      </div>
                    )}
                    {pedido.motivo_horas_extras && (
                      <div className="bg-warning-subtle border border-warning/30 rounded-lg p-3">
                        <p className="text-sm text-warning">
                          <span className="font-semibold">Motivo:</span> {pedido.motivo_horas_extras}
                        </p>
                      </div>
                    )}
                    {pedido.valor_plantao > 0 && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-muted-foreground">Plantão</span>
                          <span className="font-semibold text-primary">{formatCurrency(pedido.valor_plantao)}</span>
                        </div>
                        {pedido.motivo_plantao && (
                          <div className="bg-accent border border-primary/30 rounded-lg p-3">
                            <p className="text-sm text-primary">
                              <span className="font-semibold">Motivo:</span> {pedido.motivo_plantao}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                    {pedido.valor_desconto > 0 && (
                      <>
                        <div className="flex justify-between items-center py-2 border-b">
                          <span className="text-muted-foreground">Desconto</span>
                          <span className="font-semibold text-danger">-{formatCurrency(pedido.valor_desconto)}</span>
                        </div>
                        {pedido.motivo_desconto && (
                          <div className="bg-danger-subtle border border-danger/30 rounded-lg p-3">
                            <p className="text-sm text-danger">
                              <span className="font-semibold">Motivo:</span> {pedido.motivo_desconto}
                            </p>
                          </div>
                        )}
                      </>
                    )}
                  </>
                )}
                {pedido.valor_km > 0 && (
                  <div className="flex justify-between items-center py-2 border-b">
                    <div className="flex items-center gap-2">
                      <Car className="w-4 h-4 text-primary" />
                      <span className="text-muted-foreground">Quilometragem</span>
                    </div>
                    <span className="font-semibold text-primary">{formatCurrency(pedido.valor_km)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-3 mt-4">
                  <span className="font-bold text-lg">Valor Total</span>
                  <span className="font-bold text-2xl text-primary">{formatCurrency(pedido.valor_total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          {pedido.observacao_recusa && (
            <Card className="border-danger/30 bg-danger-subtle">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-lg text-danger mb-2">Observação de Recusa/Correção</h3>
                    <p className="text-danger">{pedido.observacao_recusa}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
