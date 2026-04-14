"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Building2, MapPin, Play, Clock, Users, BarChart3, Loader2 } from "lucide-react"
import { useRestaurant } from "@/lib/hooks/use-restaurants"
import { useSimulations } from "@/lib/hooks/use-simulations"

export default function RestaurantDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const { restaurant, isLoading } = useRestaurant(Number(id))
  const { simulations } = useSimulations()

  // Filter simulations for this restaurant (based on restaurant_id in config if available)
  const restaurantSimulations = simulations.filter((sim) => sim.config?.restaurant_id === Number(id))

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    )
  }

  if (!restaurant) {
    return (
      <DashboardLayout>
        <div className="text-center py-16">
          <h2 className="text-xl font-semibold text-foreground">Restaurant not found</h2>
          <Button
            variant="outline"
            className="mt-4 rounded-xl bg-transparent"
            onClick={() => router.push("/dashboard/restaurants")}
          >
            Back to Restaurants
          </Button>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Back button and header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="rounded-xl"
              onClick={() => router.push("/dashboard/restaurants")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">{restaurant.name}</h1>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>
                    {restaurant.address || restaurant.location}, {restaurant.city}, {restaurant.country}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <Button
            className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
            onClick={() => router.push(`/dashboard/simulations/new?restaurant=${id}`)}
          >
            <Play className="w-4 h-4" />
            Run Simulation
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Simulations</p>
                  <p className="text-2xl font-bold text-foreground">{restaurantSimulations.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg Wait Time</p>
                  <p className="text-2xl font-bold text-foreground">-- min</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-chart-3/10 flex items-center justify-center">
                  <Users className="w-5 h-5 text-chart-3" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Customers Served</p>
                  <p className="text-2xl font-bold text-foreground">--</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="rounded-2xl">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-chart-4/10 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-chart-4" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Table Utilization</p>
                  <p className="text-2xl font-bold text-foreground">--%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Simulations list */}
        <Card className="rounded-2xl">
          <CardHeader>
            <CardTitle>Simulation History</CardTitle>
            <CardDescription>All simulations run for this restaurant</CardDescription>
          </CardHeader>
          <CardContent>
            {restaurantSimulations.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">No simulations yet for this restaurant</p>
                <Button
                  className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  onClick={() => router.push(`/dashboard/simulations/new?restaurant=${id}`)}
                >
                  <Play className="w-4 h-4" />
                  Run First Simulation
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {restaurantSimulations.map((sim) => (
                  <div
                    key={sim.id}
                    className="flex items-center justify-between p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
                    onClick={() => router.push(`/dashboard/simulations/${sim.id}`)}
                  >
                    <div className="flex items-center gap-4">
                      <Badge
                        variant={sim.status === "completed" ? "default" : "secondary"}
                        className={`rounded-full ${sim.status === "completed" ? "bg-accent text-accent-foreground" : ""}`}
                      >
                        {sim.status}
                      </Badge>
                      <div>
                        <p className="font-medium text-foreground">
                          Simulation #{sim.simulation_id?.slice(-6) || sim.id}
                        </p>
                        <p className="text-sm text-muted-foreground">{new Date(sim.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-foreground">
                        {sim.performance_metrics?.avg_waiting_time?.toFixed(1) || "--"} min
                      </p>
                      <p className="text-sm text-muted-foreground">Avg Wait</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
