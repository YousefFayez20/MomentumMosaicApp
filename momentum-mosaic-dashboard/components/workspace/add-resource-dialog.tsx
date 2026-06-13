"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { apiClient } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import type { WorkspaceResourceResponse } from "@/lib/api"

interface AddResourceDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  workspaceId: number
  onSuccess: (resource: WorkspaceResourceResponse) => void
}

export function AddResourceDialog({ open, onOpenChange, workspaceId, onSuccess }: AddResourceDialogProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [url, setUrl] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!url.trim()) {
      toast({ title: "Missing URL", description: "Resource URL is required", variant: "destructive" })
      return
    }
    
    // Basic validation
    let validUrl = url.trim()
    if (!/^https?:\/\//i.test(validUrl)) {
      validUrl = `https://${validUrl}`
    }

    try {
      new URL(validUrl)
    } catch {
      toast({ title: "Invalid URL", description: "Please enter a valid URL", variant: "destructive" })
      return
    }

    setLoading(true)
    try {
      const resource = await apiClient.addWorkspaceResource(workspaceId, { url: validUrl })
      onSuccess(resource)
      setUrl("")
      onOpenChange(false)
    } catch (err) {
      const apiError = err as any
      toast({ title: "Could not add resource", description: apiError?.message || "Please try again.", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Resource</DialogTitle>
          <DialogDescription>Add a supporting link for this workspace.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resource-url">URL</Label>
            <Input 
              id="resource-url" 
              placeholder="https://example.com" 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              required 
              autoFocus
            />
          </div>



          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding…" : "Add Resource"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
