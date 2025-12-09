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
  restaurant?: number; // Restaurant ID
  restaurant_name?: string;
  created_at: string;
  updated_at?: string;
  queue_length_stats?: Array<{ time: number; queue_length: number }>; // For charts
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
    const response = await apiClient.get<any[]>("/simulations/");
    // Transform API response to match frontend interface
    return response.data.map((item: any) => {
      const resultsSummary = item.results_summary || {};
      const results = item.results || {};
      
      return {
        id: item.id?.toString() || item.simulation_id,
        simulation_id: item.simulation_id,
        status: item.status,
        performance_metrics: {
          avg_waiting_time: resultsSummary.avg_waiting_time || results.performance_metrics?.avg_waiting_time || 0,
          max_waiting_time: results.performance_metrics?.max_waiting_time || 0,
          median_waiting_time: results.performance_metrics?.median_waiting_time || 0,
          avg_service_time: results.performance_metrics?.avg_service_time || 0,
          median_service_time: results.performance_metrics?.median_service_time || 0,
          throughput: results.performance_metrics?.throughput || 0,
        },
        utilization_metrics: {
          // table_utilization is already a percentage (54.81), not a decimal (0.5481)
          table_utilization: resultsSummary.table_utilization 
            ? (resultsSummary.table_utilization > 1 ? resultsSummary.table_utilization / 100 : resultsSummary.table_utilization)
            : (results.utilization_metrics?.table_utilization 
              ? (results.utilization_metrics.table_utilization > 1 ? results.utilization_metrics.table_utilization / 100 : results.utilization_metrics.table_utilization)
              : 0),
          server_utilization: results.utilization_metrics?.server_utilization 
            ? (results.utilization_metrics.server_utilization > 1 ? results.utilization_metrics.server_utilization / 100 : results.utilization_metrics.server_utilization)
            : 0,
          peak_table_utilization: results.utilization_metrics?.peak_table_utilization || 0,
          peak_server_utilization: results.utilization_metrics?.peak_server_utilization || 0,
        },
        queue_metrics: {
          queue_length_avg: results.queue_metrics?.queue_length_avg || results.queue_length_stats?.reduce((acc: number, stat: any) => acc + stat.queue_length, 0) / (results.queue_length_stats?.length || 1) || 0,
          queue_length_max: results.queue_metrics?.queue_length_max || Math.max(...(results.queue_length_stats?.map((stat: any) => stat.queue_length) || [0])) || 0,
        },
        customer_metrics: {
          // customers_served is in performance_metrics in the API response
          customers_served: resultsSummary.customers_served || results.performance_metrics?.customers_served || results.customer_metrics?.customers_served || 0,
          customers_lost: results.performance_metrics?.customers_lost || results.customer_metrics?.customers_lost || 0,
          total_customers_arrived: results.customer_metrics?.total_customers_arrived || 0,
        },
        config: item.config,
        restaurant: item.restaurant, // Include restaurant ID for filtering
        restaurant_name: item.restaurant_name,
        created_at: item.created_at,
        updated_at: item.updated_at,
      };
    });
  }

  async getSimulationById(id: string): Promise<SimulationResult> {
    // Try by simulation_id first, then by numeric id
    let response;
    try {
      response = await apiClient.get<any>(`/simulations/${id}/`);
    } catch (error: any) {
      // If not found, try to get by numeric id and then lookup simulation_id
      if (error.response?.status === 404) {
        // Get all simulations and find by id
        const allSims = await this.getSimulations();
        const sim = allSims.find(s => s.id === id || s.simulation_id === id);
        if (sim) {
          // Try again with simulation_id
          response = await apiClient.get<any>(`/simulations/${sim.simulation_id}/`);
        } else {
          throw error;
        }
      } else {
        throw error;
      }
    }
    
    const item = response.data;
    const results = item.results || {};
    const resultsSummary = item.results_summary || {};
    
    // Calculate queue metrics from queue_length_stats if available
    const queueLengthStats = results.queue_length_stats || [];
    const queueLengthAvg = queueLengthStats.length > 0
      ? queueLengthStats.reduce((acc: number, stat: any) => acc + stat.queue_length, 0) / queueLengthStats.length
      : 0;
    const queueLengthMax = queueLengthStats.length > 0
      ? Math.max(...queueLengthStats.map((stat: any) => stat.queue_length))
      : 0;
    
    // Transform API response to match frontend interface
    return {
      id: item.id?.toString() || item.simulation_id,
      simulation_id: item.simulation_id,
      status: item.status,
      performance_metrics: {
        avg_waiting_time: results.performance_metrics?.avg_waiting_time || resultsSummary.avg_waiting_time || 0,
        max_waiting_time: results.performance_metrics?.max_waiting_time || 0,
        median_waiting_time: results.performance_metrics?.median_waiting_time || 0,
        avg_service_time: results.performance_metrics?.avg_service_time || results.performance_metrics?.avg_dining_time || 0,
        median_service_time: results.performance_metrics?.median_service_time || 0,
        throughput: results.performance_metrics?.throughput || 0,
      },
      utilization_metrics: {
        // table_utilization is already a percentage (54.81), not a decimal (0.5481)
        table_utilization: results.utilization_metrics?.table_utilization 
          ? (results.utilization_metrics.table_utilization > 1 ? results.utilization_metrics.table_utilization / 100 : results.utilization_metrics.table_utilization)
          : (resultsSummary.table_utilization 
            ? (resultsSummary.table_utilization > 1 ? resultsSummary.table_utilization / 100 : resultsSummary.table_utilization)
            : 0),
        server_utilization: results.utilization_metrics?.server_utilization 
          ? (results.utilization_metrics.server_utilization > 1 ? results.utilization_metrics.server_utilization / 100 : results.utilization_metrics.server_utilization)
          : 0,
        peak_table_utilization: results.utilization_metrics?.peak_table_utilization || results.utilization_metrics?.peak_load || 0,
        peak_server_utilization: results.utilization_metrics?.peak_server_utilization || 0,
      },
      queue_metrics: {
        queue_length_avg: results.queue_metrics?.queue_length_avg || queueLengthAvg,
        queue_length_max: results.queue_metrics?.queue_length_max || queueLengthMax,
      },
      customer_metrics: {
        // customers_served is in performance_metrics in the API response
        customers_served: results.performance_metrics?.customers_served || resultsSummary.customers_served || results.customer_metrics?.customers_served || 0,
        customers_lost: results.performance_metrics?.customers_lost || results.customer_metrics?.customers_lost || 0,
        total_customers_arrived: results.customer_metrics?.total_customers_arrived || 0,
      },
      config: item.config,
      restaurant: item.restaurant, // Include restaurant ID for filtering
      restaurant_name: item.restaurant_name,
      created_at: item.created_at,
      updated_at: item.updated_at,
      queue_length_stats: queueLengthStats, // Include for chart
    };
  }

  async updateSimulation(id: string, data: Partial<{ status: string; error_message: string }>): Promise<SimulationResult> {
    // The backend expects simulation_id, not numeric id
    let simulationId = id;
    if (/^\d+$/.test(id)) {
      // It's a numeric id, get the simulation first
      const sims = await this.getSimulations();
      const sim = sims.find(s => s.id === id || s.simulation_id === id);
      if (sim && sim.simulation_id) {
        simulationId = sim.simulation_id;
      }
    }
    const response = await apiClient.patch<SimulationResult>(`/simulations/${simulationId}/`, data);
    return response.data;
  }

  async deleteSimulation(id: string): Promise<void> {
    // The backend expects simulation_id, not numeric id
    // If id looks like a number, we need to get the simulation_id first
    let simulationId = id;
    if (/^\d+$/.test(id)) {
      // It's a numeric id, get the simulation first
      const sims = await this.getSimulations();
      const sim = sims.find(s => s.id === id || s.simulation_id === id);
      if (sim && sim.simulation_id) {
        simulationId = sim.simulation_id;
      }
    }
    // Otherwise assume it's already a simulation_id
    await apiClient.delete(`/simulations/${simulationId}/delete/`);
  }
}

export const simulationService = new SimulationService();
