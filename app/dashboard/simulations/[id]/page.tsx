"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/dashboard-layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Clock,
  Users,
  Target,
  AlertTriangle,
  Loader2,
  Trash2,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useSimulation, useSimulations } from "@/lib/hooks/use-simulations";
import { toast } from "sonner";

export default function SimulationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { simulation, isLoading } = useSimulation(id);
  const { deleteSimulation } = useSimulations();

  const handleDelete = async () => {
    try {
      const deleteId = simulation?.simulation_id || id;
      await deleteSimulation(deleteId);
      toast.success("Simulation deleted successfully!");
      router.push("/dashboard/simulations");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete simulation");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!simulation) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-foreground">
            Simulation not found
          </h2>
          <Button
            variant="outline"
            className="mt-4 rounded-xl bg-transparent"
            onClick={() => router.push("/dashboard/simulations")}
          >
            Back to Simulations
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  const {
    performance_metrics,
    utilization_metrics,
    queue_metrics,
    customer_metrics,
    config,
  } = simulation;

  // Get queue length data from simulation results if available
  const queueData = (simulation as any).queue_length_stats || [];
  const waitTimeData =
    queueData.length > 0
      ? queueData.map((stat: any) => ({
          time: stat.time,
          value: stat.queue_length,
        }))
      : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Action buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Badge
              variant={
                simulation.status === "completed" ? "default" : "secondary"
              }
              className="rounded-full"
            >
              {simulation.status}
            </Badge>
            <p className="text-sm text-muted-foreground">
              {new Date(simulation.created_at).toLocaleString()}
            </p>
          </div>
          <Button
            variant="outline"
            className="gap-2 rounded-xl bg-transparent text-destructive hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </Button>
        </div>

        {/* Key metrics */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-foreground">
                    {performance_metrics?.avg_waiting_time?.toFixed(1) || "--"}{" "}
                    min
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Customers Served
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {customer_metrics?.customers_served || "--"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Table Utilization
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {/* table_utilization is already a percentage, not a decimal */}
                    {utilization_metrics?.table_utilization
                      ? utilization_metrics.table_utilization > 1
                        ? utilization_metrics.table_utilization.toFixed(1)
                        : (utilization_metrics.table_utilization * 100).toFixed(
                            1
                          )
                      : "--"}
                    %
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-xl shadow-none">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Customers Lost
                  </p>
                  <p className="text-2xl font-bold text-foreground">
                    {customer_metrics?.customers_lost || "--"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graph and Performance Metrics side by side */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Queue Length Chart */}
          {waitTimeData.length > 0 && (
            <Card className="lg:col-span-2 rounded-xl shadow-none">
              <CardHeader>
                <CardTitle className="text-base font-semibold">
                  Queue Length Over Time
                </CardTitle>
                <CardDescription>
                  Number of customers waiting in queue throughout the simulation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={waitTimeData}
                      margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient
                          id="queueGradient"
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop
                            offset="5%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0.3}
                          />
                          <stop
                            offset="95%"
                            stopColor="var(--chart-1)"
                            stopOpacity={0}
                          />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="var(--border)"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="time"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        tickFormatter={(value) => `${value} min`}
                        label={{
                          value: "Time (minutes)",
                          position: "insideBottom",
                          offset: -5,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
                        label={{
                          value: "Queue Length (customers)",
                          angle: -90,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px",
                        }}
                        formatter={(value: any) => [
                          `${value} customers`,
                          "Queue Length",
                        ]}
                        labelFormatter={(label) => `Time: ${label} min`}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="var(--chart-1)"
                        strokeWidth={2}
                        fill="url(#queueGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics - beside the graph */}
          <Card className="rounded-xl shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Avg Wait Time
                </span>
                <span className="text-sm font-medium text-foreground">
                  {performance_metrics?.avg_waiting_time?.toFixed(2) || "--"}{" "}
                  min
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Avg Service Time
                </span>
                <span className="text-sm font-medium text-foreground">
                  {performance_metrics?.avg_service_time?.toFixed(2) ||
                    (performance_metrics as any)?.avg_dining_time?.toFixed(
                      2
                    ) ||
                    "--"}{" "}
                  min
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Server Utilization
                </span>
                <span className="text-sm font-medium text-foreground">
                  {utilization_metrics?.server_utilization
                    ? utilization_metrics.server_utilization > 1
                      ? utilization_metrics.server_utilization.toFixed(1)
                      : (
                          utilization_metrics.server_utilization * 100
                        ).toFixed(1)
                    : "--"}
                  %
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Queue & Customer Metrics and Simulation Configuration below the graph */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="rounded-xl shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Queue & Customer Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Avg Queue Length
                </span>
                <span className="text-sm font-medium text-foreground">
                  {queue_metrics?.queue_length_avg
                    ? `${queue_metrics.queue_length_avg.toFixed(1)} customers`
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Max Queue Length
                </span>
                <span className="text-sm font-medium text-foreground">
                  {queue_metrics?.queue_length_max
                    ? `${queue_metrics.queue_length_max} customers`
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Customers Served
                </span>
                <span className="text-sm font-medium text-foreground">
                  {customer_metrics?.customers_served
                    ? `${customer_metrics.customers_served} customers`
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Customers Lost
                </span>
                <span className="text-sm font-medium text-destructive">
                  {customer_metrics?.customers_lost
                    ? `${customer_metrics.customers_lost} customers`
                    : "--"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-none">
            <CardHeader>
              <CardTitle className="text-base font-semibold">
                Simulation Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Number of Tables
                </span>
                <span className="text-sm font-medium text-foreground">
                  {config?.num_tables ? `${config.num_tables} tables` : "--"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Number of Servers
                </span>
                <span className="text-sm font-medium text-foreground">
                  {config?.num_servers
                    ? `${config.num_servers} servers`
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Customer Arrival Rate
                </span>
                <span className="text-sm font-medium text-foreground">
                  {config?.arrival_rate
                    ? `${config.arrival_rate} customers/hr`
                    : "--"}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-sm text-muted-foreground">
                  Simulation Duration
                </span>
                <span className="text-sm font-medium text-foreground">
                  {config?.duration ? `${config.duration} minutes` : "--"}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-sm text-muted-foreground">
                  Queue Strategy
                </span>
                <Badge variant="secondary" className="rounded-full text-xs">
                  {config?.queue_strategy || "FCFS"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
