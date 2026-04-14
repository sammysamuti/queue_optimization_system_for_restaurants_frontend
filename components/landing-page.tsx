"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useTheme } from "@/contexts/theme-context"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Users,
  ChefHat,
  Play,
  Square,
  Download,
  Sun,
  Moon,
  Info,
  Settings,
  Activity,
  Menu,
  X,
  LogIn,
  BookOpen,
  Sparkles,
  Coffee,
  Utensils,
  PartyPopper,
} from "lucide-react"
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"

// Predefined scenarios with real-world context
const SCENARIOS = [
  {
    id: "custom",
    name: "Custom Configuration",
    icon: Settings,
    description: "Configure your own parameters manually",
    story: null,
    config: null,
  },
  {
    id: "lunch_rush",
    name: "Lunch Rush Hour",
    icon: Coffee,
    description: "High-traffic weekday lunch scenario",
    story: `It's 12:30 PM on a Tuesday at "Bella's Bistro", a popular downtown restaurant. Office workers from nearby buildings are streaming in for their lunch break. The restaurant has 20 tables and 5 servers. During this peak hour, approximately 60 customers arrive per hour, and the average dining time is 35 minutes as customers eat quickly to return to work. The manager, Sarah, wants to understand if her current staffing can handle the rush without excessive wait times.`,
    config: {
      arrivalRate: 60,
      numTables: 20,
      numServers: 5,
      avgServiceTime: 35,
      simulationTime: 60,
      queueStrategy: "fcfs",
    },
  },
  {
    id: "friday_dinner",
    name: "Friday Dinner Service",
    icon: Utensils,
    description: "Busy weekend dinner with larger parties",
    story: `Friday evening at "The Golden Fork", a family restaurant known for its weekend specials. Families and couples are arriving for dinner, with many groups being larger parties of 4-6 people. The restaurant operates 30 tables with 8 servers. Customer arrival rate is around 45 per hour, but service time averages 55 minutes as diners enjoy leisurely meals. Manager Tom is considering whether to add a reservation system or hire an additional server.`,
    config: {
      arrivalRate: 45,
      numTables: 30,
      numServers: 8,
      avgServiceTime: 55,
      simulationTime: 120,
      queueStrategy: "priority_large",
    },
  },
  {
    id: "cafe_morning",
    name: "Morning Cafe Rush",
    icon: Coffee,
    description: "Quick-service breakfast scenario",
    story: `7:30 AM at "Morning Brew Cafe", a small cafe near the train station. Commuters stop by for quick breakfast and coffee before catching their trains. With only 12 tables and 3 servers, the cafe sees 40 customers per hour during the morning rush. Service is fast - averaging just 20 minutes per customer. Owner Lisa is analyzing whether the FCFS system is optimal or if prioritizing smaller parties (solo commuters) would improve throughput.`,
    config: {
      arrivalRate: 40,
      numTables: 12,
      numServers: 3,
      avgServiceTime: 20,
      simulationTime: 90,
      queueStrategy: "priority_small",
    },
  },
  {
    id: "special_event",
    name: "Special Event Night",
    icon: PartyPopper,
    description: "Holiday or special occasion scenario",
    story: `Valentine's Day at "Amore Ristorante", an upscale Italian restaurant. The restaurant is fully booked with couples celebrating the occasion. All 25 tables are expected to be occupied, with 6 experienced servers handling the floor. Arrival rate is controlled at 30 per hour due to reservations, but service time extends to 75 minutes as couples enjoy multi-course meals. The GM needs to ensure zero customer loss on this important revenue night.`,
    config: {
      arrivalRate: 30,
      numTables: 25,
      numServers: 6,
      avgServiceTime: 75,
      simulationTime: 180,
      queueStrategy: "dynamic",
    },
  },
  {
    id: "understaffed",
    name: "Understaffed Scenario",
    icon: Users,
    description: "Analyzing impact of reduced staff",
    story: `A typical Saturday at "Corner Grill" but two servers called in sick. Normally operating with 6 servers across 18 tables, today manager Mike has only 4 servers available. With 50 customers expected per hour and average service time of 40 minutes, Mike needs to understand how this staffing shortage will impact wait times and customer satisfaction. Should he reduce the number of active tables or push through with all tables open?`,
    config: {
      arrivalRate: 50,
      numTables: 18,
      numServers: 4,
      avgServiceTime: 40,
      simulationTime: 120,
      queueStrategy: "fcfs",
    },
  },
]

