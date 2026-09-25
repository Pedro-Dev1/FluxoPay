import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

// O SDK do Resend devolve { data, error } em vez de lançar. Estes testes
// garantem que o envio só é considerado feito quando o Resend aceita.
const send = vi.fn()
vi.mock("resend", () => ({
  Resend: vi.fn().mockImplementation(() => ({ emails: { send } })),
}))

const params = { destinatario: "ana@empresa.com.br", nomeAprovador: "Ana", nomeColaborador: "Carlos" }

describe("envio de e-mail", () => {
  const chaveOriginal = process.env.RESEND_API_KEY

  beforeEach(() => {
    send.mockReset()
    vi.resetModules()
  })

  afterEach(() => {
    process.env.RESEND_API_KEY = chaveOriginal
  })

  it("falha quando não há RESEND_API_KEY, em vez de fingir que enviou", async () => {
    delete process.env.RESEND_API_KEY
    const { enviarEmailPedidoAguardandoAprovacao } = await import("./email")
    await expect(enviarEmailPedidoAguardandoAprovacao(params)).rejects.toThrow("RESEND_API_KEY não configurada")
    expect(send).not.toHaveBeenCalled()
  })

  it("falha quando o Resend recusa o envio", async () => {
    process.env.RESEND_API_KEY = "re_teste"
    send.mockResolvedValue({ data: null, error: { message: "The fluxteme.com.br domain is not verified" } })
    const { enviarEmailPedidoAguardandoAprovacao } = await import("./email")
    await expect(enviarEmailPedidoAguardandoAprovacao(params)).rejects.toThrow("domain is not verified")
  })

  it("devolve o id da mensagem quando o Resend aceita", async () => {
    process.env.RESEND_API_KEY = "re_teste"
    send.mockResolvedValue({ data: { id: "msg_123" }, error: null })
    const { enviarEmailPedidoAguardandoAprovacao } = await import("./email")
    await expect(enviarEmailPedidoAguardandoAprovacao(params)).resolves.toBe("msg_123")
    const enviado = send.mock.calls[0][0]
    expect(enviado.to).toBe("ana@empresa.com.br")
    expect(enviado.from).toContain("fluxteme.com.br")
    expect(enviado.html).toContain("Carlos")
    expect(enviado.text).toContain("Carlos")
  })
})
