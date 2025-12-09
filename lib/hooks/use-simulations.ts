"use client"

import useSWR from "swr"
import { simulationService, type SimulationResult, type RunSimulationRequest } from "@/lib/services/simulation-service"

export function useSimulations() {
  const { data, error, isLoading, mutate } = useSWR<SimulationResult[]>(
    "simulations",
    () => simulationService.getSimulations(),
    {
      revalidateOnFocus: false,
    },
  )

  const runSimulation = async (config: RunSimulationRequest) => {
    const result = await simulationService.runSimulation(config)
    mutate()
    return result
  }

  const deleteSimulation = async (id: string) => {
    await simulationService.deleteSimulation(id)
    mutate()
  }

  return {
    simulations: data || [],
    isLoading,
    error,
    runSimulation,
    deleteSimulation,
    refetch: mutate,
  }
}

export function useSimulation(id: string) {
  const { data, error, isLoading, mutate } = useSWR<SimulationResult>(
    id ? `simulation-${id}` : null,
    () => simulationService.getSimulationById(id),
    {
      revalidateOnFocus: false,
    },
  )

  return {
    simulation: data,
    isLoading,
    error,
    refetch: mutate,
  }
}
