"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Users,
  Play,
  ChevronDown,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Target,
  Loader2,
} from "lucide-react"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts"
import { useSimulations } from "@/lib/hooks/use-simulations"

const waitTimeData = [
  { time: "8:00", value: 5 },
  { time: "9:00", value: 8 },
  { time: "10:00", value: 12 },
  { time: "11:00", value: 18 },
  { time: "12:00", value: 25 },
  { time: "13:00", value: 22 },
  { time: "14:00", value: 15 },
  { time: "15:00", value: 10 },
  { time: "16:00", value: 8 },
  { time: "17:00", value: 14 },
  { time: "18:00", value: 28 },
  { time: "19:00", value: 32 },
  { time: "20:00", value: 26 },
  { time: "21:00", value: 18 },
]

const throughputData = [
  { day: "Mon", customers: 180 },
  { day: "Tue", customers: 220 },
  { day: "Wed", customers: 195 },
  { day: "Thu", customers: 240 },
  { day: "Fri", customers: 310 },
  { day: "Sat", customers: 380 },
  { day: "Sun", customers: 290 },
]

export function DashboardContent() {
  const router = useRouter()
  const { simulations, isLoading } = useSimulations()
  const [timeFilter, setTimeFilter] = useState("Last 7 days")

  // Calculate metrics from simulations
  const completedSimulations = simulations.filter((s) => s.status === "completed")
  const avgWaitTime =
    completedSimulations.length > 0
      ? completedSimulations.reduce((acc, s) => acc + (s.performance_metrics?.avg_waiting_time || 0), 0) /
        completedSimulations.length
      : 0
  const totalCustomers = completedSimulations.reduce((acc, s) => acc + (s.customer_metrics?.customers_served || 0), 0)
  const avgUtilization =
    completedSimulations.length > 0
      ? completedSimulations.reduce((acc, s) => acc + (s.utilization_metrics?.table_utilization || 0), 0) /
        completedSimulations.length
      : 0

  const utilizationData = [
    { name: "Tables", value: Math.round(avgUtilization * 100) || 87, fill: "var(--chart-1)" },
    { name: "Servers", value: 72, fill: "var(--chart-2)" },
    { name: "Kitchen", value: 65, fill: "var(--chart-3)" },
  ]

  const recentSimulations = simulations.slice(0, 4).map((sim) => ({
    id: sim.id,
    name: sim.restaurant_name || `Simulation #${sim.simulation_id?.slice(-6) || sim.id}`,
    status: sim.status,
    waitTime: sim.performance_metrics?.avg_waiting_time
      ? `${sim.performance_metrics.avg_waiting_time.toFixed(1)} min`
      : "—",
    customers: sim.customer_metrics?.customers_served || "—",
    date: sim.status === "running" ? "Running..." : new Date(sim.created_at).toLocaleDateString(),
  }))

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Monitor your simulation results and analytics</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
            {timeFilter}
            <ChevronDown className="w-4 h-4" />
          </Button>
          <Button
            className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => router.push("/dashboard/simulations/new")}
          >
            <Play className="w-4 h-4" />
            New Simulation
          </Button>
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Avg Wait Time"
          value={avgWaitTime.toFixed(1)}
          unit="min"
          change={-12}
          changeLabel="vs last week"
          icon={Clock}
          isLoading={isLoading}
        />
        <MetricCard
          title="Customers Served"
          value={totalCustomers.toLocaleString()}
          change={8}
          changeLabel="vs last week"
          icon={Users}
          isLoading={isLoading}
        />
        <MetricCard
          title="Table Utilization"
          value={Math.round(avgUtilization * 100) || 87}
          unit="%"
          change={5}
          changeLabel="vs last week"
          icon={Target}
          isLoading={isLoading}
        />
        <MetricCard
          title="Simulations Run"
          value={simulations.length.toString()}
          change={20}
          changeLabel="vs last week"
          icon={Activity}
          isLoading={isLoading}
        />
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Wait time chart - 2 columns */}
        <Card className="lg:col-span-2 rounded-2xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Wait Time Trends</CardTitle>
              <CardDescription>Average customer wait time throughout the day</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waitTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="waitTimeGradient" x1="0" y1="0" x2="0" y2="1">
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
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="var(--chart-1)"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#waitTimeGradient)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Utilization card */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Resource Utilization</CardTitle>
            <CardDescription>Current utilization rates</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {utilizationData.map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-foreground font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.value}%`,
                      backgroundColor: item.fill,
                    }}
                  />
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Peak Hours</span>
                <Badge variant="secondary" className="rounded-full">
                  12:00 - 14:00
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Throughput chart */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Weekly Throughput</CardTitle>
              <CardDescription>Customers served per day</CardDescription>
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="w-4 h-4" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={throughputData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                  />
                  <Bar dataKey="customers" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent simulations */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Recent Simulations</CardTitle>
              <CardDescription>Latest simulation runs</CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-primary"
              onClick={() => router.push("/dashboard/simulations")}
            >
              View All
            </Button>
          </CardHeader>
          <CardContent>
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
              <div className="space-y-4">
                {recentSimulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/simulations/${sim.id}`)}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-2 h-2 rounded-full ${
                          sim.status === "running" ? "bg-accent animate-pulse" : "bg-primary"
                        }`}
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">{sim.name}</p>
                        <p className="text-xs text-muted-foreground">{sim.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">{sim.waitTime}</p>
                      <p className="text-xs text-muted-foreground">{sim.customers} customers</p>
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
  change,
  changeLabel,
  icon: Icon,
  isLoading,
}: {
  title: string
  value: string
  unit?: string
  change: number
  changeLabel: string
  icon: React.ElementType
  isLoading?: boolean
}) {
  const isPositive = change > 0
  const isNegative = change < 0

  return (
    <Card className="rounded-2xl border-border hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{title}</p>
            {isLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            ) : (
              <>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">{value}</span>
                  {unit && <span className="text-lg text-muted-foreground">{unit}</span>}
                </div>
                <div className="flex items-center gap-1">
                  {isPositive && <ArrowUpRight className="w-3 h-3 text-accent" />}
                  {isNegative && <ArrowDownRight className="w-3 h-3 text-accent" />}
                  <span
                    className={`text-xs font-medium ${
                      isNegative ? "text-accent" : isPositive ? "text-accent" : "text-muted-foreground"
                    }`}
                  >
                    {Math.abs(change)}%
                  </span>
                  <span className="text-xs text-muted-foreground">{changeLabel}</span>
                </div>
              </>
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
