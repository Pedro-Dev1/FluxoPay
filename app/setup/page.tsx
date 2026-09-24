import { SetupInstructions } from "@/components/setup-instructions"
import { PageHeader } from "@/components/ui/page-header"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 lg:px-8">
        <PageHeader eyebrow="Sistema" title="Configuração do sistema" description="Passos para configurar o Fluxteme neste ambiente." />
        <SetupInstructions />
      </div>
    </div>
  )
}
