"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { EmptyState } from "@/components/ui/empty-state"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Loader2, MoreVertical, Plus, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { TermoComercialConteudo } from "@/components/termo-comercial-conteudo"
import {
  arquivarTermoComercial,
  atualizarRascunhoTermoComercial,
  criarTermoComercial,
  excluirRascunhoTermoComercial,
  listarRespostasTermoComercial,
  listarTermosComerciais,
  publicarTermoComercial,
} from "@/app/actions/termos-comerciais"
import type {
  RespostaTermoComercial,
  SituacaoResposta,
  SituacaoTermo,
  TermoComercialResumo,
} from "@/types/termo-comercial"

const DATA_HORA = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" })
const formatarDataHora = (iso: string | null) => (iso ? DATA_HORA.format(new Date(iso)) : "—")

const SITUACAO_TERMO: Record<SituacaoTermo, { rotulo: string; classe: string }> = {
  rascunho: { rotulo: "Rascunho", classe: "bg-muted text-muted-foreground" },
  em_vigor: { rotulo: "Em vigor", classe: "bg-success-subtle text-success" },
  arquivado: { rotulo: "Arquivada", classe: "bg-muted text-muted-foreground" },
}

const SITUACAO_RESPOSTA: Record<SituacaoResposta, { rotulo: string; classe: string }> = {
  aceitou: { rotulo: "Aceitou", classe: "bg-success-subtle text-success" },
  recusou: { rotulo: "Recusou", classe: "bg-danger-subtle text-danger" },
  pendente: { rotulo: "Pendente", classe: "bg-warning-subtle text-warning" },
}

function Etiqueta({ rotulo, classe }: { rotulo: string; classe: string }) {
  return (
    <span className={cn("inline-flex items-center rounded-control px-2 py-0.5 text-xs font-medium whitespace-nowrap", classe)}>
      {rotulo}
    </span>
  )
}

type Formulario = { versao: string; titulo: string; conteudo: string }
const FORMULARIO_VAZIO: Formulario = { versao: "", titulo: "", conteudo: "" }

type Confirmacao = { tipo: "publicar" | "arquivar" | "excluir"; termo: TermoComercialResumo }

