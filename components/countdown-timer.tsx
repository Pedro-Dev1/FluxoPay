"use client"

import { useEffect, useState } from "react"
import { Clock, AlertTriangle } from "lucide-react"

interface CountdownTimerProps {
  dataLimite: string
}

export function CountdownTimer({ dataLimite }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    days: number
    hours: number
    minutes: number
    seconds: number
    expired: boolean
  }>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: false })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const deadline = new Date(dataLimite).getTime()
      const difference = deadline - now

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true })
        return
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24))
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ days, hours, minutes, seconds, expired: false })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [dataLimite]) // Removido onExpired das dependências

  if (timeLeft.expired) {
    return (
      <div className="flex items-center gap-2 p-3 rounded-lg bg-danger-subtle border border-danger/30">
        <AlertTriangle className="w-5 h-5 text-danger" />
        <div className="flex-1">
          <p className="text-sm font-medium text-danger">Prazo Expirado</p>
          <p className="text-xs text-danger">O prazo para anexar a nota fiscal terminou</p>
        </div>
      </div>
    )
  }

  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 6

  return (
    <div
      className={`flex items-center gap-2 p-3 rounded-lg border ${
        isUrgent
          ? "bg-warning-subtle border-warning/30"
          : "bg-accent border-primary/30"
      }`}
    >
      <Clock
        className={`w-5 h-5 ${isUrgent ? "text-warning" : "text-primary"}`}
      />
      <div className="flex-1">
        <p
          className={`text-sm font-medium ${isUrgent ? "text-warning" : "text-primary"}`}
        >
          Tempo Restante para Anexar Nota
        </p>
        <div
          className={`flex gap-2 text-xs font-mono ${isUrgent ? "text-warning" : "text-primary"}`}
        >
          {timeLeft.days > 0 && <span>{timeLeft.days}d</span>}
          <span>{timeLeft.hours.toString().padStart(2, "0")}h</span>
          <span>{timeLeft.minutes.toString().padStart(2, "0")}m</span>
          <span>{timeLeft.seconds.toString().padStart(2, "0")}s</span>
        </div>
      </div>
    </div>
  )
}
