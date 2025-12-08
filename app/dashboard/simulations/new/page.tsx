import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SimulationsContent } from "@/components/dashboard/simulations-content"
import { Loader2 } from "lucide-react"

export default function NewSimulationPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <SimulationsContent />
      </Suspense>
    </DashboardLayout>
  )
}
