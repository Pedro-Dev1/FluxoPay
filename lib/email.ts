import { Resend } from "resend"

// Instanciado sob demanda, nunca no carregamento do módulo: o construtor do
// Resend lança exceção se a chave estiver ausente, e isso derrubaria o build
// (ou qualquer rota que importe este arquivo) em qualquer ambiente sem a
// variável configurada — inclusive antes da primeira configuração na Vercel.
function getResendClient(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null
  return new Resend(process.env.RESEND_API_KEY)
}

const FROM = process.env.RESEND_FROM_EMAIL || "Fluxteme <contato@fluxteme.com.br>"
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://fluxopay.connectvending.simpleqia.com"

/** Estado da configuração de e-mail, para diagnóstico (sem expor a chave). */
export function configuracaoEmail() {
  return {
    chaveConfigurada: !!process.env.RESEND_API_KEY,
    remetente: FROM,
    remetentePadrao: !process.env.RESEND_FROM_EMAIL,
    urlApp: APP_URL,
    urlAppPadrao: !process.env.NEXT_PUBLIC_APP_URL,
  }
}

/**
 * Único ponto de envio. Lança erro quando não há chave configurada ou quando
 * o Resend recusa (o SDK devolve `error` em vez de lançar — ignorar esse
 * retorno fazia envio recusado ser registrado como "enviado"). Quem chama
 * decide: registrar a falha ou seguir o fluxo. Devolve o id no Resend.
 */
async function enviar(msg: { to: string; subject: string; html: string; text: string; replyTo?: string }): Promise<string> {
  const resend = getResendClient()
  if (!resend) throw new Error("RESEND_API_KEY não configurada no ambiente")
  const { data, error } = await resend.emails.send({ from: FROM, ...msg })
  if (error) throw new Error(`Resend recusou o envio: ${error.message}`)
  return data?.id ?? ""
}

