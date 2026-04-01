"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { apiClient } from "@/lib/api"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function CreateTaskDialog({ open, onOpenChange, onSuccess }: CreateTaskDialogProps) {
  const { user } = useAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    taskType: "DEEP" as "DEEP" | "SHALLOW" | "FITNESS",
    durationMinutes: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.userId) return

    if (!formData.title || !formData.durationMinutes) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    const durationMinutes = Number.parseInt(formData.durationMinutes)
    if (durationMinutes < 1) {
      toast({
        title: "Error",
        description: "Duration must be at least 1 minute",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)
      await apiClient.createTask(user.userId, {
        title: formData.title,
        taskType: formData.taskType,
        durationMinutes,
      })
      toast({
        title: "Success",
        description: "Task created successfully!",
      })
      setFormData({ title: "", taskType: "DEEP", durationMinutes: "" })
      onOpenChange(false)
      onSuccess()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to create task",
        variant: "destructive",
      })
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>Add a new task to track your productivity</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Task Title</Label>
            <Input
              id="title"
              placeholder="Complete project documentation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="taskType">Task Type</Label>
            <Select
              value={formData.taskType}
              onValueChange={(value) => setFormData({ ...formData, taskType: value as any })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select task type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEEP">Deep Work</SelectItem>
                <SelectItem value="SHALLOW">Shallow Work</SelectItem>
                <SelectItem value="FITNESS">Fitness</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Deep: Focused work | Shallow: Routine tasks | Fitness: Exercise activities
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration">Duration (minutes)</Label>
            <Input
              id="duration"
              type="number"
              placeholder="60"
              min="1"
              value={formData.durationMinutes}
              onChange={(e) => setFormData({ ...formData, durationMinutes: e.target.value })}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
