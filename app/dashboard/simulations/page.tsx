import { Suspense } from "react"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SimulationsListContent } from "@/components/dashboard/simulations-list-content"
import { Loader2 } from "lucide-react"

export default function SimulationsPage() {
  return (
    <DashboardLayout>
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        }
      >
        <SimulationsListContent />
      </Suspense>
    </DashboardLayout>
  )
}
