"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Clock,
  Users,
  Play,
  Target,
  Activity,
  Loader2,
} from "lucide-react"
import { useSimulations } from "@/lib/hooks/use-simulations"

export function DashboardContent() {
  const router = useRouter()
  const { simulations, isLoading } = useSimulations()

  // Calculate metrics from simulations - only real data
  const completedSimulations = simulations.filter((s) => s.status === "completed")
  const avgWaitTime =
    completedSimulations.length > 0
      ? completedSimulations.reduce((acc, s) => acc + (s.performance_metrics?.avg_waiting_time || 0), 0) /
        completedSimulations.length
      : 0
  const totalCustomers = completedSimulations.reduce((acc, s) => acc + (s.customer_metrics?.customers_served || 0), 0)
  const avgUtilization =
    completedSimulations.length > 0
      ? completedSimulations.reduce((acc, s) => {
          const util = s.utilization_metrics?.table_utilization || 0
          // Handle percentage values (if > 1, it's already a percentage)
          return acc + (util > 1 ? util / 100 : util)
        }, 0) / completedSimulations.length
      : 0

  // Calculate server utilization from real data
  const avgServerUtilization =
    completedSimulations.length > 0
      ? completedSimulations.reduce((acc, s) => {
          const util = s.utilization_metrics?.server_utilization || 0
          return acc + (util > 1 ? util / 100 : util)
        }, 0) / completedSimulations.length
      : 0

  const utilizationData = [
    { name: "Tables", value: Math.round(avgUtilization * 100) || 0 },
    { name: "Servers", value: Math.round(avgServerUtilization * 100) || 0 },
  ]

  const recentSimulations = simulations.slice(0, 4).map((sim) => ({
    id: sim.id,
    simulation_id: sim.simulation_id,
    name: sim.restaurant_name || `Simulation #${sim.simulation_id?.slice(-6) || sim.id}`,
    status: sim.status,
    waitTime: sim.performance_metrics?.avg_waiting_time
      ? `${sim.performance_metrics.avg_waiting_time.toFixed(1)} min`
      : "—",
    customers: sim.customer_metrics?.customers_served || "—",
    date: sim.status === "running" ? "Running..." : new Date(sim.created_at).toLocaleDateString(),
  }))

  return (
    <div className="space-y-6">
      {/* Metric cards - only real data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Avg Wait Time"
          value={avgWaitTime.toFixed(1)}
          unit="min"
          icon={Clock}
          isLoading={isLoading}
        />
        <MetricCard
          title="Customers Served"
          value={totalCustomers.toLocaleString()}
          unit="customers"
          icon={Users}
          isLoading={isLoading}
        />
        <MetricCard
          title="Table Utilization"
          value={Math.round(avgUtilization * 100)}
          unit="%"
          icon={Target}
          isLoading={isLoading}
        />
        <MetricCard
          title="Simulations Run"
          value={simulations.length.toString()}
          icon={Activity}
          isLoading={isLoading}
        />
      </div>

      {/* Charts row - only real data */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Utilization card - real data only */}
        <Card className="rounded-xl shadow-none">
          <CardContent className="p-6">
            <h3 className="text-base font-semibold mb-4">Resource Utilization</h3>
            <div className="space-y-4">
              {utilizationData.map((item) => (
                <div key={item.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground font-medium">{item.name}</span>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.value}%`,
                        backgroundColor: "var(--primary)",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent simulations - real data only */}
        <Card className="rounded-xl shadow-none">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-semibold">Recent Simulations</h3>
              <Button
                variant="ghost"
                size="sm"
                className="text-primary hover:text-primary hover:bg-accent"
                onClick={() => router.push("/dashboard/simulations")}
              >
                View All
              </Button>
            </div>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : recentSimulations.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">No simulations yet</p>
                <Button
                  className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => router.push("/dashboard/simulations/new")}
                >
                  <Play className="w-4 h-4" />
                  Run First Simulation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {recentSimulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/simulations/${sim.simulation_id || sim.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          sim.status === "running" ? "bg-primary animate-pulse" : "bg-primary"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{sim.name}</p>
                        <p className="text-xs text-muted-foreground">{sim.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{sim.waitTime}</p>
                      <p className="text-xs text-muted-foreground">
                        {sim.customers !== "—" ? `${sim.customers} customers` : "No data"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function MetricCard({
  title,
  value,
  unit,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: string
  unit?: string
  icon: React.ElementType
  isLoading?: boolean
}) {
  return (
    <Card className="rounded-xl shadow-none">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">{value}</span>
                {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
              </div>
            )}
          </div>
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
