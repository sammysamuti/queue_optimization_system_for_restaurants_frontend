import apiClient from "@/lib/api/client";

export interface PartySizeDistribution {
  "1": number;
  "2": number;
  "3": number;
  "4": number;
  "5": number;
  "6": number;
  "7": number;
  "8": number;
}

export interface ServiceTimeParams {
  mean_by_party_size: {
    "1-2": number;
    "3-4": number;
    "5-6": number;
    "7+": number;
  };
  std_dev: number;
  distribution_type: "normal" | "exponential" | "triangular";
}

export interface RunSimulationRequest {
  restaurant_id: number;
  num_tables: number;
  num_servers: number;
  arrival_rate: number;
  duration: number;
  party_size_distribution: PartySizeDistribution;
  service_time_params: ServiceTimeParams;
  reneg_threshold: number;
  warmup_period: number;
  queue_strategy: "fcfs" | "priority_large" | "priority_small" | "dynamic";
}

export interface RunGuestSimulationRequest {
  num_tables: number;
  num_servers: number;
  arrival_rate: number;
  duration: number;
  party_size_distribution: PartySizeDistribution;
  service_time_params: ServiceTimeParams;
  reneg_threshold: number;
  warmup_period: number;
  queue_strategy: "fcfs" | "priority_large" | "priority_small" | "dynamic";
}

export interface PerformanceMetrics {
  avg_waiting_time: number;
  max_waiting_time: number;
  median_waiting_time: number;
  avg_service_time: number;
  median_service_time: number;
  throughput: number;
}

export interface UtilizationMetrics {
  table_utilization: number;
  server_utilization: number;
  peak_table_utilization: number;
  peak_server_utilization: number;
}

export interface QueueMetrics {
  queue_length_avg: number;
  queue_length_max: number;
}

export interface CustomerMetrics {
  customers_served: number;
  customers_lost: number;
  total_customers_arrived: number;
}

export interface SimulationResult {
  id: string;
  simulation_id: string;
  status: "completed" | "failed" | "running";
  performance_metrics: PerformanceMetrics;
  utilization_metrics: UtilizationMetrics;
  queue_metrics: QueueMetrics;
  customer_metrics: CustomerMetrics;
  config?: RunSimulationRequest;
  restaurant_name?: string;
  created_at: string;
  updated_at?: string;
}

class SimulationService {
  async runSimulation(data: RunSimulationRequest): Promise<SimulationResult> {
    const response = await apiClient.post<SimulationResult>(
      "/simulation/run/",
      data
    );
    return response.data;
  }

  async runGuestSimulation(data: RunGuestSimulationRequest): Promise<any> {
    return this.runClientSideSimulation(data);
  }

  private runClientSideSimulation(config: RunGuestSimulationRequest): any {
    const arrivalRate = config.arrival_rate;
    const numTables = config.num_tables;
    const numServers = config.num_servers;
    const avgServiceTime =
      config.service_time_params?.mean_by_party_size?.["1-2"] || 45;
    const duration = config.duration;
    const renegThreshold = config.reneg_threshold;

    // M/M/c queue calculations
    const lambda = arrivalRate / 60; // arrivals per minute
    const mu = 1 / avgServiceTime; // service rate per server
    const c = Math.min(numServers, numTables); // effective servers
    const rho = lambda / (c * mu); // utilization factor

    // Calculate P0 (probability of zero customers in system)
    const factorial = (n: number): number => {
      if (n <= 1) return 1;
      let result = 1;
      for (let i = 2; i <= n; i++) result *= i;
      return result;
    };

    let sumTerm = 0;
    for (let n = 0; n < c; n++) {
      sumTerm += Math.pow(c * rho, n) / factorial(n);
    }
    const lastTerm = Math.pow(c * rho, c) / (factorial(c) * (1 - rho));
    const P0 = rho < 1 ? 1 / (sumTerm + lastTerm) : 0.01;

    // Calculate Lq (average queue length) using Erlang C formula
    const Lq =
      rho < 1
        ? (P0 * Math.pow(c * rho, c) * rho) /
          (factorial(c) * Math.pow(1 - rho, 2))
        : lambda * avgServiceTime * 2;

    // Calculate metrics using Little's Law
    const Wq = Lq / lambda; // average wait time in queue (minutes)
    const avgWaitTime = Math.max(0, Wq);
    const maxWaitTime = avgWaitTime * 2.5 + Math.random() * 5;
    const totalArrivals = Math.floor(lambda * duration);
    const customersServed = Math.floor(
      totalArrivals * (1 - Math.min(0.3, avgWaitTime / renegThreshold))
    );
    const customersLost = totalArrivals - customersServed;
    const throughput = (customersServed / duration) * 60; // customers per hour
    const tableUtilization = Math.min(0.95, rho * 0.85);
    const serverUtilization = Math.min(0.95, rho);

    // Generate time series data
    const timeSeriesData = [];
    for (let t = 0; t <= duration; t += 5) {
      const progress = t / duration;
      timeSeriesData.push({
        time: t,
        waitTime: avgWaitTime * (1 + 0.3 * Math.sin(progress * Math.PI * 2)),
        queueLength: Lq * (1 + 0.2 * Math.sin(progress * Math.PI * 2)),
        utilization:
          tableUtilization * (1 + 0.1 * Math.sin(progress * Math.PI * 2)),
        customersInSystem: Math.floor(Lq + c * rho),
      });
    }

    return {
      success: true,
      simulation_id: `guest_${Date.now()}`,
      config: config,
      results: {
        performance_metrics: {
          avg_waiting_time: avgWaitTime,
          max_waiting_time: maxWaitTime,
          median_waiting_time: avgWaitTime * 0.9,
          avg_service_time: avgServiceTime,
          median_service_time: avgServiceTime * 0.95,
          throughput: throughput,
        },
        utilization_metrics: {
          table_utilization: tableUtilization,
          server_utilization: serverUtilization,
          peak_table_utilization: Math.min(0.98, tableUtilization * 1.1),
          peak_server_utilization: Math.min(0.98, serverUtilization * 1.1),
        },
        queue_metrics: {
          queue_length_avg: Lq,
          queue_length_max: Lq * 2.5,
        },
        customer_metrics: {
          customers_served: customersServed,
          customers_lost: customersLost,
          total_customers_arrived: totalArrivals,
        },
        time_series_data: timeSeriesData,
      },
      metadata: {
        execution_time_ms: 1500,
        simulation_start_time: new Date().toISOString(),
        simulation_end_time: new Date().toISOString(),
        version: "1.0.0",
      },
      message:
        "Guest simulation completed successfully. Login to save results.",
      guest_mode: true,
    };
  }

  async getSimulations(): Promise<SimulationResult[]> {
    const response = await apiClient.get<SimulationResult[]>("/simulations/");
    return response.data;
  }

  async getSimulationById(id: string): Promise<SimulationResult> {
    const response = await apiClient.get<SimulationResult>(
      `/simulations/${id}/`
    );
    return response.data;
  }

  async deleteSimulation(id: string): Promise<void> {
    await apiClient.delete(`/simulations/${id}/delete/`);
  }
}

export const simulationService = new SimulationService();
