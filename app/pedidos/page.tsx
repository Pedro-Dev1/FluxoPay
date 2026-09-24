import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { PageHeader } from "@/components/ui/page-header"
import { PedidoForm } from "@/components/pedido-form"
import { listarColaboradoresComGerente } from "@/app/actions/colaboradores"
import { getSession } from "@/lib/session"
import { AlertCircle, LogIn, ShieldAlert } from "lucide-react"

const PERFIS_QUE_CRIAM = ["Supervisor", "Adm", "Gerente", "Financeiro"]

function Cabecalho({ descricao }: { descricao: string }) {
  return <PageHeader eyebrow="Operação" title="Criar pedido" description={descricao} />
}

export default async function PedidosPage() {
  const session = await getSession()

  if (!session) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:px-8">
        <Cabecalho descricao="Lançamento de pedido de pagamento para prestadores da sua equipe." />
        <Alert>
          <LogIn />
          <AlertTitle>Entre para criar pedidos</AlertTitle>
          <AlertDescription>
            Só Supervisor, Gerente, Financeiro e Adm criam pedidos de pagamento.
            <Button asChild className="mt-3 flex w-fit">
              <Link href="/login">Entrar</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  if (!PERFIS_QUE_CRIAM.includes(session.tipoAcesso)) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:px-8">
        <Cabecalho descricao="Lançamento de pedido de pagamento para prestadores da sua equipe." />
        <Alert variant="destructive">
          <ShieldAlert />
          <AlertTitle>Seu perfil não cria pedidos</AlertTitle>
          <AlertDescription>
            O perfil {session.tipoAcesso} não lança pedidos de pagamento. Quem lança é o supervisor ou o gerente da sua equipe.
            <Button asChild variant="outline" className="mt-3 flex w-fit">
              <Link href="/">Voltar ao início</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const colaboradores = await listarColaboradoresComGerente()
  const descricao = ["Gerente", "Financeiro", "Adm"].includes(session.tipoAcesso)
    ? "Lançamento de pedido de pagamento para os prestadores das suas equipes."
    : "Lançamento de pedido de pagamento para os prestadores da sua equipe."

  if (colaboradores.length === 0) {
    return (
      <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:px-8">
        <Cabecalho descricao={descricao} />
        <Alert variant="warning">
          <AlertCircle />
          <AlertTitle>Nenhum prestador disponível para lançamento</AlertTitle>
          <AlertDescription>
            {session.tipoAcesso === "Supervisor"
              ? "Sua equipe ainda não tem colaboradores cadastrados. Peça ao Adm ou Financeiro que vincule os prestadores à equipe em Gestão › Cadastros."
              : "Você ainda não está vinculado a nenhuma equipe. Peça ao Adm ou Financeiro que faça o vínculo em Gestão › Cadastros › Equipes."}
            <Button asChild variant="outline" className="mt-3 flex w-fit">
              <Link href="/">Voltar ao início</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-8 lg:px-8">
      <Cabecalho descricao={descricao} />
      <PedidoForm colaboradores={colaboradores} tipoAcesso={session.tipoAcesso} />
    </div>
  )
}