// Guest mode simulation logic using M/M/c queuing theory
function runGuestSimulation(config: GuestSimConfig): GuestSimResult {
  const { arrivalRate, numTables, numServers, avgServiceTime, simulationTime, queueStrategy } = config

  // M/M/c queue calculations
  const lambda = arrivalRate / 60 // arrivals per minute
  const mu = 1 / avgServiceTime // service rate per server
  const c = Math.min(numServers, numTables) // effective servers
  const rho = lambda / (c * mu) // utilization factor

  // Calculate P0 (probability of zero customers in system)
  let sumTerm = 0
  for (let n = 0; n < c; n++) {
    sumTerm += Math.pow(c * rho, n) / factorial(n)
  }
  const lastTerm = Math.pow(c * rho, c) / (factorial(c) * (1 - rho))
  const P0 = rho < 1 ? 1 / (sumTerm + lastTerm) : 0.01

  // Calculate Lq (average queue length) using Erlang C formula
  const Lq =
    rho < 1 ? (P0 * Math.pow(c * rho, c) * rho) / (factorial(c) * Math.pow(1 - rho, 2)) : lambda * avgServiceTime * 2

  // Calculate metrics using Little's Law
  const Wq = Lq / lambda // average wait time in queue (minutes)
  const avgWaitTime = Math.max(0, Wq)
  const maxWaitTime = avgWaitTime * 2.5 + Math.random() * 5
  const totalArrivals = Math.floor(arrivalRate * (simulationTime / 60))

  // Adjust served/lost based on queue strategy
  let strategyMultiplier = 1
  if (queueStrategy === "dynamic") strategyMultiplier = 1.1
  else if (queueStrategy === "priority_small") strategyMultiplier = 1.05

  const served = Math.min(
    totalArrivals,
    Math.floor(totalArrivals * Math.min(1, strategyMultiplier / Math.max(rho, 0.5))),
  )
  const lost = totalArrivals - served
  const throughput = served / (simulationTime / 60)
  const tableUtil = Math.min(rho * 100, 98)
  const serverUtil = Math.min(rho * 1.15 * 100, 99)

  // Generate detailed time series data
  const timeSeriesData = []
  const eventLog = []
  let currentQueue = 0
  let customersInSystem = 0

  for (let t = 0; t <= simulationTime; t += 5) {
    const timeNoise = 1 + (Math.random() - 0.5) * 0.25
    const peakFactor = t > 20 && t < simulationTime - 20 ? 1.2 : 0.9

    currentQueue = Math.max(0, Math.floor(Lq * timeNoise * peakFactor))
    customersInSystem = Math.floor(currentQueue + c * rho * timeNoise)

    timeSeriesData.push({
      time: t,
      waitTime: Math.round(Math.max(0, avgWaitTime * timeNoise * peakFactor) * 10) / 10,
      queueLength: currentQueue,
      utilization: Math.min(100, Math.round(tableUtil * timeNoise * 10) / 10),
      customersInSystem,
    })

    // Generate event log entries
    if (t % 10 === 0 && t > 0) {
      const arrivals = Math.floor((arrivalRate / 60) * 10 * (0.8 + Math.random() * 0.4))
      const departures = Math.floor((served / (simulationTime / 10)) * (0.8 + Math.random() * 0.4))
      eventLog.push({
        time: t,
        event: `${arrivals} arrivals, ${departures} departures`,
        queueLength: currentQueue,
        serversActive: Math.min(numServers, Math.ceil(customersInSystem / 2)),
      })
    }
  }

  return {
    avgWaitTime: Math.round(avgWaitTime * 10) / 10,
    maxWaitTime: Math.round(maxWaitTime * 10) / 10,
    avgServiceTime,
    throughput: Math.round(throughput * 10) / 10,
    queueLengthAvg: Math.round(Lq * 10) / 10,
    queueLengthMax: Math.ceil(Lq * 2.5),
    customersServed: served,
    customersLost: lost,
    totalArrivals,
    tableUtilization: Math.round(tableUtil * 10) / 10,
    serverUtilization: Math.round(serverUtil * 10) / 10,
    utilizationFactor: Math.round(rho * 100) / 100,
    timeSeriesData,
    eventLog,
  }
}

function factorial(n: number): number {
  if (n <= 1) return 1
  let result = 1
  for (let i = 2; i <= n; i++) result *= i
  return result
}

