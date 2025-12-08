"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronDown, Download, Filter, MoreHorizontal, TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { useSimulations } from "@/lib/hooks/use-simulations"
import Link from "next/link"

const queueStrategyData = [
  { name: "FCFS", value: 45, color: "#e85d3b" },
  { name: "Priority Small", value: 25, color: "#10b981" },
  { name: "Priority Large", value: 15, color: "#6366f1" },
  { name: "Dynamic", value: 15, color: "#f59e0b" },
]

export function AnalyticsContent() {
  const { simulations, isLoading } = useSimulations()

  const performanceData = simulations.slice(0, 7).map((sim, index) => ({
    date: new Date(sim.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    waitTime: sim.performance_metrics?.avg_waiting_time || Math.random() * 20 + 5,
    served: sim.customer_metrics?.customers_served || Math.floor(Math.random() * 200 + 100),
    utilization: Math.round((sim.utilization_metrics?.table_utilization || 0.8) * 100),
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Comprehensive simulation results and insights</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl bg-transparent">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Charts row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Performance trends */}
        <Card className="lg:col-span-2 rounded-2xl border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-base font-semibold">Performance Trends</CardTitle>
              <CardDescription>Wait time and utilization over time</CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-2 rounded-lg bg-transparent">
              Last 7 days
              <ChevronDown className="w-3 h-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                  />
                  <YAxis
                    yAxisId="left"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={(value) => `${value}m`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
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
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="waitTime"
                    stroke="#e85d3b"
                    strokeWidth={2}
                    dot={{ fill: "#e85d3b", r: 4 }}
                    name="Wait Time (min)"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="utilization"
                    stroke="#10b981"
                    strokeWidth={2}
                    dot={{ fill: "#10b981", r: 4 }}
                    name="Utilization (%)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#e85d3b" }} />
                <span className="text-sm text-muted-foreground">Wait Time</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#10b981" }} />
                <span className="text-sm text-muted-foreground">Utilization</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Strategy distribution */}
        <Card className="rounded-2xl border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold">Strategy Distribution</CardTitle>
            <CardDescription>Queue strategies used in simulations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={queueStrategyData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {queueStrategyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {queueStrategyData.map((item, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-xs text-muted-foreground">{item.name}</span>
                  <span className="text-xs font-medium text-foreground ml-auto">{item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Results table - using real simulation data */}
      <Card className="rounded-2xl border-border">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-base font-semibold">Simulation Results</CardTitle>
            <CardDescription>Detailed results from all simulations</CardDescription>
          </div>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl border border-border overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Restaurant</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-right">Wait Time</TableHead>
                  <TableHead className="font-semibold text-right">Served</TableHead>
                  <TableHead className="font-semibold text-right">Utilization</TableHead>
                  <TableHead className="font-semibold">Strategy</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No simulations found. Run your first simulation to see results here.
                    </TableCell>
                  </TableRow>
                ) : (
                  simulations.map((sim) => {
                    const waitTime = sim.performance_metrics?.avg_waiting_time || 0
                    const served = sim.customer_metrics?.customers_served || 0
                    const utilization = Math.round((sim.utilization_metrics?.table_utilization || 0) * 100)

                    return (
                      <TableRow key={sim.id} className="hover:bg-secondary/30">
                        <TableCell className="font-mono text-sm">
                          <Link href={`/dashboard/simulations/${sim.id}`} className="text-primary hover:underline">
                            {sim.simulation_id?.slice(-8) || sim.id?.slice(0, 8)}
                          </Link>
                        </TableCell>
                        <TableCell className="font-medium">{sim.restaurant_name || "Restaurant"}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(sim.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {waitTime < 10 ? (
                              <TrendingDown className="w-3 h-3 text-accent" />
                            ) : (
                              <TrendingUp className="w-3 h-3 text-destructive" />
                            )}
                            <span>{waitTime.toFixed(1)} min</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">{served}</TableCell>
                        <TableCell className="text-right">
                          <span className={utilization >= 85 ? "text-accent" : "text-foreground"}>{utilization}%</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full text-xs">
                            {sim.queue_strategy || "FCFS"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="rounded-full text-xs bg-accent/10 text-accent border-0">{sim.status}</Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
