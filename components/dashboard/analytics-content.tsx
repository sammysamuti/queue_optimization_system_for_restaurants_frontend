"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TrendingUp, TrendingDown, Loader2 } from "lucide-react"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"
import { useSimulations } from "@/lib/hooks/use-simulations"
import Link from "next/link"

export function AnalyticsContent() {
  const { simulations, isLoading } = useSimulations()

  // Calculate performance trends from real simulation data
  const performanceData = simulations
    .filter((sim) => sim.status === "completed")
    .slice(0, 10)
    .map((sim) => ({
      date: new Date(sim.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      waitTime: sim.performance_metrics?.avg_waiting_time || 0,
      utilization: Math.round(
        (sim.utilization_metrics?.table_utilization || 0) * 100
      ),
    }))
    .reverse() // Show oldest to newest

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results table - moved to top */}
      <Card className="rounded-xl shadow-none">
        <CardHeader>
          <CardTitle className="text-base font-semibold">Simulation Results</CardTitle>
          <CardDescription>Detailed results from all simulations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                  <TableHead className="font-semibold">ID</TableHead>
                  <TableHead className="font-semibold">Date</TableHead>
                  <TableHead className="font-semibold text-right">Avg Wait Time</TableHead>
                  <TableHead className="font-semibold text-right">Customers Served</TableHead>
                  <TableHead className="font-semibold text-right">Table Utilization</TableHead>
                  <TableHead className="font-semibold">Queue Strategy</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No simulations found. Run your first simulation to see results here.
                    </TableCell>
                  </TableRow>
                ) : (
                  simulations.map((sim) => {
                    const waitTime = sim.performance_metrics?.avg_waiting_time || 0
                    const customersServed = sim.customer_metrics?.customers_served || 0
                    const utilization = Math.round((sim.utilization_metrics?.table_utilization || 0) * 100)

                    return (
                      <TableRow key={sim.id} className="hover:bg-accent/50">
                        <TableCell className="font-mono text-sm">
                          <Link
                            href={`/dashboard/simulations/${sim.simulation_id || sim.id}`}
                            className="text-primary hover:underline"
                          >
                            {sim.simulation_id?.slice(-8) || sim.id?.slice(0, 8)}
                          </Link>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {new Date(sim.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            {waitTime > 0 && waitTime < 10 ? (
                              <TrendingDown className="w-3 h-3 text-accent" />
                            ) : waitTime > 0 ? (
                              <TrendingUp className="w-3 h-3 text-destructive" />
                            ) : null}
                            <span>{waitTime > 0 ? `${waitTime.toFixed(1)} min` : "--"}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {customersServed > 0 ? `${customersServed} customers` : "--"}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={utilization >= 85 ? "text-accent" : "text-foreground"}>
                            {utilization > 0 ? `${utilization}%` : "--"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-full text-xs">
                            {sim.config?.queue_strategy || "FCFS"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className="rounded-full text-xs bg-accent/10 text-accent border-0">
                            {sim.status}
                          </Badge>
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

      {/* Performance trends chart - only if we have data */}
      {performanceData.length > 0 && (
        <Card className="rounded-xl shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-semibold">Performance Trends</CardTitle>
            <CardDescription>Average wait time and table utilization over time</CardDescription>
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
                    tickFormatter={(value) => `${value} min`}
                    label={{ value: "Wait Time (min)", angle: -90, position: "insideLeft" }}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                    tickFormatter={(value) => `${value}%`}
                    label={{ value: "Utilization (%)", angle: 90, position: "insideRight" }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "var(--card)",
                      border: "1px solid var(--border)",
                      borderRadius: "12px",
                    }}
                    labelStyle={{ color: "var(--foreground)" }}
                    formatter={(value: any, name: string) => {
                      if (name === "Wait Time") return [`${value} min`, "Wait Time"]
                      if (name === "Utilization") return [`${value}%`, "Table Utilization"]
                      return [value, name]
                    }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="waitTime"
                    stroke="var(--primary)"
                    strokeWidth={2}
                    dot={{ fill: "var(--primary)", r: 4 }}
                    name="Wait Time"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="utilization"
                    stroke="var(--chart-2)"
                    strokeWidth={2}
                    dot={{ fill: "var(--chart-2)", r: 4 }}
                    name="Utilization"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm text-muted-foreground">Wait Time (min)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "var(--chart-2)" }} />
                <span className="text-sm text-muted-foreground">Table Utilization (%)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
