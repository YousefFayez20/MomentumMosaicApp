"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient, type ApiError } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useRouter } from "next/navigation"
import { Activity } from "lucide-react"
import { AuthGuard } from "@/components/auth-guard"

export default function CompleteProfilePage() {
  const { user, refetchUser } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    gender: "" as "MALE" | "FEMALE" | "",
    heightCm: "",
    weightKg: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.gender || !formData.heightCm || !formData.weightKg) {
      setError("Please fill in all fields")
      return
    }

    const heightCm = Number.parseInt(formData.heightCm)
    const weightKg = Number.parseInt(formData.weightKg)

    if (heightCm < 50 || heightCm > 300) {
      setError("Height must be between 50 and 300 cm")
      return
    }

    if (weightKg < 20 || weightKg > 500) {
      setError("Weight must be between 20 and 500 kg")
      return
    }

    try {
      setLoading(true)
      console.log("[v0] Completing profile with data:", { gender: formData.gender, heightCm, weightKg })

      await apiClient.completeProfile({
        gender: formData.gender as "MALE" | "FEMALE",
        heightCm,
        weightKg,
      })

      console.log("[v0] Profile completed, fetching updated user data")
      console.log("[v0] Profile completed, fetching updated user data")
      // Just refresh user state - AuthGuard will handle the redirect
      await refetchUser()
    } catch (err: unknown) {
      const apiError = err as ApiError
      console.error("[v0] Profile completion error:", apiError)
      setError(apiError.message || "Failed to complete profile. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthGuard requireCompleteProfile={false}>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5 p-4">
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary">
            <Activity className="h-7 w-7 text-primary-foreground" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            Momentum <span className="text-primary">Mosaic</span>
          </h1>
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Complete Your Profile</CardTitle>
            <CardDescription>
              Welcome, {user?.name}! Let's personalize your fitness and productivity experience.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => setFormData({ ...formData, gender: value as "MALE" | "FEMALE" })}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="MALE" id="male" />
                    <Label htmlFor="male" className="font-normal">
                      Male
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="FEMALE" id="female" />
                    <Label htmlFor="female" className="font-normal">
                      Female
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="175"
                  min="50"
                  max="300"
                  value={formData.heightCm}
                  onChange={(e) => setFormData({ ...formData, heightCm: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  min="20"
                  max="500"
                  value={formData.weightKg}
                  onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                  required
                />
              </div>

              {error && <p className="text-sm text-destructive">{error}</p>}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving..." : "Complete Profile"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AuthGuard>
  )
}
