"use client"

import { useParams } from "next/navigation"

import { WorkspacePage } from "@/components/workspace/workspace-page"

export default function WorkspaceDetailPage() {
  const params = useParams<{ workspaceId: string }>()
  const workspaceId = Number(params.workspaceId)

  if (!Number.isFinite(workspaceId)) {
    return null
  }

  return <WorkspacePage workspaceId={workspaceId} />
}
