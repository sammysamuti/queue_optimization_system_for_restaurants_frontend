"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Plus, Building2, MapPin, MoreHorizontal, Edit, Trash2, BarChart3, Clock, Users, Loader2 } from "lucide-react"
import { useRestaurants } from "@/lib/hooks/use-restaurants"
import { toast } from "sonner"

export function RestaurantsContent() {
  const router = useRouter()
  const { restaurants, isLoading, createRestaurant, deleteRestaurant } = useRestaurants()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [editRestaurant, setEditRestaurant] = useState<any>(null)
  const [formData, setFormData] = useState({
    name: "",
    location: "",
    address: "",
    city: "",
    country: "",
  })

  const resetForm = () => {
    setFormData({ name: "", location: "", address: "", city: "", country: "" })
    setEditRestaurant(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await createRestaurant({
        ...formData,
        location: formData.location || formData.address,
      })
      toast.success("Restaurant created successfully!")
      setIsDialogOpen(false)
      resetForm()
    } catch (error: any) {
      toast.error(error.message || "Failed to create restaurant")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    try {
      await deleteRestaurant(deleteId)
      toast.success("Restaurant deleted successfully!")
      setDeleteId(null)
    } catch (error: any) {
      toast.error(error.message || "Failed to delete restaurant")
    }
  }

  const openEditDialog = (restaurant: any) => {
    setEditRestaurant(restaurant)
    setFormData({
      name: restaurant.name,
      location: restaurant.location,
      address: restaurant.address || restaurant.location,
      city: restaurant.city,
      country: restaurant.country,
    })
    setIsDialogOpen(true)
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
          <h1 className="text-2xl font-bold text-foreground">Restaurants</h1>
          <p className="text-muted-foreground">Manage your restaurant profiles</p>
        </div>
        <Dialog
          open={isDialogOpen}
          onOpenChange={(open) => {
            setIsDialogOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground">
              <Plus className="w-4 h-4" />
              Add Restaurant
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle>{editRestaurant ? "Edit Restaurant" : "Add New Restaurant"}</DialogTitle>
              <DialogDescription>
                {editRestaurant ? "Update your restaurant details" : "Create a new restaurant profile for simulations"}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Restaurant Name</Label>
                <Input
                  placeholder="e.g., Downtown Bistro"
                  className="rounded-xl"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Location</Label>
                <Input
                  placeholder="e.g., Bole"
                  className="rounded-xl"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Address</Label>
                <Input
                  placeholder="e.g., 123 Main Street"
                  className="rounded-xl"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>City</Label>
                  <Input
                    placeholder="e.g., Addis Ababa"
                    className="rounded-xl"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Country</Label>
                  <Input
                    placeholder="e.g., Ethiopia"
                    className="rounded-xl"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl bg-transparent"
                  onClick={() => {
                    setIsDialogOpen(false)
                    resetForm()
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editRestaurant ? "Updating..." : "Creating..."}
                    </>
                  ) : editRestaurant ? (
                    "Update Restaurant"
                  ) : (
                    "Create Restaurant"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {restaurants.length === 0 && (
        <Card className="rounded-2xl border-border">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No restaurants yet</h3>
            <p className="text-muted-foreground text-center max-w-sm mb-6">
              Create your first restaurant to start running queue optimization simulations.
            </p>
            <Button
              className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => setIsDialogOpen(true)}
            >
              <Plus className="w-4 h-4" />
              Add Restaurant
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Restaurant grid */}
      {restaurants.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          {restaurants.map((restaurant) => (
            <Card key={restaurant.id} className="rounded-2xl border-border hover:shadow-lg transition-shadow group">
              <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Building2 className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{restaurant.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                      <MapPin className="w-3 h-3" />
                      <span>
                        {restaurant.address || restaurant.location}, {restaurant.city}
                      </span>
                    </div>
                  </div>
                </div>
                <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <BarChart3 className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">--</p>
                    <p className="text-xs text-muted-foreground">Simulations</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Clock className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">--</p>
                    <p className="text-xs text-muted-foreground">Avg Wait</p>
                  </div>
                  <div className="text-center p-3 rounded-xl bg-secondary/50">
                    <div className="flex items-center justify-center gap-1 text-muted-foreground mb-1">
                      <Users className="w-3 h-3" />
                    </div>
                    <p className="text-lg font-semibold text-foreground">--</p>
                    <p className="text-xs text-muted-foreground">Tables</p>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-xs text-muted-foreground">
                    Created: {new Date(restaurant.created_at).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-muted-foreground hover:text-foreground"
                      onClick={() => openEditDialog(restaurant)}
                    >
                      <Edit className="w-3 h-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 gap-1 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteId(restaurant.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Restaurant</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this restaurant? This action cannot be undone and will also delete all
              associated simulations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="rounded-xl bg-destructive hover:bg-destructive/90 text-destructive-foreground"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