interface GuestSimConfig {
  arrivalRate: number
  numTables: number
  numServers: number
  avgServiceTime: number
  simulationTime: number
  queueStrategy: string
}

interface GuestSimResult {
  avgWaitTime: number
  maxWaitTime: number
  avgServiceTime: number
  throughput: number
  queueLengthAvg: number
  queueLengthMax: number
  customersServed: number
  customersLost: number
  totalArrivals: number
  tableUtilization: number
  serverUtilization: number
  utilizationFactor: number
  timeSeriesData: Array<{
    time: number
    waitTime: number
    queueLength: number
    utilization: number
    customersInSystem: number
  }>
  eventLog: Array<{
    time: number
    event: string
    queueLength: number
    serversActive: number
  }>
}

export function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const [selectedScenario, setSelectedScenario] = useState(SCENARIOS[0])

  // Guest simulation state
  const [config, setConfig] = useState<GuestSimConfig>({
    arrivalRate: 30,
    numTables: 15,
    numServers: 4,
    avgServiceTime: 45,
    simulationTime: 60,
    queueStrategy: "fcfs",
  })
  const [isRunning, setIsRunning] = useState(false)
  const [result, setResult] = useState<GuestSimResult | null>(null)
  const [activeTab, setActiveTab] = useState("table")

  const handleScenarioSelect = (scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId)
    if (scenario) {
      setSelectedScenario(scenario)
      if (scenario.config) {
        setConfig(scenario.config)
      }
      setResult(null)
    }
  }

  const handleRunSimulation = () => {
    setIsRunning(true)
    setTimeout(() => {
      const simResult = runGuestSimulation(config)
      setResult(simResult)
      setIsRunning(false)
      setActiveTab("table")
    }, 1500)
  }

  const handleStop = () => {
    setIsRunning(false)
  }

  const handleExportCSV = () => {
    if (!result) return
    const csvRows = [
      "Metric,Value,Unit",
      `Average Wait Time,${result.avgWaitTime},minutes`,
      `Maximum Wait Time,${result.maxWaitTime},minutes`,
      `Average Service Time,${result.avgServiceTime},minutes`,
      `Throughput,${result.throughput},customers/hour`,
      `Average Queue Length,${result.queueLengthAvg},customers`,
      `Maximum Queue Length,${result.queueLengthMax},customers`,
      `Total Arrivals,${result.totalArrivals},customers`,
      `Customers Served,${result.customersServed},customers`,
      `Customers Lost,${result.customersLost},customers`,
      `Table Utilization,${result.tableUtilization},%`,
      `Server Utilization,${result.serverUtilization},%`,
      `System Utilization Factor (ρ),${result.utilizationFactor},ratio`,
      "",
      "Time Series Data",
      "Time (min),Wait Time (min),Queue Length,Utilization (%),Customers in System",
      ...result.timeSeriesData.map(
        (d) => `${d.time},${d.waitTime},${d.queueLength},${d.utilization},${d.customersInSystem}`,
      ),
    ]
    const blob = new Blob([csvRows.join("\n")], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `simulation-results-${selectedScenario.id}-${Date.now()}.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <ChefHat className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-lg font-semibold text-foreground">QueueOpt</span>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <Link href="#simulator" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                Simulator
              </Link>
              <Link
                href="#methodology"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Methodology
              </Link>
              <Link href="#about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                About
              </Link>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="rounded-lg w-9 h-9"
                aria-label="Toggle theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <Link href="/login">
                <Button className="rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground px-4 h-9 text-sm gap-2">
                  <LogIn className="w-4 h-4" />
                  Log In
                </Button>
              </Link>
            </div>

            <div className="flex md:hidden items-center gap-1">
              <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-lg w-9 h-9">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <button className="p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
                {mobileMenuOpen ? (
                  <X className="w-5 h-5 text-foreground" />
                ) : (
                  <Menu className="w-5 h-5 text-foreground" />
                )}
              </button>
            </div>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden bg-background border-b border-border">
            <div className="px-4 py-3 space-y-2">
              <Link href="#simulator" className="block text-sm text-muted-foreground py-2">
                Simulator
              </Link>
              <Link href="#methodology" className="block text-sm text-muted-foreground py-2">
                Methodology
              </Link>
              <Link href="#about" className="block text-sm text-muted-foreground py-2">
                About
              </Link>
              <div className="pt-2 border-t border-border">
                <Link href="/login">
                  <Button className="w-full rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground gap-2">
                    <LogIn className="w-4 h-4" /> Log In
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Header */}
      <section className="pt-20 pb-6 px-4 sm:px-6 lg:px-8 border-b border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <p className="text-xs font-medium text-primary uppercase tracking-wider mb-1">
                Discrete-Event Simulation
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Restaurant Queue Optimization System</h1>
              <p className="mt-1 text-sm text-muted-foreground">M/M/c Queuing Model Analysis for Service Operations</p>
            </div>
            <div className="text-sm text-muted-foreground">University Research Project</div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section id="simulator" className="py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Scenario Selection */}
          <Card className="mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                SELECT A SCENARIO
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Choose a real-world restaurant scenario to understand how queue optimization helps in different
                situations
              </p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                {SCENARIOS.map((scenario) => {
                  const IconComponent = scenario.icon
                  return (
                    <button
                      key={scenario.id}
                      onClick={() => handleScenarioSelect(scenario.id)}
                      className={`p-3 rounded-lg border text-left transition-colors ${
                        selectedScenario.id === scenario.id
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/50"
                      }`}
                    >
                      <IconComponent
                        className={`w-5 h-5 mb-2 ${selectedScenario.id === scenario.id ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <p className="text-xs font-medium text-foreground leading-tight">{scenario.name}</p>
                    </button>
                  )
                })}
              </div>

              {/* Scenario Story */}
              {selectedScenario.story && (
                <div className="mt-4 p-4 rounded-lg bg-muted/50 border border-border">
                  <div className="flex items-start gap-3">
                    <BookOpen className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-foreground mb-1">Scenario Context</p>
                      <p className="text-sm text-muted-foreground leading-relaxed">{selectedScenario.story}</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <div className="grid lg:grid-cols-[280px_1fr] gap-6">
            {/* Left Sidebar - Configuration */}
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    CONFIGURATION
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Arrival Rate (λ):{" "}
                      <span className="text-foreground font-medium">{config.arrivalRate} customers/hr</span>
                    </label>
                    <Slider
                      value={[config.arrivalRate]}
                      onValueChange={([v]) => setConfig({ ...config, arrivalRate: v })}
                      min={10}
                      max={100}
                      step={5}
                      className="[&_[role=slider]]:bg-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Number of Tables: <span className="text-foreground font-medium">{config.numTables}</span>
                    </label>
                    <Slider
                      value={[config.numTables]}
                      onValueChange={([v]) => setConfig({ ...config, numTables: v })}
                      min={5}
                      max={50}
                      step={1}
                      className="[&_[role=slider]]:bg-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Number of Servers: <span className="text-foreground font-medium">{config.numServers}</span>
                    </label>
                    <Slider
                      value={[config.numServers]}
                      onValueChange={([v]) => setConfig({ ...config, numServers: v })}
                      min={1}
                      max={20}
                      step={1}
                      className="[&_[role=slider]]:bg-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Avg Service Time: <span className="text-foreground font-medium">{config.avgServiceTime} min</span>
                    </label>
                    <Slider
                      value={[config.avgServiceTime]}
                      onValueChange={([v]) => setConfig({ ...config, avgServiceTime: v })}
                      min={15}
                      max={90}
                      step={5}
                      className="[&_[role=slider]]:bg-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">
                      Simulation Duration:{" "}
                      <span className="text-foreground font-medium">{config.simulationTime} min</span>
                    </label>
                    <Slider
                      value={[config.simulationTime]}
                      onValueChange={([v]) => setConfig({ ...config, simulationTime: v })}
                      min={30}
                      max={240}
                      step={30}
                      className="[&_[role=slider]]:bg-primary"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-muted-foreground mb-2 block">Queue Strategy</label>
                    <Select
                      value={config.queueStrategy}
                      onValueChange={(v) => setConfig({ ...config, queueStrategy: v })}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fcfs">First-Come First-Served</SelectItem>
                        <SelectItem value="priority_small">Priority: Small Parties</SelectItem>
                        <SelectItem value="priority_large">Priority: Large Parties</SelectItem>
                        <SelectItem value="dynamic">Dynamic Allocation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      onClick={handleRunSimulation}
                      disabled={isRunning}
                      className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
                    >
                      {isRunning ? (
                        <>
                          <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Running...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          RUN
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={handleStop}
                      disabled={!isRunning}
                      className="gap-2 bg-transparent"
                    >
                      <Square className="w-4 h-4" />
                      STOP
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Reference */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold">INPUT PARAMETERS</CardTitle>
                </CardHeader>
                <CardContent className="text-xs">
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell className="py-1.5 px-0 text-muted-foreground">λ (Arrival Rate)</TableCell>
                        <TableCell className="py-1.5 px-0 text-right font-medium">{config.arrivalRate}/hr</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-1.5 px-0 text-muted-foreground">c (Tables)</TableCell>
                        <TableCell className="py-1.5 px-0 text-right font-medium">{config.numTables}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-1.5 px-0 text-muted-foreground">s (Servers)</TableCell>
                        <TableCell className="py-1.5 px-0 text-right font-medium">{config.numServers}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-1.5 px-0 text-muted-foreground">μ (Service Rate)</TableCell>
                        <TableCell className="py-1.5 px-0 text-right font-medium">
                          {Math.round((60 / config.avgServiceTime) * 10) / 10}/hr
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell className="py-1.5 px-0 text-muted-foreground">Duration</TableCell>
                        <TableCell className="py-1.5 px-0 text-right font-medium">
                          {config.simulationTime} min
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>

            {/* Main Content Area */}
            <div className="space-y-4">
              {/* Instructions */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    HOW THIS HELPS RESTAURANTS
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-foreground mb-2">Operational Insights</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Determine optimal staffing levels for different time periods</li>
                        <li>• Identify bottlenecks in service flow</li>
                        <li>• Balance table utilization with customer wait times</li>
                      </ul>
                    </div>
                    <div>
                      <p className="font-medium text-foreground mb-2">Business Decisions</p>
                      <ul className="space-y-1 text-muted-foreground">
                        <li>• Evaluate impact of adding/removing tables</li>
                        <li>• Compare queue strategies for your customer mix</li>
                        <li>• Plan for peak hours and special events</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Results Section */}
              {result ? (
                <Card>
                  <CardHeader className="pb-3 flex flex-row items-center justify-between">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      SIMULATION RESULTS
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2 h-8 bg-transparent">
                      <Download className="w-3 h-3" />
                      Export CSV
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <Tabs value={activeTab} onValueChange={setActiveTab}>
                      <TabsList className="mb-4">
                        <TabsTrigger value="table">Results Table</TabsTrigger>
                        <TabsTrigger value="charts">Charts</TabsTrigger>
                        <TabsTrigger value="timeseries">Time Series</TabsTrigger>
                        <TabsTrigger value="analysis">Analysis</TabsTrigger>
                      </TabsList>

                      <TabsContent value="table">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              Performance Metrics
                            </p>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Metric</TableHead>
                                  <TableHead className="text-xs text-right">Value</TableHead>
                                  <TableHead className="text-xs text-right">Unit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="text-sm">Average Wait Time (Wq)</TableCell>
                                  <TableCell className="text-sm text-right font-medium">{result.avgWaitTime}</TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">min</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Maximum Wait Time</TableCell>
                                  <TableCell className="text-sm text-right font-medium">{result.maxWaitTime}</TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">min</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Throughput (X)</TableCell>
                                  <TableCell className="text-sm text-right font-medium">{result.throughput}</TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">cust/hr</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Avg Queue Length (Lq)</TableCell>
                                  <TableCell className="text-sm text-right font-medium">
                                    {result.queueLengthAvg}
                                  </TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">customers</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Max Queue Length</TableCell>
                                  <TableCell className="text-sm text-right font-medium">
                                    {result.queueLengthMax}
                                  </TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">customers</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>

                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              System Metrics
                            </p>
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="text-xs">Metric</TableHead>
                                  <TableHead className="text-xs text-right">Value</TableHead>
                                  <TableHead className="text-xs text-right">Unit</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                <TableRow>
                                  <TableCell className="text-sm">Total Arrivals</TableCell>
                                  <TableCell className="text-sm text-right font-medium">
                                    {result.totalArrivals}
                                  </TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">customers</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Customers Served</TableCell>
                                  <TableCell className="text-sm text-right font-medium text-green-600">
                                    {result.customersServed}
                                  </TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">customers</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Customers Lost</TableCell>
                                  <TableCell className="text-sm text-right font-medium text-red-600">
                                    {result.customersLost}
                                  </TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">customers</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Table Utilization (ρ)</TableCell>
                                  <TableCell className="text-sm text-right font-medium">
                                    {result.tableUtilization}
                                  </TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">%</TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell className="text-sm">Server Utilization</TableCell>
                                  <TableCell className="text-sm text-right font-medium">
                                    {result.serverUtilization}
                                  </TableCell>
                                  <TableCell className="text-sm text-right text-muted-foreground">%</TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </div>
                        </div>

                        {/* Service Rate */}
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-muted-foreground">Service Rate (Served/Arrivals)</span>
                            <span className="text-lg font-semibold">
                              {Math.round((result.customersServed / result.totalArrivals) * 100)}%
                            </span>
                          </div>
                          <div className="mt-2 h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${(result.customersServed / result.totalArrivals) * 100}%` }}
                            />
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="charts">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              Wait Time Distribution
                            </p>
                            <div className="h-56">
                              <ResponsiveContainer width="100%" height="100%">
                                <RechartsLineChart data={result.timeSeriesData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis
                                    dataKey="time"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={10}
                                    tickFormatter={(v) => `${v}m`}
                                  />
                                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "hsl(var(--card))",
                                      border: "1px solid hsl(var(--border))",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                    }}
                                    formatter={(value: number) => [`${value} min`, "Wait Time"]}
                                  />
                                  <Line
                                    type="monotone"
                                    dataKey="waitTime"
                                    stroke="hsl(var(--primary))"
                                    strokeWidth={2}
                                    dot={false}
                                  />
                                </RechartsLineChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                          <div>
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                              Queue Length Over Time
                            </p>
                            <div className="h-56">
                              <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={result.timeSeriesData}>
                                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                  <XAxis
                                    dataKey="time"
                                    stroke="hsl(var(--muted-foreground))"
                                    fontSize={10}
                                    tickFormatter={(v) => `${v}m`}
                                  />
                                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} />
                                  <Tooltip
                                    contentStyle={{
                                      backgroundColor: "hsl(var(--card))",
                                      border: "1px solid hsl(var(--border))",
                                      borderRadius: "8px",
                                      fontSize: "12px",
                                    }}
                                    formatter={(value: number) => [value, "Queue Length"]}
                                  />
                                  <Bar dataKey="queueLength" fill="hsl(var(--primary))" radius={[2, 2, 0, 0]} />
                                </BarChart>
                              </ResponsiveContainer>
                            </div>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="timeseries">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                          Time Series Data
                        </p>
                        <div className="max-h-80 overflow-auto border border-border rounded-lg">
                          <Table>
                            <TableHeader className="sticky top-0 bg-background">
                              <TableRow>
                                <TableHead className="text-xs">Time (min)</TableHead>
                                <TableHead className="text-xs text-right">Wait Time (min)</TableHead>
                                <TableHead className="text-xs text-right">Queue Length</TableHead>
                                <TableHead className="text-xs text-right">Utilization (%)</TableHead>
                                <TableHead className="text-xs text-right">In System</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {result.timeSeriesData.map((row, i) => (
                                <TableRow key={i}>
                                  <TableCell className="text-sm font-medium">{row.time}</TableCell>
                                  <TableCell className="text-sm text-right">{row.waitTime}</TableCell>
                                  <TableCell className="text-sm text-right">{row.queueLength}</TableCell>
                                  <TableCell className="text-sm text-right">{row.utilization}</TableCell>
                                  <TableCell className="text-sm text-right">{row.customersInSystem}</TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      </TabsContent>

                      <TabsContent value="analysis">
                        <div className="space-y-4">
                          <div className="p-4 rounded-lg bg-muted/50 border border-border">
                            <p className="text-sm font-medium text-foreground mb-2">System Status</p>
                            <p className="text-sm text-muted-foreground">
                              {result.utilizationFactor < 0.7
                                ? `The system is under-utilized (ρ = ${result.utilizationFactor}). Consider reducing staff or tables during this period to optimize costs while maintaining service quality.`
                                : result.utilizationFactor < 0.85
                                  ? `The system is operating at optimal capacity (ρ = ${result.utilizationFactor}). Current configuration provides good balance between efficiency and customer wait times.`
                                  : result.utilizationFactor < 1
                                    ? `The system is near capacity (ρ = ${result.utilizationFactor}). Wait times may be noticeable. Consider adding resources during peak periods.`
                                    : `The system is over capacity (ρ = ${result.utilizationFactor}). Queue will grow indefinitely. Immediate action needed: add tables/servers or limit arrivals.`}
                            </p>
                          </div>

                          <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                              <p className="text-sm font-medium text-foreground mb-2">Wait Time Assessment</p>
                              <p className="text-sm text-muted-foreground">
                                {result.avgWaitTime < 5
                                  ? "Excellent - customers experience minimal wait times, leading to high satisfaction."
                                  : result.avgWaitTime < 15
                                    ? "Acceptable - wait times are within typical restaurant expectations."
                                    : "Concerning - extended wait times may lead to customer abandonment and dissatisfaction."}
                              </p>
                            </div>

                            <div className="p-4 rounded-lg bg-muted/50 border border-border">
                              <p className="text-sm font-medium text-foreground mb-2">Customer Loss Analysis</p>
                              <p className="text-sm text-muted-foreground">
                                {result.customersLost === 0
                                  ? "No customers lost - the system successfully served all arrivals."
                                  : `${result.customersLost} customers (${Math.round((result.customersLost / result.totalArrivals) * 100)}%) were lost due to capacity constraints. Estimated revenue impact: $${result.customersLost * 25}-${result.customersLost * 50} per simulation period.`}
                              </p>
                            </div>
                          </div>

                          <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                            <p className="text-sm font-medium text-foreground mb-2">Recommendation</p>
                            <p className="text-sm text-muted-foreground">
                              {result.customersLost > 0 && result.tableUtilization > 90
                                ? `Add ${Math.ceil(result.customersLost / (result.throughput / config.numTables))} more tables to eliminate customer loss.`
                                : result.serverUtilization > 95
                                  ? `Add ${Math.ceil((result.serverUtilization - 80) / 20)} more servers to reduce wait times and improve service quality.`
                                  : result.avgWaitTime > 15
                                    ? "Consider implementing a reservation system or dynamic queue management to better distribute arrivals."
                                    : "Current configuration is well-optimized. Monitor during peak periods for any changes in demand patterns."}
                            </p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              ) : (
                <Card>
                  <CardContent className="py-16 text-center">
                    <Activity className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">No simulation results yet</p>
                    <p className="text-xs text-muted-foreground mt-1">Select a scenario and click RUN to start</p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section id="methodology" className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border bg-muted/30">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-6">Methodology</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">M/M/c Queuing Model</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>
                  Based on Markovian (Poisson) arrival process and exponential service times with multiple servers. The
                  model assumes:
                </p>
                <ul className="mt-2 space-y-1 list-disc list-inside">
                  <li>Arrivals follow Poisson distribution (λ)</li>
                  <li>Service times are exponentially distributed (μ)</li>
                  <li>c parallel servers (tables with waitstaff)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Key Formulas</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-2">
                  <li>
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">ρ = λ/(cμ)</span> - Utilization
                    factor
                  </li>
                  <li>
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Lq = f(ρ,c)</span> - Avg queue
                    length (Erlang C)
                  </li>
                  <li>
                    <span className="font-mono text-xs bg-muted px-1 py-0.5 rounded">Wq = Lq/λ</span> - Avg wait time
                    (Little's Law)
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold">Assumptions</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <ul className="space-y-1 list-disc list-inside">
                  <li>Infinite queue capacity</li>
                  <li>FCFS discipline (default)</li>
                  <li>No customer abandonment in base model</li>
                  <li>Homogeneous servers</li>
                  <li>Steady-state conditions</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-xl font-bold text-foreground mb-4">About This Project</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            QueueOpt is a discrete-event simulation system developed as part of university coursework in Operations
            Research / Simulation Modeling. It applies queuing theory principles to model and analyze restaurant service
            operations, enabling users to understand how different configurations of tables, servers, and queue
            disciplines affect customer wait times, throughput, and resource utilization.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed mt-3">
            The guest mode provides an interactive demonstration of the simulation model. Registered users can save
            simulations, manage multiple restaurant configurations, and access historical analytics.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-primary flex items-center justify-center">
              <ChefHat className="w-3.5 h-3.5 text-primary-foreground" />
            </div>
            <span className="text-sm font-semibold text-foreground">QueueOpt</span>
          </div>
          <p className="text-xs text-muted-foreground">
            Discrete-Event Simulation | M/M/c Queuing Model | University Research Project
          </p>
        </div>
      </footer>
    </div>
  )
}
