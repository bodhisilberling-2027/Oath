"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChevronLeft, Mail, Settings, Activity, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import { IntegrationConfigDialog } from "@/components/integration-config-dialog"
import { IntegrationLogsDialog } from "@/components/integration-logs-dialog"
import { integrationStore } from "@/lib/integration-store"

interface Integration {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  status: "connected" | "disconnected" | "error"
  lastSync?: string
  dataPoints?: number
  category: "calendar" | "communication" | "documents" | "project"
}

interface IntegrationActivity {
  id: string
  integration: string
  action: string
  description: string
  timestamp: string
  type: "meeting" | "message" | "document" | "event"
  linkedTo?: string
}

export default function Integrations({ onBack }: { onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<"overview" | "activity">("overview")
  const [configDialog, setConfigDialog] = useState<{ id: string; name: string; icon: React.ReactNode } | null>(null)
  const [logsDialog, setLogsDialog] = useState<{ id: string; name: string; icon: React.ReactNode } | null>(null)
  const [backendIntegrations, setBackendIntegrations] = useState(integrationStore.getAllIntegrations())
  const [recentActivity, setRecentActivity] = useState(integrationStore.getData().slice(0, 8))

  useEffect(() => {
    const interval = setInterval(() => {
      setBackendIntegrations(integrationStore.getAllIntegrations())
      setRecentActivity(integrationStore.getData().slice(0, 8))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const integrations: Integration[] = [
    {
      id: "gcal",
      name: "Google Calendar",
      description: "Sync board meetings and events to create automatic audit trail entries",
      icon: <img src="/images/google-calendar-logo.png" alt="Google Calendar" className="size-5" />,
      color: "text-blue-600",
      status: backendIntegrations.find((i) => i.id === "gcal")?.status || "disconnected",
      lastSync: backendIntegrations.find((i) => i.id === "gcal")?.lastSync
        ? formatLastSync(backendIntegrations.find((i) => i.id === "gcal")!.lastSync!)
        : undefined,
      dataPoints: backendIntegrations.find((i) => i.id === "gcal")?.dataPoints || 0,
      category: "calendar",
    },
    {
      id: "zoom",
      name: "Zoom",
      description: "Capture meeting recordings, transcripts, and attendance for governance records",
      icon: <img src="/images/zoom-logo.png" alt="Zoom" className="size-5" />,
      color: "text-blue-500",
      status: backendIntegrations.find((i) => i.id === "zoom")?.status || "disconnected",
      lastSync: backendIntegrations.find((i) => i.id === "zoom")?.lastSync
        ? formatLastSync(backendIntegrations.find((i) => i.id === "zoom")!.lastSync!)
        : undefined,
      dataPoints: backendIntegrations.find((i) => i.id === "zoom")?.dataPoints || 0,
      category: "communication",
    },
    {
      id: "slack",
      name: "Slack",
      description: "Monitor governance-related channels and link key decisions to discussions",
      icon: <img src="/images/slack-logo.png" alt="Slack" className="size-5" />,
      color: "text-purple-600",
      status: backendIntegrations.find((i) => i.id === "slack")?.status || "disconnected",
      lastSync: backendIntegrations.find((i) => i.id === "slack")?.lastSync
        ? formatLastSync(backendIntegrations.find((i) => i.id === "slack")!.lastSync!)
        : undefined,
      dataPoints: backendIntegrations.find((i) => i.id === "slack")?.dataPoints || 0,
      category: "communication",
    },
    {
      id: "notion",
      name: "Notion",
      description: "Import board documents, meeting notes, and strategic plans into evidence system",
      icon: <img src="/images/notion-logo.png" alt="Notion" className="size-5" />,
      color: "text-gray-800",
      status: backendIntegrations.find((i) => i.id === "notion")?.status || "disconnected",
      lastSync: backendIntegrations.find((i) => i.id === "notion")?.lastSync
        ? formatLastSync(backendIntegrations.find((i) => i.id === "notion")!.lastSync!)
        : undefined,
      dataPoints: backendIntegrations.find((i) => i.id === "notion")?.dataPoints || 0,
      category: "documents",
    },
    {
      id: "gmail",
      name: "Gmail",
      description: "Track governance-related email threads and approvals",
      icon: <Mail className="size-5" />,
      color: "text-red-500",
      status: backendIntegrations.find((i) => i.id === "gmail")?.status || "disconnected",
      category: "communication",
    },
    {
      id: "gdrive",
      name: "Google Drive",
      description: "Connect board folders and automatically sync evidence documents",
      icon: <img src="/images/google-drive-logo.png" alt="Google Drive" className="size-5" />,
      color: "text-yellow-600",
      status: backendIntegrations.find((i) => i.id === "gdrive")?.status || "disconnected",
      lastSync: backendIntegrations.find((i) => i.id === "gdrive")?.lastSync
        ? formatLastSync(backendIntegrations.find((i) => i.id === "gdrive")!.lastSync!)
        : undefined,
      dataPoints: backendIntegrations.find((i) => i.id === "gdrive")?.dataPoints || 0,
      category: "documents",
    },
  ]

  const activities: IntegrationActivity[] = recentActivity.map((data, index) => {
    const integration = integrations.find((i) => i.id === data.integrationId)
    return {
      id: data.id,
      integration: integration?.name || data.integrationId,
      action: getActionTitle(data.type),
      description: getActivityDescription(data),
      timestamp: formatLastSync(data.timestamp),
      type: data.type as any,
      linkedTo: data.linkedTo,
    }
  })

  const connectedCount = integrations.filter((i) => i.status === "connected").length
  const totalDataPoints = integrations.reduce((sum, i) => sum + (i.dataPoints || 0), 0)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <img src="/images/meeting-icon.png" alt="Meeting" className="size-4" />
      case "message":
        return <img src="/images/message-icon.png" alt="Message" className="size-4" />
      case "document":
        return <img src="/images/document-icon.png" alt="Document" className="size-4" />
      case "event":
        return <img src="/images/event-icon.png" alt="Event" className="size-4" />
      default:
        return <Activity className="size-4" />
    }
  }

  const getIntegrationIcon = (name: string) => {
    const integration = integrations.find((i) => i.name === name)
    return integration?.icon || <img src="/images/default-icon.png" alt="Default" className="size-4" />
  }

  const handleConfigure = (integration: Integration) => {
    setConfigDialog({ id: integration.id, name: integration.name, icon: integration.icon })
  }

  const handleViewLogs = (integration: Integration) => {
    setLogsDialog({ id: integration.id, name: integration.name, icon: integration.icon })
  }

  const handleToggleIntegration = (id: string, enabled: boolean) => {
    integrationStore.toggleIntegration(id, enabled)
    setBackendIntegrations(integrationStore.getAllIntegrations())
    toast.success(`Integration ${enabled ? "enabled" : "disabled"}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ChevronLeft className="size-5" />
              </Button>
              <div className="flex items-center gap-3">
                <img src="/images/image-19-removebg-preview.png" alt="Oath Logo" className="h-6 w-6" />
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight">Integrations</h1>
                  <p className="text-sm text-muted-foreground">Connect external tools to create a live audit trail</p>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-xs">
                {connectedCount} Connected
              </Badge>
              <Badge variant="outline" className="text-xs font-mono">
                {totalDataPoints} Data Points
              </Badge>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Connected Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-semibold">{connectedCount}</p>
                <img src="/images/connected-icon.png" alt="Connected" className="size-5 text-success" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">of {integrations.length} available</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Data Points Synced</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-semibold">{totalDataPoints}</p>
                <img src="/images/data-points-icon.png" alt="Data Points" className="size-5 text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">Last 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Live Activities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-semibold">{activities.length}</p>
                <Activity className="size-5 text-accent" />
              </div>
              <p className="text-xs text-muted-foreground mt-1">In the last hour</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Sync Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <p className="text-3xl font-semibold">
                  <img src="/images/sync-status-icon.png" alt="Sync Status" className="size-8" />
                </p>
                <Badge variant="secondary" className="text-xs">
                  Real-time
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-1">All systems operational</p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList>
            <TabsTrigger value="overview">
              <Settings className="size-4 mr-2" />
              Integration Settings
            </TabsTrigger>
            <TabsTrigger value="activity">
              <Activity className="size-4 mr-2" />
              Live Activity Feed
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Connected Services</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations
                  .filter((i) => i.status === "connected")
                  .map((integration) => (
                    <Card key={integration.id} className="hover:border-primary/50 transition-colors">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-muted", integration.color)}>{integration.icon}</div>
                            <div>
                              <CardTitle className="text-base">{integration.name}</CardTitle>
                              <CardDescription className="text-xs">{integration.description}</CardDescription>
                            </div>
                          </div>
                          <Switch
                            checked={true}
                            onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-success">
                            <img src="/images/connected-icon.png" alt="Connected" className="size-4" />
                            <span>Connected</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Last sync</p>
                              <p className="text-xs font-medium">{integration.lastSync}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-muted-foreground">Data points</p>
                              <p className="text-xs font-mono font-medium">{integration.dataPoints}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 mt-4">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 bg-transparent"
                            onClick={() => handleConfigure(integration)}
                          >
                            <Settings className="size-4 mr-2" />
                            Configure
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex-1"
                            onClick={() => handleViewLogs(integration)}
                          >
                            <img src="/images/logs-icon.png" alt="Logs" className="size-4 mr-2" />
                            View Logs
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4">Available Integrations</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {integrations
                  .filter((i) => i.status !== "connected")
                  .map((integration) => (
                    <Card key={integration.id} className="opacity-75 hover:opacity-100 transition-opacity">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn("p-2 rounded-lg bg-muted", integration.color)}>{integration.icon}</div>
                            <div>
                              <CardTitle className="text-base">{integration.name}</CardTitle>
                              <CardDescription className="text-xs">{integration.description}</CardDescription>
                            </div>
                          </div>
                          <Switch
                            checked={false}
                            onCheckedChange={(checked) => handleToggleIntegration(integration.id, checked)}
                          />
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="text-xs">
                            Not Connected
                          </Badge>
                          <Button size="sm" onClick={() => handleToggleIntegration(integration.id, true)}>
                            <img src="/images/connect-icon.png" alt="Connect" className="size-4 mr-2" />
                            Connect
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Live Activity Feed</CardTitle>
                <CardDescription>
                  Real-time updates from all connected integrations linked to governance items
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activities.map((activity, index) => (
                    <div key={activity.id} className="flex gap-4">
                      <div className="relative">
                        <div className="size-10 rounded-full flex items-center justify-center border-2 bg-card">
                          {getIntegrationIcon(activity.integration)}
                        </div>
                        {index < activities.length - 1 && (
                          <div className="absolute left-1/2 top-12 -translate-x-1/2 w-0.5 h-12 bg-border" />
                        )}
                      </div>
                      <div className="flex-1 pb-8">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge variant="outline" className="text-xs">
                                {activity.integration}
                              </Badge>
                              <span className="text-xs text-muted-foreground">{activity.timestamp}</span>
                            </div>
                            <p className="font-medium text-sm mb-1">{activity.action}</p>
                            <p className="text-sm text-muted-foreground">{activity.description}</p>
                            {activity.linkedTo && (
                              <div className="flex items-center gap-2 mt-2">
                                <Badge variant="secondary" className="text-xs font-mono">
                                  {activity.linkedTo}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 text-xs"
                                  onClick={() => {
                                    toast.success(`Navigating to audit trail for ${activity.linkedTo}...`)
                                    onBack()
                                  }}
                                >
                                  View in Audit Trail
                                  <ExternalLink className="size-3 ml-1" />
                                </Button>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">{getActivityIcon(activity.type)}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      <IntegrationConfigDialog
        integration={configDialog}
        open={!!configDialog}
        onOpenChange={(open) => !open && setConfigDialog(null)}
      />
      <IntegrationLogsDialog
        integration={logsDialog}
        open={!!logsDialog}
        onOpenChange={(open) => !open && setLogsDialog(null)}
      />
    </div>
  )
}

function formatLastSync(timestamp: string): string {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)

  if (diffMins < 1) return "just now"
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`

  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`

  const diffDays = Math.floor(diffHours / 24)
  return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`
}

function getActionTitle(type: string): string {
  const titles: Record<string, string> = {
    meeting: "Meeting Created",
    recording: "Recording Available",
    message: "Message Thread",
    document: "Document Updated",
    file: "File Uploaded",
  }
  return titles[type] || "Activity"
}

function getActivityDescription(data: any): string {
  if (data.data?.title) {
    return `${data.data.title} - ${JSON.stringify(data.data).substring(0, 80)}...`
  }
  return JSON.stringify(data.data).substring(0, 100) + "..."
}
