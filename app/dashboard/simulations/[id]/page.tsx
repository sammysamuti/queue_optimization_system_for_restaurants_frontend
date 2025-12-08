"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Clock, Users, Target, AlertTriangle, Loader2, Trash2, Download } from "lucide-react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useSimulation, useSimulations } from "@/lib/hooks/use-simulations"
import { toast } from "sonner"

export default function SimulationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { simulation, isLoading } = useSimulation(id)
  const { deleteSimulation } = useSimulations()

  const handleDelete = async () => {
    try {
      await deleteSimulation(id)
      toast.success("Simulation deleted successfully!")
      router.push("/dashboard/simulations")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete simulation")
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!simulation) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-foreground">Simulation not found</h2>
          <Button
            variant="outline"
            className="mt-4 rounded-xl bg-transparent"
            onClick={() => router.push("/dashboard/simulations")}
          >
            Back to Simulations
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  const { performance_metrics, utilization_metrics, queue_metrics, customer_metrics } = simulation

  // Mock data for charts (in real app, this would come from detailed simulation data)
  const waitTimeData = [
    { time: "0", value: 5 },
    { time: "60", value: 8 },
    { time: "120", value: 15 },
    { time: "180", value: 22 },
    { time: "240", value: 18 },
    { time: "300", value: 25 },
    { time: "360", value: 20 },
    { time: "420", value: 12 },
    { time: "480", value: 8 },
  ]

  const customerFlowData = [
    { hour: "1", served: 45, lost: 3 },
    { hour: "2", served: 52, lost: 5 },
    { hour: "3", served: 48, lost: 4 },
    { hour: "4", served: 55, lost: 2 },
    { hour: "5", served: 60, lost: 6 },
    { hour: "6", served: 58, lost: 4 },
    { hour: "7", served: 50, lost: 3 },
    { hour: "8", served: 42, lost: 2 },
  ]

  const utilizationPieData = [
    { name: "Tables", value: Math.round((utilization_metrics?.table_utilization || 0.85) * 100) },
    { name: "Servers", value: Math.round((utilization_metrics?.server_utilization || 0.72) * 100) },
  ]

  const COLORS = ["var(--chart-1)", "var(--chart-2)"]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => router.push("/dashboard/simulations")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-foreground">
                  Simulation #{simulation.simulation_id?.slice(-6) || simulation.id}
                </h1>
                <Badge
                  variant={simulation.status === "completed" ? "default" : "secondary"}
                  className={`rounded-full ${simulation.status === "completed" ? "bg-accent text-accent-foreground" : ""}`}
                >
                  {simulation.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{new Date(simulation.created_at).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
              <Download className="w-4 h-4" />
              Export
            </Button>
            <Button
              variant="outline"
              className="gap-2 rounded-xl bg-transparent text-destructive hover:text-destructive"
              onClick={handleDelete}
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </Button>
          </div>
        </div>

        {/* Key metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-foreground">
                    {performance_metrics?.avg_waiting_time?.toFixed(1) || "--"} min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customers Served</p>
                  <p className="text-2xl font-bold text-foreground">{customer_metrics?.customers_served || "--"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Table Utilization</p>
                  <p className="text-2xl font-bold text-foreground">
                    {Math.round((utilization_metrics?.table_utilization || 0) * 100)}%
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customers Lost</p>
                  <p className="text-2xl font-bold text-foreground">{customer_metrics?.customers_lost || "--"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Wait time trend */}
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Wait Time Over Time</CardTitle>
              <CardDescription>Average customer wait time throughout simulation</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={waitTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="waitGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--chart-1)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--chart-1)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="time"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      tickFormatter={(value) => `${value}m`}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      tickFormatter={(value) => `${value}m`}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="var(--chart-1)"
                      strokeWidth={2}
                      fill="url(#waitGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Customer flow */}
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Customer Flow</CardTitle>
              <CardDescription>Customers served vs lost per hour</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={customerFlowData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis
                      dataKey="hour"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                      tickFormatter={(value) => `Hr ${value}`}
                    />
                    <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                      }}
                    />
                    <Bar dataKey="served" fill="var(--chart-2)" radius={[4, 4, 0, 0]} name="Served" />
                    <Bar dataKey="lost" fill="var(--destructive)" radius={[4, 4, 0, 0]} name="Lost" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed metrics */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Performance metrics */}
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Avg Wait Time</span>
                <span className="text-sm font-medium text-foreground">
                  {performance_metrics?.avg_waiting_time?.toFixed(2) || "--"} min
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Max Wait Time</span>
                <span className="text-sm font-medium text-foreground">
                  {performance_metrics?.max_waiting_time?.toFixed(2) || "--"} min
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Median Wait Time</span>
                <span className="text-sm font-medium text-foreground">
                  {performance_metrics?.median_waiting_time?.toFixed(2) || "--"} min
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Avg Service Time</span>
                <span className="text-sm font-medium text-foreground">
                  {performance_metrics?.avg_service_time?.toFixed(2) || "--"} min
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Throughput</span>
                <span className="text-sm font-medium text-foreground">
                  {performance_metrics?.throughput?.toFixed(2) || "--"}/hr
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Utilization */}
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Resource Utilization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={utilizationPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {utilizationPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        border: "1px solid var(--border)",
                        borderRadius: "12px",
                      }}
                      formatter={(value: number) => `${value}%`}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex justify-center gap-6 mt-4">
                {utilizationPieData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                    <span className="text-sm text-muted-foreground">{item.name}</span>
                    <span className="text-sm font-medium text-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Queue metrics */}
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <CardTitle className="text-base font-semibold">Queue & Customer Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Avg Queue Length</span>
                <span className="text-sm font-medium text-foreground">
                  {queue_metrics?.queue_length_avg?.toFixed(1) || "--"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Max Queue Length</span>
                <span className="text-sm font-medium text-foreground">{queue_metrics?.queue_length_max || "--"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Total Arrivals</span>
                <span className="text-sm font-medium text-foreground">
                  {customer_metrics?.total_customers_arrived || "--"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">Customers Served</span>
                <span className="text-sm font-medium text-foreground">
                  {customer_metrics?.customers_served || "--"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">Customers Lost</span>
                <span className="text-sm font-medium text-destructive">{customer_metrics?.customers_lost || "--"}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
