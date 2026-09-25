"use client"

import { useState } from "react"
import { usePathname } from "next/navigation"
import { ArrowLeft, CheckCircle2, ChevronRight } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AuditId } from "@/components/ui/audit"
import { IconeSuporte } from "@/components/icons/fx-icons"
import { abrirChamadoSuporte } from "@/app/actions/suporte"
import { CATEGORIAS_SUPORTE, type CategoriaSuporte } from "@/lib/suporte"

const AJUDA: Record<CategoriaSuporte, string> = {
  "Dúvida sobre o sistema": "Como fazer algo, onde encontrar uma tela",
  "Problema ou erro": "Algo não funciona como deveria",
  "Pedido de pagamento": "Lançamento, aprovação, valor ou correção",
  "Nota fiscal": "Anexo, prazo, conferência ou prorrogação",
  "Acesso e senha": "Entrar, senha, permissões do seu cargo",
  Sugestão: "Uma melhoria para o Fluxteme",
}

type Etapa = "categoria" | "detalhes" | "enviado"

// Botão de ajuda presente em todas as telas do sistema. O chamado vai por
// e-mail para o suporte com o contexto (quem, onde, quando); responder o
// e-mail responde direto a quem abriu.
export function SuporteBotao() {
  const pathname = usePathname()
  const [aberto, setAberto] = useState(false)
  const [etapa, setEtapa] = useState<Etapa>("categoria")
  const [categoria, setCategoria] = useState<CategoriaSuporte | null>(null)
  const [assunto, setAssunto] = useState("")
  const [descricao, setDescricao] = useState("")
  const [enviando, setEnviando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [resultado, setResultado] = useState<{ protocolo: string; email: string } | null>(null)

  const reiniciar = () => {
    setEtapa("categoria")
    setCategoria(null)
    setAssunto("")
    setDescricao("")
    setErro(null)
    setResultado(null)
  }

  const alternar = (v: boolean) => {
    if (enviando) return
    setAberto(v)
    // Depois de enviado, a próxima abertura começa do zero; um rascunho em
    // andamento é mantido.
    if (!v && etapa === "enviado") setTimeout(reiniciar, 200)
  }

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!categoria) return
    setEnviando(true)
    setErro(null)
    try {
      const r = await abrirChamadoSuporte({ categoria, assunto, descricao, pagina: pathname })
      if (!r.ok) {
        setErro(r.erro)
        return
      }
      setResultado({ protocolo: r.protocolo, email: r.email })
      setEtapa("enviado")
    } catch {
      setErro("Não foi possível enviar agora. Verifique a conexão e tente de novo.")
    } finally {
      setEnviando(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => alternar(true)}
        className="fixed bottom-5 right-5 z-40 inline-flex h-11 items-center gap-2 rounded-full border border-border-strong bg-popover pl-3.5 pr-4 text-sm font-medium text-foreground shadow-float transition-colors duration-150 hover:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        aria-label="Abrir suporte"
      >
        <IconeSuporte className="h-5 w-5 text-primary" />
        <span className="hidden sm:inline">Suporte</span>
      </button>

      <Dialog open={aberto} onOpenChange={alternar}>
        <DialogContent className="max-h-[92dvh] overflow-y-auto sm:max-w-lg">
          {etapa === "categoria" && (
            <>
              <DialogHeader>
                <p className="type-eyebrow text-primary">Suporte Fluxteme</p>
                <DialogTitle>Do que você precisa?</DialogTitle>
                <DialogDescription>Escolha o assunto. Na próxima etapa você descreve o que aconteceu.</DialogDescription>
              </DialogHeader>
              <ul className="divide-y divide-border overflow-hidden rounded-lg border border-border">
                {CATEGORIAS_SUPORTE.map((c) => (
                  <li key={c}>
                    <button
                      type="button"
                      onClick={() => {
                        setCategoria(c)
                        setEtapa("detalhes")
                      }}
                      className="group flex w-full items-center gap-3 bg-card px-4 py-3 text-left transition-colors duration-150 hover:bg-surface focus-visible:bg-surface focus-visible:outline-none"
                    >
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground">{c}</span>
                        <span className="block text-xs text-text-tertiary">{AJUDA[c]}</span>
                      </span>
                      <ChevronRight className="h-4 w-4 text-text-tertiary transition-colors group-hover:text-foreground" />
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}

          {etapa === "detalhes" && categoria && (
            <form onSubmit={enviar} className="space-y-4">
              <DialogHeader>
                <button
                  type="button"
                  onClick={() => setEtapa("categoria")}
                  className="type-eyebrow inline-flex w-fit items-center gap-1 text-primary hover:underline"
                >
                  <ArrowLeft className="h-3 w-3" /> {categoria}
                </button>
                <DialogTitle>Conte o que você precisa</DialogTitle>
                <DialogDescription>
                  A mensagem chega ao suporte com seu nome, cargo, carteira e a página em que você está. A resposta vem no seu
                  e-mail.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-1.5">
                <Label htmlFor="sup-assunto">Assunto</Label>
                <Input
                  id="sup-assunto"
                  value={assunto}
                  onChange={(e) => setAssunto(e.target.value)}
                  maxLength={140}
                  placeholder="Ex.: Não consigo anexar a nota do pedido de setembro"
                  required
                  autoFocus
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="sup-descricao">Descrição</Label>
                <Textarea
                  id="sup-descricao"
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  maxLength={5000}
                  rows={6}
                  placeholder="O que você tentou fazer, o que aconteceu e, se houver, a mensagem de erro que apareceu."
                  required
                />
              </div>
              <p className="type-audit text-text-tertiary">Página: {pathname}</p>
              {erro && (
                <p role="alert" className="rounded-control border border-danger/30 bg-danger-subtle px-3 py-2 text-sm text-foreground">
                  {erro}
                </p>
              )}
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <Button type="button" variant="outline" onClick={() => alternar(false)} disabled={enviando}>
                  Cancelar
                </Button>
                <Button type="submit" loading={enviando}>
                  Enviar para o suporte
                </Button>
              </div>
            </form>
          )}

          {etapa === "enviado" && resultado && (
            <div className="space-y-4 py-2 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-success" aria-hidden="true" />
              <DialogHeader className="items-center text-center">
                <DialogTitle>Chamado enviado para o suporte</DialogTitle>
                <DialogDescription>
                  A resposta chega em <span className="font-medium text-foreground">{resultado.email}</span>, em até 1 dia útil.
                </DialogDescription>
              </DialogHeader>
              <div className="inline-flex flex-col items-center gap-1 rounded-lg border border-border bg-surface px-4 py-3">
                <span className="type-eyebrow text-text-tertiary">Protocolo</span>
                <AuditId valor={resultado.protocolo} rotulo="protocolo" className="text-sm" />
              </div>
              <div className="flex justify-center gap-2">
                <Button variant="outline" onClick={reiniciar}>
                  Abrir outro chamado
                </Button>
                <Button onClick={() => alternar(false)}>Fechar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
