"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Play,
  Settings2,
  Clock,
  Users,
  ChevronRight,
  Loader2,
  CheckCircle2,
  XCircle,
  LogIn,
  Info,
} from "lucide-react";
import { useRestaurants } from "@/lib/hooks/use-restaurants";
import { useSimulations } from "@/lib/hooks/use-simulations";
import { authService } from "@/lib/services/auth-service";
import { toast } from "sonner";

export function SimulationsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedRestaurant = searchParams.get("restaurant");

  const { restaurants } = useRestaurants();
  const { simulations, runSimulation } = useSimulations();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(
    preselectedRestaurant || ""
  );
  const [guestResult, setGuestResult] = useState<any>(null);

  useEffect(() => {
    setIsAuthenticated(authService.isAuthenticated());
  }, []);
  const [numTables, setNumTables] = useState([20]);
  const [numServers, setNumServers] = useState([4]);
  const [arrivalRate, setArrivalRate] = useState([25]);
  const [duration, setDuration] = useState([480]);
  const [renegThreshold, setRenegThreshold] = useState([15]);
  const [queueStrategy, setQueueStrategy] = useState("fcfs");
  const [partySizeDistribution, setPartySizeDistribution] = useState({
    "1": 0.05,
    "2": 0.4,
    "3": 0.1,
    "4": 0.3,
    "5": 0.08,
    "6": 0.04,
    "7": 0.02,
    "8": 0.01,
  });

  const handleRunSimulation = async () => {
    // For authenticated users, require restaurant selection
    if (isAuthenticated && !selectedRestaurant) {
      toast.error("Please select a restaurant first");
      return;
    }

    setIsRunning(true);

    try {
      if (isAuthenticated && selectedRestaurant) {
        // Authenticated user - save to backend
        const result = await runSimulation({
          restaurant_id: Number(selectedRestaurant),
          num_tables: numTables[0],
          num_servers: numServers[0],
          arrival_rate: arrivalRate[0],
          duration: duration[0],
          reneg_threshold: renegThreshold[0],
          warmup_period: 60,
          queue_strategy: queueStrategy as
            | "fcfs"
            | "priority_large"
            | "priority_small"
            | "dynamic",
          party_size_distribution: partySizeDistribution,
          service_time_params: {
            mean_by_party_size: {
              "1-2": 45,
              "3-4": 60,
              "5-6": 75,
              "7+": 90,
            },
            std_dev: 10,
            distribution_type: "normal",
          },
        });

        toast.success("Simulation completed and saved!");
        router.push(`/dashboard/simulations/${result.id}`);
      } else {
        // Guest mode - run simulation without saving
        const simulationService = (
          await import("@/lib/services/simulation-service")
        ).simulationService;
        const result = await simulationService.runGuestSimulation({
          num_tables: numTables[0],
          num_servers: numServers[0],
          arrival_rate: arrivalRate[0],
          duration: duration[0],
          reneg_threshold: renegThreshold[0],
          warmup_period: 60,
          queue_strategy: queueStrategy as
            | "fcfs"
            | "priority_large"
            | "priority_small"
            | "dynamic",
          party_size_distribution: partySizeDistribution,
          service_time_params: {
            mean_by_party_size: {
              "1-2": 45,
              "3-4": 60,
              "5-6": 75,
              "7+": 90,
            },
            std_dev: 10,
            distribution_type: "normal",
          },
        });

        setGuestResult(result);
        toast.success("Simulation completed! Login to save results.");
      }
    } catch (error: any) {
      toast.error(error.message || "Simulation failed. Please try again.");
    } finally {
      setIsRunning(false);
    }
  };

  const recentRuns = simulations.slice(0, 3).map((sim) => ({
    name: `Run #${sim.simulation_id?.slice(-6) || sim.id}`,
    status: sim.status,
    time: new Date(sim.created_at).toLocaleString(),
    id: sim.id,
  }));

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Run Simulation</h1>
        <p className="text-muted-foreground">
          Configure and run queue optimization simulations
        </p>
      </div>

      {/* Guest mode alert */}
      {!isAuthenticated && (
        <Alert className="rounded-xl border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertTitle>Guest Mode</AlertTitle>
          <AlertDescription className="flex items-center justify-between">
            <span>You're running in guest mode. Results won't be saved.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/login")}
              className="ml-4 gap-2"
            >
              <LogIn className="w-4 h-4" />
              Login to Save
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Configuration panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Settings2 className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">
                  Simulation Configuration
                </CardTitle>
              </div>
              <CardDescription>
                Set up your restaurant parameters
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              {/* Restaurant selection - only for authenticated users */}
              {isAuthenticated && (
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Restaurant</Label>
                  <Select
                    value={selectedRestaurant}
                    onValueChange={setSelectedRestaurant}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Select restaurant" />
                    </SelectTrigger>
                    <SelectContent>
                      {restaurants.map((r) => (
                        <SelectItem key={r.id} value={r.id.toString()}>
                          {r.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {restaurants.length === 0 && (
                    <p className="text-sm text-muted-foreground">
                      No restaurants yet.{" "}
                      <button
                        className="text-primary hover:underline"
                        onClick={() => router.push("/dashboard/restaurants")}
                      >
                        Create one first
                      </button>
                    </p>
                  )}
                </div>
              )}

              {/* Resource configuration */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Number of Tables
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {numTables[0]}
                    </span>
                  </div>
                  <Slider
                    value={numTables}
                    onValueChange={setNumTables}
                    min={5}
                    max={50}
                    step={1}
                    className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Available seating capacity
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Number of Servers
                    </Label>
                    <span className="text-sm font-semibold text-primary">
                      {numServers[0]}
                    </span>
                  </div>
                  <Slider
                    value={numServers}
                    onValueChange={setNumServers}
                    min={1}
                    max={15}
                    step={1}
                    className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary"
                  />
                  <p className="text-xs text-muted-foreground">Staff on duty</p>
                </div>
              </div>

              {/* Arrival and duration */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Arrival Rate</Label>
                    <span className="text-sm font-semibold text-primary">
                      {arrivalRate[0]}/hr
                    </span>
                  </div>
                  <Slider
                    value={arrivalRate}
                    onValueChange={setArrivalRate}
                    min={5}
                    max={100}
                    step={1}
                    className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Expected customers per hour
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">Duration</Label>
                    <span className="text-sm font-semibold text-primary">
                      {duration[0]} min
                    </span>
                  </div>
                  <Slider
                    value={duration}
                    onValueChange={setDuration}
                    min={60}
                    max={720}
                    step={30}
                    className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary"
                  />
                  <p className="text-xs text-muted-foreground">
                    Simulation time period
                  </p>
                </div>
              </div>

              {/* Queue strategy */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Queue Strategy</Label>
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {[
                    {
                      value: "fcfs",
                      label: "FCFS",
                      desc: "First Come First Serve",
                    },
                    {
                      value: "priority_small",
                      label: "Small First",
                      desc: "Smaller parties first",
                    },
                    {
                      value: "priority_large",
                      label: "Large First",
                      desc: "Larger parties first",
                    },
                    {
                      value: "dynamic",
                      label: "Dynamic",
                      desc: "Adaptive strategy",
                    },
                  ].map((strategy) => (
                    <button
                      key={strategy.value}
                      type="button"
                      className="p-4 rounded-xl border-2 border-border hover:border-primary/50 transition-colors text-left group data-[active=true]:border-primary data-[active=true]:bg-primary/5"
                      data-active={strategy.value === queueStrategy}
                      onClick={() => setQueueStrategy(strategy.value)}
                    >
                      <p className="text-sm font-medium text-foreground group-data-[active=true]:text-primary">
                        {strategy.label}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {strategy.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Reneg threshold */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Customer Patience (Reneg Threshold)
                  </Label>
                  <span className="text-sm font-semibold text-primary">
                    {renegThreshold[0]} min
                  </span>
                </div>
                <Slider
                  value={renegThreshold}
                  onValueChange={setRenegThreshold}
                  min={5}
                  max={45}
                  step={1}
                  className="[&>span:first-child]:bg-primary/20 [&_[role=slider]]:bg-primary"
                />
                <p className="text-xs text-muted-foreground">
                  Maximum wait time before customers leave
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Party size distribution */}
          <Card className="rounded-2xl border-border">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <CardTitle className="text-lg">
                  Party Size Distribution
                </CardTitle>
              </div>
              <CardDescription>Configure expected party sizes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-4">
                {Object.entries(partySizeDistribution).map(([size, pct]) => (
                  <div key={size} className="text-center">
                    <div className="relative h-24 mb-2 flex items-end justify-center">
                      <div
                        className="w-full max-w-8 bg-primary/20 rounded-t-lg"
                        style={{ height: `${Math.round(pct * 100) * 2}%` }}
                      >
                        <div
                          className="w-full bg-primary rounded-t-lg transition-all"
                          style={{ height: "100%" }}
                        />
                      </div>
                    </div>
                    <p className="text-xs font-medium text-foreground">
                      {size}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {Math.round(pct * 100)}%
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Run panel */}
        <div className="space-y-6">
          <Card className="rounded-2xl border-border sticky top-24">
            <CardHeader>
              <CardTitle className="text-lg">Run Simulation</CardTitle>
              <CardDescription>
                Execute with current configuration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Summary */}
              <div className="space-y-3">
                {isAuthenticated && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">
                      Restaurant
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {restaurants.find(
                        (r) => r.id.toString() === selectedRestaurant
                      )?.name || "Not selected"}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Tables</span>
                  <span className="text-sm font-medium text-foreground">
                    {numTables[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Servers</span>
                  <span className="text-sm font-medium text-foreground">
                    {numServers[0]}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Arrival Rate
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {arrivalRate[0]}/hr
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">
                    Duration
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {duration[0]} min
                  </span>
                </div>
                <div className="flex items-center justify-between py-2">
                  <span className="text-sm text-muted-foreground">
                    Strategy
                  </span>
                  <Badge variant="secondary" className="rounded-full uppercase">
                    {queueStrategy}
                  </Badge>
                </div>
              </div>

              <Button
                className="w-full rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground gap-2 h-12"
                onClick={handleRunSimulation}
                disabled={isRunning || (isAuthenticated && !selectedRestaurant)}
              >
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Run Simulation
                  </>
                )}
              </Button>

              {/* Estimated time */}
              <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Estimated time: ~30 seconds</span>
              </div>

              {/* Guest result display */}
              {!isAuthenticated && guestResult && (
                <div className="mt-4 p-4 rounded-xl bg-secondary/50 border border-border">
                  <p className="text-sm font-medium mb-2">
                    Simulation Results (Not Saved)
                  </p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <p>
                      Avg Wait Time:{" "}
                      {guestResult.performance_metrics?.avg_waiting_time?.toFixed(
                        2
                      )}{" "}
                      min
                    </p>
                    <p>
                      Throughput:{" "}
                      {guestResult.performance_metrics?.throughput?.toFixed(2)}{" "}
                      customers/hr
                    </p>
                    <p>
                      Table Utilization:{" "}
                      {(
                        guestResult.utilization_metrics?.table_utilization * 100
                      )?.toFixed(1)}
                      %
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full mt-3 gap-2"
                    onClick={() => router.push("/login")}
                  >
                    <LogIn className="w-4 h-4" />
                    Login to Save This Result
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent runs */}
          <Card className="rounded-2xl border-border">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Recent Runs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {recentRuns.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No simulations yet
                </p>
              ) : (
                recentRuns.map((run, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() =>
                      router.push(`/dashboard/simulations/${run.id}`)
                    }
                  >
                    <div className="flex items-center gap-2">
                      {run.status === "completed" ? (
                        <CheckCircle2 className="w-4 h-4 text-accent" />
                      ) : run.status === "running" ? (
                        <Loader2 className="w-4 h-4 text-primary animate-spin" />
                      ) : (
                        <XCircle className="w-4 h-4 text-destructive" />
                      )}
                      <span className="text-sm font-medium text-foreground">
                        {run.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {run.time}
                      </span>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
