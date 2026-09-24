import { cn } from "@/lib/utils"

// Formato do texto (editado pelo Super Admin em /admin/termos):
//   "## Título"        -> título de seção
//   "| a | b | c |"    -> linha de tabela; a primeira é o cabeçalho e
//                         "|---|---|" é ignorada
//   linha em branco    -> separa parágrafos
type Bloco =
  | { tipo: "titulo"; texto: string }
  | { tipo: "paragrafo"; texto: string }
  | { tipo: "tabela"; linhas: string[][] }

const SEPARADOR_TABELA = /^\|[\s|:-]+\|$/
const NUMERICO = /^(R\$\s*)?[\d.,]+$/

function interpretar(conteudo: string): Bloco[] {
  const blocos: Bloco[] = []
  let paragrafo: string[] = []
  let tabela: string[][] | null = null

  const fecharParagrafo = () => {
    if (paragrafo.length) blocos.push({ tipo: "paragrafo", texto: paragrafo.join(" ") })
    paragrafo = []
  }
  const fecharTabela = () => {
    if (tabela?.length) blocos.push({ tipo: "tabela", linhas: tabela })
    tabela = null
  }

  for (const bruta of conteudo.replace(/\r\n/g, "\n").split("\n")) {
    const linha = bruta.trim()

    if (linha.startsWith("|")) {
      fecharParagrafo()
      if (SEPARADOR_TABELA.test(linha)) continue
      tabela ??= []
      tabela.push(linha.replace(/^\||\|$/g, "").split("|").map((c) => c.trim()))
      continue
    }
    fecharTabela()

    if (!linha) {
      fecharParagrafo()
    } else if (linha.startsWith("## ")) {
      fecharParagrafo()
      blocos.push({ tipo: "titulo", texto: linha.slice(3) })
    } else {
      paragrafo.push(linha)
    }
  }
  fecharParagrafo()
  fecharTabela()

  return blocos
}

function TabelaTermo({ linhas }: { linhas: string[][] }) {
  const [cabecalho, ...corpo] = linhas
  // Coluna numérica (valor, preço) alinha à direita; texto à esquerda.
  const numerica = cabecalho.map((_, i) => corpo.length > 0 && corpo.every((l) => NUMERICO.test(l[i] ?? "")))

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="border-b border-border">
            {cabecalho.map((celula, i) => (
              <th
                key={i}
                className={cn("py-2 px-2 first:pl-0 last:pr-0 font-medium text-foreground", numerica[i] ? "text-right" : "text-left")}
              >
                {celula}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {corpo.map((linha, l) => (
            <tr key={l} className="border-b border-border last:border-0">
              {cabecalho.map((_, i) => (
                <td
                  key={i}
                  className={cn(
                    "py-2 px-2 first:pl-0 last:pr-0 text-muted-foreground",
                    numerica[i] && "text-right tabular-nums whitespace-nowrap",
                  )}
                >
                  {linha[i] ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export function TermoComercialConteudo({ conteudo, className }: { conteudo: string; className?: string }) {
  const blocos = interpretar(conteudo)

  return (
    <div className={cn("space-y-3 text-sm", className)}>
      {blocos.map((bloco, i) => {
        if (bloco.tipo === "titulo") {
          return (
            <h3 key={i} className="pt-2 font-semibold text-foreground first:pt-0">
              {bloco.texto}
            </h3>
          )
        }
        if (bloco.tipo === "tabela") return <TabelaTermo key={i} linhas={bloco.linhas} />
        return (
          <p key={i} className="text-muted-foreground leading-relaxed">
            {bloco.texto}
          </p>
        )
      })}
    </div>
  )
}