// Manual de Marca v2.0 · seção 09: e-mail transacional usa a assinatura
// horizontal com 180 px de largura, sobre fundo claro. Seção 06: onde Jost e
// Inter não estão disponíveis (e-mail), usar Arial/Helvetica; no lugar de
// JetBrains Mono, Consolas/Courier New. Cores oficiais: navy #011832 para
// texto, teal #00668A para ação e link (aqua não é usado sobre branco).
function emailShell(opts: {
  preheader: string
  heading: string
  bodyHtml: string
  imagemUrl?: string
  cta?: { label: string; url: string } | null
}) {
  const imagemHtml = opts.imagemUrl
    ? `<img src="${opts.imagemUrl}" alt="" style="display:block; width:100%; max-width:416px; border-radius:6px; margin:0 0 20px 0;" />`
    : ""

  const ctaHtml = opts.cta
    ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin-top:28px;">
                <tr>
                  <td style="border-radius:4px; background-color:#00668A;">
                    <a href="${opts.cta.url}" target="_blank" style="display:inline-block; padding:11px 22px; font-size:14px; font-weight:600; color:#FFFFFF; text-decoration:none; border-radius:4px;">${opts.cta.label}</a>
                  </td>
                </tr>
              </table>
              <p style="margin:20px 0 0 0; font-size:12px; line-height:18px; color:#5A6B7B;">Se o botão não funcionar, copie e cole este link no navegador:<br />
                <a href="${opts.cta.url}" style="color:#00668A; word-break:break-all;">${opts.cta.url}</a>
              </p>`
    : ""

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${opts.heading}</title>
</head>
<body style="margin:0; padding:0; background-color:#F6F8F9; font-family:Arial,Helvetica,sans-serif;">
  <div style="display:none; max-height:0; overflow:hidden; opacity:0;">${opts.preheader}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F6F8F9; padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="max-width:480px; width:100%; background-color:#FFFFFF; border-radius:6px; overflow:hidden; border:1px solid #DFE3E6;">
          <tr>
            <td style="padding:28px 32px 24px 32px; border-bottom:1px solid #DFE3E6;">
              <img src="${APP_URL}/logo-claro.png" width="180" alt="FLUXTEME" style="display:block; width:180px; height:auto; border:0;" />
            </td>
          </tr>
          <tr>
            <td style="padding:32px;">
              ${imagemHtml}
              <h1 style="margin:0 0 16px 0; font-size:20px; line-height:28px; font-weight:400; color:#011832;">${opts.heading}</h1>
              <div style="font-size:14px; line-height:22px; color:#3D5166;">${opts.bodyHtml}</div>
              ${ctaHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px; background-color:#F6F8F9; border-top:1px solid #DFE3E6;">
              <p style="margin:0; font-size:12px; line-height:18px; color:#5A6B7B;">Fluxteme Tecnologia Desenvolvimento de Software LTDA · CNPJ 69.046.679/0001-56<br />Mensagem automática. Dúvidas: <a href="mailto:contato@fluxteme.com.br" style="color:#00668A;">contato@fluxteme.com.br</a></p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export async function enviarEmailNotaFiscalPendente(params: {
  destinatario: string
  nomeColaborador: string
  prazoDias: number
}) {
  const heading = "Seu pedido foi aprovado — falta anexar a nota fiscal"
  const bodyHtml = `
    <p style="margin:0 0 12px 0;">Olá, ${params.nomeColaborador}.</p>
    <p style="margin:0 0 12px 0;">Seu pedido de pagamento foi aprovado pelo financeiro. Para que o pagamento seja processado, você precisa anexar a nota fiscal em até ${params.prazoDias} dias.</p>
    <p style="margin:0;">Acesse o sistema e anexe sua nota fiscal o quanto antes.</p>
  `
  const textoAlternativo = `Olá, ${params.nomeColaborador}.\n\nSeu pedido de pagamento foi aprovado pelo financeiro. Para que o pagamento seja processado, você precisa anexar a nota fiscal em até ${params.prazoDias} dias.\n\nAcesse: ${APP_URL}`

  return enviar({
    to: params.destinatario,
    subject: "Pedido aprovado — anexe sua nota fiscal",
    html: emailShell({
      preheader: "Seu pedido foi aprovado. Anexe a nota fiscal para receber o pagamento.",
      heading,
      bodyHtml,
      cta: { label: "Acessar e anexar nota", url: APP_URL },
    }),
    text: textoAlternativo,
  })
}

export async function enviarEmailRedefinicaoSenha(params: { destinatario: string; nomeColaborador: string; token: string }) {
  const resetUrl = `${APP_URL}/redefinir-senha/${params.token}`
  const heading = "Redefinição de senha"
  const bodyHtml = `
    <p style="margin:0 0 12px 0;">Olá, ${params.nomeColaborador}.</p>
    <p style="margin:0 0 12px 0;">Recebemos uma solicitação para redefinir a senha da sua conta no Fluxteme. Clique no botão abaixo para criar uma nova senha.</p>
    <p style="margin:0;">Se você não solicitou essa alteração, pode ignorar este e-mail — sua senha atual continua válida. Este link expira em 1 hora.</p>
  `
  const textoAlternativo = `Olá, ${params.nomeColaborador}.\n\nRecebemos uma solicitação para redefinir a senha da sua conta no Fluxteme. Acesse o link abaixo para criar uma nova senha (expira em 1 hora):\n${resetUrl}\n\nSe você não solicitou essa alteração, pode ignorar este e-mail — sua senha atual continua válida.`

  return enviar({
    to: params.destinatario,
    subject: "Redefinição de senha — Fluxteme",
    html: emailShell({
      preheader: "Clique para criar uma nova senha da sua conta Fluxteme.",
      heading,
      bodyHtml,
      cta: { label: "Redefinir minha senha", url: resetUrl },
    }),
    text: textoAlternativo,
  })
}

function escapeHtml(texto: string): string {
  return texto.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function paragrafosHtml(texto: string): string {
  return texto
    .split("\n")
    .filter((linha) => linha.trim().length > 0)
    .map((linha) => `<p style="margin:0 0 12px 0;">${escapeHtml(linha)}</p>`)
    .join("")
}

export async function enviarEmailAtualizacao(params: {
  destinatario: string
  nome: string
  titulo: string
  subtitulo?: string | null
  descricao: string
  imagemUrl?: string | null
  cta?: { label: string; url: string } | null
}) {
  const bodyHtml = `
    <p style="margin:0 0 12px 0;">Olá, ${escapeHtml(params.nome)}.</p>
    ${params.subtitulo ? `<p style="margin:0 0 12px 0; font-weight:600; color:#011832;">${escapeHtml(params.subtitulo)}</p>` : ""}
    ${paragrafosHtml(params.descricao)}
  `
  const textoAlternativo = `Olá, ${params.nome}.\n\n${params.subtitulo ? params.subtitulo + "\n\n" : ""}${params.descricao}${params.cta ? `\n\n${params.cta.label}: ${params.cta.url}` : ""}`

  return enviar({
    to: params.destinatario,
    subject: params.titulo,
    html: emailShell({
      preheader: params.subtitulo || params.titulo,
      heading: params.titulo,
      bodyHtml,
      imagemUrl: params.imagemUrl || undefined,
      cta: params.cta,
    }),
    text: textoAlternativo,
  })
}

export async function enviarEmailPedidoAguardandoAprovacao(params: {
  destinatario: string
  nomeAprovador: string
  nomeColaborador: string
}) {
  const heading = "Pedido aguardando sua aprovação"
  const bodyHtml = `
    <p style="margin:0 0 12px 0;">Olá, ${escapeHtml(params.nomeAprovador)}.</p>
    <p style="margin:0 0 12px 0;">${escapeHtml(params.nomeColaborador)} enviou um pedido de pagamento que está aguardando a sua aprovação.</p>
    <p style="margin:0;">Acesse o Fluxteme para revisar e aprovar.</p>
  `
  const textoAlternativo = `Olá, ${params.nomeAprovador}.\n\n${params.nomeColaborador} enviou um pedido de pagamento que está aguardando a sua aprovação.\n\nAcesse: ${APP_URL}`

  return enviar({
    to: params.destinatario,
    subject: "Pedido aguardando aprovação — Fluxteme",
    html: emailShell({
      preheader: `${params.nomeColaborador} enviou um pedido aguardando sua aprovação.`,
      heading,
      bodyHtml,
      cta: { label: "Aprovar pedido", url: APP_URL },
    }),
    text: textoAlternativo,
  })
}

/** E-mail de teste do diagnóstico do painel Super Admin. */
export async function enviarEmailTeste(params: { destinatario: string; nome: string }) {
  const agora = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", dateStyle: "short", timeStyle: "medium" }).format(new Date())
  return enviar({
    to: params.destinatario,
    subject: "Teste de envio — Fluxteme",
    html: emailShell({
      preheader: "Teste de envio de e-mail do Fluxteme.",
      heading: "Teste de envio de e-mail",
      bodyHtml: `
    <p style="margin:0 0 12px 0;">Olá, ${escapeHtml(params.nome)}.</p>
    <p style="margin:0;">Este é um teste disparado do painel Super Admin em ${agora}. Se ele chegou, o envio de e-mails do Fluxteme está funcionando.</p>
  `,
      cta: { label: "Abrir o Fluxteme", url: APP_URL },
    }),
    text: `Olá, ${params.nome}.

Este é um teste disparado do painel Super Admin em ${agora}. Se ele chegou, o envio de e-mails do Fluxteme está funcionando.`,
  })
}

export const EMAIL_SUPORTE = process.env.SUPORTE_EMAIL || "contato@fluxteme.com.br"

/** Chamado aberto pelo botão de ajuda. Responder ao e-mail responde direto a quem abriu. */
export async function enviarEmailSuporte(params: {
  protocolo: string
  categoria: string
  assunto: string
  descricao: string
  nome: string
  email: string
  cargo: string
  carteira: string
  pagina: string
  navegador: string
  quando: string
}) {
  const linha = (rotulo: string, valor: string, mono = false) => `
      <tr>
        <td style="padding:6px 12px 6px 0; font-size:12px; color:#5A6B7B; white-space:nowrap; vertical-align:top;">${rotulo}</td>
        <td style="padding:6px 0; font-size:13px; color:#011832;${mono ? " font-family:Consolas,'Courier New',monospace;" : ""}">${escapeHtml(valor)}</td>
      </tr>`
  const bodyHtml = `
    <p style="margin:0 0 4px 0; font-size:12px; color:#5A6B7B;">${escapeHtml(params.categoria)}</p>
    <p style="margin:0 0 16px 0; font-size:16px; font-weight:600; color:#011832;">${escapeHtml(params.assunto)}</p>
    <div style="margin:0 0 20px 0; padding:12px 14px; background-color:#F6F8F9; border-left:2px solid #00668A;">${paragrafosHtml(params.descricao)}</div>
    <table role="presentation" cellpadding="0" cellspacing="0" style="border-top:1px solid #DFE3E6; padding-top:8px; width:100%;">
      ${linha("Protocolo", params.protocolo, true)}
      ${linha("Quem", `${params.nome} · ${params.cargo}`)}
      ${linha("E-mail", params.email)}
      ${linha("Carteira", params.carteira)}
      ${linha("Página", params.pagina, true)}
      ${linha("Quando", params.quando, true)}
      ${linha("Navegador", params.navegador, true)}
    </table>
  `
  return enviar({
    to: EMAIL_SUPORTE,
    replyTo: params.email,
    subject: `[${params.protocolo}] ${params.categoria}: ${params.assunto}`,
    html: emailShell({ preheader: `${params.nome} abriu um chamado: ${params.assunto}`, heading: "Novo chamado de suporte", bodyHtml }),
    text: [
      `Protocolo: ${params.protocolo}`,
      `Categoria: ${params.categoria}`,
      `Assunto: ${params.assunto}`,
      "",
      params.descricao,
      "",
      `Quem: ${params.nome} · ${params.cargo}`,
      `E-mail: ${params.email}`,
      `Carteira: ${params.carteira}`,
      `Página: ${params.pagina}`,
      `Quando: ${params.quando}`,
      `Navegador: ${params.navegador}`,
    ].join("\n"),
  })
}
