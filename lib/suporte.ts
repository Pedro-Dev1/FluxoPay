// Categorias do chamado de suporte — compartilhadas entre o botão (cliente)
// e a ação do servidor.
export const CATEGORIAS_SUPORTE = [
  "Dúvida sobre o sistema",
  "Problema ou erro",
  "Pedido de pagamento",
  "Nota fiscal",
  "Acesso e senha",
  "Sugestão",
] as const

export type CategoriaSuporte = (typeof CATEGORIAS_SUPORTE)[number]
