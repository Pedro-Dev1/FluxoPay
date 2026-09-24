"use client"

import type { Colaborador } from "@/types/colaborador"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Percent,
  FileText,
  CheckCircle,
  Upload,
  ExternalLink,
  AlertCircle,
  XCircle,
} from "lucide-react"
import { marcarNotaEmitida, uploadNotaFiscal, solicitarProrrogacaoPrazo } from "@/app/actions/pedidos"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMaskedCurrency } from "@/components/currency-display"
import { AnexarNotaDialog } from "./anexar-nota-dialog"
import { CountdownTimer } from "./countdown-timer"
import { PedidoTimeline } from "./pedido-timeline"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

interface Pedido {
  id: string
  colaborador_id: string
  horas_extras: number
  valor_km: number
  conducao: number
  valor_plantao: number
  valor_total: number
  salario_base?: number
  status?: string
  created_at: string
  valor_desconto?: number
  motivo_desconto?: string
  nota_emitida?: boolean
  data_emissao_nota?: string
  nota_fiscal_url?: string
  data_previsao_pagamento?: string
  tipo_pedido?: string
  data_limite_anexo_nota?: string
  prorrogacao_solicitada?: boolean
  prorrogacao_aprovada?: boolean
  observacao_prorrogacao?: string
  motivo_prorrogacao?: string
  data_aprovacao_gerente?: string
  data_aprovacao_financeiro?: string
  data_nota_recebida?: string
  aprovado_gerente?: boolean
  aprovado_financeiro?: boolean
  correcao_solicitada_por?: string
}

interface MeusPagamentosListProps {
  pedidos: Pedido[]
  colaborador: Colaborador | null
  isHistorico?: boolean
}

