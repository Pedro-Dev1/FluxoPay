"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  listTermsAcceptances,
  getTermsAcceptanceStats,
} from "@/app/actions/terms"
import { CURRENT_TERMS_VERSION, type TermsAcceptanceWithUser } from "@/types/terms"
import { Search, FileCheck, FileX, Users, Clock, Monitor, Smartphone } from "lucide-react"
import { PageHeader } from "@/components/ui/page-header"

export function AceitesTermosList() {
  const [acceptances, setAcceptances] = useState<TermsAcceptanceWithUser[]>([])
  const [stats, setStats] = useState({
    totalUsers: 0,
    acceptedCurrentVersion: 0,
    pendingAcceptance: 0,
    declinedCurrentVersion: 0,
  })
  const [search, setSearch] = useState("")
  const [filterAccepted, setFilterAccepted] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(true)

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [acceptancesResult, statsResult] = await Promise.all([
        listTermsAcceptances({
          version: CURRENT_TERMS_VERSION,
          accepted: filterAccepted === "all" ? undefined : filterAccepted === "accepted",
          search: search || undefined,
        }),
        getTermsAcceptanceStats(),
      ])

      setAcceptances(acceptancesResult.data)
      setStats(statsResult)
    } catch (error) {
      console.error("[v0] Error loading terms data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [filterAccepted])

  useEffect(() => {
    const timer = setTimeout(() => {
      loadData()
    }, 300)
    return () => clearTimeout(timer)
  }, [search])

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const parseDeviceInfo = (deviceInfo: string | null) => {
    if (!deviceInfo) return null
    try {
      return JSON.parse(deviceInfo)
    } catch {
      return null
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Auditoria"
        title="Aceites de termos de uso"
        description="Quem aceitou, recusou ou ainda não respondeu a versão vigente, com data, IP e dispositivo."
        className="mb-0"
      />

      <div className="grid gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-[2fr_1fr_1fr]">
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Aceitaram a versão {CURRENT_TERMS_VERSION}</p>
          <p className="mt-2 flex items-baseline gap-2">
            <span className="type-metric text-foreground">{stats.acceptedCurrentVersion}</span>
            <span className="text-sm tabular-nums text-text-secondary">de {stats.totalUsers} usuários ativos</span>
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Pendentes</p>
          <p className={`mt-2 font-display text-2xl font-light tabular-nums ${stats.pendingAcceptance > 0 ? "text-warning" : "text-foreground"}`}>
            {stats.pendingAcceptance}
          </p>
        </div>
        <div className="bg-card p-5">
          <p className="type-eyebrow text-text-tertiary">Recusaram</p>
          <p className={`mt-2 font-display text-2xl font-light tabular-nums ${stats.declinedCurrentVersion > 0 ? "text-danger" : "text-foreground"}`}>
            {stats.declinedCurrentVersion}
          </p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Respostas registradas</CardTitle>
          <CardDescription>
            Cada aceite e recusa, com data, IP e dispositivo de origem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={filterAccepted} onValueChange={setFilterAccepted}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="accepted">Aceitos</SelectItem>
                <SelectItem value="declined">Recusados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-muted-foreground">Carregando...</div>
            </div>
          ) : acceptances.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileCheck className="mb-2 h-12 w-12 text-muted-foreground/50" />
              <p className="text-muted-foreground">Nenhum registro encontrado</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Colaborador</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Versão</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Dispositivo</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {acceptances.map((acceptance) => {
                    const deviceInfo = parseDeviceInfo(acceptance.device_info)
                    return (
                      <TableRow key={acceptance.id}>
                        <TableCell>
                          <div>
                            <div className="font-medium">
                              {acceptance.colaborador?.nome_completo || "Usuario desconhecido"}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {acceptance.colaborador?.email || "-"}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {acceptance.accepted ? (
                            <Badge variant="default" className="bg-success hover:bg-success/90">
                              Aceito
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Recusado</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{acceptance.version}</Badge>
                        </TableCell>
                        <TableCell>{formatDate(acceptance.accepted_at || acceptance.created_at)}</TableCell>
                        <TableCell>
                          {deviceInfo ? (
                            <div className="flex items-center gap-2">
                              {deviceInfo.type === "mobile" ? (
                                <Smartphone className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Monitor className="h-4 w-4 text-muted-foreground" />
                              )}
                              <span className="text-sm">{deviceInfo.os}</span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-sm">
                            {acceptance.ip_address || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
