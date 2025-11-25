import type { ComponentType } from "react"
import { AlertTriangle, FileText, Mail, MessageSquare } from "lucide-react"

import type { SourceSystem } from "@/lib/insight-types"

export interface SourceOption {
  label: string
  description: string
  icon: ComponentType<{ className?: string }>
  accent: string
}

export const SOURCE_OPTIONS: Record<SourceSystem, SourceOption> = {
  slack: { label: "Slack", description: "Eng + product chatter", icon: MessageSquare, accent: "text-sky-400" },
  gmail: { label: "Gmail", description: "Exec + customer email", icon: Mail, accent: "text-amber-400" },
  docs: { label: "Docs", description: "QBRs, PRDs, briefs", icon: FileText, accent: "text-emerald-400" },
  incidents: { label: "Incidents", description: "Outages, trust", icon: AlertTriangle, accent: "text-rose-400" },
}

