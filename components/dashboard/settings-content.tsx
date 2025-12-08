"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, Bell, Shield, Palette, Save, Loader2 } from "lucide-react"
import { useTheme } from "@/contexts/theme-context"
import { useAuth } from "@/lib/hooks/use-auth"
import { toast } from "sonner"

export function SettingsContent() {
  const { theme, toggleTheme } = useTheme()
  const { user, updateProfile, updatePassword, isLoading } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false)

  const [profileForm, setProfileForm] = useState({
    fullName: user?.full_name || "John Doe",
    username: user?.username || "johndoe",
    email: user?.email || "john@university.edu",
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notifications, setNotifications] = useState({
    simulationComplete: true,
    weeklyReports: true,
    tipsAndUpdates: false,
  })

  const handleSaveProfile = async () => {
    setIsSaving(true)
    try {
      await updateProfile({
        full_name: profileForm.fullName,
        username: profileForm.username,
        email: profileForm.email,
      })
      toast.success("Profile updated successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (passwordForm.newPassword.length < 8) {
      toast.error("Password must be at least 8 characters")
      return
    }
    setIsUpdatingPassword(true)
    try {
      await updatePassword({
        current_password: passwordForm.currentPassword,
        new_password: passwordForm.newPassword,
      })
      toast.success("Password updated successfully!")
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
    } catch (error: any) {
      toast.error(error.message || "Failed to update password")
    } finally {
      setIsUpdatingPassword(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 max-w-4xl">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground">Manage your account and preferences</p>
      </div>

      {/* Profile section */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Profile</CardTitle>
          </div>
          <CardDescription>Update your personal information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex items-center gap-6">
            <Avatar className="w-20 h-20">
              <AvatarImage src="/diverse-user-avatars.png" />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {profileForm.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <Button variant="outline" className="rounded-xl bg-transparent">
                Change Avatar
              </Button>
              <p className="text-xs text-muted-foreground mt-2">JPG, GIF or PNG. Max 2MB</p>
            </div>
          </div>

          <Separator />

          {/* Form */}
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Full Name</Label>
              <Input
                value={profileForm.fullName}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, fullName: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <Label>Username</Label>
              <Input
                value={profileForm.username}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, username: e.target.value }))}
                className="rounded-xl"
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Email</Label>
              <Input
                value={profileForm.email}
                onChange={(e) => setProfileForm((prev) => ({ ...prev, email: e.target.value }))}
                type="email"
                className="rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Notifications</CardTitle>
          </div>
          <CardDescription>Configure how you receive notifications</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Simulation Complete</p>
              <p className="text-sm text-muted-foreground">Get notified when a simulation finishes running</p>
            </div>
            <Switch
              checked={notifications.simulationComplete}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, simulationComplete: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Weekly Reports</p>
              <p className="text-sm text-muted-foreground">Receive weekly summary of your simulations</p>
            </div>
            <Switch
              checked={notifications.weeklyReports}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, weeklyReports: checked }))}
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Tips & Updates</p>
              <p className="text-sm text-muted-foreground">Learn about new features and optimization tips</p>
            </div>
            <Switch
              checked={notifications.tipsAndUpdates}
              onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, tipsAndUpdates: checked }))}
            />
          </div>
        </CardContent>
      </Card>

      {/* Appearance */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Appearance</CardTitle>
          </div>
          <CardDescription>Customize the look and feel</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Use dark theme for the dashboard</p>
            </div>
            <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
          </div>
        </CardContent>
      </Card>

      {/* Security */}
      <Card className="rounded-2xl border-border">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg">Security</CardTitle>
          </div>
          <CardDescription>Manage your security settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Current Password</Label>
            <Input
              type="password"
              placeholder="Enter current password"
              className="rounded-xl"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm((prev) => ({ ...prev, currentPassword: e.target.value }))}
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>New Password</Label>
              <Input
                type="password"
                placeholder="Enter new password"
                className="rounded-xl"
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                placeholder="Confirm new password"
                className="rounded-xl"
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
              />
            </div>
          </div>
          <div className="flex justify-end">
            <Button
              variant="outline"
              className="rounded-xl bg-transparent"
              onClick={handleUpdatePassword}
              disabled={isUpdatingPassword || !passwordForm.currentPassword || !passwordForm.newPassword}
            >
              {isUpdatingPassword ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Password
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
