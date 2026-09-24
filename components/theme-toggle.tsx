"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // O tema só é conhecido no cliente; antes disso o ícone ficaria errado.
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  const escuro = !montado || resolvedTheme === "dark"
  const rotulo = escuro ? "Usar tema claro" : "Usar tema escuro"

  return (
    <Button variant="ghost" size="icon" onClick={() => setTheme(escuro ? "light" : "dark")} aria-label={rotulo} title={rotulo}>
      {escuro ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </Button>
  )
}
