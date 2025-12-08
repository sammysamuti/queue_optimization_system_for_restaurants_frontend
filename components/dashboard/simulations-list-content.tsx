"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Play, MoreHorizontal, Eye, Trash2, Loader2, BarChart3 } from "lucide-react"
import { useSimulations } from "@/lib/hooks/use-simulations"
import { toast } from "sonner"

export function SimulationsListContent() {
  const router = useRouter()
  const { simulations, isLoading, deleteSimulation } = useSimulations()

  const handleDelete = async (id: string) => {
    try {
      await deleteSimulation(id)
      toast.success("Simulation deleted successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to delete simulation")
    }
  }

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
          <h1 className="text-2xl font-bold text-foreground">Simulations</h1>
          <p className="text-muted-foreground">View and manage all your simulation runs</p>
        </div>
        <Button
          className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
          onClick={() => router.push("/dashboard/simulations/new")}
        >
          <Play className="w-4 h-4" />
          New Simulation
        </Button>
      </div>

      {/* Empty state */}
      {simulations.length === 0 && (
        <Card className="rounded-2xl border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No simulations yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Run your first queue optimization simulation to see results here.
            </p>
            <Button
              className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => router.push("/dashboard/simulations/new")}
            >
              <Play className="w-4 h-4" />
              Run First Simulation
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Simulations table */}
      {simulations.length > 0 && (
        <Card className="rounded-2xl border-border overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base font-semibold">All Simulations</CardTitle>
            <CardDescription>{simulations.length} total simulation(s)</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[200px]">Simulation ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Avg Wait Time</TableHead>
                  <TableHead>Customers</TableHead>
                  <TableHead>Utilization</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {simulations.map((sim) => (
                  <TableRow
                    key={sim.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/dashboard/simulations/${sim.id}`)}
                  >
                    <TableCell className="font-medium">#{sim.simulation_id?.slice(-8) || sim.id}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          sim.status === "completed"
                            ? "default"
                            : sim.status === "running"
                              ? "secondary"
                              : "destructive"
                        }
                        className={`rounded-full ${sim.status === "completed" ? "bg-accent text-accent-foreground" : ""}`}
                      >
                        {sim.status === "running" && <Loader2 className="w-3 h-3 mr-1 animate-spin" />}
                        {sim.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{sim.performance_metrics?.avg_waiting_time?.toFixed(1) || "--"} min</TableCell>
                    <TableCell>{sim.customer_metrics?.customers_served || "--"} served</TableCell>
                    <TableCell>
                      {sim.utilization_metrics?.table_utilization
                        ? `${Math.round(sim.utilization_metrics.table_utilization * 100)}%`
                        : "--"}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(sim.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <DropdownMenuItem
                            onClick={(e) => {
                              e.stopPropagation()
                              router.push(`/dashboard/simulations/${sim.id}`)
                            }}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(sim.id)
                            }}
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
