import { notFound } from "next/navigation"
import { PageHeader } from "@/components/ui/page-header"
import { UsuariosSituacaoList } from "@/components/usuarios-situacao-list"
import { AdminDiagnosticoEmail } from "@/components/admin-diagnostico-email"
import type { UsuarioSituacao } from "@/app/actions/colaboradores"

// Prévia com dados fictícios do controle de usuários e do diagnóstico de
// e-mail, só em desenvolvimento.
export default function ControlesPreviewPage() {
  if (process.env.NODE_ENV === "production") notFound()
  const dia = 86400000
  const agora = Date.now()
  const pessoas: [string, string, string | null, boolean, number | null][] = [
    ["Ana Beatriz Figueiredo de Albuquerque Nogueira", "Colaborador", "Operação Norte", true, 3],
    ["Carlos Mendes", "Supervisor", "Manutenção", true, 1],
    ["Juliana Prado", "Colaborador", "Operação Sul", true, 120],
    ["Rafael Tavares", "Colaborador", "Manutenção", false, 210],
    ["Marina Lopes", "Financeiro", null, true, null],
    ["Paula Rezende", "Gerente", "Operação Norte", true, null],
    ["Diego Arruda", "Colaborador", "Administrativo", false, 400],
    ["Luana Couto", "Colaborador", "Operação Sul", true, 95],
  ]
  const usuarios: UsuarioSituacao[] = pessoas.map(([nome, cargo, equipe, ativo, dias], i) => ({
    id: `u-${i}`,
    nome_completo: nome,
    email: `${nome.split(" ")[0].toLowerCase()}@empresa.com.br`,
    tipo_acesso: cargo,
    ativo,
    created_at: new Date(agora - 400 * dia).toISOString(),
    equipe: equipe ? { nome: equipe } : null,
    ultimo_pedido: dias === null ? null : new Date(agora - dias * dia).toISOString(),
  }))

  return (
    <div className="mx-auto w-full max-w-7xl space-y-16 px-4 py-8 lg:px-8">
      <div>
        <PageHeader eyebrow="Gestão" title="Usuários ativos e inativos" description="Prévia com dados fictícios." />
        <UsuariosSituacaoList usuarios={usuarios} usuarioLogadoId="u-4" />
      </div>
      <AdminDiagnosticoEmail
        diagnostico={{
          config: {
            chaveConfigurada: true,
            remetente: "Fluxteme <contato@fluxteme.com.br>",
            remetentePadrao: true,
            urlApp: "https://fluxopay.connectvending.simpleqia.com",
            urlAppPadrao: true,
          },
          ultimos30Dias: { enviados: 42, falhados: 1, pendentes: 0 },
          falhasRecentes: [
            {
              email: "carlos@empresa.com.br",
              erro: "Resend recusou o envio: The fluxteme.com.br domain is not verified",
              quando: new Date(agora - 2 * dia).toISOString(),
            },
          ],
        }}
      />
    </div>
  )
}
