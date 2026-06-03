"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { WorkspaceResponse, WorkspaceSectionResponse } from "@/lib/api"

interface CreateWorkspaceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sections: WorkspaceSectionResponse[]
  onSuccess: (workspace: WorkspaceResponse) => void
}

export function CreateWorkspaceDialog({ open, onOpenChange, sections, onSuccess }: CreateWorkspaceDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [sectionChoice, setSectionChoice] = useState<string>("none") // "none", "new", or id string
  const [newSectionName, setNewSectionName] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast({ title: "Missing title", description: "Workspace title is required", variant: "destructive" })
      return
    }
    if (sectionChoice === "new" && !newSectionName.trim()) {
      toast({ title: "Missing section name", description: "Section name is required", variant: "destructive" })
      return
    }
    setLoading(true)
    try {
      let sectionId: number | null = null
      if (sectionChoice === "new") {
        const newSection = await apiClient.createSection({ name: newSectionName.trim() })
        sectionId = newSection.id
      } else if (sectionChoice !== "none") {
        sectionId = Number(sectionChoice)
      }

      const workspace = await apiClient.createWorkspace({ title: title.trim(), sectionId })
      onSuccess(workspace)
      // Reset form
      setTitle("")
      setSectionChoice("none")
      setNewSectionName("")
      onOpenChange(false)
    } catch (err) {
      const apiError = err as any
      toast({ title: "Could not create workspace", description: apiError?.message || "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create Workspace</DialogTitle>
          <DialogDescription>Start a new study workspace.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="workspace-title">Workspace Title</Label>
            <Input id="workspace-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-select">Section</Label>
            <Select value={sectionChoice} onValueChange={setSectionChoice}>
              <SelectTrigger>
                <SelectValue placeholder="Select a section" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">No Section</SelectItem>
                {sections.map((sec) => (
                  <SelectItem key={sec.id} value={String(sec.id)}>
                    {sec.name}
                  </SelectItem>
                ))}
                <SelectItem value="new">Create New Section…</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {sectionChoice === "new" && (
            <div className="space-y-2">
              <Label htmlFor="new-section-name">New Section Name</Label>
              <Input id="new-section-name" value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)} required />
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creating…" : "Create Workspace"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
