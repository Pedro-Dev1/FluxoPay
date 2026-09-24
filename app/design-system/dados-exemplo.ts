import type { PedidoPagamento, StatusPedido } from "@/types/pedido"

// Dados fictícios e determinísticos para as prévias de /design-system.
export const EQUIPES_EXEMPLO = [
  { id: "eq-norte", nome: "Operação Norte" },
  { id: "eq-sul", nome: "Operação Sul" },
  { id: "eq-manut", nome: "Manutenção" },
  { id: "eq-adm", nome: "Administrativo" },
]

const CENTROS = [
  { id: "cc1", numero: "1010", nome: "Campo" },
  { id: "cc2", numero: "2020", nome: "Oficina" },
  { id: "cc3", numero: "3030", nome: "Escritório" },
]

const NOMES = [
  "Ana Beatriz Figueiredo", "Carlos Mendes", "Juliana Prado", "Rafael Tavares", "Marina Lopes", "Pedro Henrique Salles",
  "Luana Couto", "Diego Arruda", "Fernanda Queiroz", "Thiago Bastos", "Camila Rezende", "Bruno Almeida",
  "Patrícia Nogueira", "Gustavo Ferraz", "Isabela Monteiro", "Rodrigo Pacheco", "Larissa Vilela", "Eduardo Siqueira",
]

function aleatorio(semente: number) {
  let s = semente
  return () => {
    s = (s * 1103515245 + 12345) % 2147483648
    return s / 2147483648
  }
}

export function pedidosDeExemplo(): PedidoPagamento[] {
  const r = aleatorio(42)
  const agora = new Date()
  const pedidos: PedidoPagamento[] = []
  for (let i = 0; i < 92; i++) {
    const diasAtras = Math.floor(r() * 175)
    const criado = new Date(agora.getTime() - diasAtras * 86400000 - Math.floor(r() * 36000000))
    const nome = NOMES[Math.floor(r() * NOMES.length)]
    const equipe = EQUIPES_EXEMPLO[Math.floor(r() * EQUIPES_EXEMPLO.length)]
    const cc = CENTROS[Math.floor(r() * CENTROS.length)]
    const km = r() < 0.18
    const salario = [3200, 4100, 5200, 6800, 8900][Math.floor(r() * 5)]
    const he = km ? 0 : Math.round(r() * 1400)
    const plantao = !km && r() < 0.3 ? Math.round(r() * 900) : 0
    const conducao = !km && r() < 0.4 ? 220 : 0
    const comissao = !km && r() < 0.2 ? Math.round(r() * 2500) : 0
    const valorKm = km ? Math.round(150 + r() * 900) : r() < 0.2 ? Math.round(r() * 300) : 0
    const total = km ? valorKm : salario + he + plantao + comissao

    let status: StatusPedido
    const x = r()
    if (diasAtras < 6) status = x < 0.55 ? "pendente_gerente" : x < 0.8 ? "pendente_financeiro" : "correcao"
    else if (diasAtras < 20) status = x < 0.35 ? "aprovado" : x < 0.6 ? "nota_recebida" : x < 0.9 ? "pago" : "recusado"
    else status = x < 0.85 ? "pago" : x < 0.93 ? "recusado" : "expirado"

    const aprovGer = ["pendente_financeiro", "aprovado", "nota_recebida", "pago"].includes(status)
    const aprovFin = ["aprovado", "nota_recebida", "pago"].includes(status)
    pedidos.push({
      id: `ex-${i}`,
      colaborador_id: `c-${nome}`,
      tipo_pedido: km ? "reembolso_km" : "completo",
      horas_extras: he,
      valor_km: valorKm,
      conducao,
      valor_plantao: plantao,
      comissao,
      valor_total: total,
      salario_base: km ? 0 : salario,
      valor_desconto: 0,
      created_at: criado.toISOString(),
      status,
      aprovado_gerente: aprovGer,
      aprovado_financeiro: aprovFin,
      data_aprovacao_gerente: aprovGer ? new Date(criado.getTime() + (0.3 + r() * 2.5) * 86400000).toISOString() : undefined,
      data_aprovacao_financeiro: aprovFin ? new Date(criado.getTime() + (1.5 + r() * 3) * 86400000).toISOString() : undefined,
      criado_por: { nome_completo: "Carlos Mendes", tipo_acesso: "Supervisor" },
      colaborador: {
        nome_completo: nome,
        salario,
        tipo_acesso: "Colaborador",
        equipe_id: equipe.id,
        centro_custo_id: cc.id,
        equipe,
        centro_custo: cc,
      },
    })
  }
  return pedidos.sort((a, b) => b.created_at.localeCompare(a.created_at))
}
