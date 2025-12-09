"use client"

import useSWR from "swr"
import { restaurantService, type Restaurant, type CreateRestaurantRequest } from "@/lib/services/restaurant-service"

export function useRestaurants() {
  const { data, error, isLoading, mutate } = useSWR<Restaurant[]>(
    "restaurants",
    () => restaurantService.getRestaurants(),
    {
      revalidateOnFocus: false,
    },
  )

  const createRestaurant = async (data: CreateRestaurantRequest) => {
    const newRestaurant = await restaurantService.createRestaurant(data)
    mutate()
    return newRestaurant
  }

  const updateRestaurant = async (id: number, data: Partial<CreateRestaurantRequest>) => {
    const updated = await restaurantService.updateRestaurant(id, data)
    mutate()
    return updated
  }

  const deleteRestaurant = async (id: number) => {
    await restaurantService.deleteRestaurant(id)
    mutate()
  }

  return {
    restaurants: data || [],
    isLoading,
    error,
    createRestaurant,
    updateRestaurant,
    deleteRestaurant,
    refetch: mutate,
  }
}

export function useRestaurant(id: number) {
  const { data, error, isLoading, mutate } = useSWR<Restaurant>(
    id ? `restaurant-${id}` : null,
    () => restaurantService.getRestaurantById(id),
    {
      revalidateOnFocus: false,
    },
  )

  return {
    restaurant: data,
    isLoading,
    error,
    refetch: mutate,
  }
}