export function MeusPagamentosList({ pedidos, colaborador, isHistorico = false }: MeusPagamentosListProps) {
  const { formatValue } = useMaskedCurrency()
  const [loading, setLoading] = useState<string | null>(null)
  const [uploadingPdf, setUploadingPdf] = useState<string | null>(null)
  const [pdfUrls, setPdfUrls] = useState<Record<string, string>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pedidoSelecionado, setPedidoSelecionado] = useState<Pedido | null>(null)
  const [prorrogacaoDialogOpen, setProrrogacaoDialogOpen] = useState(false)
  const [motivoProrrogacao, setMotivoProrrogacao] = useState("")
  const [solicitandoProrrogacao, setSolicitandoProrrogacao] = useState(false)
  const [expandedHistorico, setExpandedHistorico] = useState<string | null>(null)
  const router = useRouter()

  const handlePdfUpload = async (pedidoId: string, file: File) => {
    try {
      setUploadingPdf(pedidoId)
      console.log("[v0] Iniciando upload do PDF:", file.name)

      const formData = new FormData()
      formData.append("file", file)

      const result = await uploadNotaFiscal(formData)

      if (!result.success) {
        throw new Error(result.error || "Erro ao fazer upload")
      }

      console.log("[v0] Upload concluído:", result.url)
      if (result.url) setPdfUrls((prev) => ({ ...prev, [pedidoId]: result.url as string }))
    } catch (error) {
      console.error("[v0] Erro ao fazer upload:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao fazer upload do PDF")
    } finally {
      setUploadingPdf(null)
    }
  }

  const handleMarcarNota = async (pedidoId: string) => {
    const pdfUrl = pdfUrls[pedidoId]
    if (!pdfUrl) {
      toast.error("Por favor, anexe o PDF da nota fiscal antes de confirmar")
      return
    }

    try {
      setLoading(pedidoId)
      await marcarNotaEmitida(pedidoId, pdfUrl)
      toast.success("Nota fiscal enviada")
      router.refresh()
    } catch (error) {
      console.error("[v0] Erro ao marcar nota:", error)
      toast.error("Erro ao marcar nota como emitida")
    } finally {
      setLoading(null)
    }
  }

  const handleSolicitarProrrogacao = async (pedidoId: string) => {
    if (!motivoProrrogacao.trim()) {
      toast.error("Por favor, informe o motivo da solicitação")
      return
    }

    try {
      setSolicitandoProrrogacao(true)
      const result = await solicitarProrrogacaoPrazo(pedidoId, motivoProrrogacao)
      toast.success(result.message)
      setProrrogacaoDialogOpen(false)
      setMotivoProrrogacao("")
      setPedidoSelecionado(null)
      router.refresh()
    } catch (error) {
      console.error("[v0] Erro ao solicitar prorrogação:", error)
      toast.error(error instanceof Error ? error.message : "Erro ao solicitar prorrogação")
    } finally {
      setSolicitandoProrrogacao(false)
    }
  }

  const mesAnoEsperado = pedidoSelecionado
    ? (() => {
        const dataPedido = new Date(pedidoSelecionado.created_at)
        return {
          mes: dataPedido.getMonth() + 1,
          ano: dataPedido.getFullYear(),
        }
      })()
    : { mes: 1, ano: 2025 }

  const valorEsperado = pedidoSelecionado
    ? (pedidoSelecionado.salario_base ?? colaborador?.salario ?? 0) +
      pedidoSelecionado.horas_extras +
      (pedidoSelecionado.conducao || 0) +
      (pedidoSelecionado.valor_plantao || 0) -
      (pedidoSelecionado.valor_desconto || 0)
    : 0

  const openPdfSafely = (url: string | undefined) => {
    if (!url || url.includes("undefined") || url.includes("null") || url.trim() === "") {
      toast.error("Arquivo PDF não disponível ou foi removido.")
      console.error("[v0] Invalid PDF URL:", url)
      return
    }
    window.open(url, "_blank")
  }

  const renderPedidos = (pedidos: Pedido[], isHistorico: boolean) => {
    if (!pedidos || !Array.isArray(pedidos) || pedidos.length === 0) {
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">
              {isHistorico
                ? "Nenhum pagamento no histórico ainda"
                : colaborador?.tipo_acesso === "Colaborador"
                  ? "Nenhum pagamento aprovado ainda"
                  : "Nenhum pagamento registrado ainda"}
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="space-y-4">
        {pedidos.map((pedido) => {
          // Valor da NF = Salário + HE + Plantão - Desconto (sem condução e KM)
          const valorParaEmitir =
            (pedido.salario_base ?? colaborador?.salario ?? 0) +
            pedido.horas_extras +
            (pedido.valor_plantao || 0) -
            (pedido.valor_desconto || 0)
          const isReembolsoKm = pedido.tipo_pedido === "reembolso_km"

          const dataPedido = new Date(pedido.created_at)
          const mesAnoEsperado = {
            mes: dataPedido.getMonth() + 1,
            ano: dataPedido.getFullYear(),
          }

          const prazoExpirado = pedido.data_limite_anexo_nota
            ? new Date(pedido.data_limite_anexo_nota).getTime() < new Date().getTime()
            : false

          const aguardandoProrrogacao = pedido.status === "aguardando_prorrogacao"
          const prorrogacaoNegada = pedido.status === "prorrogacao_negada"

          const isExpandedHistorico = isHistorico && expandedHistorico === pedido.id

          return (
            <Card key={pedido.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">
                      {isReembolsoKm ? "Reembolso de Quilometragem" : "Pedido de Pagamento"}
                    </CardTitle>
                    {isReembolsoKm && (
                      <span className="px-2 py-1 text-xs font-medium bg-accent text-primary rounded-full">
                        Apenas KM
                      </span>
                    )}
                    {isHistorico && (
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          pedido.status === "pago" 
                            ? "bg-success-subtle text-success" 
                            : pedido.status === "nota_recebida" 
                              ? "bg-accent text-primary" 
                              : "bg-warning-subtle text-warning"
                        }`}
                      >
                        {pedido.status === "pago" 
                          ? "Pago" 
                          : pedido.status === "nota_recebida" 
                            ? "Nota Recebida" 
                            : "Em Análise"}
                      </span>
                    )}
                    {aguardandoProrrogacao && (
                      <span className="px-2 py-1 text-xs font-medium bg-warning-subtle text-warning rounded-full flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Aguardando prorrogação
                      </span>
                    )}
                    {prorrogacaoNegada && (
                      <span className="px-2 py-1 text-xs font-medium bg-danger-subtle text-danger rounded-full flex items-center gap-1">
                        <XCircle className="w-3 h-3" />
                        Prorrogação negada
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {isHistorico && (
                      <button
                        onClick={() => setExpandedHistorico(isExpandedHistorico ? null : pedido.id)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {isExpandedHistorico ? (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 14l-7-7m0 0L5 14m7-7v12"
                            />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7 7 7-7" />
                          </svg>
                        )}
                      </button>
                    )}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="w-4 h-4" />
                      {new Date(pedido.created_at).toLocaleDateString("pt-BR")}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Timeline de Status do Pedido */}
                {!isHistorico && (
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <h4 className="text-sm font-medium text-muted-foreground mb-2">Acompanhe o progresso do seu pedido</h4>
                    <PedidoTimeline pedido={{
                      created_at: pedido.created_at,
                      status: pedido.status || "pendente_gerente",
                      data_aprovacao_gerente: pedido.data_aprovacao_gerente,
                      data_aprovacao_financeiro: pedido.data_aprovacao_financeiro,
                      data_emissao_nota: pedido.data_emissao_nota,
                      data_nota_recebida: pedido.data_nota_recebida,
                      aprovado_gerente: pedido.aprovado_gerente,
                      aprovado_financeiro: pedido.aprovado_financeiro,
                      nota_emitida: pedido.nota_emitida,
                      correcao_solicitada_por: pedido.correcao_solicitada_por,
                    }} />
                  </div>
                )}

                {isHistorico && !isExpandedHistorico ? (
                  <div className="space-y-3">
                    {isReembolsoKm ? (
                      <div className="p-4 rounded-lg bg-muted border">
                        <div className="flex items-end justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground font-medium mb-1">
                              Quilometragem (Reembolso)
                            </p>
                            <p className="text-3xl font-semibold text-foreground">
                              {formatValue(pedido.valor_km)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Total do pedido</p>
                            <p className="text-lg font-semibold text-foreground">
                              {formatValue(pedido.valor_total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 rounded-lg bg-muted border">
                        <div className="flex items-end justify-between">
                          <div className="flex-1">
                            <p className="text-sm text-muted-foreground font-medium mb-1">
                              Valor para nota fiscal
                            </p>
                            <p className="text-3xl font-semibold text-foreground">
                              {formatValue(valorParaEmitir)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground mb-1">Total do pedido</p>
                            <p className="text-lg font-semibold text-foreground">
                              {formatValue(pedido.valor_total)}
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Desconto summary */}
                    {pedido.valor_desconto && pedido.valor_desconto > 0 && (
                      <div className="flex items-center justify-between p-3 rounded-lg bg-danger-subtle border border-danger/30">
                        <span className="text-danger font-medium">Desconto:</span>
                        <span className="text-danger font-semibold">
                          - {formatValue(pedido.valor_desconto)}
                        </span>
                      </div>
                    )}

                    {/* Nota Fiscal link */}
                    {pedido.nota_fiscal_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full bg-transparent"
                        onClick={() => openPdfSafely(pedido.nota_fiscal_url)}
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Ver nota fiscal
                      </Button>
                    )}
                  </div>
                ) : (
                  <>
                    {isReembolsoKm ? (
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-accent">
                        <MapPin className="w-5 h-5 text-primary mt-0.5" />
                        <div>
                          <p className="text-sm text-primary font-medium">Quilometragem</p>
                          <p className="font-semibold">{formatValue(pedido.valor_km)}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Salário base</p>
                            <p className="font-semibold">{formatValue(pedido.salario_base ?? colaborador?.salario ?? 0)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <Clock className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Horas extras</p>
                            <p className="font-semibold">{formatValue(pedido.horas_extras)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Quilometragem</p>
                            <p className="font-semibold">{formatValue(pedido.valor_km)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Condução</p>
                            <p className="font-semibold">{formatValue(pedido.conducao)}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
                          <MapPin className="w-5 h-5 text-primary mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Plantão</p>
                            <p className="font-semibold">{formatValue(pedido.valor_plantao)}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {!isReembolsoKm && pedido.valor_desconto && pedido.valor_desconto > 0 && (
                      <>
                        <div className="flex items-start gap-3 p-3 rounded-lg bg-danger-subtle border border-danger/30">
                          <Percent className="w-5 h-5 text-danger mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-danger">Desconto aplicado</p>
                            <p className="font-semibold text-danger">
                              - {formatValue(pedido.valor_desconto)}
                            </p>
                          </div>
                        </div>

                        {pedido.motivo_desconto && (
                          <div className="p-3 rounded-lg bg-warning-subtle border border-warning/30">
                            <p className="text-sm font-medium mb-1 text-warning">
                              Motivo do Desconto:
                            </p>
                            <p className="text-sm text-warning">{pedido.motivo_desconto}</p>
                          </div>
                        )}
                      </>
                    )}

                    {aguardandoProrrogacao && (
                      <div className="p-4 rounded-lg bg-warning-subtle border-2 border-warning/30">
                        <div className="flex items-start gap-3">
                          <Clock className="w-5 h-5 text-warning mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-warning mb-2">
                              Solicitação de prorrogação em análise
                            </p>
                            <p className="text-sm text-warning mb-3">
                              Sua solicitação de prorrogação de prazo foi enviada ao financeiro e está aguardando
                              aprovação.
                            </p>
                            {pedido.motivo_prorrogacao && (
                              <div className="p-3 rounded bg-card">
                                <p className="text-xs font-medium text-warning mb-1">
                                  Motivo informado:
                                </p>
                                <p className="text-sm text-warning">
                                  {pedido.motivo_prorrogacao}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {prorrogacaoNegada && (
                      <div className="p-4 rounded-lg bg-danger-subtle border-2 border-danger/30">
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-danger mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-danger mb-2">Prorrogação negada</p>
                            <p className="text-sm text-danger mb-3">
                              Sua solicitação de prorrogação foi negada pelo financeiro.
                            </p>
                            {pedido.observacao_prorrogacao && (
                              <div className="p-3 rounded bg-card">
                                <p className="text-xs font-medium text-danger mb-1">
                                  Motivo da negação:
                                </p>
                                <p className="text-sm text-danger">
                                  {pedido.observacao_prorrogacao}
                                </p>
                              </div>
                            )}
                            <p className="text-sm text-danger mt-3">
                              Entre em contato com o seu supervisor para resolver esta situação.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {pedido.status === "aprovado" && !isReembolsoKm && !isHistorico && (
                      <div className="p-4 rounded-lg bg-muted border">
                        <div className="flex items-start gap-3 mb-3">
                          <FileText className="w-5 h-5 text-muted-foreground mt-0.5" />
                          <div className="flex-1">
                            <p className="font-semibold text-foreground mb-1">
                              Valor para emitir nota
                            </p>
                            <p className="text-xs text-muted-foreground mb-2">
                              (Salário Base + Horas Extras + Condução + Plantão - Desconto)
                            </p>
                            <p className="text-2xl font-semibold text-foreground">
                              {formatValue(valorParaEmitir)}
                            </p>
                          </div>
                        </div>

                        {pedido.nota_emitida ? (
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 p-3 rounded-lg bg-success-subtle border border-success/30">
                              <CheckCircle className="w-5 h-5 text-success" />
                              <div className="flex-1">
                                <p className="font-medium text-success">Nota emitida</p>
                                <p className="text-xs text-success">
                                  {pedido.data_emissao_nota &&
                                    new Date(pedido.data_emissao_nota).toLocaleDateString("pt-BR")}
                                </p>
                              </div>
                            </div>
                            {pedido.nota_fiscal_url && (
                              <Button
                                variant="outline"
                                className="w-full bg-transparent"
                                onClick={() => openPdfSafely(pedido.nota_fiscal_url)}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Ver nota fiscal
                              </Button>
                            )}
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {pedido.data_limite_anexo_nota && (
                              <CountdownTimer dataLimite={pedido.data_limite_anexo_nota} />
                            )}

                            {prazoExpirado && !pedido.prorrogacao_solicitada ? (
                              <div className="space-y-3">
                                <div className="p-4 rounded-lg bg-danger-subtle border-2 border-danger/30">
                                  <div className="flex items-start gap-3 mb-3">
                                    <AlertCircle className="w-5 h-5 text-danger mt-0.5" />
                                    <div className="flex-1">
                                      <p className="font-semibold text-danger mb-2">
                                        Você não anexou a nota a tempo
                                      </p>
                                      <p className="text-sm text-danger">
                                        O prazo para anexar a nota fiscal expirou. Você precisa solicitar uma nova data
                                        ao financeiro.
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => {
                                    setPedidoSelecionado(pedido)
                                    setProrrogacaoDialogOpen(true)
                                  }}
                                  className="w-full bg-warning hover:bg-warning/90 text-warning-foreground"
                                >
                                  <Clock className="w-4 h-4 mr-2" />
                                  Solicitar nova data
                                </Button>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm font-medium text-success">
                                  Você já emitiu sua nota?
                                </p>
                                <Button
                                  onClick={() => {
                                    setPedidoSelecionado(pedido)
                                    setDialogOpen(true)
                                  }}
                                  className="w-full bg-success hover:bg-success/90 text-success-foreground"
                                >
                                  <Upload className="w-4 h-4 mr-2" />
                                  Anexar nota fiscal
                                </Button>
                                <p className="text-xs text-center text-success">
                                  * A nota será validada automaticamente
                                </p>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {isHistorico && pedido.nota_fiscal_url && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 p-3 rounded-lg bg-success-subtle border border-success/30">
                          <CheckCircle className="w-5 h-5 text-success" />
                          <div className="flex-1">
                            <p className="font-medium text-success">Nota fiscal enviada</p>
                            <p className="text-xs text-success">
                              {pedido.data_emissao_nota &&
                                new Date(pedido.data_emissao_nota).toLocaleDateString("pt-BR")}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          className="w-full bg-transparent"
                          onClick={() => openPdfSafely(pedido.nota_fiscal_url)}
                        >
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Ver nota fiscal
                        </Button>
                        {(pedido.status === "pago" || pedido.status === "nota_recebida") && (
                          <div className="p-3 rounded-lg bg-accent border border-primary/30">
                            <div className="flex items-center gap-2">
                              <CheckCircle className="w-5 h-5 text-primary" />
                              <p className="font-medium text-primary">Pagamento aprovado</p>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {pedido.data_previsao_pagamento && (
                      <div className="flex items-center gap-3 p-3 rounded-lg bg-accent border border-primary/30">
                        <Calendar className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-primary">Previsão de pagamento</p>
                          <p className="font-semibold text-primary">
                            {pedido.data_previsao_pagamento.includes("T")
                              ? new Date(pedido.data_previsao_pagamento).toLocaleDateString("pt-BR")
                              : new Date(pedido.data_previsao_pagamento + "T12:00:00").toLocaleDateString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold">Valor total</span>
                        <span className="text-2xl font-semibold text-primary">{formatValue(pedido.valor_total)}</span>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {renderPedidos(pedidos || [], isHistorico)}
      {pedidoSelecionado && (
        <>
          <AnexarNotaDialog
            open={dialogOpen}
            onOpenChange={setDialogOpen}
            pedidoId={pedidoSelecionado.id}
            colaboradorId={colaborador?.id || ""}
            valorEsperado={valorEsperado}
            mesAnoEsperado={mesAnoEsperado}
          />

          <Dialog open={prorrogacaoDialogOpen} onOpenChange={setProrrogacaoDialogOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Solicitar nova data</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="motivo">Motivo da Solicitação *</Label>
                  <Textarea
                    id="motivo"
                    placeholder="Explique o motivo pelo qual você não conseguiu anexar a nota no prazo..."
                    value={motivoProrrogacao}
                    onChange={(e) => setMotivoProrrogacao(e.target.value)}
                    rows={4}
                    className="mt-2"
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Sua solicitação será enviada ao financeiro para análise.
                </p>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setProrrogacaoDialogOpen(false)
                    setMotivoProrrogacao("")
                    setPedidoSelecionado(null)
                  }}
                  disabled={solicitandoProrrogacao}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={() => handleSolicitarProrrogacao(pedidoSelecionado.id)}
                  disabled={solicitandoProrrogacao || !motivoProrrogacao.trim()}
                >
                  {solicitandoProrrogacao ? "Enviando..." : "Enviar Solicitação"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </div>
  )
}
