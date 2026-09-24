import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"

export default function NotFound() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
      <EmptyState
        icon={FileQuestion}
        title="Esta página não existe"
        description="O endereço pode ter mudado ou o registro foi removido. Volte ao início e navegue pelo menu."
        action={
          <Button asChild>
            <Link href="/">Ir para o início</Link>
          </Button>
        }
      />
    </div>
  )
}
