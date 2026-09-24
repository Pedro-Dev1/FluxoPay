// Símbolo Fluxteme sobre a grade de construção, com as cotas do Manual
// (seção 07: X = altura da barra). Usa o arquivo original do ícone — nada é
// redesenhado. Medidas conferidas no arquivo: barra 1X, largura ~8X, altura ~10X.
export function DiagramaSimbolo({ className }: { className?: string }) {
  const linha = "hsl(var(--border))"
  const cota = "hsl(var(--text-tertiary))"
  return (
    <svg viewBox="0 0 520 540" className={className} role="img" aria-label="Símbolo Fluxteme com as cotas de construção">
      {/* grade */}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={40 + i * 44} y1={20} x2={40 + i * 44} y2={520} stroke={linha} strokeWidth={1} opacity={0.6} />
      ))}
      {Array.from({ length: 12 }, (_, i) => (
        <line key={`h${i}`} x1={20} y1={30 + i * 44} x2={500} y2={30 + i * 44} stroke={linha} strokeWidth={1} opacity={0.6} />
      ))}

      {/* símbolo (arquivo original, versão pela luminância do fundo) */}
      <image href="/icone-claro.png" x={95} y={85} width={400} height={400} className="dark:hidden" />
      <image href="/icone.png" x={95} y={85} width={400} height={400} className="hidden dark:block" />

      {/* cota horizontal: largura 8X */}
      <g stroke={cota} strokeWidth={1}>
        <line x1={164} y1={96} x2={427} y2={96} />
        <line x1={164} y1={89} x2={164} y2={103} />
        <line x1={427} y1={89} x2={427} y2={103} />
      </g>
      <text x={295} y={84} textAnchor="middle" fill={cota} fontSize={13} fontFamily="var(--font-mono)" letterSpacing="0.08em">
        8X
      </text>

      {/* cota vertical: altura 10X */}
      <g stroke={cota} strokeWidth={1}>
        <line x1={138} y1={124} x2={138} y2={446} />
        <line x1={131} y1={124} x2={145} y2={124} />
        <line x1={131} y1={446} x2={145} y2={446} />
      </g>
      <text
        x={120}
        y={285}
        textAnchor="middle"
        fill={cota}
        fontSize={13}
        fontFamily="var(--font-mono)"
        letterSpacing="0.08em"
        transform="rotate(-90 120 285)"
      >
        10X
      </text>

      {/* cota da barra: 1X (unidade de proteção) */}
      <g stroke={cota} strokeWidth={1}>
        <line x1={440} y1={276} x2={466} y2={276} />
        <line x1={440} y1={310} x2={466} y2={310} />
      </g>
      <text x={474} y={298} fill={cota} fontSize={13} fontFamily="var(--font-mono)" letterSpacing="0.08em">
        1X
      </text>
    </svg>
  )
}