export function AdminTermosList({
  termosIniciais,
  tenants,
  termoSelecionadoInicial,
  respostasIniciais,
}: {
  termosIniciais: TermoComercialResumo[]
  tenants: { id: string; nome: string }[]
  termoSelecionadoInicial: string | null
  respostasIniciais: RespostaTermoComercial[]
}) {
  const { toast } = useToast()
  const [termos, setTermos] = useState(termosIniciais)

  // Respostas da versão selecionada
  const [selecionadoId, setSelecionadoId] = useState(termoSelecionadoInicial)
  const [respostas, setRespostas] = useState(respostasIniciais)
  const [carregandoRespostas, setCarregandoRespostas] = useState(false)
  const [erroRespostas, setErroRespostas] = useState<string | null>(null)
  const [filtroCarteira, setFiltroCarteira] = useState("todas")
  const [filtroSituacao, setFiltroSituacao] = useState<"todas" | SituacaoResposta>("todas")
  const [busca, setBusca] = useState("")

  // Editor de rascunho
  const [editorAberto, setEditorAberto] = useState(false)
  const [editandoId, setEditandoId] = useState<string | null>(null)
  const [formulario, setFormulario] = useState<Formulario>(FORMULARIO_VAZIO)
  const [salvando, setSalvando] = useState(false)

  const [lendo, setLendo] = useState<TermoComercialResumo | null>(null)
  const [confirmacao, setConfirmacao] = useState<Confirmacao | null>(null)
  const [executando, setExecutando] = useState(false)

  const selecionado = termos.find((t) => t.id === selecionadoId) ?? null
  const emVigor = termos.find((t) => t.situacao === "em_vigor") ?? null

  const recarregarTermos = async () => {
    try {
      setTermos(await listarTermosComerciais())
    } catch (error) {
      console.error("[v0] Erro ao recarregar termos comerciais:", error)
      toast({
        title: "Não foi possível atualizar a lista de versões",
        description: "A ação foi concluída. Recarregue a página para ver a lista atualizada.",
        variant: "destructive",
      })
    }
  }

  const carregarRespostas = async (termoId: string) => {
    setSelecionadoId(termoId)
    setCarregandoRespostas(true)
    setErroRespostas(null)
    try {
      setRespostas(await listarRespostasTermoComercial(termoId))
    } catch (error) {
      console.error("[v0] Erro ao carregar respostas do termo comercial:", error)
      setErroRespostas(error instanceof Error ? error.message : "Erro ao carregar respostas")
    } finally {
      setCarregandoRespostas(false)
    }
  }

  const abrirNovo = () => {
    // Parte do texto da versão mais recente, que é o ponto de partida comum.
    const base = termos[0]
    setEditandoId(null)
    setFormulario(base ? { versao: "", titulo: base.titulo, conteudo: base.conteudo } : FORMULARIO_VAZIO)
    setEditorAberto(true)
  }

  const abrirEdicao = (termo: TermoComercialResumo) => {
    setEditandoId(termo.id)
    setFormulario({ versao: termo.versao, titulo: termo.titulo, conteudo: termo.conteudo })
    setEditorAberto(true)
  }

  const salvarRascunho = async (e: React.FormEvent) => {
    e.preventDefault()
    setSalvando(true)
    try {
      const resultado = editandoId
        ? await atualizarRascunhoTermoComercial(editandoId, formulario)
        : await criarTermoComercial(formulario)
      if (!resultado.success) {
        toast({ title: "Rascunho não salvo", description: resultado.error, variant: "destructive" })
        return
      }
      toast({ title: "Rascunho salvo" })
      setEditorAberto(false)
      await recarregarTermos()
    } catch {
      toast({ title: "Rascunho não salvo", description: "Verifique sua conexão e tente de novo.", variant: "destructive" })
    } finally {
      setSalvando(false)
    }
  }

  const executarConfirmacao = async () => {
    if (!confirmacao) return
    const { tipo, termo } = confirmacao
    const acoes = {
      publicar: { fn: publicarTermoComercial, sucesso: `Versão ${termo.versao} publicada`, falha: "Versão não publicada" },
      arquivar: { fn: arquivarTermoComercial, sucesso: `Versão ${termo.versao} arquivada`, falha: "Versão não arquivada" },
      excluir: { fn: excluirRascunhoTermoComercial, sucesso: "Rascunho excluído", falha: "Rascunho não excluído" },
    }[tipo]

    setExecutando(true)
    try {
      const resultado = await acoes.fn(termo.id)
      if (!resultado.success) {
        toast({ title: acoes.falha, description: resultado.error, variant: "destructive" })
        return
      }
      toast({ title: acoes.sucesso })
      setConfirmacao(null)
      await recarregarTermos()
      if (tipo === "publicar") await carregarRespostas(termo.id)
      if (tipo === "excluir" && selecionadoId === termo.id) setSelecionadoId(null)
    } catch {
      toast({ title: acoes.falha, description: "Verifique sua conexão e tente de novo.", variant: "destructive" })
    } finally {
      setExecutando(false)
    }
  }

  const respostasFiltradas = useMemo(() => {
    const termoBusca = busca.trim().toLowerCase()
    return respostas.filter(
      (r) =>
        (filtroCarteira === "todas" || r.tenant_id === filtroCarteira) &&
        (filtroSituacao === "todas" || r.situacao === filtroSituacao) &&
        (!termoBusca || r.nome_completo.toLowerCase().includes(termoBusca) || r.email.toLowerCase().includes(termoBusca)),
    )
  }, [respostas, filtroCarteira, filtroSituacao, busca])

  const contagem = useMemo(() => {
    const base = respostas.filter((r) => filtroCarteira === "todas" || r.tenant_id === filtroCarteira)
    return {
      total: base.length,
      aceitou: base.filter((r) => r.situacao === "aceitou").length,
      recusou: base.filter((r) => r.situacao === "recusou").length,
      pendente: base.filter((r) => r.situacao === "pendente").length,
    }
  }, [respostas, filtroCarteira])

  return (
    <div className="space-y-8">
      {/* Versões */}
      <section>
        <div className="flex items-center justify-between gap-4 mb-3">
          <h2 className="text-sm font-medium text-foreground">Versões</h2>
          <Button size="sm" onClick={abrirNovo}>
            <Plus className="mr-2 h-4 w-4" />
            Nova versão
          </Button>
        </div>

        {termos.length === 0 ? (
          <EmptyState
            title="Nenhum termo comercial ainda"
            description="Crie a primeira versão e publique para que Adm e Financeiro das carteiras aceitem."
            action={<Button onClick={abrirNovo}>Nova versão</Button>}
          />
        ) : (
          <div className="overflow-x-auto border border-border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Versão</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Publicada em</TableHead>
                  <TableHead className="text-right">Aceites</TableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {termos.map((termo) => {
                  const situacao = SITUACAO_TERMO[termo.situacao]
                  const podeVerRespostas = termo.situacao !== "rascunho"
                  return (
                    <TableRow
                      key={termo.id}
                      className={cn(podeVerRespostas && "cursor-pointer", termo.id === selecionadoId && "bg-muted/50")}
                      onClick={() => podeVerRespostas && carregarRespostas(termo.id)}
                    >
                      <TableCell className="font-medium tabular-nums whitespace-nowrap">{termo.versao}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="truncate" title={termo.titulo}>
                          {termo.titulo}
                        </p>
                      </TableCell>
                      <TableCell>
                        <Etiqueta {...situacao} />
                      </TableCell>
                      <TableCell className="whitespace-nowrap tabular-nums">{formatarDataHora(termo.publicado_em)}</TableCell>
                      <TableCell className="text-right whitespace-nowrap tabular-nums">
                        {podeVerRespostas ? `${termo.total_aceites} de ${termo.total_obrigados}` : "—"}
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8" aria-label={`Ações da versão ${termo.versao}`}>
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setLendo(termo)}>Ler texto</DropdownMenuItem>
                            {termo.situacao === "rascunho" && (
                              <>
                                <DropdownMenuItem onClick={() => abrirEdicao(termo)}>Editar rascunho</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setConfirmacao({ tipo: "publicar", termo })}>
                                  Publicar versão
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className="text-danger"
                                  onClick={() => setConfirmacao({ tipo: "excluir", termo })}
                                >
                                  Excluir rascunho
                                </DropdownMenuItem>
                              </>
                            )}
                            {termo.situacao === "em_vigor" && (
                              <DropdownMenuItem onClick={() => setConfirmacao({ tipo: "arquivar", termo })}>
                                Arquivar versão
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {/* Respostas */}
      <section>
        <h2 className="text-sm font-medium text-foreground mb-3">
          {selecionado ? `Respostas à versão ${selecionado.versao}` : "Respostas"}
          {selecionado?.situacao === "arquivado" && (
            <span className="ml-2 font-normal text-muted-foreground">(arquivada, não é mais exigida)</span>
          )}
        </h2>

        {!selecionado ? (
          <EmptyState
            title="Nenhuma versão publicada"
            description="Publique uma versão para que Adm e Financeiro das carteiras passem a aceitar. As respostas aparecem aqui."
          />
        ) : erroRespostas ? (
          <div className="border border-danger/30 bg-danger-subtle rounded-lg px-4 py-3 flex items-center justify-between gap-4">
            <p className="text-sm text-danger">{erroRespostas}</p>
            <Button size="sm" variant="outline" onClick={() => carregarRespostas(selecionado.id)}>
              Carregar de novo
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-4">
              {carregandoRespostas ? (
                <Skeleton className="h-9 w-48" />
              ) : (
                <>
                  <p className="text-3xl font-semibold text-foreground tabular-nums">
                    {contagem.aceitou}
                    <span className="text-base font-normal text-muted-foreground"> de {contagem.total} aceitaram</span>
                  </p>
                  <p className="text-sm text-muted-foreground tabular-nums mt-1">
                    {contagem.pendente} pendentes · {contagem.recusou} recusaram
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou e-mail"
                  className="pl-9"
                />
              </div>
              <Select value={filtroCarteira} onValueChange={setFiltroCarteira}>
                <SelectTrigger className="sm:w-56">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as carteiras</SelectItem>
                  {tenants.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filtroSituacao} onValueChange={(v) => setFiltroSituacao(v as typeof filtroSituacao)}>
                <SelectTrigger className="sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as situações</SelectItem>
                  <SelectItem value="pendente">Pendente</SelectItem>
                  <SelectItem value="aceitou">Aceitou</SelectItem>
                  <SelectItem value="recusou">Recusou</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {carregandoRespostas ? (
              <div className="border border-border rounded-lg divide-y divide-border">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 px-4 py-3">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-28" />
                  </div>
                ))}
              </div>
            ) : respostasFiltradas.length === 0 ? (
              <EmptyState
                title={respostas.length === 0 ? "Nenhum Adm ou Financeiro ativo nas carteiras" : "Ninguém com esses filtros"}
                description={
                  respostas.length === 0
                    ? "Quando houver Adm ou Financeiro ativos, eles aparecem aqui com a situação do aceite."
                    : "Troque a carteira, a situação ou a busca."
                }
              />
            ) : (
              <div className="overflow-x-auto border border-border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pessoa</TableHead>
                      <TableHead>Carteira</TableHead>
                      <TableHead>Cargo</TableHead>
                      <TableHead>Situação</TableHead>
                      <TableHead>Respondido em</TableHead>
                      <TableHead>IP</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {respostasFiltradas.map((r) => (
                      <TableRow key={r.colaborador_id}>
                        <TableCell className="max-w-[16rem]">
                          <p className="font-medium text-foreground truncate" title={r.nome_completo}>
                            {r.nome_completo}
                          </p>
                          <p className="text-xs text-muted-foreground truncate" title={r.email}>
                            {r.email}
                          </p>
                        </TableCell>
                        <TableCell className="max-w-[12rem]">
                          <p className="truncate" title={r.tenant_nome}>
                            {r.tenant_nome}
                          </p>
                        </TableCell>
                        <TableCell>{r.tipo_acesso}</TableCell>
                        <TableCell>
                          <Etiqueta {...SITUACAO_RESPOSTA[r.situacao]} />
                        </TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">{formatarDataHora(r.respondido_em)}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums text-muted-foreground" title={r.user_agent ?? undefined}>
                          {r.ip_address ?? "—"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </>
        )}
      </section>

      {/* Editor de rascunho */}
      <Dialog open={editorAberto} onOpenChange={(aberto) => !salvando && setEditorAberto(aberto)}>
        <DialogContent className="sm:max-w-3xl max-h-[92dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editandoId ? "Editar rascunho" : "Nova versão"}</DialogTitle>
            <DialogDescription>
              Fica como rascunho até ser publicada. Depois de publicada, o texto não pode mais ser alterado.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={salvarRascunho} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-[8rem_1fr] gap-4">
              <div className="space-y-2">
                <Label htmlFor="termo-versao">Versão</Label>
                <Input
                  id="termo-versao"
                  value={formulario.versao}
                  onChange={(e) => setFormulario({ ...formulario, versao: e.target.value })}
                  placeholder="1.1"
                  maxLength={20}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="termo-titulo">Título</Label>
                <Input
                  id="termo-titulo"
                  value={formulario.titulo}
                  onChange={(e) => setFormulario({ ...formulario, titulo: e.target.value })}
                  required
                />
              </div>
            </div>

            <Tabs defaultValue="texto">
              <TabsList>
                <TabsTrigger value="texto">Texto</TabsTrigger>
                <TabsTrigger value="previa">Pré-visualização</TabsTrigger>
              </TabsList>
              <TabsContent value="texto" className="space-y-2">
                <Textarea
                  value={formulario.conteudo}
                  onChange={(e) => setFormulario({ ...formulario, conteudo: e.target.value })}
                  rows={16}
                  className="font-mono text-xs"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  &quot;## &quot; no início da linha vira título de seção. Linhas com &quot;| a | b |&quot; formam tabela
                  (a primeira é o cabeçalho). Linha em branco separa parágrafos.
                </p>
              </TabsContent>
              <TabsContent value="previa">
                <div className="border border-border rounded-lg p-4 max-h-[50vh] overflow-y-auto">
                  {formulario.conteudo.trim() ? (
                    <TermoComercialConteudo conteudo={formulario.conteudo} />
                  ) : (
                    <p className="text-sm text-muted-foreground">Escreva o texto na aba Texto para ver a prévia.</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditorAberto(false)} disabled={salvando}>
                Cancelar
              </Button>
              <Button type="submit" disabled={salvando}>
                {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Salvar rascunho
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Leitura */}
      <Dialog open={!!lendo} onOpenChange={(aberto) => !aberto && setLendo(null)}>
        <DialogContent className="sm:max-w-2xl max-h-[92dvh] overflow-y-auto">
          {lendo && (
            <>
              <DialogHeader>
                <DialogTitle>{lendo.titulo}</DialogTitle>
                <DialogDescription>
                  Versão {lendo.versao} · {SITUACAO_TERMO[lendo.situacao].rotulo}
                  {lendo.publicado_em && ` · publicada em ${formatarDataHora(lendo.publicado_em)}`}
                </DialogDescription>
              </DialogHeader>
              <TermoComercialConteudo conteudo={lendo.conteudo} />
              {lendo.conteudo_sha256 && (
                <p className="text-xs text-muted-foreground break-all border-t border-border pt-3">
                  SHA-256 do texto publicado: <span className="font-mono">{lendo.conteudo_sha256}</span>
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Confirmações */}
      <AlertDialog open={!!confirmacao} onOpenChange={(aberto) => !aberto && !executando && setConfirmacao(null)}>
        <AlertDialogContent>
          {confirmacao && (
            <>
              <AlertDialogHeader>
                <AlertDialogTitle>
                  {confirmacao.tipo === "publicar" && `Publicar versão ${confirmacao.termo.versao}?`}
                  {confirmacao.tipo === "arquivar" && `Arquivar versão ${confirmacao.termo.versao}?`}
                  {confirmacao.tipo === "excluir" && `Excluir rascunho ${confirmacao.termo.versao}?`}
                </AlertDialogTitle>
                <AlertDialogDescription>
                  {confirmacao.tipo === "publicar" &&
                    `Os ${confirmacao.termo.total_obrigados} Adm e Financeiro ativos das carteiras vão precisar aceitar antes de continuar usando o sistema.${
                      emVigor ? ` A versão ${emVigor.versao} será arquivada e todos aceitam de novo.` : ""
                    } Depois de publicada, o texto não pode mais ser editado.`}
                  {confirmacao.tipo === "arquivar" &&
                    "Adm e Financeiro deixam de ver o termo e param de ser bloqueados. As respostas já registradas continuam guardadas."}
                  {confirmacao.tipo === "excluir" && "O rascunho é apagado. Essa ação não pode ser desfeita."}
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={executando}>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={(e) => {
                    e.preventDefault()
                    executarConfirmacao()
                  }}
                  disabled={executando}
                  className={cn(
                    confirmacao.tipo === "excluir" && "bg-destructive text-destructive-foreground hover:bg-destructive/90",
                  )}
                >
                  {executando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {confirmacao.tipo === "publicar" && "Publicar versão"}
                  {confirmacao.tipo === "arquivar" && "Arquivar versão"}
                  {confirmacao.tipo === "excluir" && "Excluir rascunho"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
