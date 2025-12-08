import apiClient from "@/lib/api/client"

export interface CreateRestaurantRequest {
  name: string
  location: string
  address: string
  city: string
  country: string
}

export interface Restaurant {
  id: number
  name: string
  location: string
  address: string
  city: string
  country: string
  created_at: string
  updated_at?: string
}

class RestaurantService {
  async createRestaurant(data: CreateRestaurantRequest): Promise<Restaurant> {
    const response = await apiClient.post<Restaurant>("/restaurants/", data)
    return response.data
  }

  async getRestaurants(): Promise<Restaurant[]> {
    const response = await apiClient.get<Restaurant[]>("/restaurants/")
    return response.data
  }

  async getRestaurantById(id: number): Promise<Restaurant> {
    const response = await apiClient.get<Restaurant>(`/restaurants/${id}/`)
    return response.data
  }

  async updateRestaurant(id: number, data: Partial<CreateRestaurantRequest>): Promise<Restaurant> {
    const response = await apiClient.patch<Restaurant>(`/restaurants/${id}/`, data)
    return response.data
  }

  async deleteRestaurant(id: number): Promise<void> {
    await apiClient.delete(`/restaurants/${id}/`)
  }
}

export const restaurantService = new RestaurantService()
